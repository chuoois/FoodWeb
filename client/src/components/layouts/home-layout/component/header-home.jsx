import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

export const HeaderHome = () => {
  return (
    <header className="w-full px-6 py-4 bg-[#FBF4E6] backdrop-blur-md border-b border-orange-200 shadow-sm ">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 bg-orange-500 rounded-full flex items-center justify-center shadow-md">
            <span className="text-white font-bold text-lg">Y</span>
          </div>
          <span className="text-2xl font-bold text-gray-900">
            Yummy<span className="text-orange-500">Go</span>
          </span>
        </div>

        {/* Navigation */}
        <nav className="hidden md:flex items-center gap-8">
          <a
            href="#"
            className="text-gray-900 hover:text-orange-500 transition-colors font-medium"
          >
            Trang chủ
          </a>
          <a
            href="#"
            className="text-gray-600 hover:text-orange-500 transition-colors font-medium"
          >
            Thực đơn
          </a>
          <a
            href="#"
            className="text-gray-600 hover:text-orange-500 transition-colors font-medium"
          >
            Khuyến mãi
          </a>
          <a
            href="#"
            className="text-gray-600 hover:text-orange-500 transition-colors font-medium"
          >
            Liên hệ
          </a>
        </nav>

        {/* CTA Button */}
        <Link
          to="/auth/login"
          className="bg-orange-500 hover:bg-orange-600 text-white font-semibold px-6 py-2 rounded-full shadow-md transition-all duration-300"
        >
          Đăng nhập/Đăng ký
        </Link>
      </div>
    </header>
  );
};
