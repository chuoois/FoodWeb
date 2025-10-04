import { useState, useMemo } from "react";
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
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
    category: "CAFE VIỆT NAM",
  },
  {
    id: 2,
    title: "MILK COFFEE - Cà phê Bạc xỉu kiểu Tonkin",
    desc: "Công thức Bạc xỉu độc quyền tại quán",
    sold: 50,
    price: 49000,
    img: "https://winci.com.vn/wp-content/uploads/2023/12/2-Huong-Dan-Cach-Pha-Ca-Phe-Bac-Xiu-Ngon-Va-Don-Gian.jpg",
    category: "CAFE VIỆT NAM",
  },
  {
    id: 3,
    title: "COCONUT MILK COFFEE - Cà phê sữa dừa kiểu Tonkin",
    desc: "Hương vị sữa dừa thơm béo kết hợp độc đáo",
    sold: 10,
    price: 59000,
    img: "https://file.hstatic.net/200000721249/file/ac_ngot_ngao_va_nuoc_cot_dua_beo_ngay_d69e37c5c6394aef9f932fed83616e80.jpg",
    category: "TONKIN SIGNATURE",
  },
  {
    id: 4,
    title: "NUT MILK COFFEE - Cà phê sữa hạt kiểu Tonkin",
    desc: "Lựa chọn tinh tế cho sức khỏe với sữa hạt",
    sold: 0,
    price: 55000,
    img: "https://thienanbakery-cafe.vn/wp-content/uploads/2025/09/image.png",
    category: "TONKIN SIGNATURE",
  },
  {
    id: 5,
    title: "ESPRESSO - Cà phê Espresso đậm đà",
    desc: "Hương vị cà phê nguyên chất, đậm đà",
    sold: 15,
    price: 45000,
    img: "https://images.unsplash.com/photo-1510591509098-f4fdc6d0ff04",
    category: "CAFE PHA MÁY",
  },
  {
    id: 6,
    title: "CAPPUCCINO - Cà phê Cappuccino kem sữa",
    desc: "Lớp foam mịn màng, hương vị cân bằng",
    sold: 25,
    price: 52000,
    img: "https://images.unsplash.com/photo-1572442388796-11668a67e53d",
    category: "CAFE PHA MÁY",
  },
  {
    id: 7,
    title: "COLD BREW ORIGINAL - Cà phê ủ lạnh nguyên bản",
    desc: "Hương vị êm dịu, ít đắng, nhiều tầng hương",
    sold: 30,
    price: 55000,
    img: "https://images.unsplash.com/photo-1517487881594-2787fef5ebf7",
    category: "COLD BREW",
  },
  {
    id: 8,
    title: "COLD BREW MILK - Cà phê ủ lạnh sữa tươi",
    desc: "Sự kết hợp hoàn hảo giữa cold brew và sữa tươi",
    sold: 22,
    price: 59000,
    img: "https://images.unsplash.com/photo-1461023058943-07fcbe16d735",
    category: "COLD BREW",
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
    badge: "PROMO",
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
    subtitle: "Đóng cửa trong 48 phút nữa",
  },
  {
    id: 3,
    name: "Cô Ngân - Cháo Sườn Sụn & Đồ Ăn Vặt",
    address: "13B Ngõ 663/112 Trường Định, Phường...",
    distance: "1.1 km",
    rating: 4.9,
    reviews: 668,
    img: "https://images.unsplash.com/photo-1504674900247-0877df9cc836",
    badge: "PROMO",
  },
  {
    id: 4,
    name: "Mỳ Vằn Thắn Thành Vy",
    address: "157A, Trường Định, Trường Định, Hai...",
    distance: "1.1 km",
    rating: 4.8,
    reviews: 999,
    img: "https://images.unsplash.com/photo-1569718212165-3a8278d5f624",
    badge: "PROMO",
  },
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

