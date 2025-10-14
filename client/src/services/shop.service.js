import api from "../lib/axios";

export const createShop = (data) => {
    return api.post("/shop/create", data);
};