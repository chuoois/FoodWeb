const Shop = require("../../models/shop.model");
const User = require("../../models/user.model");
const Account = require("../../models/accout.model");

const listShops = async (req, res) => {
  try {
    const { search, status, page = 1 } = req.query;
    const limit = 8;
    const skip = (page - 1) * limit;

    const query = {};

    if (search) {
      query.name = { $regex: search, $options: "i" };
    }

    if (status) {
      query.status = status;
    }

    const shops = await Shop.find(query)
      .populate({
        path: "owner",
        populate: {
          path: "account_id",
          model: "Account",
          select: "email",
        },
        select: "full_name account_id",
      })
      .select("name status createdAt description logoUrl coverUrl")
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    const total = await Shop.countDocuments(query);
    const totalPages = Math.ceil(total / limit);

    const formattedShops = shops.map((shop) => ({
      _id: shop._id,
      name: shop.name,
      ownerEmail: shop.owner?.account_id?.email || "N/A",
      status: shop.status,
      description: shop.description || "Không có mô tả",
      createdAt: shop.createdAt,
      logoUrl: shop.logoUrl,
      coverUrl: shop.coverUrl,
    }));

    return res.json({
      shops: formattedShops,
      totalPages,
      currentPage: parseInt(page),
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};



const updateShopStatus = async (req, res) => {
  try {
    const { shopId } = req.params;
    if (!shopId) {
      return res.status(400).json({ message: "Thiếu shop_id" });
    }

    const shop = await Shop.findById(shopId);
    if (!shop) {
      return res.status(404).json({ message: "Không tìm thấy cửa hàng" });
    }

    if (shop.status === "PENDING_APPROVAL") {
      return res
        .status(400)
        .json({ message: "Không thể cập nhật trạng thái từ PENDING_APPROVAL" });
    }

    const newStatus = shop.status === "ACTIVE" ? "INACTIVE" : "ACTIVE";

    const updatedShop = await Shop.findByIdAndUpdate(
      shopId,
      { status: newStatus },
      { new: true }
    )
      .populate({
        path: "owner",
        populate: {
          path: "account_id",
          model: "Account",
          select: "email",
        },
      })
      .select("name status createdAt");

    return res.json({
      message: "Cập nhật trạng thái thành công",
      shop: {
        _id: updatedShop._id,
        name: updatedShop.name,
        ownerEmail: updatedShop.owner?.account_id?.email || "N/A",
        status: updatedShop.status,
        createdAt: updatedShop.createdAt,
      },
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

module.exports = {
  listShops,
  updateShopStatus,
};
