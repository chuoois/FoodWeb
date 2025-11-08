import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { MapPin, Star, Heart, Clock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getFavoriteShops, removeFavoriteShop } from "@/services/home.service"; // Adjust the import path as needed

export const FavoritePage = () => {
  const [favoriteShops, setFavoriteShops] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchFavorites = async () => {
      try {
        const response = await getFavoriteShops();
        if (response.data.success) {
          setFavoriteShops(response.data.favorites || []);
        }
      } catch (error) {
        console.error("Error fetching favorites:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchFavorites();
  }, []);

  const handleRemoveFavorite = async (e, shopId) => {
    e.stopPropagation(); // Prevent card click from triggering
    try {
      await removeFavoriteShop(shopId);
      setFavoriteShops((prev) => prev.filter((shop) => shop._id !== shopId));
    } catch (error) {
      console.error("Error removing favorite:", error);
    }
  };

  const handleShopClick = (shopId) => {
    navigate(`/detail/${shopId}`);
  };

  if (loading) {
    return (
      <div className="bg-[#FBF4E6] min-h-screen flex items-center justify-center">
        <p className="text-gray-600">Đang tải...</p>
      </div>
    );
  }

  return (
    <div className="bg-[#FBF4E6] min-h-screen">
      <div className="bg-orange-500 text-white py-6 px-4">
          <div className="max-w-4xl mx-auto flex items-center gap-3">
            <h1 className="text-2xl font-bold">Nhà hàng yêu thích</h1>
          </div>
        </div>
      <section className="max-w-7xl mx-auto px-6 py-8 space-y-8">

        {favoriteShops.length === 0 ? (
          <p className="text-gray-600 text-center py-8">
            Bạn chưa có nhà hàng yêu thích nào.
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {favoriteShops.map((shop) => {
              const fullAddress = `${shop.address?.street || ""}, ${
                shop.address?.district || ""
              }, ${shop.address?.city || ""}`.trim();
              return (
                <Card
                  key={shop._id}
                  className="overflow-hidden group hover:shadow-lg transition-all duration-300 cursor-pointer"
                  onClick={() => handleShopClick(shop._id)}
                >
                  <div className="relative">
                    <img
                      src={
                        shop.coverUrl ||
                        "https://ila.edu.vn/wp-content/uploads/2025/07/ila-food-co-dem-duoc-khong-1.jpg"
                      } // Fallback to default food image
                      alt={shop.name}
                      className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                    />

                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => handleRemoveFavorite(e, shop._id)}
                      className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm rounded-full hover:bg-white transition"
                    >
                      <Heart className="w-4 h-4 fill-red-500 text-red-500" />
                    </Button>
                  </div>

                  <CardContent className="p-4 space-y-2">
                    <h3 className="font-semibold text-gray-800 line-clamp-2 text-sm">
                      {shop.name}
                    </h3>

                    <div className="flex items-center gap-1 text-sm">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      <span>{shop.rating || 0}</span>
                      <span className="text-xs text-gray-500">
                        ({shop.reviews?.length || 0})
                      </span>
                    </div>

                    <p className="text-xs text-gray-600 line-clamp-1">
                      {fullAddress}
                    </p>

                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span>25-35 phút</span>
                      </div>
                      <span className="text-orange-600 font-medium">
                        {shop.type || "Ẩm thực"}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
};
