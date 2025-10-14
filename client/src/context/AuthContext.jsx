import React, { createContext, useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [mounted, setMounted] = useState(false); 

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decoded = jwtDecode(token);
        const currentTime = Date.now() / 1000;

        // ✅ Kiểm tra token hết hạn
        if (decoded.exp && decoded.exp < currentTime) {
          logout();
        } else {
          setUser({
            id: decoded.accountId,
            roleId: decoded.roleId,
          });
        }
      } catch (error) {
        console.error("Token decode failed:", error);
        logout();
      }
    }

    setMounted(true); 
  }, []);

  const login = (token) => {
    localStorage.setItem("token", token);
    try {
      const decoded = jwtDecode(token);
      setUser({
        id: decoded.accountId,
        roleId: decoded.roleId,
      });
    } catch (error) {
      console.error("Token decode error:", error);
    }
  };

  // ✅ Logout — xóa token và user
  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {mounted ? children : null}
    </AuthContext.Provider>
  );
};
