import React, { createContext, useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode"; // npm i jwt-decode

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // ✅ Kiểm tra token khi app load
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decoded = jwtDecode(token);
        const currentTime = Date.now() / 1000;

        // Nếu token hết hạn thì logout
        if (decoded.exp && decoded.exp < currentTime) {
          console.warn("Token hết hạn, tự động đăng xuất");
          logout();
        } else {
          console.log("Token decode:", decoded);
          setUser({
            id: decoded.accountId,
            roleId: decoded.roleId,
          });
        }
      } catch (err) {
        console.error("Token không hợp lệ:", err);
        logout();
      }
    }
    setLoading(false);
  }, []);

  // ✅ Hàm login
  const login = (token) => {
    localStorage.setItem("token", token);
    const decoded = jwtDecode(token);
    setUser({
      id: decoded.accountId,
      roleId: decoded.roleId,
    });
  };

  // ✅ Hàm logout
  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
