import { Heart, MapPin, Star, Search, SlidersHorizontal, X } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

export const FoodFilter = () => {
  const [favorites, setFavorites] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const navigate = useNavigate();

  // Filter states
  const [filters, setFilters] = useState({
    distance: [],
    cuisine: [],
    priceRange: [],
    rating: null,
  });

  const restaurants = [
    {
      id: 1,
      image: "https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=400&h=300&fit=crop",
      title: "Na Sushi's - Bánh Mì Pate Truyền Thống, Xôi Nóng & Nước Ép - G...",
      address: "805 Giải Phóng, Phường Giáp Bát, Quận...",
      distance: "0.1 km",
      rating: "4.1",
      reviews: "11",
      cuisine: "Ẩm thực Việt",
      priceRange: "50k - 100k",
    },
    {
      id: 2,
      image: "https://images.unsplash.com/photo-1529042410759-befb1204b468?w=400&h=300&fit=crop",
      title: "Luyện - Bún Chả - Định Công",
      address: "22 Định Công, Phường Liệt, Thanh Xuân...",
      distance: "0.2 km",
      rating: "3.7",
      reviews: "760",
      cuisine: "Bún Chả",
      priceRange: "30k - 50k",
    },
    {
      id: 3,
      image: "https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?w=400&h=300&fit=crop",
      title: "Bún Chả Việt Lan - Định Công",
      address: "28 Định Công, Phường Liệt, Thanh Xuân...",
      distance: "0.2 km",
      rating: "4.4",
      reviews: "113",
      cuisine: "Bún Chả",
      priceRange: "30k - 50k",
    },
    {
      id: 4,
      image: "https://images.unsplash.com/photo-1512058564366-18510be2db19?w=400&h=300&fit=crop",
      title: "Bún Riêu Thuý Béo - Bún Cá & Bánh Đa Trộn - Giải Phóng",
      address: "807B Giải Phóng, phường Giáp Bát, Hoàn...",
      distance: "0.2 km",
      rating: "4.7",
      reviews: "264",
      cuisine: "Bún Riêu",
      priceRange: "30k - 50k",
    },
    {
      id: 5,
      image: "https://images.unsplash.com/photo-1455619452474-d2be8b1e70cd?w=400&h=300&fit=crop",
      title: "Chân Gà Sốt Thái & Sá Tắc - 39 Nguyễn Văn Trỗi",
      address: "39 Nguyễn Văn Trỗi, Phường Phương Liệt...",
      distance: "0.2 km",
      rating: "4.7",
      reviews: "13",
      cuisine: "Ăn vặt",
      priceRange: "30k - 50k",
    },
    {
      id: 6,
      image: "https://images.unsplash.com/photo-1547592180-85f173990554?w=400&h=300&fit=crop",
      title: "Bún Riêu Bà Hải - Giải Phóng",
      address: "805 Giải Phóng, Phường Giáp Bát, Quận...",
      distance: "0.2 km",
      rating: "4.9",
      reviews: "910",
      cuisine: "Bún Riêu",
      priceRange: "30k - 50k",
    },
    {
      id: 7,
      image: "https://images.unsplash.com/photo-1619460007989-b50a87732fdd?w=400&h=300&fit=crop",
      title: "Bánh Mì Sài Gòn - Định Công",
      address: "38 Định Công, Phường Phương Liệt, Quận...",
      distance: "0.3 km",
      rating: "4.6",
      reviews: "26",
      cuisine: "Bánh Mì",
      priceRange: "20k - 30k",
    },
    {
      id: 8,
      image: "https://images.unsplash.com/photo-1622597467836-f3285f2131b8?w=400&h=300&fit=crop",
      title: "Ép Fruits Nước Ép - Trà Hoa Quả & Đồ Ăn Vặt - Kim Đồng",
      address: "39 Ngõ 19 Kim Đồng, Phường Giáp Bát...",
      distance: "0.2 km",
      rating: "4.8",
      reviews: "320",
      cuisine: "Đồ uống",
      priceRange: "20k - 30k",
    },
    {
      id: 9,
      image: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=400&h=300&fit=crop",
      title: "Phở Bò Hà Nội - Giải Phóng",
      address: "812 Giải Phóng, Phường Giáp Bát...",
      distance: "0.3 km",
      rating: "4.5",
      reviews: "450",
      cuisine: "Phở",
      priceRange: "50k - 100k",
    },
    {
      id: 10,
      image: "https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=400&h=300&fit=crop",
      title: "Cơm Tấm Sài Gòn - Định Công",
      address: "45 Định Công, Phường Liệt...",
      distance: "0.4 km",
      rating: "4.3",
      reviews: "180",
      cuisine: "Cơm Tấm",
      priceRange: "50k - 100k",
    },
    {
      id: 11,
      image: "https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=400&h=300&fit=crop",
      title: "Lẩu Thái Tomyum - Kim Đồng",
      address: "50 Kim Đồng, Phường Giáp Bát...",
      distance: "0.5 km",
      rating: "4.8",
      reviews: "520",
      cuisine: "Lẩu",
      priceRange: "100k - 200k",
    },
    {
      id: 12,
      image: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&h=300&fit=crop",
      title: "Pizza Hut - Giải Phóng",
      address: "820 Giải Phóng, Phường Giáp Bát...",
      distance: "0.6 km",
      rating: "4.2",
      reviews: "890",
      cuisine: "Pizza",
      priceRange: "100k - 200k",
    },
  ];

  const distanceOptions = [
    { label: "Dưới 0.5 km", value: "0.5" },
    { label: "0.5 - 1 km", value: "1" },
    { label: "1 - 2 km", value: "2" },
    { label: "Trên 2 km", value: "3" },
  ];

  const cuisineOptions = [
    { label: "Ẩm thực Việt", value: "Ẩm thực Việt" },
    { label: "Bún Chả", value: "Bún Chả" },
    { label: "Bún Riêu", value: "Bún Riêu" },
    { label: "Phở", value: "Phở" },
    { label: "Cơm Tấm", value: "Cơm Tấm" },
    { label: "Bánh Mì", value: "Bánh Mì" },
    { label: "Pizza", value: "Pizza" },
    { label: "Lẩu", value: "Lẩu" },
    { label: "Đồ uống", value: "Đồ uống" },
    { label: "Ăn vặt", value: "Ăn vặt" },
  ];

  const priceOptions = [
    { label: "Dưới 30k", value: "20k - 30k" },
    { label: "30k - 50k", value: "30k - 50k" },
    { label: "50k - 100k", value: "50k - 100k" },
    { label: "100k - 200k", value: "100k - 200k" },
    { label: "Trên 200k", value: "200k+" },
  ];

  const ratingOptions = [
    { label: "4.5+ sao", value: 4.5 },
    { label: "4.0+ sao", value: 4.0 },
    { label: "3.5+ sao", value: 3.5 },
    { label: "3.0+ sao", value: 3.0 },
  ];

  const toggleFavorite = (id) => {
    setFavorites((prev) =>
      prev.includes(id) ? prev.filter((fav) => fav !== id) : [...prev, id]
    );
  };

  const handleFilterChange = (filterType, value) => {
    setFilters((prev) => {
      if (filterType === "rating") {
        return { ...prev, rating: prev.rating === value ? null : value };
      }
      
      const currentValues = prev[filterType];
      const newValues = currentValues.includes(value)
        ? currentValues.filter((v) => v !== value)
        : [...currentValues, value];
      
      return { ...prev, [filterType]: newValues };
    });
  };

  const clearFilters = () => {
    setFilters({
      distance: [],
      cuisine: [],
      priceRange: [],
      rating: null,
    });
  };

  const FilterSection = () => (
    <div className="space-y-6">
      {/* Distance Filter */}
      <div>
        <h3 className="font-semibold text-gray-900 mb-3">Khoảng cách</h3>
        <div className="space-y-2">
          {distanceOptions.map((option) => (
            <label key={option.value} className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={filters.distance.includes(option.value)}
                onChange={() => handleFilterChange("distance", option.value)}
                className="w-4 h-4 text-yellow-500 rounded focus:ring-yellow-500"
              />
              <span className="ml-2 text-sm text-gray-700">{option.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Cuisine Filter */}
      <div>
        <h3 className="font-semibold text-gray-900 mb-3">Món ăn</h3>
        <div className="space-y-2">
          {cuisineOptions.map((option) => (
            <label key={option.value} className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={filters.cuisine.includes(option.value)}
                onChange={() => handleFilterChange("cuisine", option.value)}
                className="w-4 h-4 text-yellow-500 rounded focus:ring-yellow-500"
              />
              <span className="ml-2 text-sm text-gray-700">{option.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Price Range Filter */}
      <div>
        <h3 className="font-semibold text-gray-900 mb-3">Giá</h3>
        <div className="space-y-2">
          {priceOptions.map((option) => (
            <label key={option.value} className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={filters.priceRange.includes(option.value)}
                onChange={() => handleFilterChange("priceRange", option.value)}
                className="w-4 h-4 text-yellow-500 rounded focus:ring-yellow-500"
              />
              <span className="ml-2 text-sm text-gray-700">{option.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Rating Filter */}
      <div>
        <h3 className="font-semibold text-gray-900 mb-3">Đánh giá</h3>
        <div className="space-y-2">
          {ratingOptions.map((option) => (
            <label key={option.value} className="flex items-center cursor-pointer">
              <input
                type="radio"
                checked={filters.rating === option.value}
                onChange={() => handleFilterChange("rating", option.value)}
                className="w-4 h-4 text-yellow-500 focus:ring-yellow-500"
              />
              <span className="ml-2 text-sm text-gray-700">{option.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Clear Filters */}
      <button
        onClick={clearFilters}
        className="w-full py-2 text-sm text-yellow-600 hover:text-yellow-700 font-medium"
      >
        Xóa bộ lọc
      </button>
    </div>
  );

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Search Header */}


      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex gap-8">
          {/* Desktop Filters Sidebar */}
          <aside className="hidden lg:block w-64 flex-shrink-0">
            <div className="bg-white rounded-xl p-6 shadow-sm sticky top-24">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">Bộ lọc</h2>
                <SlidersHorizontal className="h-5 w-5 text-gray-600" />
              </div>
              <FilterSection />
            </div>
          </aside>

          {/* Mobile Filters Modal */}
          {showMobileFilters && (
            <div className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-50">
              <div className="absolute right-0 top-0 bottom-0 w-80 bg-white shadow-xl overflow-y-auto">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-gray-900">Bộ lọc</h2>
                    <button
                      onClick={() => setShowMobileFilters(false)}
                      className="p-2 hover:bg-gray-100 rounded-lg"
                    >
                      <X className="h-6 w-6" />
                    </button>
                  </div>
                  <FilterSection />
                </div>
              </div>
            </div>
          )}

          {/* Restaurant Grid */}
          <div className="flex-1">
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-gray-900">
                Tìm thấy {restaurants.length} quán ăn
              </h1>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
        </div>
      </div>
    </div>
  );
};