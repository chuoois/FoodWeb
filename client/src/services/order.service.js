import api from "../lib/axios";

//create order
export const createOrder = (data) => {
  return api.post("/orders",data);
};

//get vouchers
export const getVouchers = (params) => {
  return api.get("/vouchers", { params });
};