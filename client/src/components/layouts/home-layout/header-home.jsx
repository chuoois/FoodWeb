import {
  Search,
  X,
  User,
  ChevronDown,
  Heart,
  Clock,
  LogOut,
} from "lucide-react";
import { useState, useEffect } from "react";  // Thêm useEffect
import { useNavigate, Link } from "react-router-dom";

export const HeaderHome = () => {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  // Sửa: Khởi tạo isLoggedIn từ localStorage
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    return localStorage.getItem("isLoggedIn") === "true";
  });
  const [recentSearches] = useState(["gà ủ muối", "bún bò huế"]);
  const navigate = useNavigate();

  const trendingItems = [
    "nem nướng",
    "bún bò huế",
    "jollibee",
    "cơm",
    "bún đậu mắm tôm",
    "lotteria",
    "bún chả",
    "mì cay",
    "cơm gà",
    "cơm tấm",
    "gà rán",
    "highlands coffee",
    "mỳ cay",
    "gà ủ muối",
    "bún riêu",
    "bún đậu",
    "cơm thố anh nguyên",
    "cơm thố",
    "nem nướng nha trang tâm việt",
    "cháo",
    "bánh mì",
    "trà sữa mixue",
    "cơm rang",
  ];

  // Thêm: Lắng nghe thay đổi localStorage (hỗ trợ multi-tab)
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === "isLoggedIn") {
        setIsLoggedIn(e.newValue === "true");
      }
    };
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  // Sửa: handleLogout xóa localStorage
  const handleLogout = () => {
    localStorage.removeItem("isLoggedIn");
    setIsLoggedIn(false);
    setShowUserMenu(false);
  };

  return (
    <>
      <header className="bg-gray-400 px-6 py-4 relative z-40">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <Link to="/">
            <div className="flex-shrink-0">
              <h1 className="text-3xl font-bold text-yellow-400">beFood</h1>
            </div>
          </Link>

          <div
            onClick={() => setIsSearchOpen(true)}
            className="flex-1 max-w-md cursor-pointer"
          >
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-500" />
              </div>
              <input
                type="text"
                placeholder="Tìm món ăn hoặc nhà hàng"
                readOnly
                className="w-full pl-10 pr-4 py-2.5 rounded-lg border-0 focus:ring-2 focus:ring-yellow-400 focus:outline-none cursor-pointer"
              />
            </div>
          </div>

          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex-shrink-0 bg-yellow-400 hover:bg-yellow-500 text-black font-semibold px-6 py-2.5 rounded-lg flex items-center gap-2 transition-colors"
            >
              <User className="h-5 w-5" />
              <span>{isLoggedIn ? "Tài khoản" : "Đăng nhập/Đăng ký"}</span>
              <ChevronDown className="h-4 w-4" />
            </button>

            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-50">
                {isLoggedIn ? (
                  <>
                    <button
                      className="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center gap-3 transition"
                      onClick={() => setShowUserMenu(false)}
                    >
                      <User className="w-5 h-5 text-yellow-500" />
                      <div>
                        <div className="font-medium text-gray-900">
                          Thông tin cá nhân
                        </div>
                        <div className="text-xs text-gray-500">
                          Xem và chỉnh sửa profile
                        </div>
                      </div>
                    </button>
                    <button
                      className="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center gap-3 transition"
                      onClick={() => setShowUserMenu(false)}
                    >
                      <Heart className="w-5 h-5 text-yellow-500" />
                      <div>
                        <div className="font-medium text-gray-900">
                          Nhà hàng yêu thích
                        </div>
                        <div className="text-xs text-gray-500">
                          Danh sách yêu thích
                        </div>
                      </div>
                    </button>
                    <button
                      className="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center gap-3 transition"
                      onClick={() => setShowUserMenu(false)}
                    >
                      <Clock className="w-5 h-5 text-yellow-500" />
                      <div>
                        <div className="font-medium text-gray-900">
                          Lịch sử đơn hàng
                        </div>
                        <div className="text-xs text-gray-500">
                          Xem đơn hàng đã đặt
                        </div>
                      </div>
                    </button>
                    <hr className="my-2 border-gray-200" />
                    <button
                      onClick={handleLogout}
                      className="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center gap-3 transition"
                    >
                      <LogOut className="w-5 h-5 text-red-500" />
                      <div>
                        <div className="font-medium text-gray-900">
                          Đăng xuất
                        </div>
                        <div className="text-xs text-gray-500">
                          Thoát tài khoản
                        </div>
                      </div>
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => {
                        navigate("/auth/login");
                        setShowUserMenu(false);
                      }}
                      className="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center gap-3 transition"
                    >
                      <User className="w-5 h-5 text-yellow-500" />
                      <div>
                        <div className="font-medium text-gray-900">
                          Đăng nhập
                        </div>
                        <div className="text-xs text-gray-500">
                          Đăng nhập tài khoản
                        </div>
                      </div>
                    </button>

                    <button
                      onClick={() => {
                        navigate("/auth/login2");
                        setShowUserMenu(false);
                      }}
                      className="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center gap-3 transition"
                    >
                      <User className="w-5 h-5 text-yellow-500" />
                      <div>
                        <div className="font-medium text-gray-900">
                          Đăng nhập
                        </div>
                        <div className="text-xs text-gray-500">
                          Đăng nhập admin
                        </div>
                      </div>
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Search Modal Overlay */}
      {isSearchOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-20">
          <div className="bg-white rounded-2xl w-full max-w-3xl mx-4 shadow-2xl">
            {/* Search Input */}
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <Search className="h-6 w-6 text-gray-400 flex-shrink-0" />
                <input
                  type="text"
                  placeholder="Tìm món ăn hoặc nhà hàng"
                  autoFocus
                  className="flex-1 text-lg outline-none"
                />
                <button
                  onClick={() => setIsSearchOpen(false)}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X className="h-6 w-6 text-gray-500" />
                </button>
              </div>
            </div>

            {/* Search Content */}
            <div className="p-6 max-h-96 overflow-y-auto">
              {/* Recent Searches */}
              {recentSearches.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-sm font-semibold text-gray-600 uppercase mb-3">
                    Tìm kiếm gần đây
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {recentSearches.map((item, index) => (
                      <button
                        key={index}
                        className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full text-sm transition-colors"
                      >
                        {item}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Trending Section */}
              <div>
                <h3 className="text-sm font-semibold text-gray-600 uppercase mb-3">
                  Món gì đang hot
                </h3>
                <div className="flex flex-wrap gap-2">
                  {trendingItems.map((item, index) => (
                    <button
                      key={index}
                      className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full text-sm transition-colors"
                    >
                      {item}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};