// src/components/common/Sidebar.jsx
import { NavLink, useNavigate } from "react-router-dom";
import { Home, ShoppingBag, Settings, LogOut, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export const Sidebar = () => {
  const navigate = useNavigate();
  const role = localStorage.getItem("role"); // 👉 Lấy role hiện tại

  const handleLogout = () => {
  // ✅ Xóa tất cả thông tin đăng nhập lưu trong localStorage
  localStorage.removeItem("token");
  localStorage.removeItem("refreshToken");
  localStorage.removeItem("role");
  localStorage.removeItem("userId");
  localStorage.removeItem("username");

  // Hoặc xóa toàn bộ luôn (nếu không lưu gì khác ngoài login)
  // localStorage.clear();

  // ✅ Chuyển về trang đăng nhập
  navigate("/auth/login");
};


  // 👉 Menu theo từng role
  const menuByRole = {
    ADMIN: [
      { to: "list-user", label: "List Account", icon: Users },
      { to: "list-shop", label: "List Shop", icon: ShoppingBag },
      { to: "setting", label: "Settings", icon: Settings },
    ],
    MANAGER_STAFF: [
      { to: "manage-shop", label: "Manage Shop", icon: ShoppingBag },
      { to: "report", label: "Reports", icon: Home },
    ],
    CUSTOMER: [
      { to: "profile", label: "My Profile", icon: Users },
      { to: "orders", label: "My Orders", icon: ShoppingBag },
    ],
  };

  // 👉 Lấy danh sách menu tương ứng role
  const menuItems = menuByRole[role] || [];

  return (
    <aside className="w-64 bg-white border-r border-orange-200 min-h-[calc(100vh-73px)] sticky top-[73px] flex flex-col justify-between">
      <nav className="p-4 space-y-2">
        {menuItems.map(({ to, label, icon: Icon, badge }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `w-full flex items-center gap-3 px-4 py-3 rounded-lg transition justify-start ${
                isActive
                  ? "bg-orange-500 text-white"
                  : "text-gray-700 hover:bg-orange-50"
              }`
            }
          >
            <Icon className="w-5 h-5" />
            <span className="font-medium">{label}</span>
            {badge && (
              <Badge
                variant="destructive"
                className="ml-auto bg-red-500 text-white text-xs px-2 py-1 rounded-full"
              >
                {badge}
              </Badge>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Nút đăng xuất */}
      <div className="p-4 border-t border-orange-100">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-red-600 hover:bg-red-50 transition"
        >
          <LogOut className="w-5 h-5" />
          <span className="font-medium">Đăng xuất</span>
        </button>
      </div>
    </aside>
  );
};
