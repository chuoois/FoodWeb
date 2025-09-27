import { useState } from "react";
import { Link } from "react-router-dom";
import { Search, X } from "lucide-react"; // icon

export const HeaderHome = () => {
  const [openSearch, setOpenSearch] = useState(false);

  return (
    <>
      {/* Header */}
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

          {/* Search trigger */}
          <div
            onClick={() => setOpenSearch(true)}
            className="flex items-center gap-2 w-full max-w-md px-4 py-2 border border-orange-300 rounded-full bg-white hover:shadow-md transition cursor-pointer"
          >
            <Search className="w-5 h-5 text-gray-500" />
            <span className="text-gray-500">Tìm món ăn hoặc nhà hàng</span>
          </div>

          {/* CTA Button */}
          <Link
            to="/auth/login"
            className="bg-orange-500 hover:bg-orange-600 text-white font-semibold px-6 py-2 rounded-full shadow-md transition-all duration-300"
          >
            Đăng nhập/Đăng ký
          </Link>
        </div>
      </header>

      {/* Overlay search */}
      {openSearch && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-start pt-20 z-50">
          <div className="bg-white w-full max-w-2xl rounded-lg shadow-lg p-4 relative">
            {/* Close button */}
            <button
              onClick={() => setOpenSearch(false)}
              className="absolute right-4 top-4 text-gray-500 hover:text-gray-700"
            >
              <X className="w-6 h-6" />
            </button>

            {/* Search input */}
            <div className="flex items-center gap-2 border rounded-lg px-3 py-2">
              <Search className="w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Tìm món ăn hoặc nhà hàng"
                className="w-full outline-none"
              />
            </div>

            {/* Gợi ý */}
            <div className="mt-6">
              <h3 className="text-sm font-semibold text-gray-600 mb-2">
                Tìm kiếm gần đây
              </h3>
              <div className="flex flex-wrap gap-2 mb-4">
                <span className="px-3 py-1 border rounded-full text-sm text-gray-700">
                  gà ủ muối
                </span>
              </div>

              <h3 className="text-sm font-semibold text-gray-600 mb-2">
                Món gì đang hot
              </h3>
              <div className="flex flex-wrap gap-2">
                {[
                  "mì cay",
                  "nem nướng",
                  "trà sữa",
                  "bún bò huế",
                  "pizza",
                  "cháo",
                  "bánh mì",
                ].map((item) => (
                  <span
                    key={item}
                    className="px-3 py-1 border rounded-full text-sm text-gray-700 hover:bg-gray-100 cursor-pointer"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
