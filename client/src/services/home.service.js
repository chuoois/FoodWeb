import api from "../lib/axios";

// Lấy danh sách cửa hàng gần vị trí (lat, lng) nhất đinh (3000m)
export const getNearbyShops = (lat, lng) => {
    return api.get("home/nearby", { params: { lat, lng } });
};
export const getPopularShops = () => {
    return api.get("home/popular");
}

export const getShopsByType = (type, lat, lng) => {
    return api.get("home/filter", { params: { type, lat, lng } });
}

export const getShopById = (shopId) => {
    return api.get(`home/shop/${shopId}`);
}

export const searchShopsAndFoods = (query) => {
    return api.get("home/search-all", { params: { query } });
};

export const searchHome = (q, lat, lng, options) => {
    const params = { q, ...options };
    if (lat && lng) params.lat = lat;
    if (lat && lng) params.lng = lng;
    return api.get("home/search", { params });
}
export const getShopWithFoods = (id) => {
    return api.get(`home/shop/${id}/foods`);
};

export const getRandomShops = () => {
    return api.get("home/detail/random");
};

