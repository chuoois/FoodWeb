const Food = require("../../models/food.model");
const Shop = require("../../models/shop.model");
const FoodCategory = require("../../models/foodCategory.model");

const createFoodWithCategory = async (req, res) => {
  try {
    const { shop_id, category_name, category_description, name, description, price, discount, image_url, options } = req.body;
    const { accountId } = req.user;
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
    const { shop_id } = req.params;
    const {
      category_id,
      search,
      minPrice,
      maxPrice,
      is_available,
      page = 1,
      limit = 10,
    } = req.query;

    const query = {};

    if (shop_id) {
      const shopExists = await Shop.findById(shop_id);
      if (!shopExists)
        return res.status(404).json({ message: "Cửa hàng không tồn tại" });
      query.shop_id = shop_id;
    }

    if (category_id) query.category_id = category_id;

    if (search)
      query.name = { $regex: new RegExp(search, "i") };

    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    if (is_available !== undefined)
      query.is_available = is_available === "true";

    const skip = (page - 1) * limit;

    const foods = await Food.find(query)
      .populate("category_id", "name")
      .populate("shop_id", "name")
      .sort({ created_at: -1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await Food.countDocuments(query);
    const totalPages = Math.ceil(total / limit);

    return res.status(200).json({
      message: "Lấy danh sách món ăn thành công",
      pagination: {
        currentPage: Number(page),
        totalPages,
        totalItems: total,
      },
      data: foods,
    });
  } catch (error) {
    console.error("Lỗi khi lấy danh sách món ăn:", error);
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
};

module.exports = {
  createFoodWithCategory,
  getFoodsByShop
};