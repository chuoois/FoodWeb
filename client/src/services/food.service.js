import api from "../lib/axios";

// Tạo món ăn cùng danh mục (nếu chưa có)
export const createFoodWithCategory = (data) => {
    return api.post("/food/create-with-category", data);
};

// Lấy danh sách món ăn theo shop_id
export const getFoodsByShop = (params) => {
    return api.get("/food/all", { params });
};

// Lấy shop ID theo manager
export const getShopIdByManager = () => {
    return api.get("/food/shopId-by-manager");
};