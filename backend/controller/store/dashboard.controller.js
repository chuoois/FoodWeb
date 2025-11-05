// controllers/owner/dashboard.controller.js
const Order = require("../../models/order.model");
const Shop = require("../../models/shop.model");
const Food = require("../../models/food.model");
const User = require("../../models/user.model");
const moment = require("moment");

const getOverview = async (req, res) => {
    try {
        const accountId = req.user.accountId;
        const owner = await User.findOne({ account_id: accountId }).select("_id");

        // Lấy danh sách shop của owner
        const shops = await Shop.find({ owner: owner._id });
        const shopIds = shops.map(shop => shop._id);

        if (shopIds.length === 0) {
            return res.status(200).json({
                success: true,
                data: {
                    totalShops: 0,
                    totalRevenue: 0,
                    totalOrders: 0,
                    totalFoods: 0,
                    avgRating: 0,
                },
            });
        }

        // Thống kê tổng quan
        const [revenueStats, orderStats, foodStats] = await Promise.all([
            // Tổng doanh thu từ đơn hàng đã hoàn thành
            Order.aggregate([
                {
                    $match: {
                        shop_id: { $in: shopIds },
                        status: "DELIVERED",
                        payment_status: { $in: ["PAID", "COD_PENDING"] },
                    },
                },
                {
                    $group: {
                        _id: null,
                        totalRevenue: { $sum: "$total_amount" },
                        totalOrders: { $sum: 1 },
                    },
                },
            ]),

            // Thống kê đơn hàng theo trạng thái
            Order.aggregate([
                {
                    $match: {
                        shop_id: { $in: shopIds },
                    },
                },
                {
                    $group: {
                        _id: "$status",
                        count: { $sum: 1 },
                    },
                },
            ]),

            // Tổng số món ăn
            Food.countDocuments({ shop_id: { $in: shopIds } }),
        ]);

        // Tính rating trung bình
        const avgRating =
            shops.reduce((sum, shop) => sum + (shop.rating || 0), 0) /
            shops.length;

        // Format dữ liệu đơn hàng theo trạng thái
        const ordersByStatus = {};
        orderStats.forEach((item) => {
            ordersByStatus[item._id] = item.count;
        });

        res.status(200).json({
            success: true,
            data: {
                totalShops: shops.length,
                totalRevenue: revenueStats[0]?.totalRevenue || 0,
                totalOrders: revenueStats[0]?.totalOrders || 0,
                totalFoods: foodStats,
                avgRating: avgRating.toFixed(2),
                ordersByStatus,
            },
        });
    } catch (error) {
        console.error("Get overview error:", error);
        res.status(500).json({
            success: false,
            message: "Lỗi khi lấy dữ liệu tổng quan",
            error: error.message,
        });
    }
};

const getRevenueStats = async (req, res) => {
    try {
        const accountId = req.user.accountId;
        const owner = await User.findOne({ account_id: accountId }).select("_id");
        const ownerId = owner._id;
        const { period = "month", startDate, endDate } = req.query;

        const shops = await Shop.find({ owner: ownerId });
        const shopIds = shops.map(shop => shop._id);

        if (shopIds.length === 0) {
            return res.status(200).json({
                success: true,
                data: [],
            });
        }

        // Xác định khoảng thời gian
        let start, end, groupFormat;

        if (startDate && endDate) {
            start = new Date(startDate);
            end = new Date(endDate);
        } else {
            end = new Date();
            switch (period) {
                case "day":
                    start = moment().subtract(7, "days").toDate();
                    groupFormat = { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } };
                    break;
                case "week":
                    start = moment().subtract(8, "weeks").toDate();
                    groupFormat = { $dateToString: { format: "%Y-W%V", date: "$createdAt" } };
                    break;
                case "year":
                    start = moment().subtract(5, "years").toDate();
                    groupFormat = { $dateToString: { format: "%Y", date: "$createdAt" } };
                    break;
                case "month":
                default:
                    start = moment().subtract(12, "months").toDate();
                    groupFormat = { $dateToString: { format: "%Y-%m", date: "$createdAt" } };
                    break;
            }
        }

        const revenueData = await Order.aggregate([
            {
                $match: {
                    shop_id: { $in: shopIds },
                    status: "DELIVERED",
                    payment_status: { $in: ["PAID", "COD_PENDING"] },
                    createdAt: { $gte: start, $lte: end },
                },
            },
            {
                $group: {
                    _id: groupFormat,
                    revenue: { $sum: "$total_amount" },
                    orders: { $sum: 1 },
                    avgOrderValue: { $avg: "$total_amount" },
                },
            },
            { $sort: { _id: 1 } },
        ]);

        res.status(200).json({
            success: true,
            data: revenueData,
            period,
            startDate: start,
            endDate: end,
        });
    } catch (error) {
        console.error("Get revenue stats error:", error);
        res.status(500).json({
            success: false,
            message: "Lỗi khi lấy thống kê doanh thu",
            error: error.message,
        });
    }
};

