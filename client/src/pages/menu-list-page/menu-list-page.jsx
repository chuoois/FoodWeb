import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Star, Heart } from "lucide-react";
import { Card } from "@/components/ui/card";
import { getShopsByType } from "@/services/home.service";

export const MenuListPage = () => {
  const { category } = useParams(); // category = 'Drink' hoặc 'Food'
  const navigate = useNavigate();

  const [shops, setShops] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

  // 🔹 Lấy lat/lng từ sessionStorage
  const locationData = JSON.parse(sessionStorage.getItem("userLocation"));
  const lat = locationData?.lat || null;
  const lng = locationData?.lng || null;

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


  // 🔹 Lọc theo tên hoặc loại
  const filteredItems = shops.filter(
    (item) =>
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.type.toLowerCase().includes(searchQuery.toLowerCase())
  );

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

        {/* Ô tìm kiếm */}
        <div className="mb-6">
          <input
            type="text"
            placeholder="Tìm kiếm cửa hàng..."
            className="w-full md:w-1/2 border rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-orange-400"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Menu Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map((item) => (
            <Card
              key={item._id}
              onClick={() => navigate(`/detail/${item._id}`)}
              className="overflow-hidden hover:shadow-lg transition-all duration-300 group cursor-pointer"
            >
              <div className="relative">
                <img
                  src={item.coverUrl || "/placeholder.svg"}
                  alt={item.name}
                  className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                />
                {item.isPromo && (
                  <div className="absolute top-3 left-3">
                    <span className="bg-green-500 text-white text-xs font-medium px-2 py-1 rounded">
                      PROMO
                    </span>
                  </div>
                )}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleFavorite(item._id);
                  }}
                  className="absolute top-3 right-3 w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white transition-colors"
                >
                  <Heart
                    className={`w-4 h-4 ${
                      favorites.includes(item._id)
                        ? "fill-red-500 text-red-500"
                        : "text-gray-600"
                    }`}
                  />
                </button>
              </div>

              <div className="p-4">
                <h3 className="font-semibold text-gray-800 mb-2 line-clamp-2 text-sm leading-tight">
                  {item.name}
                </h3>
                <p className="text-xs text-gray-600 mb-3 line-clamp-1">
                  {`${item.address?.street || ""}, ${item.address?.district || ""}, ${item.address?.city || ""}`}
                </p>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <span className="text-sm font-medium">
                      {item.rating || "N/A"}
                    </span>
                    <span className="text-xs text-gray-500">
                      ({item.reviews?.length || 0})
                    </span>
                  </div>
                  <span className="text-xs text-orange-600 font-medium">
                    {item.type}
                  </span>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* No Results */}
        {filteredItems.length === 0 && searchQuery && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">
              Không tìm thấy kết quả cho "{searchQuery}"
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
