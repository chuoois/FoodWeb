
import { useState } from "react"
import { Link } from "react-router-dom"
import { Star, Heart, Clock, MapPin } from "lucide-react"

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

export function FoodCategoriesHome() {
  const [favorites, setFavorites] = useState([])

  const toggleFavorite = (id) => {
    setFavorites((prev) =>
      prev.includes(id) ? prev.filter((fav) => fav !== id) : [...prev, id]
    )
  }

  return (
    <div className=" bg-[#F7EFDF]">


      <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        {/* Bộ sưu tập món ăn */}
        <section>
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Bộ sưu tập món ăn</h2>
          <div className="grid grid-cols-2 gap-4">
            {foodCategories.map((category) => (
              <Link
                key={category.id}
                to={`/menu/list/${category.slug}`}   // 👈 dùng slug để tạo link
                className="relative overflow-hidden cursor-pointer group hover:shadow-lg transition-all duration-300 rounded-lg bg-white"
              >
                <div className="aspect-[3/2] relative">
                  <img
                    src={category.image || "/placeholder.svg"}
                    alt={category.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className={`absolute inset-0 bg-gradient-to-r ${category.color} opacity-60`} />
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

        {/* Quán ngon quanh đây */}
        <section>
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Quán ngon quanh đây</h2>
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
                      <span className="bg-green-500 text-white text-xs font-medium px-2 py-1 rounded">PROMO</span>
                    </div>
                  )}
                  <button
                    onClick={() => toggleFavorite(restaurant.id)}
                    className="absolute top-3 right-3 w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white transition-colors"
                  >
                    <Heart
                      className={`w-4 h-4 ${favorites.includes(restaurant.id) ? "fill-red-500 text-red-500" : "text-gray-600"
                        }`}
                    />
                  </button>
                </div>

                <div className="p-4">
                  <h3 className="font-semibold text-gray-800 mb-2 line-clamp-2 text-sm">{restaurant.name}</h3>

                  <div className="flex items-center gap-2 mb-2">
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      <span className="text-sm font-medium">{restaurant.rating}</span>
                      <span className="text-xs text-gray-500">({restaurant.reviews})</span>
                    </div>
                  </div>

                  <p className="text-xs text-gray-600 mb-2 line-clamp-1">{restaurant.address}</p>

                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span>{restaurant.deliveryTime}</span>
                    </div>
                    <span className="text-orange-600 font-medium">{restaurant.category}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Xem thêm */}
        {/* <div className="text-center">
          <button className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-3 rounded-lg font-medium transition-colors">
            Xem thêm quán ngon
          </button>
        </div> */}
      </div>
    </div>
  )
}
