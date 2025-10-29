import api from "../lib/axios";

// Lấy danh sách tài khoản (có phân trang, filter)
export const getCart = async (shop_id) => {
  const response = await api.get("/cart", {
    params: { shop_id },
  });
  return response.data;
};

// Thêm món vào giỏ
export const addToCart = async (data) => {
  const response = await api.post("/cart/add", data);
  return response.data;
};

export const updateCartItem = async (itemId, quantity, note = "") => {
  const response = await api.post(`/cart/item/${itemId}`, { 
    quantity,
    note 
  });
  return response.data;
};

export const removeFromCart = async (itemId) => {
  const response = await api.delete(`/cart/item/${itemId}`);
  return response.data;
};