const CartItem = ({ item, onDecrease, onIncrease, onRemove }) => (
  <div className="flex items-start gap-3 py-4 border-b border-gray-100 last:border-b-0 group hover:bg-gray-50/50 px-2 -mx-2 rounded-lg transition-colors">
    <img
      src={item.img || "/placeholder.svg"}
      alt={item.title}
      className="w-20 h-20 rounded-xl object-cover shadow-sm"
    />
    <div className="flex-1 min-w-0">
      <div className="text-sm font-semibold text-gray-900 line-clamp-2 mb-1">
        {item.title}
      </div>
      <div className="text-base font-bold text-orange-600 mb-2">
        {item.price.toLocaleString()}đ
      </div>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="icon"
          className="w-8 h-8 border-gray-300 hover:bg-gray-100 hover:border-gray-400 rounded-lg bg-transparent"
          onClick={() => onDecrease(item.id)}
        >
          <Minus className="w-4 h-4 text-gray-700" />
        </Button>
        <span className="w-10 text-center font-semibold text-gray-900 text-base">
          {item.qty}
        </span>
        <Button
          size="icon"
          className="w-8 h-8 bg-orange-500 hover:bg-orange-600 rounded-lg shadow-sm"
          onClick={() => onIncrease(item.id)}
        >
          <Plus className="w-4 h-4 text-white" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="w-8 h-8 ml-auto text-red-500 hover:text-red-600 hover:bg-red-50 rounded-lg"
          onClick={() => onRemove(item.id)}
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>
    </div>
  </div>
);

