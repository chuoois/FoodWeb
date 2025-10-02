import { useState } from "react"
import { Search, MapPin, User, Target } from "lucide-react"

export const HeaderDetail = () => {
  const [searchQuery, setSearchQuery] = useState("")
  const [location, setLocation] = useState("Giải Phóng, Giải Phóng, P.Giáp Bát, Q.Hoà")

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between gap-6">
          
          {/* Logo */}
          <a href="/" className="flex-shrink-0">
            <h1 className="text-3xl font-bold text-blue-500">beFood</h1>
          </a>

          {/* Location Selector */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <span className="text-sm font-medium text-gray-700 whitespace-nowrap">GIAO TỚI</span>
            <button className="flex items-center gap-2 text-sm text-gray-700 hover:text-blue-500 transition-colors group">
              <MapPin className="w-4 h-4 text-gray-500 group-hover:text-blue-500" />
              <span className="max-w-xs truncate">{location}</span>
              <Target className="w-4 h-4 text-gray-400 group-hover:text-blue-500" />
            </button>
          </div>

          {/* Search Bar */}
          <div className="flex-1 max-w-2xl">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Tìm món ăn hoặc nhà hàng"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
              />
            </div>
          </div>

          {/* User Account */}
          <button className="flex-shrink-0 w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors">
            <User className="w-5 h-5 text-gray-600" />
          </button>

        </div>
      </div>
    </header>
  )
}