const getShopsPerformance = async (req, res) => {
    try {
        const accountId = req.user.accountId;
        const owner = await User.findOne({ account_id: accountId }).select("_id");
        const ownerId = owner._id;

        const shops = await Shop.find({ owner: ownerId }).select(
            "name status rating favorites reviews"
        );

        const shopIds = shops.map(shop => shop._id);

        // Lấy thống kê đơn hàng và doanh thu cho từng shop
        const shopStats = await Order.aggregate([
            {
                $match: {
                    shop_id: { $in: shopIds },
                },
            },
            {
                $group: {
                    _id: "$shop_id",
                    totalOrders: { $sum: 1 },
                    completedOrders: {
                        $sum: {
                            $cond: [{ $eq: ["$status", "DELIVERED"] }, 1, 0],
                        },
                    },
                    totalRevenue: {
                        $sum: {
                            $cond: [
                                {
                                    $and: [
                                        { $eq: ["$status", "DELIVERED"] },
                                        { $in: ["$payment_status", ["PAID", "COD_PENDING"]] },
                                    ],
                                },
                                "$total_amount",
                                0,
                            ],
                        },
                    },
                    cancelledOrders: {
                        $sum: {
                            $cond: [{ $eq: ["$status", "CANCELLED"] }, 1, 0],
                        },
                    },
                },
            },
        ]);

        // Lấy số lượng món ăn cho từng shop
        const foodCounts = await Food.aggregate([
            {
                $match: {
                    shop_id: { $in: shopIds },
                },
            },
            {
                $group: {
                    _id: "$shop_id",
                    totalFoods: { $sum: 1 },
                    availableFoods: {
                        $sum: {
                            $cond: ["$is_available", 1, 0],
                        },
                    },
                },
            },
        ]);

        // Kết hợp dữ liệu
        const performanceData = shops.map((shop) => {
            const stats = shopStats.find(
                (s) => s._id.toString() === shop._id.toString()
            ) || {
                totalOrders: 0,
                completedOrders: 0,
                totalRevenue: 0,
                cancelledOrders: 0,
            };

            const foodCount = foodCounts.find(
                (f) => f._id.toString() === shop._id.toString()
            ) || { totalFoods: 0, availableFoods: 0 };

            return {
                shopId: shop._id,
                shopName: shop.name,
                status: shop.status,
                rating: shop.rating,
                totalFavorites: shop.favorites?.length || 0,
                totalReviews: shop.reviews?.length || 0,
                totalOrders: stats.totalOrders,
                completedOrders: stats.completedOrders,
                cancelledOrders: stats.cancelledOrders,
                totalRevenue: stats.totalRevenue,
                completionRate:
                    stats.totalOrders > 0
                        ? ((stats.completedOrders / stats.totalOrders) * 100).toFixed(2)
                        : 0,
                totalFoods: foodCount.totalFoods,
                availableFoods: foodCount.availableFoods,
            };
        });

        // Sắp xếp theo doanh thu giảm dần
        performanceData.sort((a, b) => b.totalRevenue - a.totalRevenue);

        res.status(200).json({
            success: true,
            data: performanceData,
        });
    } catch (error) {
        console.error("Get shops performance error:", error);
        res.status(500).json({
            success: false,
            message: "Lỗi khi lấy thống kê hiệu suất shop",
            error: error.message,
        });
    }
};

