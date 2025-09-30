import { useState } from "react";
import { Star, Heart, User, Plus, Minus, ShoppingCart, Search, MapPin, Clock, Phone } from "lucide-react";

const products = [
  {
    id: 1,
    title: "BLACK COFFEE - Cà phê đen kiểu Tonkin",
    desc: "Tràn đầy cảm hứng bắt đầu ngày mới",
    sold: 6,
    price: 49000,
    img: "https://images.unsplash.com/photo-1509042239860-f550ce710b93",
  },
  {
    id: 2,
    title: "MILK COFFEE - Cà phê Bạc xỉu kiểu Tonkin",
    desc: "Công thức Bạc xỉu độc quyền tại quán",
    sold: 50,
    price: 49000,
    img: "https://images.unsplash.com/photo-1509042239861-f550ce710b94",
  },
  {
    id: 3,
    title: "COCONUT MILK COFFEE - Cà phê sữa dừa kiểu Tonkin",
    desc: "Hương vị sữa dừa thơm béo kết hợp độc đáo",
    sold: 10,
    price: 59000,
    img: "https://images.unsplash.com/photo-1509042239862-f550ce710b95",
  },
  {
    id: 4,
    title: "NUT MILK COFFEE - Cà phê sữa hạt kiểu Tonkin",
    desc: "Lựa chọn tinh tế cho sức khỏe với sữa hạt",
    sold: 0,
    price: 55000,
    img: "https://images.unsplash.com/photo-1509042239863-f550ce710b96",
  },
  {
    id: 5,
    title: "ESPRESSO - Cà phê Espresso đậm đà",
    desc: "Hương vị cà phê nguyên chất, đậm đà",
    sold: 15,
    price: 45000,
    img: "https://images.unsplash.com/photo-1510591509098-f4fdc6d0ff04",
  },
  {
    id: 6,
    title: "CAPPUCCINO - Cà phê Cappuccino kem sữa",
    desc: "Lớp foam mịn màng, hương vị cân bằng",
    sold: 25,
    price: 52000,
    img: "https://images.unsplash.com/photo-1572442388796-11668a67e53d",
  },
];

const CartItem = ({ item, onDecrease, onIncrease }) => (
  <div className="flex items-center gap-3 py-3 border-b border-orange-100">
    <img src={item.img} alt={item.title} className="w-16 h-16 rounded-lg object-cover" />
    <div className="flex-1 min-w-0">
      <div className="text-sm font-semibold text-gray-900 line-clamp-1">{item.title}</div>
      <div className="text-sm font-semibold text-orange-500 mt-1">
        {item.price.toLocaleString()}đ
      </div>
    </div>
    <div className="flex items-center gap-2">
      <button
        onClick={() => onDecrease(item.id)}
        className="w-7 h-7 rounded-full border border-orange-300 flex items-center justify-center hover:bg-orange-50 transition"
      >
        <Minus className="w-4 h-4 text-orange-500" />
      </button>
      <span className="w-8 text-center font-medium text-gray-900">{item.qty}</span>
      <button
        onClick={() => onIncrease(item.id)}
        className="w-7 h-7 rounded-full bg-orange-500 flex items-center justify-center hover:bg-orange-600 transition"
      >
        <Plus className="w-4 h-4 text-white" />
      </button>
    </div>
  </div>
);

