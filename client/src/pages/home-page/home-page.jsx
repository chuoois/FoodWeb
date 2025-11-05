import { useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { MapPin, Crosshair, Star, Heart } from "lucide-react";
import useDebounce from "@/hooks/useDebounce";
import { getNearbyShops, getPopularShops } from "@/services/home.service";
import { addFavoriteShop, removeFavoriteShop } from "@/services/home.service";
import {
  searchAddress,
  getAddressFromCoordinates,
} from "@/services/goong.service";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";

const heroContent = {
  title: "Giao hàng nhanh ,",
  highlight: "mọi lúc!",
  description:
    "Đặt món ăn yêu thích từ các nhà hàng tốt nhất trong thành phố. Giao hàng nhanh chóng, đảm bảo chất lượng.",
};

const foodCategories = [
  {
    id: 1,
    name: "Đồ uống",
    slug: "Drink",
    image: "/img-home/drinks.jpg",
    color: "from-blue-400 to-blue-600",
  },
  {
    id: 2,
    name: "Thức Ăn",
    slug: "Food",
    image: "/img-home/fast-food.jpg",
    color: "from-orange-400 to-orange-600",
  },
];

const heroSlides = [
  {
    id: 1,
    image: "/img-home/img-hero-section.png",
    alt: "Delivery illustration",
  },
  {
    id: 2,
    image: "/img-home/delicious-food-delivery-with-fresh-ingredients.jpg",
    alt: "Fresh food",
  },
  {
    id: 3,
    image: "/img-home/happy-customer-receiving-food-delivery.png",
    alt: "Happy customer",
  },
  {
    id: 4,
    image: "/img-home/variety-of-restaurant-dishes-and-meals.jpg",
    alt: "Restaurant dishes",
  },
];

export const HomePage = () => {
  const [favorites, setFavorites] = useState([]);
  const [address, setAddress] = useState("");
  const [nearbyShops, setNearbyShops] = useState([]);
  const [popularShops, setPopularShops] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const navigate = useNavigate();

  const debouncedAddress = useDebounce(address, 600);

  // === TẢI QUÁN PHỔ BIẾN ===
  useEffect(() => {
    getPopularShops()
      .then((res) => {
        if (res.data?.shops) {
          setPopularShops(res.data.shops);
          // ✅ Đồng bộ favorites từ API (shop nào isFavorite = true)
          const favs = res.data.shops
            .filter((s) => s.isFavorite)
            .map((s) => s._id);
          setFavorites(favs);
        }
      })
      .catch((err) => console.error("Lỗi tải quán phổ biến:", err));
  }, []);

  // === TÌM KIẾM GỢI Ý ĐỊA CHỈ (chỉ khi >= 2 ký tự) ===
  useEffect(() => {
    const query = debouncedAddress.trim();

    if (isLocating || query.length < 2) {
      setSuggestions([]);
      return;
    }

    let mounted = true;
    setLoading(true);

    searchAddress(query)
      .then((predictions) => {
        if (!mounted) return;

        const results = predictions.map((p) => {
          const main =
            p.structured_formatting?.main_text || p.description.split(",")[0];
          const secondary =
            p.structured_formatting?.secondary_text ||
            p.description.replace(main, "").replace(/^,\s*/, "").trim();

          return {
            place_id: p.place_id,
            display: p.description,
            main_text: main,
            secondary_text: secondary,
          };
        });

        setSuggestions(results);
      })
      .catch((err) => {
        if (mounted) console.error("Lỗi tìm kiếm địa chỉ:", err);
        if (mounted) setSuggestions([]);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [debouncedAddress, isLocating]);

  // === CHỌN GỢI Ý ===
  const handleSelect = useCallback(async (suggestion) => {
    setIsLocating(true);
    setSuggestions([]);
    setLoading(true);

    try {
      // Lấy chi tiết địa điểm
      const detailResponse = await fetch(
        `https://rsapi.goong.io/Place/Detail?place_id=${
          suggestion.place_id
        }&api_key=${import.meta.env.VITE_GOONG_API_KEY}`
      );
      const detailData = await detailResponse.json();

      if (
        detailData.status !== "OK" ||
        !detailData.result?.geometry?.location
      ) {
        throw new Error("Không lấy được tọa độ");
      }

      const { lat, lng } = detailData.result.geometry.location;
      const loc = { lat, lng };
      sessionStorage.setItem("userLocation", JSON.stringify(loc));

      // Lấy địa chỉ chi tiết từ tọa độ
      const addressData = await getAddressFromCoordinates(lat, lng);
      const fullAddress = [
        addressData.street,
        addressData.ward,
        addressData.district,
        addressData.city,
      ]
        .filter(Boolean)
        .join(", ");

      setAddress(fullAddress);
      sessionStorage.setItem("userAddress", fullAddress);

      // Lấy quán gần
      const res = await getNearbyShops(lat, lng);
      if (res.data?.shops) {
        setNearbyShops(res.data.shops);
        // ✅ Đồng bộ favorites từ shop gần
        const favs = res.data.shops
          .filter((s) => s.isFavorite)
          .map((s) => s._id);
        setFavorites(favs);
      }
    } catch (err) {
      console.error("Lỗi chọn địa chỉ:", err);
      alert("Không thể xác định vị trí. Vui lòng thử lại.");
    } finally {
      setLoading(false);
      setTimeout(() => setIsLocating(false), 100);
    }
  }, []);

  // === LẤY VỊ TRÍ HIỆN TẠI ===
  const handleGetLocation = useCallback(() => {
    if (!navigator.geolocation) {
      return alert("Trình duyệt không hỗ trợ định vị");
    }

    setIsLocating(true);
    setLoading(true);
    setSuggestions([]);

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        const loc = { lat, lng };
        sessionStorage.setItem("userLocation", JSON.stringify(loc));

        try {
          const addressData = await getAddressFromCoordinates(lat, lng);
          const fullAddress = [
            addressData.street,
            addressData.ward,
            addressData.district,
            addressData.city,
          ]
            .filter(Boolean)
            .join(", ");

          setAddress(fullAddress);
          sessionStorage.setItem("userAddress", fullAddress);

          const res = await getNearbyShops(lat, lng);
          if (res.data?.shops) {
            setNearbyShops(res.data.shops);
            // ✅ Đồng bộ favorites từ shop gần
            const favs = res.data.shops
              .filter((s) => s.isFavorite)
              .map((s) => s._id);
            setFavorites(favs);
          }
        } catch (err) {
          console.error("Lỗi lấy địa chỉ:", err);
          const fallback = `Vị trí: ${lat.toFixed(6)}, ${lng.toFixed(6)}`;
          setAddress(fallback);
          sessionStorage.setItem("userAddress", fallback);
          alert("Lấy vị trí thành công nhưng không có địa chỉ chi tiết.");
        } finally {
          setLoading(false);
          setTimeout(() => setIsLocating(false), 100);
        }
      },
      (err) => {
        alert("Không lấy được vị trí: " + err.message);
        setLoading(false);
        setIsLocating(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    );
  }, []);

  // === KHỞI TẠO TỪ SESSIONSTORAGE ===
  useEffect(() => {
    const savedAddr = sessionStorage.getItem("userAddress");
    if (savedAddr) setAddress(savedAddr);
  }, []);

  const toggleFavorite = async (shopId) => {
  const isFav = favorites.includes(shopId);

  try {
    if (isFav) {
      await removeFavoriteShop(shopId);
      setFavorites((prev) => prev.filter((f) => f !== shopId));

      // ✅ Update ngay trên UI
      setNearbyShops((prev) => prev.map((s) =>
        s._id === shopId ? { ...s, isFavorite: false } : s
      ));
      setPopularShops((prev) => prev.map((s) =>
        s._id === shopId ? { ...s, isFavorite: false } : s
      ));
    } else {
      await addFavoriteShop(shopId);
      setFavorites((prev) => [...prev, shopId]);

      // ✅ Update ngay trên UI
      setNearbyShops((prev) => prev.map((s) =>
        s._id === shopId ? { ...s, isFavorite: true } : s
      ));
      setPopularShops((prev) => prev.map((s) =>
        s._id === shopId ? { ...s, isFavorite: true } : s
      ));
    }
  } catch (err) {
    console.error("Lỗi khi gọi API yêu thích:", err);
    alert("Không thể cập nhật yêu thích. Vui lòng thử lại.");
  }
};


  return (
    <div className="bg-[#FBF4E6] min-h-screen">
      {/* Hero Section */}
      <section className="w-full px-6 py-16">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <div className="space-y-4">
              <h1 className="text-5xl lg:text-6xl font-bold text-foreground leading-tight">
                Giao hàng nhanh,{" "}
                <span className="text-orange-500">mọi lúc!</span>
              </h1>
              <p className="text-lg text-muted-foreground leading-relaxed max-w-lg">
                {heroContent.description}
              </p>
            </div>

            {/* Input + Autocomplete */}
            <div className="w-full max-w-lg space-y-2 relative">
              <div className="flex items-center border border-blue-400 rounded-lg px-3 py-2 bg-white shadow-sm">
                <MapPin className="w-5 h-5 text-gray-500" />
                <input
                  type="text"
                  placeholder="Nhập địa chỉ giao hàng..."
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="flex-1 px-2 py-1 outline-none text-gray-700"
                  disabled={loading || isLocating}
                />
                <button
                  onClick={handleGetLocation}
                  disabled={loading || isLocating}
                  className="disabled:opacity-50"
                >
                  <Crosshair
                    className={`w-5 h-5 transition-all ${
                      isLocating
                        ? "text-orange-500 animate-pulse"
                        : "text-gray-500 hover:text-orange-500"
                    }`}
                  />
                </button>
              </div>

              {/* Thông báo input ngắn */}
              {address.length > 0 &&
                address.length < 2 &&
                !loading &&
                !isLocating && (
                  <div className="text-xs text-gray-500 px-2 mt-1">
                    Nhập ít nhất 2 ký tự để tìm kiếm...
                  </div>
                )}

              {/* Loading */}
              {(loading || isLocating) && (
                <div className="text-sm text-orange-500 px-2 flex items-center gap-2">
                  <div className="animate-spin w-4 h-4 border-2 border-orange-500 border-t-transparent rounded-full"></div>
                  {isLocating ? "Đang định vị..." : "Đang tìm kiếm..."}
                </div>
              )}

              {/* Gợi ý */}
              {suggestions.length > 0 && !loading && !isLocating && (
                <ul className="absolute z-20 w-full bg-white border rounded-lg shadow-xl mt-1 max-h-64 overflow-y-auto">
                  {suggestions.map((s) => (
                    <li
                      key={s.place_id}
                      onClick={() => handleSelect(s)}
                      className="px-4 py-3 hover:bg-orange-50 cursor-pointer border-b last:border-b-0 transition"
                    >
                      <div className="font-medium text-gray-800">
                        {s.main_text}
                      </div>
                      {s.secondary_text && (
                        <div className="text-xs text-gray-500">
                          {s.secondary_text}
                        </div>
                      )}
                    </li>
                  ))}
                </ul>
              )}

              {/* Không có gợi ý */}
              {suggestions.length === 0 &&
                debouncedAddress.length >= 2 &&
                !loading &&
                !isLocating && (
                  <div className="text-sm text-gray-500 px-2 italic">
                    Không tìm thấy. Hãy thử nhập chi tiết hơn hoặc
                    <button
                      onClick={handleGetLocation}
                      className="underline ml-1 text-orange-500"
                    >
                      dùng vị trí hiện tại
                    </button>
                  </div>
                )}
            </div>
          </div>

          {/* Carousel */}
          <div className="relative">
            <Carousel
              opts={{ align: "center", loop: true }}
              plugins={[Autoplay({ delay: 3500 })]}
              className="w-full"
            >
              <CarouselContent>
                {heroSlides.map((slide) => (
                  <CarouselItem key={slide.id}>
                    <div className="relative w-full h-96 rounded-3xl overflow-hidden shadow-2xl shadow-orange-200 transform hover:scale-105 transition-transform duration-500">
                      <img
                        src={slide.image}
                        alt={slide.alt}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious className="left-4" />
              <CarouselNext className="right-4" />
            </Carousel>
          </div>
        </div>
      </section>

      {/* Danh mục */}
      <section className="max-w-7xl mx-auto px-6 py-10">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">
          Bộ sưu tập món ăn
        </h2>
        <div className="grid grid-cols-2 gap-4">
          {foodCategories.map((cat) => (
            <Link
              key={cat.id}
              to={`/menu/list/${cat.slug}`}
              className="relative overflow-hidden group rounded-lg bg-white hover:shadow-lg transition-all duration-300"
            >
              <div className="aspect-[3/2] relative">
                <img
                  src={cat.image}
                  alt={cat.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                />
                <div
                  className={`absolute inset-0 bg-gradient-to-r ${cat.color} opacity-60`}
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <h3 className="text-white text-xl font-bold px-4">
                    {cat.name}
                  </h3>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Quán ăn gần bạn */}
      {address && nearbyShops.length > 0 ? (
        <section className="max-w-7xl mx-auto px-6 py-10">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">
            Quán ăn gần bạn
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {nearbyShops.map((shop) => (
              <ShopCard
                key={shop._id}
                shop={shop}
                favorites={favorites}
                toggleFavorite={toggleFavorite}
                navigate={navigate}
              />
            ))}
          </div>
        </section>
      ) : (
        <section className="max-w-7xl mx-auto px-6 py-10">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">
            Quán ngon hot
          </h2>
          {popularShops.length === 0 ? (
            <p className="text-gray-500 italic">Đang tải quán nổi bật...</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {popularShops.map((shop) => (
                <ShopCard
                  key={shop._id}
                  shop={shop}
                  favorites={favorites}
                  toggleFavorite={toggleFavorite}
                  navigate={navigate}
                />
              ))}
            </div>
          )}
        </section>
      )}
    </div>
  );
};

// === SHOP CARD COMPONENT ===
const ShopCard = ({ shop, favorites, toggleFavorite, navigate }) => (
  <div
    onClick={() => navigate(`/detail/${shop._id}`)}
    className="overflow-hidden bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 cursor-pointer group"
  >
    <div className="relative">
      <img
        src={shop.coverUrl || "/placeholder.svg"}
        alt={shop.name}
        className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
      />
      <button
        onClick={(e) => {
          e.stopPropagation();
          toggleFavorite(shop._id);
        }}
        className="absolute top-3 right-3 w-8 h-8 bg-white/90 rounded-full flex items-center justify-center hover:bg-white transition"
      >
        <Heart
          className={`w-4 h-4 transition ${
            shop.isFavorite || favorites.includes(shop._id)
              ? "fill-red-500 text-red-500"
              : "text-gray-600"
          }`}
        />
      </button>
    </div>

    <div className="p-4">
      <h3 className="font-semibold text-gray-800 mb-2 line-clamp-2 text-sm">
        {shop.name}
      </h3>

      <div className="flex items-center gap-2 mb-2">
        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
        <span className="text-sm font-medium">
          {shop.rating?.toFixed(1) || "N/A"}
        </span>
      </div>

      <p className="text-xs text-gray-600 mb-2 line-clamp-1">
        {shop.address?.street}, {shop.address?.ward}, {shop.address?.district}
        {shop.address?.city ? `, ${shop.address.city}` : ""}
      </p>

      {shop.distance !== undefined && (
        <div className="flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center gap-1">
            <MapPin className="w-3 h-3" />
            <span>{Math.round(shop.distance)}m</span>
          </div>
        </div>
      )}
    </div>
  </div>
);