const getTopFoods = async (req, res) => {
    try {
        const accountId = req.user.accountId;
        const owner = await User.findOne({ account_id: accountId }).select("_id");
        const ownerId = owner._id;
        const limit = parseInt(req.query.limit) || 10;

        const shops = await Shop.find({ owner: ownerId });
        const shopIds = shops.map(shop => shop._id);

        if (shopIds.length === 0) {
            return res.status(200).json({
                success: true,
                data: [],
            });
        }

        // Lấy top món ăn từ OrderItem
        // Note: Cần có model OrderItem để thực hiện query này
        // Giả sử có OrderItem model với food_id và quantity

        const topFoods = await Food.aggregate([
            {
                $match: {
                    shop_id: { $in: shopIds },
                },
            },
            {
                $lookup: {
                    from: "orderitems", // Collection OrderItem
                    localField: "_id",
                    foreignField: "food_id",
                    as: "orders",
                },
            },
            {
                $project: {
                    name: 1,
                    price: 1,
                    image_url: 1,
                    shop_id: 1,
                    totalOrdered: { $size: "$orders" },
                    totalQuantity: { $sum: "$orders.quantity" },
                },
            },
            { $sort: { totalQuantity: -1 } },
            { $limit: limit },
            {
                $lookup: {
                    from: "shops",
                    localField: "shop_id",
                    foreignField: "_id",
                    as: "shop",
                },
            },
            {
                $unwind: "$shop",
            },
            {
                $project: {
                    name: 1,
                    price: 1,
                    image_url: 1,
                    totalOrdered: 1,
                    totalQuantity: 1,
                    shopName: "$shop.name",
                },
            },
        ]);

        res.status(200).json({
            success: true,
            data: topFoods,
        });
    } catch (error) {
        console.error("Get top foods error:", error);
        res.status(500).json({
            success: false,
            message: "Lỗi khi lấy danh sách món ăn bán chạy",
            error: error.message,
        });
    }
};

const getCustomerStats = async (req, res) => {
    try {
        const accountId = req.user.accountId;
        const owner = await User.findOne({ account_id: accountId }).select("_id");
        const ownerId = owner._id;

        const shops = await Shop.find({ owner: ownerId });
        const shopIds = shops.map(shop => shop._id);

        if (shopIds.length === 0) {
            return res.status(200).json({
                success: true,
                data: {
                    totalCustomers: 0,
                    newCustomersThisMonth: 0,
                    topCustomers: [],
                },
            });
        }

        // Thống kê khách hàng
        const [totalCustomers, newCustomers, topCustomers] = await Promise.all([
            // Tổng số khách hàng unique
            Order.distinct("customer_id", { shop_id: { $in: shopIds } }),

            // Khách hàng mới trong tháng
            Order.distinct("customer_id", {
                shop_id: { $in: shopIds },
                createdAt: {
                    $gte: moment().startOf("month").toDate(),
                    $lte: moment().endOf("month").toDate(),
                },
            }),

            // Top khách hàng
            Order.aggregate([
                {
                    $match: {
                        shop_id: { $in: shopIds },
                        status: "DELIVERED",
                    },
                },
                {
                    $group: {
                        _id: "$customer_id",
                        totalOrders: { $sum: 1 },
                        totalSpent: { $sum: "$total_amount" },
                    },
                },
                { $sort: { totalSpent: -1 } },
                { $limit: 10 },
                {
                    $lookup: {
                        from: "users",
                        localField: "_id",
                        foreignField: "_id",
                        as: "customer",
                    },
                },
                {
                    $unwind: "$customer",
                },
                {
                    $project: {
                        customerId: "$_id",
                        customerName: "$customer.full_name",
                        customerPhone: "$customer.phone",
                        totalOrders: 1,
                        totalSpent: 1,
                        avgOrderValue: { $divide: ["$totalSpent", "$totalOrders"] },
                    },
                },
            ]),
        ]);

        res.status(200).json({
            success: true,
            data: {
                totalCustomers: totalCustomers.length,
                newCustomersThisMonth: newCustomers.length,
                topCustomers,
            },
        });
    } catch (error) {
        console.error("Get customer stats error:", error);
        res.status(500).json({
            success: false,
            message: "Lỗi khi lấy thống kê khách hàng",
            error: error.message,
        });
    }
};

