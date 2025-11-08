import { Outlet, useNavigate } from "react-router-dom";
import { HeaderHome } from "../home-layout/header-home";
import { FooterHome } from "../home-layout/footer-home";
import { SidebarProfile } from "./Sidebar-Profile";
import { ArrowLeft } from "lucide-react";

export const MyProfileMainLayout = () => {
  const navigate = useNavigate();

  return (
    <>
      <HeaderHome />

      {/* 🔶 Header tiêu đề giống FavoritePage */}
      <div className="bg-orange-500 text-white py-6 px-4">
        <div className="max-w-6xl mx-auto flex items-center gap-3">
          {/* Nút quay lại chỉ hiện ở mobile */}
          <button onClick={() => navigate(-1)} className="lg:hidden">
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-2xl font-bold">Hồ Sơ Của Tôi</h1>
        </div>
      </div>

      {/* 📄 Nội dung gồm sidebar + phần chính */}
      <div className="flex min-h-[calc(100vh-180px)] bg-gray-50">
        <SidebarProfile />

        <div className="flex-1 p-6">
          <Outlet />
        </div>
      </div>

      <FooterHome />
    </>
  );
};
