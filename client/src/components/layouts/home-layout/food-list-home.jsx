import { Heart, MapPin, Star } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

export const FoodList = () => {
  const [favorites, setFavorites] = useState([]);
  const navigate = useNavigate();

  const restaurants = [
    {
      id: 1,
      image:
        "https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=400&h=300&fit=crop",
      title:
        "Na Sushi's - Bánh Mì Pate Truyền Thống, Xôi Nóng & Nước Ép - G...",
      address: "805 Giải Phóng, Phường Giáp Bát, Quận...",
      distance: "0.1 km",
      rating: "4.1",
      reviews: "11",
    },
    {
      id: 2,
      image:
        "https://images.unsplash.com/photo-1529042410759-befb1204b468?w=400&h=300&fit=crop",
      title: "Luyện - Bún Chả - Định Công",
      address: "22 Định Công, Phường Liệt, Thanh Xuân...",
      distance: "0.2 km",
      rating: "3.7",
      reviews: "760",
    },
    {
      id: 3,
      image:
        "https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?w=400&h=300&fit=crop",
      title: "Bún Chả Việt Lan - Định Công",
      address: "28 Định Công, Phường Liệt, Thanh Xuân...",
      distance: "0.2 km",
      rating: "4.4",
      reviews: "113",
    },
    {
      id: 4,
      image:
        "https://images.unsplash.com/photo-1512058564366-18510be2db19?w=400&h=300&fit=crop",
      title: "Bún Riêu Thuý Béo - Bún Cá & Bánh Đa Trộn - Giải Phóng",
      address: "807B Giải Phóng, phường Giáp Bát, Hoàn...",
      distance: "0.2 km",
      rating: "4.7",
      reviews: "264",
    },
    {
      id: 5,
      image:
        "https://images.unsplash.com/photo-1455619452474-d2be8b1e70cd?w=400&h=300&fit=crop",
      title: "Chân Gà Sốt Thái & Sá Tắc - 39 Nguyễn Văn Trỗi",
      address: "39 Nguyễn Văn Trỗi, Phường Phương Liệt...",
      distance: "0.2 km",
      rating: "4.7",
      reviews: "13",
    },
    {
      id: 6,
      image:
        "https://images.unsplash.com/photo-1547592180-85f173990554?w=400&h=300&fit=crop",
      title: "Bún Riêu Bà Hải - Giải Phóng",
      address: "805 Giải Phóng, Phường Giáp Bát, Quận...",
      distance: "0.2 km",
      rating: "4.9",
      reviews: "910",
    },
    {
      id: 7,
      image:
        "https://images.unsplash.com/photo-1619460007989-b50a87732fdd?w=400&h=300&fit=crop",
      title: "Bánh Mì Sài Gòn - Định Công",
      address: "38 Định Công, Phường Phương Liệt, Quận...",
      distance: "0.2 km",
      rating: "4.6",
      reviews: "26",
    },
    {
      id: 8,
      image:
        "https://images.unsplash.com/photo-1622597467836-f3285f2131b8?w=400&h=300&fit=crop",
      title: "Ép Fruits Nước Ép - Trà Hoa Quả & Đồ Ăn Vặt - Kim Đồng",
      address: "39 Ngõ 19 Kim Đồng, Phường Giáp Bát...",
      distance: "0.2 km",
      rating: "4.8",
      reviews: "320",
    },
  ];

  const toggleFavorite = (id) => {
    setFavorites((prev) =>
      prev.includes(id) ? prev.filter((fav) => fav !== id) : [...prev, id]
    );
  };

  return (
    <div>
      <section className="py-12 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">
            Quán ngon quanh đây
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {restaurants.map((restaurant) => (
              <div
                key={restaurant.id}
                onClick={() => navigate(`/detail/${restaurant.id}`)}
                className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-shadow duration-300 cursor-pointer"
              >
                {/* Image Container */}
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={restaurant.image}
                    alt={restaurant.title}
                    className="w-full h-full object-cover hover:scale-110 transition-transform duration-300"
                  />
                  {/* Promo Badge */}
                  <div className="absolute top-3 left-3 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded">
                    PROMO
                  </div>
                  {/* Favorite Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleFavorite(restaurant.id);
                    }}
                    className="absolute top-3 right-3 bg-white rounded-full p-2 hover:bg-gray-100 transition-colors"
                  >
                    <Heart
                      className={`h-5 w-5 ${
                        favorites.includes(restaurant.id)
                          ? "fill-red-500 text-red-500"
                          : "text-gray-600"
                      }`}
                    />
                  </button>
                </div>

                {/* Content */}
                <div className="p-4">
                  <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 min-h-[3rem]">
                    {restaurant.title}
                  </h3>

                  <p className="text-sm text-gray-600 mb-3 line-clamp-1">
                    {restaurant.address}
                  </p>

                  {/* Stats */}
                  <div className="flex items-center gap-3 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      <span>{restaurant.distance}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span className="font-medium">{restaurant.rating}</span>
                      <span className="text-gray-400">
                        ({restaurant.reviews})
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="text-center">
        <button onClick={() => navigate("/filter")} className="bg-yellow-500 hover:bg-yellow-600 text-white px-8 py-3 rounded-lg font-medium transition-colors">
          Xem thêm quán ngon
        </button>
      </div>
    </div>
  );
};