const getRevenueComparison = async (req, res) => {
    try {
        const accountId = req.user.accountId;
        const owner = await User.findOne({ account_id: accountId }).select("_id");
        const ownerId = owner._id;

        const shops = await Shop.find({ owner: ownerId });
        const shopIds = shops.map(shop => shop._id);

        if (shopIds.length === 0) {
            return res.status(200).json({
                success: true,
                data: {
                    today: 0,
                    yesterday: 0,
                    thisWeek: 0,
                    lastWeek: 0,
                    thisMonth: 0,
                    lastMonth: 0,
                },
            });
        }

        const now = moment();

        const [
            todayRevenue,
            yesterdayRevenue,
            thisWeekRevenue,
            lastWeekRevenue,
            thisMonthRevenue,
            lastMonthRevenue,
        ] = await Promise.all([
            // Hôm nay
            Order.aggregate([
                {
                    $match: {
                        shop_id: { $in: shopIds },
                        status: "DELIVERED",
                        payment_status: { $in: ["PAID", "COD_PENDING"] },
                        createdAt: {
                            $gte: now.startOf("day").toDate(),
                            $lte: now.endOf("day").toDate(),
                        },
                    },
                },
                { $group: { _id: null, total: { $sum: "$total_amount" } } },
            ]),

            // Hôm qua
            Order.aggregate([
                {
                    $match: {
                        shop_id: { $in: shopIds },
                        status: "DELIVERED",
                        payment_status: { $in: ["PAID", "COD_PENDING"] },
                        createdAt: {
                            $gte: moment().subtract(1, "day").startOf("day").toDate(),
                            $lte: moment().subtract(1, "day").endOf("day").toDate(),
                        },
                    },
                },
                { $group: { _id: null, total: { $sum: "$total_amount" } } },
            ]),

            // Tuần này
            Order.aggregate([
                {
                    $match: {
                        shop_id: { $in: shopIds },
                        status: "DELIVERED",
                        payment_status: { $in: ["PAID", "COD_PENDING"] },
                        createdAt: {
                            $gte: now.startOf("week").toDate(),
                            $lte: now.endOf("week").toDate(),
                        },
                    },
                },
                { $group: { _id: null, total: { $sum: "$total_amount" } } },
            ]),

            // Tuần trước
            Order.aggregate([
                {
                    $match: {
                        shop_id: { $in: shopIds },
                        status: "DELIVERED",
                        payment_status: { $in: ["PAID", "COD_PENDING"] },
                        createdAt: {
                            $gte: moment().subtract(1, "week").startOf("week").toDate(),
                            $lte: moment().subtract(1, "week").endOf("week").toDate(),
                        },
                    },
                },
                { $group: { _id: null, total: { $sum: "$total_amount" } } },
            ]),

            // Tháng này
            Order.aggregate([
                {
                    $match: {
                        shop_id: { $in: shopIds },
                        status: "DELIVERED",
                        payment_status: { $in: ["PAID", "COD_PENDING"] },
                        createdAt: {
                            $gte: now.startOf("month").toDate(),
                            $lte: now.endOf("month").toDate(),
                        },
                    },
                },
                { $group: { _id: null, total: { $sum: "$total_amount" } } },
            ]),

            // Tháng trước
            Order.aggregate([
                {
                    $match: {
                        shop_id: { $in: shopIds },
                        status: "DELIVERED",
                        payment_status: { $in: ["PAID", "COD_PENDING"] },
                        createdAt: {
                            $gte: moment().subtract(1, "month").startOf("month").toDate(),
                            $lte: moment().subtract(1, "month").endOf("month").toDate(),
                        },
                    },
                },
                { $group: { _id: null, total: { $sum: "$total_amount" } } },
            ]),
        ]);

        res.status(200).json({
            success: true,
            data: {
                today: todayRevenue[0]?.total || 0,
                yesterday: yesterdayRevenue[0]?.total || 0,
                thisWeek: thisWeekRevenue[0]?.total || 0,
                lastWeek: lastWeekRevenue[0]?.total || 0,
                thisMonth: thisMonthRevenue[0]?.total || 0,
                lastMonth: lastMonthRevenue[0]?.total || 0,
                todayGrowth:
                    yesterdayRevenue[0]?.total > 0
                        ? (
                            ((todayRevenue[0]?.total || 0) - yesterdayRevenue[0].total) /
                            yesterdayRevenue[0].total *
                            100
                        ).toFixed(2)
                        : 0,
                weekGrowth:
                    lastWeekRevenue[0]?.total > 0
                        ? (
                            ((thisWeekRevenue[0]?.total || 0) - lastWeekRevenue[0].total) /
                            lastWeekRevenue[0].total *
                            100
                        ).toFixed(2)
                        : 0,
                monthGrowth:
                    lastMonthRevenue[0]?.total > 0
                        ? (
                            ((thisMonthRevenue[0]?.total || 0) -
                                lastMonthRevenue[0].total) /
                            lastMonthRevenue[0].total *
                            100
                        ).toFixed(2)
                        : 0,
            },
        });
    } catch (error) {
        console.error("Get revenue comparison error:", error);
        res.status(500).json({
            success: false,
            message: "Lỗi khi so sánh doanh thu",
            error: error.message,
        });
    }
};

module.exports = {
    getOverview,
    getRevenueStats,
    getRevenueComparison,
    getTopFoods,
    getShopsPerformance,
    getCustomerStats
};