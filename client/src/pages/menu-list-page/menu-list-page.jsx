import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Star, Heart, MapPin } from "lucide-react";
import { getShopsByType } from "@/services/home.service";

export const MenuListPage = () => {
  const { category } = useParams(); // category = 'Drink' hoặc 'Food'
  const navigate = useNavigate();

  const [shops, setShops] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);

  // 🔹 Lấy lat/lng từ sessionStorage
  const locationData = JSON.parse(sessionStorage.getItem("userLocation"));
  const DEFAULT_LOCATION = { lat: 21.0135, lng: 105.5262 }; // Đại học FPT Hà Nội

  const lat = locationData?.lat || DEFAULT_LOCATION.lat;
  const lng = locationData?.lng || DEFAULT_LOCATION.lng;

  // 🔹 Gọi API khi category thay đổi
  useEffect(() => {
    if (!category) return;
    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await getShopsByType(category, lat, lng);
        setShops(res?.data?.shopsByType || []);
      } catch (err) {
        console.error(err);
        setShops([]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [category]);


  // 🔹 Thêm/bỏ yêu thích
  const toggleFavorite = (id) => {
    setFavorites((prev) =>
      prev.includes(id)
        ? prev.filter((fav) => fav !== id)
        : [...prev, id]
    );
  };

  // 🔹 Nếu đang load
  if (loading) {
    return (
      <div className="text-center py-12 text-gray-600 text-lg">
        Đang tải dữ liệu...
      </div>
    );
  }

  // 🔹 Nếu không có kết quả
  if (!shops || shops.length === 0) {
    return (
      <div className="text-center py-12 text-gray-600 text-lg">
        Không tìm thấy cửa hàng thuộc loại "{category}"
      </div>
    );
  }

  return (
    <div className="bg-gray-50">
      <div className="max-w-7xl mx-auto p-4 pt-10">
        {/* Category Title */}
        <h2 className="text-5xl font-bold text-gray-800 mb-6">
          {category === "Drink" ? "Đồ uống" : "Đồ ăn"}
        </h2>
        {/* Menu Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {shops.map((shop) => (
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
                    className={`w-4 h-4 ${favorites.includes(shop._id)
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
                  {shop.address?.street}, {shop.address?.ward},{" "}
                  {shop.address?.district}, {shop.address?.city}
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
      </div>
    </div>
  );
};
