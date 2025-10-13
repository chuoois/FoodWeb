import { useState, useContext } from "react"
import { Link, useNavigate } from "react-router-dom"
import {
  Search,
  X,
  MapPin,
  Crosshair,
  User,
  ChevronDown,
  UserCog,
  Heart,
  Clock,
  LogOut,
} from "lucide-react"
import { AuthContext } from "@/context/AuthContext"

export const HeaderDetail = () => {
  const [openSearch, setOpenSearch] = useState(false)
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [address, setAddress] = useState("")
  const { user, logout } = useContext(AuthContext)
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    setShowUserMenu(false)
    navigate("/")
  }

  const handleLocate = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          alert(`Vị trí của bạn:\nLat: ${pos.coords.latitude}\nLng: ${pos.coords.longitude}`)
        },
        (err) => alert("Không lấy được vị trí: " + err.message)
      )
    } else {
      alert("Trình duyệt không hỗ trợ định vị!")
    }
  }

  return (
    <>
      {/* Header */}
      <header className="w-full px-6 py-4 bg-white border-b border-orange-200 shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-6">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 bg-orange-500 rounded-full flex items-center justify-center shadow-md">
              <span className="text-white font-bold text-lg">Y</span>
            </div>
            <Link
              to="/"
              className="text-2xl font-bold text-gray-900 transition-colors"
            >
              Yummy<span className="text-orange-500">Go</span>
            </Link>
          </div>

          {/* Địa chỉ giao hàng */}
          <div className="flex items-center w-full max-w-md border border-orange-300 rounded-full px-3 py-2 bg-white shadow-sm">
            <MapPin className="w-5 h-5 text-gray-500" />
            <input
              type="text"
              placeholder="Nhập địa chỉ của bạn"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="flex-1 px-2 py-1 outline-none text-gray-700 bg-transparent"
            />
            <button onClick={handleLocate}>
              <Crosshair className="w-5 h-5 text-gray-500 hover:text-orange-500" />
            </button>
          </div>

          {/* Thanh tìm kiếm */}
          <div
            onClick={() => setOpenSearch(true)}
            className="flex items-center gap-2 w-full max-w-sm px-4 py-2 border border-orange-300 rounded-full bg-white hover:shadow-md transition cursor-pointer"
          >
            <Search className="w-5 h-5 text-gray-500" />
            <span className="text-gray-500 text-sm">Tìm món ăn hoặc nhà hàng</span>
          </div>

          {/* Menu tài khoản */}
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
                      to="/profile"
                      onClick={() => setShowUserMenu(false)}
                      className="w-full px-4 py-3 text-left text-sm hover:bg-orange-50 flex items-center gap-3 transition"
                    >
                      <User className="w-5 h-5 text-orange-500" />
                      <div>
                        <div className="font-medium text-gray-900">Hồ sơ cá nhân</div>
                        <div className="text-xs text-gray-500">{user.name}</div>
                      </div>
                    </Link>

                    <Link
                      to="/detail/favorite"
                      onClick={() => setShowUserMenu(false)}
                      className="w-full px-4 py-3 text-left text-sm hover:bg-orange-50 flex items-center gap-3 transition"
                    >
                      <Heart className="w-5 h-5 text-orange-500" />
                      <div>
                        <div className="font-medium text-gray-900">Yêu thích</div>
                        <div className="text-xs text-gray-500">Danh sách món</div>
                      </div>
                    </Link>

                    <Link
                      to="/detail/history"
                      onClick={() => setShowUserMenu(false)}
                      className="w-full px-4 py-3 text-left text-sm hover:bg-orange-50 flex items-center gap-3 transition"
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
                      onClick={() => setShowUserMenu(false)}
                      className="w-full px-4 py-3 text-left text-sm hover:bg-orange-50 flex items-center gap-3 transition"
                    >
                      <User className="w-5 h-5 text-orange-500" />
                      <div>
                        <div className="font-medium text-gray-900">Đăng nhập người dùng</div>
                        <div className="text-xs text-gray-500">Khách hàng</div>
                      </div>
                    </Link>

                    <hr className="my-2" />

                    <Link
                      to="/auth2"
                      onClick={() => setShowUserMenu(false)}
                      className="w-full px-4 py-3 text-left text-sm hover:bg-orange-50 flex items-center gap-3 transition"
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

      {/* Overlay tìm kiếm */}
      {openSearch && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-start pt-20 z-50">
          <div className="bg-white w-full max-w-2xl rounded-lg shadow-lg p-4 relative">
            {/* Nút đóng */}
            <button
              onClick={() => setOpenSearch(false)}
              className="absolute right-4 top-4 text-gray-500 hover:text-gray-700"
            >
              <X className="w-6 h-6" />
            </button>

            {/* Ô tìm kiếm */}
            <div className="flex items-center gap-2 border rounded-lg px-3 py-2">
              <Search className="w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Tìm món ăn hoặc nhà hàng"
                className="w-full outline-none"
              />
            </div>

            {/* Gợi ý tìm kiếm */}
            <div className="mt-6">
              <h3 className="text-sm font-semibold text-gray-600 mb-2">
                Tìm kiếm gần đây
              </h3>
              <div className="flex flex-wrap gap-2 mb-4">
                <span className="px-3 py-1 border rounded-full text-sm text-gray-700">
                  bún bò huế
                </span>
              </div>

              <h3 className="text-sm font-semibold text-gray-600 mb-2">
                Món hot hôm nay
              </h3>
              <div className="flex flex-wrap gap-2">
                {["trà sữa", "pizza", "cơm tấm", "bánh mì", "cháo", "mì cay"].map(
                  (item) => (
                    <span
                      key={item}
                      className="px-3 py-1 border rounded-full text-sm text-gray-700 hover:bg-gray-100 cursor-pointer"
                    >
                      {item}
                    </span>
                  )
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
