import { useState, useMemo, useEffect } from "react";
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
import { Link, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import toast from "react-hot-toast";
import { getShopWithFoods, getRandomShops } from "@/services/home.service";
import {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
} from "@/services/cart.service";

const openingHours = [
  { day: "Chủ nhật", time: "06:30 - 21:00", isToday: false },
  { day: "Thứ hai", time: "06:30 - 21:00", isToday: false },
  { day: "Thứ ba", time: "06:30 - 21:00", isToday: false },
  { day: "Thứ tư", time: "06:30 - 21:00", isToday: false },
  { day: "Thứ năm", time: "06:30 - 21:00", isToday: false },
  { day: "Thứ sáu", time: "06:30 - 21:00", isToday: false },
  { day: "Thứ bảy", time: "06:30 - 21:00", isToday: true },
];

export const DetailPage = () => {
  const { id } = useParams();
  const [cartItems, setCartItems] = useState([]);
  const [loadingCart, setLoadingCart] = useState(false);
  const [liked, setLiked] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("Tất cả");
  const [showSimilar, setShowSimilar] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [shop, setShop] = useState(null);
  const [foods, setFoods] = useState([]);
  const [similarShops, setSimilarShops] = useState([]);
  const [loadingSimilar, setLoadingSimilar] = useState(false);

  // Kiểm tra đăng nhập
  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsLoggedIn(!!token);
  }, []);

  // Load shop + món ăn
  useEffect(() => {
    if (id) {
      getShopWithFoods(id)
        .then((response) => {
          setShop(response.data.shop);
          setFoods(response.data.foods.filter((food) => food.is_available));
        })
        .catch((error) => {
          console.error("Error fetching shop data:", error);
          toast.error("Không thể tải thông tin quán");
        });
    }
  }, [id]);

  // Load giỏ hàng theo shop_id
  useEffect(() => {
    if (id && isLoggedIn) {
      setLoadingCart(true);
      getCart(id)
        .then((data) => {
          const items = (data.items || []).map((item) => ({
            id: item.food_id, // string ID
            cartItemId: item.id, // ID của cart item
            qty: item.quantity,
            title: item.name,
            price: item.unit_price,
            img: null, // API không trả image → để null hoặc lấy từ foods nếu cần
            note: item.note || "",
            is_available: item.is_available,
          }));
          setCartItems(items);
        })
        .catch((err) => {
          console.error("Lỗi load giỏ hàng:", err);
          toast.error("Không thể tải giỏ hàng");
          setCartItems([]);
        })
        .finally(() => setLoadingCart(false));
    } else {
      setCartItems([]);
    }
  }, [id, isLoggedIn]);

  // Load nhà hàng tương tự
  useEffect(() => {
    if (showSimilar && similarShops.length === 0) {
      setLoadingSimilar(true);
      getRandomShops()
        .then((response) => {
          const shops = response.data.data || [];
          const filtered = shops.filter((s) => s._id !== id);
          setSimilarShops(filtered.slice(0, 4));
        })
        .catch((err) => {
          console.error("Error loading similar shops:", err);
          toast.error("Không thể tải nhà hàng tương tự");
        })
        .finally(() => setLoadingSimilar(false));
    }
  }, [showSimilar, id, similarShops.length]);

  const itemsPerPage = 9;

  const categories = useMemo(() => {
    const allCategories = ["Tất cả"];
    const categoryCounts = { "Tất cả": foods.length };

    foods.forEach((food) => {
      const catName = food.category_id?.name;
      if (catName && !allCategories.includes(catName)) {
        allCategories.push(catName);
        categoryCounts[catName] = 1;
      } else if (catName) {
        categoryCounts[catName]++;
      }
    });

    return allCategories.map((name) => ({
      name,
      count: categoryCounts[name] || 0,
    }));
  }, [foods]);

  const filteredFoods = useMemo(() => {
    return foods.filter((food) => {
      const matchesCategory =
        selectedCategory === "Tất cả" ||
        food.category_id?.name === selectedCategory;
      const matchesSearch =
        food.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        food.description?.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [selectedCategory, searchQuery, foods]);

  const paginatedFoods = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredFoods.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredFoods, currentPage]);

  const totalPages = Math.ceil(filteredFoods.length / itemsPerPage);

  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCategory, searchQuery]);

  const handlePageChange = (pageNumber) => {
    if (pageNumber >= 1 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
    }
  };

  // Thêm món vào giỏ
  const handleAddToCart = async (food) => {
    if (!isLoggedIn) {
      toast.error("Vui lòng đăng nhập để thêm vào giỏ hàng");
      return;
    }

    try {
      await addToCart({
        shop_id: id,
        food_id: food._id,
        quantity: 1,
        note: "", // tùy chọn
      });

      // Reload giỏ hàng
      const data = await getCart(id);
      const items = (data.items || []).map((item) => ({
        id: item.food_id,
        cartItemId: item.id,
        qty: item.quantity,
        title: item.name,
        price: item.unit_price,
        img: null,
        note: item.note || "",
        is_available: item.is_available,
      }));
      setCartItems(items);

      toast.success(`Đã thêm ${food.name} vào giỏ hàng`);
    } catch (err) {
      toast.error("Không thể thêm vào giỏ hàng");
    }
  };

  const handleIncrease = async (cartItemId, currentQty) => {
    try {
      await updateCartItem(cartItemId, currentQty + 1); // ✅ Giờ pass đúng format
      const data = await getCart(id);
      const items = (data.items || []).map((item) => ({
        id: item.food_id,
        cartItemId: item.id,
        qty: item.quantity,
        title: item.name,
        price: item.unit_price,
        img: null,
        note: item.note || "",
        is_available: item.is_available,
      }));
      setCartItems(items);
    } catch (err) {
      toast.error("Cập nhật thất bại");
    }
  };

  const handleDecrease = async (cartItemId, currentQty) => {
    if (currentQty <= 1) return;
    try {
      await updateCartItem(cartItemId, currentQty - 1); // ✅ Giờ pass đúng format
      const data = await getCart(id);
      const items = (data.items || []).map((item) => ({
        id: item.food_id,
        cartItemId: item.id,
        qty: item.quantity,
        title: item.name,
        price: item.unit_price,
        img: null,
        note: item.note || "",
        is_available: item.is_available,
      }));
      setCartItems(items);
    } catch (err) {
      toast.error("Cập nhật thất bại");
    }
  };

  // Xóa món
  const handleRemove = async (cartItemId) => {
    try {
      await removeFromCart(cartItemId);
      setCartItems((prev) =>
        prev.filter((item) => item.cartItemId !== cartItemId)
      );
      toast.success("Đã xóa món khỏi giỏ hàng");
    } catch (err) {
      toast.error("Xóa thất bại");
    }
  };

  const totalPrice = cartItems.reduce(
    (sum, item) => sum + item.price * item.qty,
    0
  );

  if (!shop) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        Đang tải...
      </div>
    );
  }

  const fullAddress = `${shop.address.street}, ${shop.address.district}, ${shop.address.city}`;
  const getRandomDistance = () => {
    const distances = ["0.8 km", "1.2 km", "1.5 km", "2.1 km", "3.4 km"];
    return distances[Math.floor(Math.random() * distances.length)];
  };

  return (
    <main className="bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 min-h-screen pt-4">
      {/* Header shop info */}
      <Card className="border-0 shadow-md mx-auto max-w-7xl rounded-none sm:rounded-2xl">
        <CardContent className="p-0">
          <div className="px-6 py-8">
            <div className="flex flex-col lg:flex-row gap-6">
              <div className="w-full lg:w-96 h-64 lg:h-56 rounded-2xl overflow-hidden shadow-lg flex-shrink-0">
                <img
                  src={shop.coverUrl || "/placeholder.svg"}
                  alt={shop.name}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                />
              </div>

              <div className="flex-1">
                <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-4">
                  <div className="flex items-start gap-3">
                    <CardTitle className="text-2xl sm:text-3xl font-bold text-gray-900 leading-tight">
                      {shop.name}
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
                  <p className="text-sm">{fullAddress}</p>
                </div>

                <div className="flex flex-wrap items-center gap-4 mb-4">
                  <div className="flex items-center gap-2">
                    <Badge
                      variant="secondary"
                      className="flex items-center gap-1 bg-gradient-to-r from-orange-100 to-amber-100 text-orange-600 px-3 py-1.5 border border-orange-200"
                    >
                      <Star className="w-4 h-4 fill-orange-500 text-orange-500" />
                      <span className="font-bold text-gray-900">
                        {shop.rating || "0.0"}
                      </span>
                    </Badge>
                    <Button
                      variant="link"
                      className="text-sm text-orange-600 hover:text-orange-700 hover:underline p-0 h-auto font-medium"
                    >
                      ({shop.reviews?.length || 0} Đánh giá)
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
                    <span className="font-medium">{shop.phone}</span>
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
                    ></span>
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

        {/* Danh mục món */}
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

      {/* Modal thông tin quán */}
      {showInfo && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          onClick={(e) => e.target === e.currentTarget && setShowInfo(false)}
        >
          <div className="bg-white rounded-3xl w-full max-w-md max-h-[90vh] overflow-hidden shadow-2xl">
            <div className="flex items-center justify-between p-5 border-b bg-gradient-to-r from-orange-50 to-amber-50">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowInfo(false)}
                  className="w-9 h-9 rounded-full"
                >
                  <ChevronLeft className="w-5 h-5" />
                </Button>
                <span className="text-sm font-medium truncate">
                  {shop.name}
                </span>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowInfo(false)}
                className="w-9 h-9 rounded-full"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
            <ScrollArea className="max-h-[calc(90vh-80px)] p-6">
              <h3 className="text-xl font-bold mb-5">Thông tin quán</h3>
              <div className="p-5 bg-gradient-to-br from-orange-50 to-amber-50 rounded-2xl border border-orange-100 mb-6">
                <h4 className="font-bold mb-3">{shop.name}</h4>
                <div className="flex items-start gap-2 text-sm text-gray-600 mb-2">
                  <MapPin className="w-4 h-4 text-orange-500 mt-0.5" />
                  <span>{fullAddress}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Clock className="w-4 h-4 text-orange-500" />
                  <span>13.9 km • 41 phút</span>
                </div>
              </div>
              <h5 className="font-bold mb-4">Giờ hoạt động</h5>
              <div className="space-y-2">
                {openingHours.map((hour) => (
                  <div
                    key={hour.day}
                    className={`flex justify-between p-4 rounded-xl border ${
                      hour.isToday
                        ? "bg-gradient-to-r from-amber-50 to-yellow-50 border-amber-200"
                        : "bg-gray-50 border-gray-100"
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
            </ScrollArea>
          </div>
        </div>
      )}

      {/* Nhà hàng tương tự */}
      {showSimilar && (
        <Card className="border-0 shadow-md mx-auto max-w-7xl rounded-none sm:rounded-2xl mt-6">
          <CardContent className="p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-5">
              Nhà hàng tương tự
            </h3>
            {loadingSimilar ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {[...Array(4)].map((_, i) => (
                  <Card key={i} className="animate-pulse">
                    <div className="h-44 bg-gray-200 rounded-t-xl"></div>
                    <CardContent className="p-4 space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                      <div className="h-3 bg-gray-200 rounded w-full"></div>
                      <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : similarShops.length === 0 ? (
              <p className="text-center text-gray-500 py-8">
                Không có nhà hàng tương tự
              </p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {similarShops.map((restaurant) => (
                  <Link key={restaurant._id} to={`/shop/${restaurant._id}`}>
                    <Card className="overflow-hidden border-gray-200 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer group">
                      <div className="relative">
                        <img
                          src={restaurant.coverUrl || "/placeholder.svg"}
                          alt={restaurant.name}
                          className="w-full h-44 object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                        <Button
                          variant="ghost"
                          size="icon"
                          className="absolute top-3 right-3 bg-white/90 hover:bg-white rounded-full w-9 h-9 shadow-md"
                        >
                          <Heart className="w-4 h-4 text-gray-600 hover:text-red-500" />
                        </Button>
                      </div>
                      <CardContent className="p-4">
                        <h4 className="font-bold text-gray-900 text-sm mb-2 line-clamp-2">
                          {restaurant.name}
                        </h4>
                        <p className="text-xs text-gray-500 mb-3 line-clamp-1">
                          {restaurant.address.street},{" "}
                          {restaurant.address.district}
                        </p>
                        <div className="flex items-center justify-between text-xs">
                          <div className="flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5 text-gray-400" />
                            <span className="text-gray-600 font-medium">
                              {getRandomDistance()}
                            </span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Star className="w-3.5 h-3.5 fill-orange-400 text-orange-400" />
                            <span className="font-bold text-gray-900">
                              {restaurant.rating || "0.0"}
                            </span>
                            <span className="text-gray-500">
                              ({restaurant.reviews?.length || 0}+)
                            </span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Danh sách món + Giỏ hàng */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
              {selectedCategory === "Tất cả"
                ? "TẤT CẢ SẢN PHẨM"
                : selectedCategory.toUpperCase()}
            </h2>

            {filteredFoods.length === 0 ? (
              <div className="text-center py-16">
                <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 text-lg">
                  Không tìm thấy sản phẩm nào
                </p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {paginatedFoods.map((food) => (
                    <Card
                      key={food._id}
                      className="overflow-hidden border-gray-200 shadow-md hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 group"
                    >
                      <div className="relative overflow-hidden">
                        <img
                          src={food.image_url || "/placeholder.svg"}
                          alt={food.name}
                          className="w-full h-52 object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                      </div>
                      <CardContent className="p-5">
                        <CardTitle className="font-bold text-gray-900 mb-2 line-clamp-2 text-base">
                          {food.name}
                        </CardTitle>
                        <CardDescription className="text-sm text-gray-600 mb-3 line-clamp-2">
                          {food.description}
                        </CardDescription>
                        <div className="flex justify-between items-center">
                          <span className="text-xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                            {food.price.toLocaleString()}đ
                          </span>
                          <Button
                            size="icon"
                            className="w-10 h-10 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 rounded-xl shadow-lg hover:scale-110 transition-all"
                            onClick={() => handleAddToCart(food)}
                          >
                            <Plus className="w-5 h-5 text-white" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {totalPages > 1 && (
                  <div className="flex justify-center mt-8">
                    <Pagination>
                      <PaginationContent>
                        <PaginationItem>
                          <PaginationPrevious
                            onClick={() => handlePageChange(currentPage - 1)}
                            className={
                              currentPage === 1
                                ? "pointer-events-none opacity-50"
                                : "cursor-pointer"
                            }
                          />
                        </PaginationItem>
                        {Array.from({ length: totalPages }, (_, i) => {
                          const page = i + 1;
                          if (
                            totalPages <= 7 ||
                            page <= 3 ||
                            page >= totalPages - 2 ||
                            page === currentPage
                          ) {
                            return (
                              <PaginationItem key={page}>
                                <PaginationLink
                                  isActive={currentPage === page}
                                  onClick={() => handlePageChange(page)}
                                  className="cursor-pointer"
                                >
                                  {page}
                                </PaginationLink>
                              </PaginationItem>
                            );
                          }
                          if (
                            (page === 4 && currentPage > 4) ||
                            (page === totalPages - 3 &&
                              currentPage < totalPages - 3)
                          ) {
                            return (
                              <PaginationItem key={`ellipsis-${page}`}>
                                <PaginationEllipsis />
                              </PaginationItem>
                            );
                          }
                          return null;
                        })}
                        <PaginationItem>
                          <PaginationNext
                            onClick={() => handlePageChange(currentPage + 1)}
                            className={
                              currentPage === totalPages
                                ? "pointer-events-none opacity-50"
                                : "cursor-pointer"
                            }
                          />
                        </PaginationItem>
                      </PaginationContent>
                    </Pagination>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Giỏ hàng */}
          <div className="w-full lg:w-80 flex-shrink-0">
            <Card className="sticky top-8 border-0 shadow-lg bg-white rounded-2xl overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-orange-50 to-amber-50 border-b border-orange-100 pb-4">
                <CardTitle className="text-lg font-bold text-gray-900">
                  Giỏ hàng của tôi
                </CardTitle>
              </CardHeader>

              {loadingCart ? (
                <CardContent className="p-6 text-center">
                  <div className="animate-pulse">Đang tải giỏ hàng...</div>
                </CardContent>
              ) : cartItems.length === 0 ? (
                <CardContent className="p-6 text-center">
                  <div className="flex flex-col items-center justify-center py-8">
                    <ShoppingCart className="w-12 h-12 text-gray-300 mb-3" />
                    <p className="text-gray-500 text-sm">
                      Giỏ hàng hiện đang trống
                    </p>
                  </div>
                </CardContent>
              ) : (
                <>
                  <ScrollArea className="max-h-[500px] overflow-y-auto">
                    <div className="p-4 space-y-3">
                      {cartItems.map((item) => (
                        <div
                          key={item.cartItemId}
                          className="flex gap-3 p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                        >
                          <img
                            src={item.img || "/placeholder.svg"}
                            alt={item.title}
                            className="w-16 h-16 rounded-lg object-cover flex-shrink-0"
                          />
                          <div className="flex-1 min-w-0">
                            <h4 className="text-sm font-semibold text-gray-900 line-clamp-2 mb-1">
                              {item.title}
                            </h4>
                            <p className="text-sm font-bold text-orange-600 mb-2">
                              {item.price?.toLocaleString()}đ
                            </p>
                            <div className="flex items-center gap-2">
                              <Button
                                size="icon"
                                variant="outline"
                                onClick={() =>
                                  handleDecrease(item.cartItemId, item.qty)
                                }
                                className="w-6 h-6"
                              >
                                <Minus className="w-3 h-3" />
                              </Button>
                              <span className="text-xs font-semibold w-6 text-center">
                                {item.qty}
                              </span>
                              <Button
                                size="icon"
                                variant="outline"
                                onClick={() =>
                                  handleIncrease(item.cartItemId, item.qty)
                                }
                                className="w-6 h-6"
                              >
                                <Plus className="w-3 h-3" />
                              </Button>
                              <Button
                                size="icon"
                                variant="ghost"
                                onClick={() => handleRemove(item.cartItemId)}
                                className="w-6 h-6 ml-auto hover:bg-red-100"
                              >
                                <Trash2 className="w-3 h-3 text-red-500" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>

                  <div className="border-t border-gray-200 p-4 space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-600">
                        Tổng số tiền
                      </span>
                      <span className="text-lg font-bold text-orange-600">
                        {totalPrice.toLocaleString()}đ
                      </span>
                    </div>
                    {isLoggedIn && cartItems.length > 0 ? (
                      <Link to={`/checkout?shop_id=${id}`}>
                        <Button className="w-full bg-gradient-to-r from-orange-400 to-orange-500 hover:from-orange-500 hover:to-orange-600 text-gray-900 font-bold rounded-xl py-3 shadow-md hover:shadow-lg">
                          Xem đơn hàng
                        </Button>
                      </Link>
                    ) : (
                      <Link to="/auth/login">
                        <Button className="w-full bg-gradient-to-r from-orange-400 to-orange-500 hover:from-orange-500 hover:to-orange-600 text-gray-900 font-bold rounded-xl py-3 shadow-md hover:shadow-lg">
                          Đăng nhập để đặt đơn
                        </Button>
                      </Link>
                    )}
                    <p className="text-xs text-gray-500 text-center">
                      Xem phí áp dụng và dùng mã khuyến mại ở bước tiếp theo
                    </p>
                  </div>
                </>
              )}
            </Card>
          </div>
        </div>
      </div>
    </main>
  );
};
