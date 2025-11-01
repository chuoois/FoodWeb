import api from "../lib/axios";

// Tạo món ăn cùng danh mục (nếu chưa có)
export const createFoodWithCategory = (data) => {
    return api.post("/food/create-with-category", data);
};

// Lấy danh sách món ăn theo shop_id
export const getFoodsByShop = (params) => {
    return api.get("/food/all", { params });
};

// Cập nhật món ăn: http://localhost:9999/api/food/(id)
export const updateFood = (foodId, data) => {
    return api.put(`/food/${foodId}`, data);
};

// Xóa món ăn: http://localhost:9999/api/food/(id)
export const deleteFood = (foodId) => {
    return api.delete(`/food/${foodId}`);
};

// Cập nhật trạng thái món ăn: http://localhost:9999/api/food/(id)/toggle-status
export const toggleFoodStatus = (foodId) => {
    return api.patch(`/food/${foodId}/toggle-status`);
}