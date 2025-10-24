const Food = require("../../models/food.model");
const Shop = require("../../models/shop.model");
const FoodCategory = require("../../models/foodCategory.model");
const Staff = require("../../models/staff.model");
const { getShopIdByStaff } = require("../../services/shop.service");

const createFoodWithCategory = async (req, res) => {
  try {
    const { category_name, category_description, name, description, price, discount, image_url, options } = req.body;
    const { accountId } = req.user;

    const shop_id = await getShopIdByStaff(accountId);
    if (!shop_id) {
      return res.status(404).json({ message: "Shop not found for this staff" });
    }
    const created_by = accountId;

    // Kiểm tra shop có tồn tại
    const shop = await Shop.findById(shop_id);
    if (!shop) {
      return res.status(404).json({ message: "Cửa hàng không tồn tại" });
    }

    // Tìm hoặc tạo danh mục (case-insensitive)
    let category = await FoodCategory.findOne({
      shop_id,
      name: { $regex: new RegExp(`^${category_name}$`, "i") }
    });

    if (!category) {
      category = await FoodCategory.create({
        shop_id,
        name: category_name,
        description: category_description || "",
      });
    }

    // Kiểm tra trùng món ăn trong cùng shop
    const existingFood = await Food.findOne({
      shop_id,
      name: { $regex: new RegExp(`^${name}$`, "i") }
    });
    if (existingFood) {
      return res.status(400).json({ message: `Món ăn "${name}" đã tồn tại trong cửa hàng này.` });
    }

    // Tạo món ăn mới
    const newFood = await Food.create({
      shop_id,
      category_id: category._id,
      name,
      description,
      price,
      discount,
      image_url,
      options,
      created_by
    });

    return res.status(201).json({
      message: "Tạo món ăn và danh mục (nếu chưa có) thành công",
      data: {
        category,
        food: newFood
      }
    });
  } catch (error) {
    console.error("Lỗi khi tạo món và danh mục:", error);
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
};

const getFoodsByShop = async (req, res) => {
  try {
    const { accountId } = req.user;

    // Lấy query parameters
    const {
      page = 1,
      limit = 10,
      search = '',
      category_id = '',
      is_available = '',
      min_price = '',
      max_price = '',
      sort_by = 'created_at',
      sort_order = 'desc'
    } = req.query;

    const staff = await Staff.findOne({ account_id: accountId });
    if (!staff) {
      return res.status(404).json({ message: "Staff not found for this account" });
    }

    const shop = await Shop.findOne({ managers: staff.account_id });
    if (!shop) {
      return res.status(404).json({ message: "Shop not found for this staff" });
    }

    // Xây dựng filter query
    const filter = { shop_id: shop._id };

    // Search theo tên món ăn
    if (search.trim()) {
      filter.name = { $regex: search.trim(), $options: 'i' };
    }

    // Filter theo category
    if (category_id) {
      filter.category_id = category_id;
    }

    // Filter theo trạng thái available
    if (is_available !== '') {
      filter.is_available = is_available === 'true';
    }

    // Filter theo khoảng giá
    if (min_price !== '' || max_price !== '') {
      filter.price = {};
      if (min_price !== '') {
        filter.price.$gte = Number(min_price);
      }
      if (max_price !== '') {
        filter.price.$lte = Number(max_price);
      }
    }

    // Xây dựng sort object
    const sortObj = {};
    const validSortFields = ['name', 'price', 'created_at', 'discount'];
    const sortField = validSortFields.includes(sort_by) ? sort_by : 'created_at';
    sortObj[sortField] = sort_order === 'asc' ? 1 : -1;

    // Tính toán pagination
    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit)));
    const skip = (pageNum - 1) * limitNum;

    // Thực hiện query với pagination
    const [foods, totalCount] = await Promise.all([
      Food.find(filter)
        .populate("category_id", "name")
        .sort(sortObj)
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Food.countDocuments(filter)
    ]);

    // Tính toán metadata
    const totalPages = Math.ceil(totalCount / limitNum);

    return res.status(200).json({
      foods,
      pagination: {
        current_page: pageNum,
        total_pages: totalPages,
        total_items: totalCount,
        items_per_page: limitNum,
        has_next: pageNum < totalPages,
        has_prev: pageNum > 1
      }
    });
  } catch (error) {
    console.error("Error getting foods by shop:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const getShopIdByManager = async (req, res) => {
  try {
    const { accountId } = req.user;

    const staff = await Staff.findOne({ account_id: accountId });
    if (!staff) {
      return res.status(404).json({ message: "Staff not found for this account" });
    }

    const shop = await Shop.findOne({ managers: staff.account_id });
    if (!shop) {
      return res.status(404).json({ message: "Shop not found for this staff" });
    }

    return res.status(200).json({ shopId: shop._id, shopName: shop.name });
  } catch (error) {
    console.error("Error getting shopId by manager:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = {
  createFoodWithCategory,
  getFoodsByShop,
  getShopIdByManager
};