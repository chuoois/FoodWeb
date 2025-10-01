import api from "../lib/axios";

// Đăng ký bằng email/password
export const register = (data) => {
    return api.post("/auth/register", data);
};

// Đăng ký bằng Google
export const registerGoogle = (tokenId) => {
    return api.post("/auth/register/google", { tokenId });
};
