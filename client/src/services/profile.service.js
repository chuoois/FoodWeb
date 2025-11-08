// services/profile.service.js
import api from "../lib/axios";

export const getProfile = () => {
  return api.get("/auth/profile");
};

export const updateProfile = (data) => {
  return api.patch("/auth/profile", data);
};

// services/address.service.js
export const getUserAddresses = () => {
  return api.get("/auth/addresses");
};

export const createAddress = (data) => {
  return api.post("/auth/addresses", data);
};

export const updateAddress = (addrId, data) => {
  return api.patch(`/auth/addresses/${addrId}`, data);
};

export const deleteAddress = (addrId) => {
  return api.delete(`/auth/addresses/${addrId}`);
};