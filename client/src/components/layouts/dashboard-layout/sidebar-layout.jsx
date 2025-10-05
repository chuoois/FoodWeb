// src/components/admin/SidebarAdmin.jsx
import { NavLink } from "react-router-dom";
import { Home, ShoppingBag, Users, Settings, TrendingUp, Package } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export const SidebarAdmin = () => {
  const menuItems = [
    { to: "dashboard", label: "Tổng quan", icon: Home },
    { to: "orders", label: "Đơn hàng", icon: ShoppingBag, badge: 3 },
    { to: "menu", label: "Thực đơn", icon: Package },
    { to: "analytics", label: "Thống kê", icon: TrendingUp },
    { to: "customers", label: "Khách hàng", icon: Users },
    { to: "settings", label: "Cài đặt", icon: Settings },
  ];

  return (
    <aside className="w-64 bg-white border-r border-orange-200 min-h-[calc(100vh-73px)] sticky top-[73px]">
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
    </aside>
  );
};
