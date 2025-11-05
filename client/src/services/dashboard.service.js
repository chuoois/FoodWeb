import api from "../lib/axios";

/**
 * Lấy dữ liệu tổng quan dashboard
 * API: GET /api/dashboard/overview
 * Ví dụ: http://localhost:9999/api/dashboard/overview
 * {
    "success": true,
    "data": {
        "totalShops": 2,
        "totalRevenue": 125000,
        "totalOrders": 1,
        "totalFoods": 2,
        "avgRating": "0.00",
        "ordersByStatus": {
            "DELIVERED": 1,
            "PENDING": 1
        }
    }
}
 */
export const getOverview = async () => {
  const res = await api.get("/dashboard/overview");
  return res.data;
};

/**
 * Lấy thống kê doanh thu theo thời gian
 * API: GET /api/dashboard/revenue-stats?period=month
 * period có thể là: "day", "week", "month", "year"
 * Hoặc dùng startDate, endDate để chỉ định khoảng thời gian tùy chọn
 * Ví dụ: http://localhost:9999/api/dashboard/revenue-stats?period=month
 * {
    "success": true,
    "data": [
        {
            "_id": "2025-11",
            "revenue": 125000,
            "orders": 1,
            "avgOrderValue": 125000
        }
    ],
    "period": "month",
    "startDate": "2024-11-05T13:20:39.439Z",
    "endDate": "2025-11-05T13:20:39.439Z"
}
 */
export const getRevenueStats = async (params = {}) => {
  const res = await api.get("/dashboard/revenue-stats", { params });
  return res.data;
};

/**
 * So sánh doanh thu giữa các mốc thời gian (hôm nay, hôm qua, tuần này,...)
 * API: GET /api/dashboard/revenue-comparison
 * Ví dụ: http://localhost:9999/api/dashboard/revenue-comparison
 * {
    "success": true,
    "data": {
        "today": 125000,
        "yesterday": 0,
        "thisWeek": 125000,
        "lastWeek": 0,
        "thisMonth": 125000,
        "lastMonth": 0,
        "todayGrowth": 0,
        "weekGrowth": 0,
        "monthGrowth": 0
    }
}
 */
export const getRevenueComparison = async () => {
  const res = await api.get("/dashboard/revenue-comparison");
  return res.data;
};

/**
 * Lấy danh sách món ăn bán chạy nhất
 * API: GET /api/dashboard/top-foods?limit=10
 * Ví dụ: http://localhost:9999/api/dashboard/top-foods?limit=5
 * {
    "success": true,
    "data": [
        {
            "_id": "690b479034eca4524221a19f",
            "name": "test",
            "price": 35000,
            "image_url": "https://res.cloudinary.com/dqh0zio2c/image/upload/v1762346889/s4tqv8z8bncloyptj1ff.jpg",
            "totalOrdered": 0,
            "totalQuantity": 0,
            "shopName": "test"
        },
        {
            "_id": "690b4a1aa81b265e9cc0de1d",
            "name": "test2",
            "price": 0,
            "image_url": "https://res.cloudinary.com/dqh0zio2c/image/upload/v1762347544/c1in2wskmsb65flhhrvo.jpg",
            "totalOrdered": 0,
            "totalQuantity": 0,
            "shopName": "test 2"
        }
    ]
}
 */
export const getTopFoods = async (limit = 10) => {
  const res = await api.get("/dashboard/top-foods", {
    params: { limit },
  });
  return res.data;
};

/**
 * Lấy hiệu suất hoạt động của các shop thuộc owner
 * API: GET /api/dashboard/shops-performance
 * Ví dụ: http://localhost:9999/api/dashboard/shops-performance
 * {
    "success": true,
    "data": [
        {
            "shopId": "690b40455233345b2ca511d9",
            "shopName": "test",
            "status": "ACTIVE",
            "rating": 0,
            "totalFavorites": 0,
            "totalReviews": 0,
            "totalOrders": 1,
            "completedOrders": 1,
            "cancelledOrders": 0,
            "totalRevenue": 125000,
            "completionRate": "100.00",
            "totalFoods": 1,
            "availableFoods": 1
        },
        {
            "shopId": "690b499c6c74aa7af14a518e",
            "shopName": "test 2",
            "status": "ACTIVE",
            "rating": 0,
            "totalFavorites": 0,
            "totalReviews": 0,
            "totalOrders": 1,
            "completedOrders": 0,
            "cancelledOrders": 0,
            "totalRevenue": 0,
            "completionRate": "0.00",
            "totalFoods": 1,
            "availableFoods": 1
        }
    ]
}
 */
export const getShopsPerformance = async () => {
  const res = await api.get("/dashboard/shops-performance");
  return res.data;
};

/**
 * Lấy thống kê khách hàng (tổng khách hàng, khách mới trong tháng, top khách)
 * API: GET /api/dashboard/customer-stats
 * Ví dụ: http://localhost:9999/api/dashboard/customer-stats
 * {
    "success": true,
    "data": {
        "totalCustomers": 1,
        "newCustomersThisMonth": 1,
        "topCustomers": [
            {
                "_id": "68e688c9b08aa80a2d4ee492",
                "totalOrders": 1,
                "totalSpent": 125000,
                "customerId": "68e688c9b08aa80a2d4ee492",
                "customerName": "Anh Lê",
                "customerPhone": "0977217368",
                "avgOrderValue": 125000
            }
        ]
    }
}
 */
export const getCustomerStats = async () => {
  const res = await api.get("/dashboard/customer-stats");
  return res.data;
};