export const DetailPage = () => {
  const [cartItems, setCartItems] = useState([]);
  const [liked, setLiked] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("Tất cả");
  const [showSimilar, setShowSimilar] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const categories = useMemo(() => {
    const allCategories = ["Tất cả"];
    const categoryCounts = { "Tất cả": products.length };

    products.forEach((product) => {
      if (!allCategories.includes(product.category)) {
        allCategories.push(product.category);
        categoryCounts[product.category] = 1;
      } else if (product.category) {
        categoryCounts[product.category]++;
      }
    });

    return allCategories.map((name) => ({
      name,
      count: categoryCounts[name] || 0,
    }));
  }, []);

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesCategory =
        selectedCategory === "Tất cả" || product.category === selectedCategory;
      const matchesSearch =
        product.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.desc.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [selectedCategory, searchQuery]);

  const handleIncrease = (id) => {
    setCartItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, qty: item.qty + 1 } : item
      )
    );
  };

  const handleDecrease = (id) => {
    setCartItems((prev) => {
      const item = prev.find((i) => i.id === id);
      if (item && item.qty === 1) {
        return prev.filter((i) => i.id !== id);
      }
      return prev.map((item) =>
        item.id === id ? { ...item, qty: item.qty - 1 } : item
      );
    });
  };

  const handleRemove = (id) => {
    setCartItems((prev) => prev.filter((item) => item.id !== id));
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
    <div className="bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 min-h-screen">
      {/* Restaurant Header */}
      <Card className="border-0 shadow-md mx-auto max-w-7xl rounded-none sm:rounded-2xl sm:mt-4">
        <CardContent className="p-0">
          <div className="px-6 py-8">
            <div className="flex flex-col lg:flex-row gap-6">
              <div className="w-full lg:w-96 h-64 lg:h-56 rounded-2xl overflow-hidden shadow-lg flex-shrink-0">
                <img
                  src="https://images.unsplash.com/photo-1554118811-1e0d58224f24"
                  alt="Bún Bò Huế 72 - Dường 72"
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                />
              </div>

              <div className="flex-1">
                <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-4">
                  <div className="flex items-start gap-3">
                    <CardTitle className="text-2xl sm:text-3xl font-bold text-gray-900 leading-tight">
                      Bún Bò Huế 72 - Dường 72
                    </CardTitle>
                  </div>
                  <Button
                    variant={liked ? "destructive" : "outline"}
                    size="sm"
                    className={`flex items-center gap-2 px-4 py-2 rounded-full border-2 transition-all duration-300 ${
                      liked
                        ? "bg-red-50 border-red-400 text-red-600 hover:bg-red-100"
                        : "border-gray-300 text-gray-600 hover:bg-orange-50 hover:border-orange-300"
                    }`}
                    onClick={() => setLiked(!liked)}
                  >
                    <Heart
                      className={`w-4 h-4 transition-all ${
                        liked ? "fill-red-500 scale-110" : ""
                      }`}
                    />
                    <span className="text-sm font-medium">Yêu thích</span>
                  </Button>
                </div>

                <div className="flex items-center gap-2 text-gray-600 mb-3">
                  <MapPin className="w-4 h-4 text-orange-500 flex-shrink-0" />
                  <p className="text-sm">318 Dương 72, Xã An Khánh, H. Nghi</p>
                </div>

                <div className="flex flex-wrap items-center gap-4 mb-4">
                  <div className="flex items-center gap-2">
                    <Badge
                      variant="secondary"
                      className="flex items-center gap-1 bg-gradient-to-r from-orange-100 to-amber-100 text-orange-600 px-3 py-1.5 border border-orange-200"
                    >
                      <Star className="w-4 h-4 fill-orange-500 text-orange-500" />
                      <span className="font-bold text-gray-900">4.7</span>
                    </Badge>
                    <Button
                      variant="link"
                      className="text-sm text-orange-600 hover:text-orange-700 hover:underline p-0 h-auto font-medium"
                    >
                      (63 Đánh giá)
                    </Button>
                    <Button
                      variant="link"
                      size="sm"
                      className="h-auto p-0 text-orange-600 hover:text-orange-700 hover:underline text-sm font-medium"
                      onClick={() => setShowInfo(true)}
                    >
                      Thông tin quán
                    </Button>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600 text-sm">
                    <Clock className="w-4 h-4 text-orange-500" />
                    <span className="font-medium">13.9 km • 41 phút</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600 text-sm">
                    <Phone className="w-4 h-4 text-orange-500" />
                    <span className="font-medium">1900 1234</span>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-3 mb-4">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-2 border-2 border-orange-300 text-gray-700 hover:bg-orange-50 hover:border-orange-400 rounded-full px-4 transition-all bg-transparent"
                    onClick={() => setShowSimilar(!showSimilar)}
                  >
                    <span className="font-medium">Nhà hàng tương tự</span>
                    <span
                      className={`text-xs transition-transform duration-300 ${
                        showSimilar ? "rotate-180" : ""
                      }`}
                    >
                      ▼
                    </span>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-2 border-2 border-orange-300 text-gray-700 hover:bg-orange-50 hover:border-orange-400 rounded-full px-4 transition-all bg-transparent"
                  >
                    <User className="w-4 h-4" />
                    <span className="font-medium">Đặt theo nhóm</span>
                  </Button>
                </div>

                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                  <Input
                    type="search"
                    placeholder="Tìm kiếm món ăn trong quán..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 border-2 border-orange-200 bg-white text-gray-700 placeholder-gray-400 focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 rounded-xl transition-all"
                  />
                </div>
              </div>
            </div>
          </div>
        </CardContent>
        <CardContent className="p-0">
          <ScrollArea className="whitespace-nowrap py-4">
            <div className="max-w-7xl mx-auto px-6 flex gap-3">
              {categories.map((cat) => (
                <Button
                  key={cat.name}
                  variant={
                    selectedCategory === cat.name ? "default" : "outline"
                  }
                  size="sm"
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-full font-semibold whitespace-nowrap transition-all duration-300 ${
                    selectedCategory === cat.name
                      ? "bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg shadow-orange-200 scale-105"
                      : "border-2 border-gray-300 text-gray-700 hover:bg-orange-50 hover:border-orange-300"
                  }`}
                  onClick={() => setSelectedCategory(cat.name)}
                >
                  {cat.name}
                  <Badge
                    variant={
                      selectedCategory === cat.name ? "default" : "secondary"
                    }
                    className={`text-xs font-bold ${
                      selectedCategory === cat.name
                        ? "bg-white/30 text-white"
                        : "bg-orange-100 text-orange-600"
                    }`}
                  >
                    {cat.count}
                  </Badge>
                </Button>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Restaurant Info Modal */}
      {showInfo && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowInfo(false);
          }}
        >
          <div className="bg-white rounded-3xl w-full max-w-md max-h-[90vh] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
            {/* Top Bar */}
            <div className="flex items-center justify-between p-5 border-b border-gray-200 bg-gradient-to-r from-orange-50 to-amber-50">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <Button
                  variant="ghost"
                  size="icon"
                  className="w-9 h-9 p-0 hover:bg-white/80 rounded-full flex-shrink-0"
                  onClick={() => setShowInfo(false)}
                >
                  <ChevronLeft className="w-5 h-5 text-gray-600" />
                </Button>
                <span className="text-sm font-medium text-gray-600 truncate">
                  THCS Giáp Bát – Điện Đồng Tả, 35
                </span>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="w-9 h-9 p-0 hover:bg-white/80 rounded-full flex-shrink-0"
                onClick={() => setShowInfo(false)}
              >
                <X className="w-5 h-5 text-gray-600" />
              </Button>
            </div>

            {/* Content */}
            <ScrollArea className="max-h-[calc(90vh-80px)]">
              <div className="p-6">
                <h3 className="text-xl font-bold mb-5 text-gray-900">
                  Thông tin quán
                </h3>
                <div className="mb-6 p-5 bg-gradient-to-br from-orange-50 to-amber-50 rounded-2xl border border-orange-100">
                  <h4 className="text-base font-bold text-gray-900 mb-3">
                    Bún Bò Huế 72 - Dường 72
                  </h4>
                  <div className="flex items-start gap-2 text-gray-600 text-sm mb-2">
                    <MapPin className="w-4 h-4 text-orange-500 mt-0.5 flex-shrink-0" />
                    <span>318 Dương 72, Xã An Khánh, H. Nghi</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600 text-sm">
                    <Clock className="w-4 h-4 text-orange-500 flex-shrink-0" />
                    <span>13.9 km - 41 phút</span>
                  </div>
                </div>

                <div>
                  <h5 className="text-base font-bold mb-4 text-gray-900">
                    Giờ hoạt động
                  </h5>
                  <div className="space-y-2">
                    {openingHours.map((hour) => (
                      <div
                        key={hour.day}
                        className={`flex justify-between items-center p-4 rounded-xl border transition-all ${
                          hour.isToday
                            ? "bg-gradient-to-r from-amber-50 to-yellow-50 border-amber-200 shadow-sm"
                            : "bg-gray-50 border-gray-100 hover:bg-gray-100"
                        }`}
                      >
                        <span
                          className={`text-sm font-medium ${
                            hour.isToday ? "text-gray-900" : "text-gray-700"
                          }`}
                        >
                          {hour.day}
                        </span>
                        <span
                          className={`text-sm font-semibold ${
                            hour.isToday ? "text-orange-600" : "text-gray-600"
                          }`}
                        >
                          {hour.time}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </ScrollArea>
          </div>
        </div>
      )}

      {/* Similar Restaurants Section */}
      {showSimilar && (
        <Card className="border-0 shadow-md mx-auto max-w-7xl mt-4 rounded-none sm:rounded-2xl animate-in slide-in-from-top duration-300">
          <CardContent className="p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-5">
              Nhà hàng tương tự
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {similarRestaurants.map((restaurant) => (
                <Card
                  key={restaurant.id}
                  className="overflow-hidden border-gray-200 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer group"
                >
                  <div className="relative">
                    <img
                      src={restaurant.img || "/placeholder.svg"}
                      alt={restaurant.name}
                      className="w-full h-44 object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    {restaurant.badge && (
                      <Badge className="absolute top-3 left-3 bg-green-500 text-white text-xs font-semibold px-2 py-1 shadow-md">
                        {restaurant.badge}
                      </Badge>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute top-3 right-3 bg-white/90 hover:bg-white rounded-full w-9 h-9 shadow-md backdrop-blur-sm"
                    >
                      <Heart className="w-4 h-4 text-gray-600 hover:text-red-500 transition-colors" />
                    </Button>
                    {restaurant.subtitle && (
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-r from-orange-500 to-red-500 text-white text-xs py-2 px-3 text-center font-medium">
                        {restaurant.subtitle}
                      </div>
                    )}
                  </div>
                  <CardContent className="p-4">
                    <h4 className="font-bold text-gray-900 text-sm mb-2 line-clamp-2 min-h-[2.5rem]">
                      {restaurant.name}
                    </h4>
                    <p className="text-xs text-gray-500 mb-3 line-clamp-1">
                      {restaurant.address}
                    </p>
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-gray-400" />
                        <span className="text-gray-600 font-medium">
                          {restaurant.distance}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Star className="w-3.5 h-3.5 fill-orange-400 text-orange-400" />
                        <span className="font-bold text-gray-900">
                          {restaurant.rating}
                        </span>
                        <span className="text-gray-500">
                          ({restaurant.reviews}+)
                        </span>
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
      <Card className="border-0 shadow-sm z-20 bg-white/95 backdrop-blur-md rounded-none">
        
      </Card>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
              {selectedCategory === "Tất cả"
                ? "TẤT CẢ SẢN PHẨM"
                : selectedCategory.toUpperCase()}
            </h2>

            {filteredProducts.length === 0 ? (
              <div className="text-center py-16">
                <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 text-lg">
                  Không tìm thấy sản phẩm nào
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProducts.map((product) => (
                  <Card
                    key={product.id}
                    className="overflow-hidden border-gray-200 shadow-md hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 group"
                  >
                    <div className="relative overflow-hidden">
                      <img
                        src={product.img || "/placeholder.svg"}
                        alt={product.title}
                        className="w-full h-52 object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                      {product.sold > 20 && (
                        <Badge className="absolute top-3 left-3 bg-gradient-to-r from-orange-500 to-red-500 text-white text-xs font-bold px-3 py-1 shadow-lg">
                          Bán chạy
                        </Badge>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    </div>
                    <CardContent className="p-5">
                      <CardTitle className="font-bold text-gray-900 mb-2 line-clamp-2 text-base leading-snug min-h-[3rem]">
                        {product.title}
                      </CardTitle>
                      <CardDescription className="text-sm text-gray-600 mb-3 line-clamp-2 min-h-[2.5rem]">
                        {product.desc}
                      </CardDescription>
                      <div className="flex items-center gap-1.5 text-sm text-gray-500 mb-4">
                        <ShoppingCart className="w-4 h-4 text-orange-500" />
                        <span className="font-medium">
                          {product.sold}+ đã bán
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                          {product.price.toLocaleString()}đ
                        </span>
                        <Button
                          size="icon"
                          className="w-10 h-10 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 rounded-xl shadow-lg hover:shadow-xl hover:scale-110 transition-all duration-300"
                          onClick={() => addToCart(product)}
                        >
                          <Plus className="w-5 h-5 text-white" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Cart Sidebar */}
          <div className="w-full lg:w-[420px] flex-shrink-0">
            <Card className="border-gray-200 shadow-2xl max-h-[calc(100vh-120px)] flex flex-col rounded-2xl overflow-hidden">
              <CardHeader className="border-b border-gray-200 p-6 bg-gradient-to-r from-orange-50 to-amber-50">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl font-bold text-gray-900">
                    Giỏ hàng
                  </CardTitle>
                  <Badge
                    variant="secondary"
                    className="flex items-center gap-2 bg-gradient-to-r from-orange-500 to-red-500 text-white px-4 py-2 shadow-md"
                  >
                    <ShoppingCart className="w-4 h-4" />
                    <span className="text-sm font-bold">{totalItems} món</span>
                  </Badge>
                </div>
              </CardHeader>

              <CardContent className="flex-1 p-0 overflow-hidden">
                <ScrollArea className="h-[calc(100vh-480px)] px-6 py-2">
                  {cartItems.length === 0 ? (
                    <div className="py-16 text-center">
                      <ShoppingCart className="w-20 h-20 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500 font-medium">
                        Giỏ hàng trống
                      </p>
                      <p className="text-gray-400 text-sm mt-2">
                        Thêm món để bắt đầu đặt hàng
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-1">
                      {cartItems.map((item) => (
                        <CartItem
                          key={item.id}
                          item={item}
                          onDecrease={handleDecrease}
                          onIncrease={handleIncrease}
                          onRemove={handleRemove}
                        />
                      ))}
                    </div>
                  )}
                </ScrollArea>
              </CardContent>

              <CardFooter className="p-6 border-t border-gray-200 space-y-4 flex flex-col bg-white">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 font-medium">Tạm tính</span>
                  <span className="font-bold text-gray-900 text-lg">
                    {total.toLocaleString()}đ
                  </span>
                </div>
                <Separator className="border-gray-200" />
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 font-medium">
                    Phí giao hàng
                  </span>
                  <span className="font-bold text-gray-900 text-lg">
                    15.000đ
                  </span>
                </div>
                <Separator className="border-gray-200" />
                <div className="flex justify-between items-center py-2">
                  <span className="text-lg font-bold text-gray-900">
                    Tổng cộng
                  </span>
                  <span className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                    {(total + 15000).toLocaleString()}đ
                  </span>
                </div>
                <Button
                  disabled={cartItems.length === 0}
                  className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-bold py-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed text-base"
                >
                  Đăng nhập để đặt đơn
                </Button>
                <p className="text-xs text-gray-500 text-center leading-relaxed">
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
