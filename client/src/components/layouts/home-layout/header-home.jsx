import { useState, useContext, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Search,
  X,
  User,
  ChevronDown,
  UserCog,
  Heart,
  Clock,
  LogOut,
} from "lucide-react";
import { AuthContext } from "@/context/AuthContext";
import { searchShopsAndFoods } from "@/services/home.service"; // <-- API gọi backend

export const HeaderHome = () => {
  const [openSearch, setOpenSearch] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [results, setResults] = useState([]);
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  // 🟠 Gọi API tìm kiếm khi người dùng nhập
  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      if (searchTerm.trim() !== "") {
        searchShopsAndFoods(searchTerm)
          .then((res) => {
            console.log("Kết quả tìm kiếm:", res.data);
            setResults(res.data?.data || []); // ✅ Fix 1
          })
          .catch(() => setResults([]));
      } else {
        setResults([]);
      }
    }, 500);

    return () => clearTimeout(delayDebounce);
  }, [searchTerm]);

  const handleLogout = () => {
    logout();
    setShowUserMenu(false);
    navigate("/");
  };

  // 🟠 Khi người dùng chọn 1 kết quả
  const handleSelectResult = (item) => {
    setOpenSearch(false);
    setSearchTerm("");
    setResults([]);

    if (item.type === "shop") {
      navigate(`/detail/${item.id}`);
    } else if (item.type === "food") {
      navigate(`/detail/${item.shopId}`);
    }
  };

  return (
    <>
      {/* Header */}
      <header className="w-full px-6 py-4 bg-[#FBF4E6] border-b border-orange-200 shadow-sm relative z-50">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 bg-orange-500 rounded-full flex items-center justify-center shadow-md">
              <span className="text-white font-bold text-lg">Y</span>
            </div>
            <div className="flex items-center gap-3">
              <Link
                to="/"
                className="text-2xl font-bold text-gray-900 transition-colors"
              >
                Yummy<span className="text-orange-500">Go</span>
              </Link>
            </div>
          </div>

          {/* Search trigger */}
          <div
            onClick={() => setOpenSearch(true)}
            className="flex items-center gap-2 w-full max-w-md px-4 py-2 border border-orange-300 rounded-full bg-white hover:shadow-md transition cursor-pointer"
          >
            <Search className="w-5 h-5 text-gray-500" />
            <span className="text-gray-500">Tìm món ăn hoặc nhà hàng</span>
          </div>

          {/* Account menu */}
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-semibold px-6 py-2 rounded-full shadow-md transition-all duration-300"
            >
              <User className="w-4 h-4" />
              <span>{user ? user.name || "Tài khoản" : "Đăng nhập"}</span>
              <ChevronDown className="w-4 h-4" />
            </button>

            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                {user ? (
                  <>
                    <Link
                      to="/my-profile"
                      className="w-full px-4 py-3 text-left text-sm hover:bg-orange-50 flex items-center gap-3 transition"
                      onClick={() => setShowUserMenu(false)}
                    >
                      <User className="w-5 h-5 text-orange-500" />
                      <div>
                        <div className="font-medium text-gray-900">Hồ sơ cá nhân</div>
                        <div className="text-xs text-gray-500">
                          {user.name || "Người dùng"}
                        </div>
                      </div>
                    </Link>

                    <Link
                      to="/detail/favorite"
                      className="w-full px-4 py-3 text-left text-sm hover:bg-orange-50 flex items-center gap-3 transition"
                      onClick={() => setShowUserMenu(false)}
                    >
                      <Heart className="w-5 h-5 text-orange-500" />
                      <div>
                        <div className="font-medium text-gray-900">Yêu thích</div>
                        <div className="text-xs text-gray-500">Danh sách món</div>
                      </div>
                    </Link>

                    <Link
                      to="/myorder"
                      className="w-full px-4 py-3 text-left text-sm hover:bg-orange-50 flex items-center gap-3 transition"
                      onClick={() => setShowUserMenu(false)}
                    >
                      <Clock className="w-5 h-5 text-orange-500" />
                      <div>
                        <div className="font-medium text-gray-900">Lịch sử đơn hàng</div>
                        <div className="text-xs text-gray-500">Đơn đã đặt</div>
                      </div>
                    </Link>

                    <hr className="my-2" />

                    <button
                      onClick={handleLogout}
                      className="w-full px-4 py-3 text-left text-sm hover:bg-orange-50 flex items-center gap-3 transition"
                    >
                      <LogOut className="w-5 h-5 text-orange-500" />
                      <div>
                        <div className="font-medium text-gray-900">Đăng xuất</div>
                        <div className="text-xs text-gray-500">Thoát tài khoản</div>
                      </div>
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      to="/auth/login"
                      className="w-full px-4 py-3 text-left text-sm hover:bg-orange-50 flex items-center gap-3 transition"
                      onClick={() => setShowUserMenu(false)}
                    >
                      <User className="w-5 h-5 text-orange-500" />
                      <div>
                        <div className="font-medium text-gray-900">Đăng nhập người dùng</div>
                        <div className="text-xs text-gray-500">Khách hàng</div>
                      </div>
                    </Link>
                    <hr className="my-2" />
                    <Link
                      to="/store-director/login"
                      className="w-full px-4 py-3 text-left text-sm hover:bg-orange-50 flex items-center gap-3 transition"
                      onClick={() => setShowUserMenu(false)}
                    >
                      <UserCog className="w-5 h-5 text-orange-500" />
                      <div>
                        <div className="font-medium text-gray-900">Đăng nhập đối tác</div>
                        <div className="text-xs text-gray-500">Đối tác</div>
                      </div>
                    </Link>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Overlay search */}
      {openSearch && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-start pt-20 z-50">
          <div className="bg-white w-full max-w-2xl rounded-lg shadow-lg p-4 relative">
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
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* Kết quả tìm kiếm */}
            {results.length > 0 && (
              <div className="mt-4 border-t pt-3 max-h-64 overflow-y-auto">
                {results.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => handleSelectResult(item)}
                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-orange-50 cursor-pointer transition"
                  >
                    <img
                      src={item.image || "/placeholder.svg"}
                      alt={item.name}
                      className="w-10 h-10 rounded-md object-cover"
                    />
                    <div>
                      <div className="font-medium text-gray-800">{item.name}</div>
                      {item.shopName && (
                        <div className="text-sm text-gray-500">{item.shopName}</div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};
