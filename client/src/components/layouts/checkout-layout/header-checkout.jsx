import { Link } from "react-router-dom"
import { Search, MapPin, Crosshair } from "lucide-react"
import { Input } from "@/components/ui/input"

export const HeaderCheckOut = ({ searchQuery, setSearchQuery }) => {
  return (
    <div className="bg-white shadow-sm sticky top-0 z-10">
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between gap-6">
          {/* Left section - Logo */}
          <div className="flex items-center gap-3">
            <Link
              to="/"
              className="text-2xl font-bold text-gray-900 transition-colors"
            >
              Yummy<span className="text-orange-500">Go</span>
            </Link>
          </div>


          {/* Center section - Search Bar */}
          <div className="flex-1 max-w-md mx-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                type="text"
                placeholder="Tìm món ăn hoặc nhà hàng"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 text-sm border-gray-200 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Right section - Login button */}
          <Link
            to="/auth/login"
            className="bg-orange-500 hover:bg-orange-600 text-white font-semibold px-6 py-2 rounded-full shadow-md transition-all duration-300"
          >
            Đăng nhập/Đăng ký
          </Link>
        </div>
      </div>
    </div>
  )
}