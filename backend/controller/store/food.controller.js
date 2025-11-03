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

const updateFood = async (req, res) => {
  try {
    const { foodId } = req.params;
    const { accountId } = req.user;
    const updateData = req.body;

    // Lấy shop_id của staff
    const shop_id = await getShopIdByStaff(accountId);
    if (!shop_id) {
      return res.status(404).json({ message: "Shop not found for this staff" });
    }

    // Tìm món ăn và kiểm tra quyền sở hữu
    const food = await Food.findOne({ _id: foodId, shop_id });
    if (!food) {
      return res.status(404).json({ message: "Món ăn không tồn tại hoặc không thuộc cửa hàng của bạn" });
    }

    // Nếu cập nhật tên món, kiểm tra trùng lặp
    if (updateData.name && updateData.name !== food.name) {
      const existingFood = await Food.findOne({
        shop_id,
        name: { $regex: new RegExp(`^${updateData.name}$`, "i") },
        _id: { $ne: foodId }
      });
      if (existingFood) {
        return res.status(400).json({ message: `Món ăn "${updateData.name}" đã tồn tại trong cửa hàng này` });
      }
    }

    // Nếu cập nhật category, kiểm tra category có tồn tại
    if (updateData.category_id) {
      const category = await FoodCategory.findOne({
        _id: updateData.category_id,
        shop_id
      });
      if (!category) {
        return res.status(404).json({ message: "Danh mục không tồn tại hoặc không thuộc cửa hàng của bạn" });
      }
    }

    // Các trường được phép cập nhật
    const allowedUpdates = [
      'name', 'description', 'price', 'discount',
      'image_url', 'options', 'category_id', 'is_available'
    ];

    // Lọc chỉ lấy các trường được phép
    const filteredUpdates = {};
    allowedUpdates.forEach(field => {
      if (updateData[field] !== undefined) {
        filteredUpdates[field] = updateData[field];
      }
    });

    // Cập nhật món ăn
    const updatedFood = await Food.findByIdAndUpdate(
      foodId,
      filteredUpdates,
      { new: true, runValidators: true }
    ).populate("category_id", "name");

    return res.status(200).json({
      message: "Cập nhật món ăn thành công",
      data: updatedFood
    });
  } catch (error) {
    console.error("Lỗi khi cập nhật món ăn:", error);
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
};

const toggleFoodStatus = async (req, res) => {
  try {
    const { foodId } = req.params;
    const { accountId } = req.user;

    // Lấy shop_id của staff đang đăng nhập
    const shop_id = await getShopIdByStaff(accountId);
    if (!shop_id) {
      return res.status(404).json({ message: "Không tìm thấy cửa hàng của nhân viên này" });
    }

    // Lấy món ăn thuộc shop đó
    const food = await Food.findOne({ _id: foodId, shop_id });
    if (!food) {
      return res.status(404).json({ message: "Món ăn không tồn tại hoặc không thuộc cửa hàng của bạn" });
    }

    // Đảo trạng thái bật/tắt
    food.is_available = !food.is_available;
    await food.save();

    return res.status(200).json({
      message: `Món ăn đã được ${food.is_available ? "kích hoạt" : "vô hiệu hóa"} thành công`,
      data: food
    });
  } catch (error) {
    console.error("Lỗi khi bật/tắt trạng thái món ăn:", error);
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
};

const deleteFood = async (req, res) => {
  try {
    const { foodId } = req.params;
    const { accountId } = req.user;

    // Lấy shop_id của staff
    const shop_id = await getShopIdByStaff(accountId);
    if (!shop_id) {
      return res.status(404).json({ message: "Shop not found for this staff" });
    }

    // Tìm và xóa món ăn
    const food = await Food.findOneAndDelete({ _id: foodId, shop_id });

    if (!food) {
      return res.status(404).json({ message: "Món ăn không tồn tại hoặc không thuộc cửa hàng của bạn" });
    }

    return res.status(200).json({
      message: "Xóa món ăn thành công",
      data: {
        deletedFood: {
          _id: food._id,
          name: food.name
        }
      }
    });
  } catch (error) {
    console.error("Lỗi khi xóa món ăn:", error);
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
};

module.exports = {
  createFoodWithCategory,
  getFoodsByShop,
  getShopIdByManager,
  updateFood,
  toggleFoodStatus,
  deleteFood
};