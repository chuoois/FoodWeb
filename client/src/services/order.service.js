import api from "../lib/axios";

//create order
export const createOrder = (data) => {
  return api.post("/orders",data);
};