export const FoodDetailHome = () => {
  const [cartItems, setCartItems] = useState([
    {
      id: 1,
      qty: 1,
      title: products[0].title,
      price: products[0].price,
      img: products[0].img,
    },
    {
      id: 2,
      qty: 1,
      title: products[1].title,
      price: products[1].price,
      img: products[1].img,
    },
  ]);
  const [liked, setLiked] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("CAFE VIỆT NAM");

  const categories = [
    { name: "TONKIN SIGNATURE", count: 4 },
    { name: "CAFE VIỆT NAM", count: 6 },
    { name: "CAFE PHA MÁY", count: 5 },
    { name: "COLD BREW", count: 3 },
  ];

  const handleIncrease = (id) => {
    setCartItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, qty: item.qty + 1 } : item
      )
    );
  };

  const handleDecrease = (id) => {
    setCartItems((prev) =>
      prev.map((item) =>
        item.id === id && item.qty > 1 ? { ...item, qty: item.qty - 1 } : item
      )
    );
  };

  const addToCart = (product) => {
    const existingItem = cartItems.find((item) => item.id === product.id);
    if (existingItem) {
      handleIncrease(product.id);
    } else {
      setCartItems((prev) => [
        ...prev,
        {
          id: product.id,
          qty: 1,
          title: product.title,
          price: product.price,
          img: product.img,
        },
      ]);
    }
  };

  const total = cartItems.reduce((sum, i) => sum + i.qty * i.price, 0);
  const totalItems = cartItems.reduce((sum, i) => sum + i.qty, 0);

  return (
    <div className="bg-[#F7EFDF] min-h-screen">
      {/* Restaurant Header */}
      <div className="bg-white border-b border-orange-200">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex gap-6">
            {/* Restaurant Image */}
            <div className="w-80 h-52 rounded-xl overflow-hidden shadow-md flex-shrink-0">
              <img
                src="https://images.unsplash.com/photo-1554118811-1e0d58224f24"
                alt="Cafe Tonkin Cottage"
                className="w-full h-full object-cover"
              />
            </div>

            {/* Restaurant Info */}
            <div className="flex-1">
              {/* Title and Like Button */}
              <div className="flex justify-between items-start mb-3">
                <h1 className="text-3xl font-bold text-gray-900">
                  Cafe Tonkin Cottage - Lý Tự Trọng
                </h1>
                <button
                  onClick={() => setLiked(!liked)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full border transition ${
                    liked
                      ? "bg-red-50 border-red-300 text-red-600"
                      : "bg-white border-gray-300 text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  <Heart className={`w-4 h-4 ${liked ? "fill-red-500" : ""}`} />
                  <span className="text-sm font-medium">Yêu thích</span>
                </button>
              </div>

              {/* Address */}
              <div className="flex items-center gap-2 text-gray-600 mb-3">
                <MapPin className="w-4 h-4 text-orange-500" />
                <p className="text-sm">
                  91 Lý Tự Trọng, Bến Thành, Quận 1, Hồ Chí Minh, Việt Nam
                </p>
              </div>

              {/* Rating and Info */}
              <div className="flex items-center gap-4 mb-4">
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1 bg-orange-50 px-3 py-1 rounded-full">
                    <Star className="w-4 h-4 fill-orange-400 text-orange-400" />
                    <span className="font-semibold text-gray-900">4.7</span>
                  </div>
                  <a href="#" className="text-sm text-orange-500 hover:underline">
                    (63 Đánh giá)
                  </a>
                </div>
                <div className="flex items-center gap-2 text-gray-600 text-sm">
                  <Clock className="w-4 h-4 text-orange-500" />
                  <span>8:00 - 22:00</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600 text-sm">
                  <Phone className="w-4 h-4 text-orange-500" />
                  <span>1900 1234</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-3 mb-4">
                <button className="flex items-center gap-2 border border-orange-300 rounded-full px-4 py-2 text-sm text-gray-700 hover:bg-orange-50 transition">
                  <span>Nhà hàng tương tự</span>
                  <span className="text-xs">▼</span>
                </button>
                <button className="flex items-center gap-2 border border-orange-300 rounded-full px-4 py-2 text-sm text-gray-700 hover:bg-orange-50 transition">
                  <User className="w-4 h-4" />
                  <span>Đặt theo nhóm</span>
                </button>
              </div>

              {/* Search Bar */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="search"
                  placeholder="Tìm kiếm món ăn trong quán..."
                  className="w-full pl-10 pr-4 py-2 border border-orange-300 rounded-full bg-white text-gray-700 placeholder-gray-400 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-200"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Category Filter */}
      <div className="bg-white border-b border-orange-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex gap-3 overflow-x-auto scrollbar-hide">
            {categories.map((cat) => (
              <button
                key={cat.name}
                onClick={() => setSelectedCategory(cat.name)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition ${
                  selectedCategory === cat.name
                    ? "bg-orange-500 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-orange-100"
                }`}
              >
                {cat.name}
                <span
                  className={`px-2 py-0.5 rounded-full text-xs ${
                    selectedCategory === cat.name
                      ? "bg-orange-600"
                      : "bg-orange-500 text-white"
                  }`}
                >
                  {cat.count}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex gap-8">
          {/* Products Grid */}
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              CAFE VIỆT NAM – ROBUSTA CHẤT LƯỢNG CAO
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((product) => (
                <div
                  key={product.id}
                  className="bg-white rounded-xl overflow-hidden border border-orange-100 shadow-sm hover:shadow-md transition group"
                >
                  <div className="relative">
                    <img
                      src={product.img}
                      alt={product.title}
                      className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    {product.sold > 20 && (
                      <span className="absolute top-3 left-3 px-2 py-1 bg-orange-500 text-white text-xs font-medium rounded">
                        Bán chạy
                      </span>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                      {product.title}
                    </h3>
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                      {product.desc}
                    </p>
                    <div className="flex items-center gap-1 text-sm text-gray-500 mb-3">
                      <ShoppingCart className="w-4 h-4" />
                      <span>{product.sold}+ đã bán</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xl font-bold text-orange-500">
                        {product.price.toLocaleString()}đ
                      </span>
                      <button
                        onClick={() => addToCart(product)}
                        className="w-9 h-9 bg-orange-500 hover:bg-orange-600 rounded-lg flex items-center justify-center transition"
                      >
                        <Plus className="w-5 h-5 text-white" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Cart Sidebar */}
          <div className="w-96 flex-shrink-0">
            <div className="bg-white rounded-xl shadow-lg border border-orange-200 sticky top-24 max-h-[calc(100vh-120px)] flex flex-col">
              <div className="p-6 border-b border-orange-100">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold text-gray-900">Giỏ hàng</h3>
                  <div className="flex items-center gap-2 bg-orange-100 px-3 py-1 rounded-full">
                    <ShoppingCart className="w-4 h-4 text-orange-500" />
                    <span className="text-sm font-medium text-orange-500">
                      {totalItems} món
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto px-6">
                {cartItems.length === 0 ? (
                  <div className="py-12 text-center">
                    <ShoppingCart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">Giỏ hàng trống</p>
                  </div>
                ) : (
                  cartItems.map((item) => (
                    <CartItem
                      key={item.id}
                      item={item}
                      onDecrease={handleDecrease}
                      onIncrease={handleIncrease}
                    />
                  ))
                )}
              </div>

              <div className="p-6 border-t border-orange-100 space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Tạm tính</span>
                  <span className="font-semibold text-gray-900">
                    {total.toLocaleString()}đ
                  </span>
                </div>
                <div className="flex justify-between items-center pb-4 border-b border-orange-100">
                  <span className="text-gray-600">Phí giao hàng</span>
                  <span className="font-semibold text-gray-900">15.000đ</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold text-gray-900">
                    Tổng cộng
                  </span>
                  <span className="text-2xl font-bold text-orange-500">
                    {(total + 15000).toLocaleString()}đ
                  </span>
                </div>
                <button className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-semibold py-3 rounded-full shadow-md transition">
                  Đăng nhập để đặt đơn
                </button>
                <p className="text-xs text-gray-500 text-center">
                  Xem phí áp dụng và dùng mã khuyến mại ở bước tiếp theo
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}