import { useState } from "react"
import { Link } from "react-router-dom"
import { MapPin, Crosshair } from "lucide-react";
import { Star, Heart, Clock } from "lucide-react"

const foodCategories = [
  {
    id: 1,
    name: "Đồ uống",
    slug: "do-uong",
    image: "/img-home/drinks.jpg",
    color: "from-blue-400 to-blue-600",
  },
  {
    id: 2,
    name: "Thức Ăn",
    slug: "do-an",
    image: "/img-home/fast-food.jpg",
    color: "from-orange-400 to-orange-600",
  },
]

const popularRestaurants = [
  {
    id: 1,
    name: "Bún Thịt Nướng Xuân Mai - Bún Mắm & Ăn Vặt - Chợ Bến Thành",
    image: "/img-home/restaurant-1.jpg",
    rating: 4.2,
    reviews: 29,
    address: "Sạp 1066/1090 Chợ Bến Thành, Lê Lợi...",
    isPromo: true,
    deliveryTime: "25-35 phút",
    category: "Bún, Mắm",
  },
  {
    id: 2,
    name: "Cua Bắc - Juice & Fruit - Lê Thánh Tôn",
    image: "/img-home/restaurant-2.jpg",
    rating: 4.8,
    reviews: 156,
    address: "164 Lê Thánh Tôn, Phường Bến Thành...",
    isPromo: true,
    deliveryTime: "15-25 phút",
    category: "Nước ép, Trái cây",
  },
  {
    id: 3,
    name: "Pin Wei - Bánh Cuốn Tươi - Phan Bội Châu",
    image: "/img-home/restaurant-3.jpg",
    rating: 4.6,
    reviews: 89,
    address: "14 Phan Bội Châu, Phường Bến Thành...",
    isPromo: true,
    deliveryTime: "20-30 phút",
    category: "Bánh cuốn",
  },
  {
    id: 4,
    name: "Trà Sữa, Sinh Tố & Bánh Ngọt Dung - Lê Thánh Tôn",
    image: "/img-home/restaurant-4.jpg",
    rating: 5.0,
    reviews: 17,
    address: "195 - 197 Lê Thánh Tôn, Phường Bến T...",
    isPromo: true,
    deliveryTime: "10-20 phút",
    category: "Trà sữa, Bánh ngọt",
  },
]

export const HomePage = () => {
  const [favorites, setFavorites] = useState([])
   const [address, setAddress] = useState("");

  const handleGetLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const coords = `Lat: ${pos.coords.latitude}, Lng: ${pos.coords.longitude}`;
          console.log("Vị trí hiện tại:", coords);
          setAddress(coords); // ✅ đưa vào input
        },
        (err) => alert("Không lấy được vị trí: " + err.message)
      );
    } else {
      alert("Trình duyệt không hỗ trợ định vị!");
    }
  };

  const toggleFavorite = (id) => {
    setFavorites((prev) =>
      prev.includes(id) ? prev.filter((fav) => fav !== id) : [...prev, id]
    )
  }

  return (
    <div className="bg-[#FBF4E6]">
      {/* Hero Section */}
      <section className="w-full px-6 py-16">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="space-y-8">
            <div className="space-y-4">
              <h1 className="text-5xl lg:text-6xl font-bold text-foreground leading-tight text-balance">
                Giao hàng nhanh,{" "}
                <span className="text-orange-500">mọi lúc!</span>
              </h1>
              <p className="text-lg text-muted-foreground leading-relaxed max-w-lg">
                Đặt món ăn yêu thích từ các nhà hàng tốt nhất trong thành phố.
                Giao hàng nhanh chóng, đảm bảo chất lượng.
              </p>
              
            </div>

              {/* Thanh nhập địa chỉ */}
          <div className="flex items-center w-full max-w-lg border border-blue-400 rounded-lg px-3 py-2 bg-white shadow-sm">
            <MapPin className="w-5 h-5 text-gray-500" />
            <input
              type="text"
              placeholder="Nhập địa chỉ của bạn"
              value={address}             // ✅ gắn value từ state
              onChange={(e) => setAddress(e.target.value)}
              className="flex-1 px-2 py-1 outline-none text-gray-700"
            />
            <button onClick={handleGetLocation}>
              <Crosshair className="w-5 h-5 text-gray-500 hover:text-orange-500" />
            </button>
          </div>
        </div>

          {/* Right Illustration */}
          <div className="relative">
            <div className="relative w-full h-96 rounded-3xl overflow-hidden shadow-2xl shadow-orange-200 transform hover:scale-105 transition-transform duration-500 ease-in-out animate-fade-in">
              <img
                src="/img-home/img-hero-section.png"
                alt="Delivery illustration"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Food Categories */}
      <section className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">
          Bộ sưu tập món ăn
        </h2>
        <div className="grid grid-cols-2 gap-4">
          {foodCategories.map((category) => (
            <Link
              key={category.id}
              to={`/menu/list/${category.slug}`}
              className="relative overflow-hidden cursor-pointer group hover:shadow-lg transition-all duration-300 rounded-lg bg-white"
            >
              <div className="aspect-[3/2] relative">
                <img
                  src={category.image || "/placeholder.svg"}
                  alt={category.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div
                  className={`absolute inset-0 bg-gradient-to-r ${category.color} opacity-60`}
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <h3 className="text-white text-xl font-bold text-center px-4">
                    {category.name}
                  </h3>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Popular Restaurants */}
      <section className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Quán ngon hot</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {popularRestaurants.map((restaurant) => (
            <div
              key={restaurant.id}
              className="overflow-hidden hover:shadow-lg transition-all duration-300 group rounded-lg bg-white"
            >
              <div className="relative">
                <img
                  src={restaurant.image || "/placeholder.svg"}
                  alt={restaurant.name}
                  className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                />
                {restaurant.isPromo && (
                  <div className="absolute top-3 left-3">
                    <span className="bg-green-500 text-white text-xs font-medium px-2 py-1 rounded">
                      PROMO
                    </span>
                  </div>
                )}
                <button
                  onClick={() => toggleFavorite(restaurant.id)}
                  className="absolute top-3 right-3 w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white transition-colors"
                >
                  <Heart
                    className={`w-4 h-4 ${
                      favorites.includes(restaurant.id)
                        ? "fill-red-500 text-red-500"
                        : "text-gray-600"
                    }`}
                  />
                </button>
              </div>

              <div className="p-4">
                <h3 className="font-semibold text-gray-800 mb-2 line-clamp-2 text-sm">
                  {restaurant.name}
                </h3>

                <div className="flex items-center gap-2 mb-2">
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <span className="text-sm font-medium">
                      {restaurant.rating}
                    </span>
                    <span className="text-xs text-gray-500">
                      ({restaurant.reviews})
                    </span>
                  </div>
                </div>

                <p className="text-xs text-gray-600 mb-2 line-clamp-1">
                  {restaurant.address}
                </p>

                <div className="flex items-center justify-between text-xs text-gray-500">
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    <span>{restaurant.deliveryTime}</span>
                  </div>
                  <span className="text-orange-600 font-medium">
                    {restaurant.category}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
