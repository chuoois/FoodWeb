import { useState } from "react"
import { Star, Plus, Minus, ShoppingCart } from "lucide-react"
import { useNavigate } from "react-router-dom" // nếu bạn dùng react-router

const menuItems = [
  {
    id: "1",
    name: "Pizza Margherita",
    description: "Cà chua tươi, phô mai mozzarella, lá húng quế",
    price: 189000,
    image: "public/img-home/pizza-margherita.png",
    rating: 4.8,
    category: "Pizza",
    isPopular: true,
  },
  {
    id: "2",
    name: "Sushi Combo Deluxe",
    description: "12 miếng sushi tươi ngon với cá hồi, cá ngừ",
    price: 299000,
    image: "public/img-home/sushi-combo-platter.jpg",
    rating: 4.9,
    category: "Sushi",
    isNew: true,
  },
  {
    id: "3",
    name: "Burger Bò Úc",
    description: "Thịt bò Úc 200g, phô mai cheddar, rau tươi",
    price: 159000,
    image: "public/img-home/beef-cheeseburger.png",
    rating: 4.7,
    category: "Burgers",
  },
  {
    id: "4",
    name: "Salad Caesar",
    description: "Rau xà lách, gà nướng, phô mai parmesan, sốt caesar",
    price: 129000,
    image: "public/img-home/caesar-salad-with-chicken.png",
    rating: 4.6,
    category: "Salads",
  },
  {
    id: "5",
    name: "Pizza Pepperoni",
    description: "Xúc xích pepperoni, phô mai mozzarella, sốt cà chua",
    price: 209000,
    image: "public/img-home/pepperoni-pizza.png",
    rating: 4.8,
    category: "Pizza",
    isPopular: true,
  },
  {
    id: "6",
    name: "Sashimi Cá Hồi",
    description: "Cá hồi tươi sống thái lát mỏng, wasabi, gừng",
    price: 249000,
    image: "public/img-home/salmon-sashimi.png",
    rating: 4.9,
    category: "Sushi",
  },
]

const categories = ["Tất cả", "Pizza", "Sushi", "Burgers", "Salads"]

export const FoodCategoriesHome = () => {
  const [selectedCategory, setSelectedCategory] = useState("Tất cả")
  const [cart, setCart] = useState({})
  const navigate = useNavigate()

  const filteredItems =
    selectedCategory === "Tất cả"
      ? menuItems
      : menuItems.filter((item) => item.category === selectedCategory)

  const addToCart = (itemId) => {
    setCart((prev) => ({
      ...prev,
      [itemId]: (prev[itemId] || 0) + 1,
    }))
  }

  const removeFromCart = (itemId) => {
    setCart((prev) => ({
      ...prev,
      [itemId]: Math.max((prev[itemId] || 0) - 1, 0),
    }))
  }

  const formatPrice = (price) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price)
  }

  return (
    <section className="py-16 px-4 bg-[#F7EFDF]">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-foreground mb-4">
            Thực đơn YummyGo
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Khám phá những món ăn ngon được chế biến từ nguyên liệu tươi ngon nhất
          </p>
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap justify-center gap-3 mb-12">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-6 py-2 rounded-full transition-all duration-300 ${
                selectedCategory === category
                  ? "bg-orange-500 text-white shadow-lg"
                  : "bg-white border hover:bg-orange-100"
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Menu Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              className="group hover:shadow-xl transition-all duration-300 bg-white border rounded-xl overflow-hidden"
            >
              <div className="relative">
                <img
                  src={item.image || "/placeholder.svg"}
                  alt={item.name}
                  className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute top-3 left-3 flex gap-2">
                  {item.isPopular && (
                    <span className="px-2 py-1 text-xs font-medium rounded bg-orange-500 text-white">
                      Phổ biến
                    </span>
                  )}
                  {item.isNew && (
                    <span className="px-2 py-1 text-xs font-medium rounded bg-green-500 text-white">
                      Mới
                    </span>
                  )}
                </div>
                <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm rounded-full px-2 py-1 flex items-center gap-1">
                  <Star className="w-4 h-4 fill-orange-400 text-orange-400" />
                  <span className="text-sm font-medium">{item.rating}</span>
                </div>
              </div>

              <div className="p-6">
                <h3 className="text-xl font-bold text-foreground mb-2">
                  {item.name}
                </h3>
                <p className="text-muted-foreground mb-4 line-clamp-2">
                  {item.description}
                </p>

                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold text-orange-500">
                    {formatPrice(item.price)}
                  </span>

                  <div className="flex items-center gap-2">
                    {cart[item.id] > 0 && (
                      <>
                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="w-8 h-8 flex items-center justify-center border rounded-full hover:bg-orange-100"
                        >
                          <Minus className="w-4 h-4 text-orange-500" />
                        </button>
                        <span className="w-8 text-center font-medium">
                          {cart[item.id]}
                        </span>
                      </>
                    )}
                    <button
                      onClick={() => addToCart(item.id)}
                      className="flex items-center bg-orange-500 hover:bg-orange-600 text-white rounded-full px-4 py-2 transition-colors"
                    >
                      <Plus className="w-4 h-4 mr-1" />
                      {cart[item.id] > 0 ? "Thêm" : "Đặt món"}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Xem tất cả */}
        <div className="text-center mt-12">
          <button
            onClick={() => navigate("/menu")}
            className="px-6 py-3 rounded-full bg-orange-500 hover:bg-orange-600 text-white font-medium shadow-md transition-colors"
          >
            Xem tất cả
          </button>
        </div>

        {/* Cart Summary */}
        {Object.values(cart).some((qty) => qty > 0) && (
          <div className="fixed bottom-6 right-6 z-50">
            <button className="flex items-center bg-orange-500 hover:bg-orange-600 text-white rounded-full shadow-lg px-6 py-3 text-lg transition-colors">
              <ShoppingCart className="w-5 h-5 mr-2" />
              Giỏ hàng (
              {Object.values(cart).reduce((sum, qty) => sum + qty, 0)})
            </button>
          </div>
        )}
      </div>
    </section>
  )
}
