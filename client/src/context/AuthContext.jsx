import React, { createContext, useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";
import { getRoleNameById } from "@/services/auth.service";
import { getShopByOwnerID } from "@/services/shop.service";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [hasShop, setHasShop] = useState(null); // null = chưa check, true/false = đã check
  const [shop, setShop] = useState(null); // <-- THÊM STATE ĐỂ LƯU DỮ LIỆU SHOP
  const [mounted, setMounted] = useState(false);

  const checkShopStatus = async () => {
    try {
      const response = await getShopByOwnerID();
      const shopData = response?.data?.shop || response?.data;
      
      const shopExists = !!(shopData && (
        shopData.status === "ACTIVE" ||
        shopData.status === "INACTIVE" ||
        shopData.status === "BANNED" ||
        shopData.status === "PENDING_APPROVAL"
      ));
      
      setHasShop(shopExists);
      if (shopExists) {
        setShop(shopData); // <-- LƯU DỮ LIỆU SHOP VÀO STATE
      } else {
        setShop(null); // <-- Đảm bảo shop là null nếu không tồn tại
      }
      return shopExists;
    } catch (err) {
      console.error("[Error checking shop]", err);
      setHasShop(false);
      setShop(null); // <-- RESET STATE SHOP KHI CÓ LỖI
      return false;
    }
  };

  useEffect(() => {
    // ... logic initUser của bạn không thay đổi
    const initUser = async () => {
      const token = localStorage.getItem("token");
      if (token) {
        try {
          const decoded = jwtDecode(token);
          const currentTime = Date.now() / 1000;

          if (decoded.exp && decoded.exp < currentTime) {
            logout();
          } else {
            const response = await getRoleNameById({ id: decoded.roleId });
            const roleName = response.data.name;
            
            setUser({
              id: decoded.accountId,
              roleId: decoded.roleId,
              roleName,
            });

            await checkShopStatus();
          }
        } catch (error) {
          console.error("Token decode failed:", error);
          logout();
        }
      }
      setMounted(true);
    };

    initUser();
  }, []);

  const login = async (token) => {
    // ... logic login của bạn không thay đổi
    localStorage.setItem("token", token);
    const decoded = jwtDecode(token);
    const response = await getRoleNameById({ id: decoded.roleId });
    const roleName = response.data.name;

    setUser({
      id: decoded.accountId,
      roleId: decoded.roleId,
      roleName,
    });
    
    await checkShopStatus();
  };

  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
    setHasShop(null);
    setShop(null); // <-- RESET KHI LOGOUT
  };

  const isAuthenticated = !!user;

  return (
    <AuthContext.Provider 
      value={{ 
        user, 
        login, 
        logout, 
        isAuthenticated,
        hasShop,
        shop, // <-- CUNG CẤP SHOP RA BÊN NGOÀI
        checkShopStatus,
      }}
    >
      {mounted ? children : null}
    </AuthContext.Provider>
  );
};