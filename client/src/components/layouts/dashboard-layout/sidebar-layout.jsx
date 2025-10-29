// src/components/admin/SidebarAdmin.jsx
import { NavLink, useNavigate } from "react-router-dom";
import { Home, ShoppingBag, Settings, LogOut } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export const SidebarAdmin = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token"); // hoặc sessionStorage tùy bạn lưu token ở đâu
    navigate("/auth/login"); // điều hướng về trang đăng nhập
  };

  const menuItems = [
    { to: "list-user", label: "List Account", icon: Home },
    { to: "list-acc-pending", label: "Pending Accounts", icon: ShoppingBag },
    { to: "list-shop", label: "List Shop", icon: ShoppingBag },
    { to: "setting", label: "Settings", icon: Settings },
  ];

  return (
    <aside className="w-64 bg-white border-r border-orange-200 min-h-[calc(100vh-73px)] sticky top-[73px] flex flex-col justify-between">
      <nav className="p-4 space-y-2">
        {menuItems.map(({ to, label, icon: Icon, badge }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `w-full flex items-center gap-3 px-4 py-3 rounded-lg transition justify-start ${
                isActive ? "bg-orange-500 text-white" : "text-gray-700 hover:bg-orange-50"
              }`
            }
          >
            <Icon className="w-5 h-5" />
            <span className="font-medium">{label}</span>
            {badge && (
              <Badge variant="destructive" className="ml-auto bg-red-500 text-white text-xs px-2 py-1 rounded-full">
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
