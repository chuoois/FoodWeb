import api from "../lib/axios";

export const createShop = (data) => {
    return api.post("/shop/create", data);
};

export const getShopByOwnerID = () => {
  return api.get("/shop/get-by-owner");
};