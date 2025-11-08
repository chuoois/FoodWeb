// src/components/user/SidebarProfile.jsx
import { NavLink, useNavigate } from "react-router-dom";
import { User, MapPin, Lock, Settings } from "lucide-react";

export const SidebarProfile = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    navigate("/login");
  };

  const menuItems = [
    { to: "/my-profile", label: "Hồ Sơ", icon: User },
    { to: "/my-profile/address", label: "Địa Chỉ", icon: MapPin },
    { to: "/my-profile/changepassword", label: "Đổi Mật Khẩu", icon: Lock },
    { to: "/my-profile/privacy", label: "Thiết Lập Riêng Tư", icon: Settings },
  ];

  return (
    <aside className="w-64 bg-white border-r border-gray-200 min-h-[calc(100vh-70px)] flex flex-col justify-between">
      <nav className="p-4 space-y-1">
        {menuItems.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === "/my-profile"} // ✅ chỉ thêm end cho đường dẫn gốc
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-2 rounded-md transition ${
                isActive
                  ? "bg-orange-500 text-white font-semibold"
                  : "text-gray-700 hover:bg-orange-50"
              }`
            }
          >
            <Icon className="w-5 h-5" />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>
    </aside>
  );
};
