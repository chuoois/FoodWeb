import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { MapPin, Crosshair, Star, Heart, Clock } from "lucide-react";
import { getNearbyShops, getPopularShops } from "@/services/home.service";

const heroContent = {
  title: "Giao hàng nhanh ,",
  highlight: "mọi lúc!",
  description: "Đặt món ăn yêu thích từ các nhà hàng tốt nhất trong thành phố. Giao hàng nhanh chóng, đảm bảo chất lượng.",
};
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

export const HomePage = () => {
  const [favorites, setFavorites] = useState([]);
  const [address, setAddress] = useState("");
  const [nearbyShops, setNearbyShops] = useState([]);
  const [popularShops, setPopularShops] = useState([]);
  const navigate = useNavigate();

  // ✅ Lấy danh sách shop phổ biến khi vào trang
  useEffect(() => {
    getPopularShops()
      .then((res) => {
        console.log("Popular shops:", res.data);
        if (res.data?.shops) setPopularShops(res.data.shops);
      })
      .catch((err) => console.error("Lỗi khi tải popular shops:", err));
  }, []);

  const handleGetLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const coords = `Vị trí của bạn (${pos.coords.latitude},${pos.coords.longitude})`;
          setAddress(coords);

          getNearbyShops(pos.coords.latitude, pos.coords.longitude)
            .then((res) => {
              console.log("Quán gần nhất:", res.data);
              if (res.data?.shops) setNearbyShops(res.data.shops);
            })
            .catch((err) => console.log(err));
        },
        (err) => alert("Không lấy được vị trí: " + err.message),
      )
    } else {
      alert("Trình duyệt không hỗ trợ định vị!")
    }
  }

  const toggleFavorite = (id) => {
    setFavorites((prev) =>
      prev.includes(id) ? prev.filter((fav) => fav !== id) : [...prev, id],
    )
  }

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

            {/* Địa chỉ người dùng */}
            <div className="flex items-center w-full max-w-lg border border-blue-400 rounded-lg px-3 py-2 bg-white shadow-sm">
              <MapPin className="w-5 h-5 text-gray-500" />
              <input
                type="text"
                placeholder="Nhập địa chỉ của bạn"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="flex-1 px-2 py-1 outline-none text-gray-700"
              />
              <button onClick={handleGetLocation}>
                <Crosshair className="w-5 h-5 text-gray-500 hover:text-orange-500" />
              </button>
            </div>
          </div>

          <div className="relative">
            <Carousel
              opts={{ align: "center", loop: true }}
              plugins={[Autoplay({ delay: 3500 })]}
              className="w-full"
            >
              <CarouselContent>
                {heroSlides.map((slide) => (
                  <CarouselItem key={slide.id}>
                    <div className="relative w-full h-96 rounded-3xl overflow-hidden shadow-2xl shadow-orange-200 transform hover:scale-105 transition-transform duration-500 ease-in-out">
                      <img
                        src={slide.image || "/placeholder.svg"}
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

      

      {/* Food Categories */}
      <section className="max-w-7xl mx-auto px-6 py-10 space-y-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">
          Bộ sưu tập món ăn
        </h2>
        <div className="grid grid-cols-2 gap-4">
          {foodCategories.map((category) => (
            <Link
              key={category.id}
              to={`/menu/list/${category.slug}`}
              className="relative overflow-hidden group rounded-lg bg-white hover:shadow-lg transition-all duration-300"
            >
              <div className="aspect-[3/2] relative">
                <img
                  src={category.image}
                  alt={category.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className={`absolute inset-0 bg-gradient-to-r ${category.color} opacity-60`} />
                <div className="absolute inset-0 flex items-center justify-center">
                  <h3 className="text-white text-xl font-bold text-center px-4">{category.name}</h3>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ================== Hiển thị nội dung chính ================== */}
      {address && nearbyShops.length > 0 ? (
        /* Khi có địa chỉ → hiện quán ăn gần bạn */
        <section className="max-w-7xl mx-auto px-6 py-10 space-y-8">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-800">
              Quán ăn gần bạn
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {nearbyShops.map((shop) => (
              <div
                key={shop._id}
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
                      className={`w-4 h-4 ${
                        favorites.includes(shop._id)
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
                     {shop.address?.street}, {shop.address?.ward}, {shop.address?.district}, {shop.address?.city}
                  </p>

                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <div className="flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      <span>{shop.distance}m</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      ) : (
        /* Khi chưa có địa chỉ → hiện quán ngon hot từ API */
        <section className="max-w-7xl mx-auto px-6 py-10 space-y-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">
            Quán ngon hot
          </h2>

          {popularShops.length === 0 ? (
            <p className="text-gray-500 italic">Đang tải quán nổi bật...</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {popularShops.map((shop) => (
                <div
                  key={shop._id}
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
                        className={`w-4 h-4 ${
                          favorites.includes(shop._id)
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
                      {shop.address?.street}, {shop.address?.ward}, {shop.address?.district}, {shop.address?.city}
                    </p>
                    
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      )}
    </div>
  )
}


