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
  Store,
  UtensilsCrossed,
  ChevronRight,
  MapPin,
} from "lucide-react";
import { AuthContext } from "@/context/AuthContext";
import { searchShopsAndFoods } from "@/services/home.service";
import { useState, useEffect, useContext } from "react";

// Hook: Tự động cập nhật vị trí từ sessionStorage
const useUserLocation = () => {
  const [location, setLocation] = useState(null);

  useEffect(() => {
    const updateLocation = () => {
      const saved = sessionStorage.getItem("userLocation");
      if (saved) {
        try {
          const loc = JSON.parse(saved);
          if (loc.lat && loc.lng) {
            setLocation(loc);
          }
        } catch (e) {
          console.error("Lỗi parse userLocation:", e);
        }
      }
    };

    updateLocation();
    window.addEventListener("storage", updateLocation);
    return () => window.removeEventListener("storage", updateLocation);
  }, []);

  return location;
};

export const HeaderHome = () => {
  const [openSearch, setOpenSearch] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState("all");

  const userLocation = useUserLocation(); // Tự động cập nhật
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  // Gọi API tìm kiếm
  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      if (searchTerm.trim() !== "") {
        setLoading(true);
        const params = { query: searchTerm };
        if (userLocation?.lat && userLocation?.lng) {
          params.lat = userLocation.lat;
          params.lng = userLocation.lng;
        }

        searchShopsAndFoods(params)
          .then((res) => {
            let data = res.data?.data || [];
            // Lọc thêm ở frontend: chỉ hiện <= 5000m
            if (userLocation) {
              data = data.filter(
                (item) => item.distance === null || item.distance <= 5000
              );
            }
            setResults(data);
          })
          .catch((err) => {
            console.error("Lỗi tìm kiếm:", err);
            setResults([]);
          })
          .finally(() => setLoading(false));
      } else {
        setResults([]);
      }
    }, 500);

    return () => clearTimeout(delayDebounce);
  }, [searchTerm, userLocation]);

  const handleLogout = () => {
    logout();
    setShowUserMenu(false);
    navigate("/");
  };

  const handleSelectResult = (item) => {
    setOpenSearch(false);
    setSearchTerm("");
    setResults([]);
    setFilter("all");
    if (item.type === "shop") {
      navigate(`/detail/${item.id}`);
    } else if (item.type === "food") {
      navigate(`/detail/${item.shopId}`);
    }
  };

  const filteredResults = results.filter((item) => {
    if (filter === "all") return true;
    return item.type === filter;
  });

  const shopCount = results.filter((r) => r.type === "shop").length;
  const foodCount = results.filter((r) => r.type === "food").length;

  return (
    <>
      {/* Header */}
      <header className="w-full px-6 py-4 bg-[#FBF4E6] border-b border-orange-200 shadow-sm relative z-50">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 bg-orange-500 rounded-full flex items-center justify-center shadow-md">
              <span className="text-white font-bold text-lg">Y</span>
            </div>
            <Link
              to="/"
              className="text-2xl font-bold text-gray-900 hover:text-orange-600 transition-colors"
            >
              Yummy<span className="text-orange-500">Go</span>
            </Link>
          </div>

          <div
            onClick={() => setOpenSearch(true)}
            className="flex items-center gap-2 w-full max-w-md px-4 py-2 border border-orange-300 rounded-full bg-white hover:shadow-md transition cursor-pointer"
          >
            <Search className="w-5 h-5 text-gray-500" />
            <span className="text-gray-500">
              {userLocation
                ? "Tìm quán gần bạn..."
                : "Tìm món ăn hoặc nhà hàng"}
            </span>
          </div>

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
                        <div className="font-medium text-gray-900">
                          Hồ sơ cá nhân
                        </div>
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
                        <div className="font-medium text-gray-900">
                          Yêu thích
                        </div>
                        <div className="text-xs text-gray-500">
                          Danh sách món
                        </div>
                      </div>
                    </Link>
                    <Link
                      to="/myorder"
                      className="w-full px-4 py-3 text-left text-sm hover:bg-orange-50 flex items-center gap-3 transition"
                      onClick={() => setShowUserMenu(false)}
                    >
                      <Clock className="w-5 h-5 text-orange-500" />
                      <div>
                        <div className="font-medium text-gray-900">
                          Lịch sử đơn hàng
                        </div>
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
                    <Link
                      to="/auth/login"
                      className="w-full px-4 py-3 text-left text-sm hover:bg-orange-50 flex items-center gap-3 transition"
                      onClick={() => setShowUserMenu(false)}
                    >
                      <User className="w-5 h-5 text-orange-500" />
                      <div>
                        <div className="font-medium text-gray-900">
                          Đăng nhập người dùng
                        </div>
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
                        <div className="font-medium text-gray-900">
                          Đăng nhập đối tác
                        </div>
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

      {/* Search Modal */}
      {openSearch && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-start pt-20 z-50">
          <div className="bg-white w-full max-w-2xl rounded-lg shadow-2xl relative max-h-[80vh] flex flex-col">
            <div className="p-4 border-b">
              <button
                onClick={() => {
                  setOpenSearch(false);
                  setSearchTerm("");
                  setResults([]);
                  setFilter("all");
                }}
                className="absolute right-4 top-4 text-gray-500 hover:text-gray-700 transition"
              >
                <X className="w-6 h-6" />
              </button>

              {userLocation && (
                <div className="mb-3 flex items-center gap-2 text-xs text-gray-500 bg-orange-50 px-3 py-2 rounded-lg">
                  <MapPin className="w-4 h-4 text-orange-500" />
                  <span>
                    Tìm kiếm trong bán kính{" "}
                    <strong className="text-orange-600">5km</strong> từ vị trí
                    của bạn
                  </span>
                </div>
              )}

              <div className="flex items-center gap-2 border-2 border-orange-300 rounded-lg px-3 py-2 focus-within:border-orange-500 transition">
                <Search className="w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder={
                    userLocation
                      ? "Tìm quán gần bạn..."
                      : "Tìm món ăn hoặc nhà hàng..."
                  }
                  className="w-full outline-none text-gray-800 placeholder:text-gray-400"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  autoFocus
                />
                {loading && (
                  <div className="animate-spin w-4 h-4 border-2 border-orange-500 border-t-transparent rounded-full"></div>
                )}
              </div>

              {results.length > 0 && (
                <div className="flex gap-2 mt-3">
                  <button
                    onClick={() => setFilter("all")}
                    className={`px-4 py-1.5 rounded-full text-sm font-medium transition ${
                      filter === "all"
                        ? "bg-orange-500 text-white shadow-md"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    Tất cả ({results.length})
                  </button>
                  {shopCount > 0 && (
                    <button
                      onClick={() => setFilter("shop")}
                      className={`px-4 py-1.5 rounded-full text-sm font-medium transition flex items-center gap-1 ${
                        filter === "shop"
                          ? "bg-orange-500 text-white shadow-md"
                          : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                      }`}
                    >
                      <Store className="w-4 h-4" /> Quán ({shopCount})
                    </button>
                  )}
                  {foodCount > 0 && (
                    <button
                      onClick={() => setFilter("food")}
                      className={`px-4 py-1.5 rounded-full text-sm font-medium transition flex items-center gap-1 ${
                        filter === "food"
                          ? "bg-orange-500 text-white shadow-md"
                          : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                      }`}
                    >
                      <UtensilsCrossed className="w-4 h-4" /> Món ăn (
                      {foodCount})
                    </button>
                  )}
                </div>
              )}
            </div>

            <div className="flex-1 overflow-y-auto p-4">
              {!searchTerm.trim() && (
                <div className="text-center py-12">
                  <Search className="w-16 h-16 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-600 font-medium mb-1">
                    {userLocation
                      ? "Tìm quán gần bạn"
                      : "Tìm món ăn hoặc nhà hàng"}
                  </p>
                  <p className="text-gray-500 text-sm">
                    {userLocation
                      ? "Chỉ hiển thị kết quả trong bán kính 5km"
                      : "Nhập tên để tìm kiếm"}
                  </p>
                </div>
              )}

              {searchTerm.trim() && loading && (
                <div className="text-center py-12">
                  <div className="animate-spin w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full mx-auto mb-3"></div>
                  <p className="text-gray-500 text-sm">Đang tìm kiếm...</p>
                </div>
              )}

              {searchTerm.trim() &&
                !loading &&
                filteredResults.length === 0 && (
                  <div className="text-center py-12">
                    <X className="w-16 h-16 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-600 font-medium mb-1">
                      Không tìm thấy kết quả
                    </p>
                    <p className="text-gray-500 text-sm">
                      {userLocation
                        ? "Không có quán nào trong bán kính 5km phù hợp với từ khóa"
                        : "Thử tìm kiếm với từ khóa khác"}
                    </p>
                  </div>
                )}

              {filteredResults.length > 0 && (
                <div className="space-y-2">
                  {filteredResults.map((item) => (
                    <div
                      key={`${item.type}-${item.id}`}
                      onClick={() => handleSelectResult(item)}
                      className="flex items-center gap-3 p-3 rounded-lg hover:bg-orange-50 cursor-pointer transition group border border-transparent hover:border-orange-200"
                    >
                      <div className="relative flex-shrink-0">
                        <img
                          src={item.image || "/placeholder.svg"}
                          alt={item.name}
                          className="w-14 h-14 rounded-lg object-cover shadow-sm"
                        />
                        {item.type === "shop" && (
                          <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-orange-500 rounded-full flex items-center justify-center border-2 border-white">
                            <Store className="w-3 h-3 text-white" />
                          </div>
                        )}
                        {item.type === "food" && (
                          <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center border-2 border-white">
                            <UtensilsCrossed className="w-3 h-3 text-white" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-gray-800 group-hover:text-orange-600 transition line-clamp-1">
                          {item.name}
                        </div>
                        {item.shopName && (
                          <div className="text-sm text-gray-500 flex items-center gap-1 mt-0.5">
                            <Store className="w-3 h-3" />
                            <span className="line-clamp-1">
                              {item.shopName}
                            </span>
                          </div>
                        )}
                        {item.type === "shop" && item.address && (
                          <div className="text-xs text-gray-400 line-clamp-1 mt-0.5">
                            {item.address}
                          </div>
                        )}
                        {item.distance !== null && (
                          <div className="flex items-center gap-1 text-xs text-orange-500 mt-1">
                            <MapPin className="w-3 h-3" />
                            <span className="font-medium">
                              {item.distance}m
                            </span>
                          </div>
                        )}
                      </div>
                      <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-orange-500 transition flex-shrink-0" />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
