import { useState } from "react";
import {
  Star,
  Heart,
  User,
  Plus,
  Minus,
  ShoppingCart,
  Search,
  MapPin,
  Clock,
  Phone,
  X,
  ChevronLeft,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

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
    img: "https://winci.com.vn/wp-content/uploads/2023/12/2-Huong-Dan-Cach-Pha-Ca-Phe-Bac-Xiu-Ngon-Va-Don-Gian.jpg",
  },
  {
    id: 3,
    title: "COCONUT MILK COFFEE - Cà phê sữa dừa kiểu Tonkin",
    desc: "Hương vị sữa dừa thơm béo kết hợp độc đáo",
    sold: 10,
    price: 59000,
    img: "https://file.hstatic.net/200000721249/file/ac_ngot_ngao_va_nuoc_cot_dua_beo_ngay_d69e37c5c6394aef9f932fed83616e80.jpg",
  },
  {
    id: 4,
    title: "NUT MILK COFFEE - Cà phê sữa hạt kiểu Tonkin",
    desc: "Lựa chọn tinh tế cho sức khỏe với sữa hạt",
    sold: 0,
    price: 55000,
    img: "https://thienanbakery-cafe.vn/wp-content/uploads/2025/09/image.png",
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

const similarRestaurants = [
  {
    id: 1,
    name: "Mỳ Quảng Cô Hai - KĐT Đại Kim",
    address: "147 Lô A4, KĐT Đại Kim, Phường Định Công...",
    distance: "1.4 km",
    rating: 4.9,
    reviews: 81,
    img: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1",
    badge: "PROMO"
  },
  {
    id: 2,
    name: "Bún Riêu Bà Hải - Giải Phóng",
    address: "805 Giải Phóng, Phường Giáp Bát, Quận...",
    distance: "0.2 km",
    rating: 4.9,
    reviews: 911,
    img: "https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43",
    badge: "PROMO",
    subtitle: "Đóng cửa trong 48 phút nữa"
  },
  {
    id: 3,
    name: "Cô Ngân - Cháo Sườn Sụn & Đồ Ăn Vặt",
    address: "13B Ngõ 663/112 Trường Định, Phường...",
    distance: "1.1 km",
    rating: 4.9,
    reviews: 668,
    img: "https://images.unsplash.com/photo-1504674900247-0877df9cc836",
    badge: "PROMO"
  },
  {
    id: 4,
    name: "Mỳ Vằn Thắn Thành Vy",
    address: "157A, Trường Định, Trường Định, Hai...",
    distance: "1.1 km",
    rating: 4.8,
    reviews: 999,
    img: "https://images.unsplash.com/photo-1569718212165-3a8278d5f624",
    badge: "PROMO"
  }
];

const openingHours = [
  { day: "Chủ nhật", time: "06:30 - 21:00", isToday: false },
  { day: "Thứ hai", time: "06:30 - 21:00", isToday: false },
  { day: "Thứ ba", time: "06:30 - 21:00", isToday: false },
  { day: "Thứ tư", time: "06:30 - 21:00", isToday: false },
  { day: "Thứ năm", time: "06:30 - 21:00", isToday: false },
  { day: "Thứ sáu", time: "06:30 - 21:00", isToday: false },
  { day: "Thứ bảy", time: "06:30 - 21:00", isToday: true },
];

const CartItem = ({ item, onDecrease, onIncrease }) => (
  <div className="flex items-center gap-3 py-3 border-b border-orange-100 last:border-b-0">
    <img
      src={item.img}
      alt={item.title}
      className="w-16 h-16 rounded-lg object-cover"
    />
    <div className="flex-1 min-w-0">
      <div className="text-sm font-semibold text-gray-900 line-clamp-1">
        {item.title}
      </div>
      <div className="text-sm font-semibold text-orange-500 mt-1">
        {item.price.toLocaleString()}đ
      </div>
    </div>
    <div className="flex items-center gap-2">
      <Button
        variant="outline"
        size="icon"
        className="w-7 h-7 border-orange-300 hover:bg-orange-50"
        onClick={() => onDecrease(item.id)}
      >
        <Minus className="w-4 h-4 text-orange-500" />
      </Button>
      <span className="w-8 text-center font-medium text-gray-900">
        {item.qty}
      </span>
      <Button
        size="icon"
        className="w-7 h-7 bg-orange-500 hover:bg-orange-600"
        onClick={() => onIncrease(item.id)}
      >
        <Plus className="w-4 h-4 text-white" />
      </Button>
    </div>
  </div>
);

export const DetailPage = () => {
  const [cartItems, setCartItems] = useState([]);
  const [liked, setLiked] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("CAFE VIỆT NAM");
  const [showSimilar, setShowSimilar] = useState(false);
  const [showInfo, setShowInfo] = useState(false);

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
      <Card className="border-orange-200 mx-auto max-w-7xl border-b">
        <CardContent className="p-0">
          <div className="px-4 py-6">
            <div className="flex gap-6">
              <div className="w-80 h-52 rounded-xl overflow-hidden shadow-md flex-shrink-0">
                <img
                  src="https://images.unsplash.com/photo-1554118811-1e0d58224f24"
                  alt="Bún Bò Huế 72 - Dường 72"
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="flex-1">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center gap-2">
                    <CardTitle className="text-3xl font-bold text-gray-900 leading-tight">
                      Bún Bò Huế 72 - Dường 72
                    </CardTitle>
                  </div>
                  <Button
                    variant={liked ? "destructive" : "outline"}
                    size="sm"
                    className={`flex items-center gap-2 px-4 py-2 rounded-full border transition ${liked ? "bg-red-50 border-red-300 text-red-600" : "border-gray-300 text-gray-600 hover:bg-gray-50"}`}
                    onClick={() => setLiked(!liked)}
                  >
                    <Heart className={`w-4 h-4 ${liked ? "fill-red-500" : ""}`} />
                    <span className="text-sm font-medium">Yêu thích</span>
                  </Button>
                </div>

                <div className="flex items-center gap-2 text-gray-600 mb-3">
                  <MapPin className="w-4 h-4 text-orange-500" />
                  <p className="text-sm">
                    318 Dương 72, Xã An Khánh, H. Nghi
                  </p>
                </div>

                <div className="flex items-center gap-4 mb-4">
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="flex items-center gap-1 bg-orange-50 text-orange-500 px-3 py-1">
                      <Star className="w-4 h-4 fill-orange-400 text-orange-400" />
                      <span className="font-semibold text-gray-900">4.7</span>
                    </Badge>
                    <Button variant="link" className="text-sm text-orange-500 hover:underline p-0 h-auto">
                      (63 Đánh giá)
                    </Button>
                    <Button
                      variant="link"
                      size="sm"
                      className="h-auto p-0 text-orange-500 hover:underline text-base"
                      onClick={() => setShowInfo(true)}
                    >
                      Thông tin quán
                    </Button>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600 text-sm">
                    <Clock className="w-4 h-4 text-orange-500" />
                    <span>13.9 km • 41 phút</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600 text-sm">
                    <Phone className="w-4 h-4 text-orange-500" />
                    <span>1900 1234</span>
                  </div>
                </div>

                <div className="flex items-center gap-3 mb-4">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex items-center gap-2 border-orange-300 text-gray-700 hover:bg-orange-50"
                    onClick={() => setShowSimilar(!showSimilar)}
                  >
                    <span>Nhà hàng tương tự</span>
                    <span className={`text-xs transition-transform duration-200 ${showSimilar ? 'rotate-180' : ''}`}>▼</span>
                  </Button>
                  <Button variant="outline" size="sm" className="flex items-center gap-2 border-orange-300 text-gray-700 hover:bg-orange-50">
                    <User className="w-4 h-4" />
                    <span>Đặt theo nhóm</span>
                  </Button>
                </div>

                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                  <Input
                    type="search"
                    placeholder="Tìm kiếm món ăn trong quán..."
                    className="w-full pl-10 pr-4 py-2 border-orange-300 bg-white text-gray-700 placeholder-gray-400 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-200"
                  />
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Restaurant Info Modal */}
      {showInfo && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowInfo(false);
          }}
        >
          <div className="bg-white rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            {/* Top Bar */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50 sticky top-0">
              <div className="flex items-center gap-3">
                <Button
                  variant="ghost"
                  size="icon"
                  className="w-8 h-8 p-0"
                  onClick={() => setShowInfo(false)}
                >
                  <ChevronLeft className="w-5 h-5 text-gray-500" />
                </Button>
                <span className="text-sm font-medium text-gray-600">
                  THCS Giáp Bát – Điện Đồng Tả, 35
                </span>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="w-8 h-8 p-0"
                onClick={() => setShowInfo(false)}
              >
                <X className="w-5 h-5 text-gray-500" />
              </Button>
            </div>

            {/* Content */}
            <div className="p-4">
              <h3 className="text-lg font-semibold mb-4 text-gray-900">Thông tin quán</h3>
              <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                <h4 className="text-base font-semibold text-gray-900 mb-2">
                  Bún Bò Huế 72 - Dường 72
                </h4>
                <div className="flex items-center gap-2 text-gray-600 text-sm mb-2">
                  <MapPin className="w-4 h-4 text-orange-500" />
                  <span>318 Dương 72, Xã An Khánh, H. Nghi</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600 text-sm">
                  <Clock className="w-4 h-4 text-orange-500" />
                  <span>13.9 km - 41 phút</span>
                </div>
              </div>

              <div>
                <h5 className="text-base font-semibold mb-3 text-gray-900">Giờ hoạt động</h5>
                <div className="space-y-2">
                  {openingHours.map((hour) => (
                    <div
                      key={hour.day}
                      className={`flex justify-between items-center p-3 rounded-lg border ${
                        hour.isToday
                          ? "bg-yellow-50 border-yellow-200"
                          : "bg-gray-50 border-gray-100"
                      }`}
                    >
                      <span className="text-sm text-gray-700">{hour.day}</span>
                      <span className="text-sm text-gray-600 font-medium">{hour.time}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Similar Restaurants Section */}
      {showSimilar && (
        <Card className="border-orange-200 mx-auto max-w-7xl border-b bg-white">
          <CardContent className="p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Nhà hàng tương tự</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {similarRestaurants.map((restaurant) => (
                <Card key={restaurant.id} className="overflow-hidden border-orange-100 hover:shadow-lg transition cursor-pointer">
                  <div className="relative">
                    <img
                      src={restaurant.img}
                      alt={restaurant.name}
                      className="w-full h-40 object-cover"
                    />
                    {restaurant.badge && (
                      <Badge className="absolute top-2 left-2 bg-green-500 text-white text-xs">
                        {restaurant.badge}
                      </Badge>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute top-2 right-2 bg-white/80 hover:bg-white rounded-full w-8 h-8"
                    >
                      <Heart className="w-4 h-4 text-gray-600" />
                    </Button>
                    {restaurant.subtitle && (
                      <div className="absolute bottom-0 left-0 right-0 bg-orange-500 text-white text-xs py-1 px-2 text-center">
                        {restaurant.subtitle}
                      </div>
                    )}
                  </div>
                  <CardContent className="p-3">
                    <h4 className="font-semibold text-gray-900 text-sm mb-1 line-clamp-2">
                      {restaurant.name}
                    </h4>
                    <p className="text-xs text-gray-500 mb-2 line-clamp-1">
                      {restaurant.address}
                    </p>
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-gray-400" />
                        <span className="text-gray-600">{restaurant.distance}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Star className="w-3 h-3 fill-orange-400 text-orange-400" />
                        <span className="font-semibold text-gray-900">{restaurant.rating}</span>
                        <span className="text-gray-500">({restaurant.reviews}+)</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Category Filter */}
      <Card className="border-orange-200 border-b sticky top-0 z-10 bg-white">
        <CardContent className="p-0">
          <ScrollArea className="whitespace-nowrap py-4">
            <div className="max-w-7xl mx-auto px-4 flex gap-3">
              {categories.map((cat) => (
                <Button
                  key={cat.name}
                  variant={selectedCategory === cat.name ? "default" : "outline"}
                  size="sm"
                  className="flex items-center gap-2 px-4 py-2 rounded-full font-medium whitespace-nowrap transition"
                  onClick={() => setSelectedCategory(cat.name)}
                >
                  {cat.name}
                  <Badge
                    variant={selectedCategory === cat.name ? "default" : "secondary"}
                    className={`text-xs ${selectedCategory === cat.name ? "bg-orange-600" : "bg-orange-500 text-white"}`}
                  >
                    {cat.count}
                  </Badge>
                </Button>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex gap-8">
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              CAFE VIỆT NAM – ROBUSTA CHẤT LƯỢNG CAO
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((product) => (
                <Card key={product.id} className="overflow-hidden border-orange-100 shadow-sm hover:shadow-md transition group">
                  <div className="relative overflow-hidden">
                    <img
                      src={product.img}
                      alt={product.title}
                      className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    {product.sold > 20 && (
                      <Badge className="absolute top-3 left-3 bg-orange-500 text-white text-xs font-medium">
                        Bán chạy
                      </Badge>
                    )}
                  </div>
                  <CardContent className="p-4">
                    <CardTitle className="font-semibold text-gray-900 mb-2 line-clamp-2">
                      {product.title}
                    </CardTitle>
                    <CardDescription className="text-sm text-gray-600 mb-3 line-clamp-2">
                      {product.desc}
                    </CardDescription>
                    <div className="flex items-center gap-1 text-sm text-gray-500 mb-3">
                      <ShoppingCart className="w-4 h-4" />
                      <span>{product.sold}+ đã bán</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xl font-bold text-orange-500">
                        {product.price.toLocaleString()}đ
                      </span>
                      <Button
                        size="icon"
                        className="w-9 h-9 bg-orange-500 hover:bg-orange-600 rounded-lg p-0"
                        onClick={() => addToCart(product)}
                      >
                        <Plus className="w-5 h-5 text-white" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          <div className="w-96 flex-shrink-0">
            <Card className="border-orange-200 shadow-lg sticky top-24 max-h-[calc(100vh-120px)] flex flex-col">
              <CardHeader className="border-b border-orange-100 p-6">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl font-bold text-gray-900">Giỏ hàng</CardTitle>
                  <Badge variant="secondary" className="flex items-center gap-2 bg-orange-100 text-orange-500 px-3 py-1">
                    <ShoppingCart className="w-4 h-4 text-orange-500" />
                    <span className="text-sm font-medium">{totalItems} món</span>
                  </Badge>
                </div>
              </CardHeader>

              <CardContent className="flex-1 p-0">
                <ScrollArea className="h-[calc(100vh-400px)] px-6">
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
                </ScrollArea>
              </CardContent>

              <CardFooter className="p-6 border-t border-orange-100 space-y-4 flex flex-col">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Tạm tính</span>
                  <span className="font-semibold text-gray-900">
                    {total.toLocaleString()}đ
                  </span>
                </div>
                <Separator className="border-orange-100" />
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Phí giao hàng</span>
                  <span className="font-semibold text-gray-900">15.000đ</span>
                </div>
                <Separator className="border-orange-100" />
                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold text-gray-900">
                    Tổng cộng
                  </span>
                  <span className="text-2xl font-bold text-orange-500">
                    {(total + 15000).toLocaleString()}đ
                  </span>
                </div>
                <Button
                  className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-semibold py-3 rounded-full shadow-md transition"
                >
                  Đăng nhập để đặt đơn
                </Button>
                <p className="text-xs text-gray-500 text-center">
                  Xem phí áp dụng và dùng mã khuyến mại ở bước tiếp theo
                </p>
              </CardFooter>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};