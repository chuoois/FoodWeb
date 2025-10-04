import React, { useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { Star, Heart } from "lucide-react"
import { Card } from "@/components/ui/card"


const menuData = { 
  "do-uong": {
        title: "Đồ uống",
        items: [
            {
                id: 1,
                name: "Cafe Tonkin Cottage - Lý Tự Trọng",
                image: "/img-home/cafe-1.jpg",
                rating: 4.7,
                reviews: 63,
                address: "Lầu 2-3-4, 91 Lý Tự Trọng, Bến Thành...",
                isPromo: true,
                category: "Cà phê, Trà sữa",
            },
            {
                id: 2,
                name: "Nhà Hàng Doãn Viên - Huyền Trân Công Chúa",
                image: "/img-home/restaurant-2.jpg",
                rating: 4.5,
                reviews: 89,
                address: "6 Huyền Trân Công Chúa, Phường Bến...",
                isPromo: true,
                category: "Nước ép, Sinh tố",
            },
            {
                id: 3,
                name: "The Coffee Factory - Trường Định",
                image: "/img-home/coffee-factory.jpg",
                rating: 4.8,
                reviews: 68,
                address: "107A Trường Định, Phường Võ Thị Sáu...",
                isPromo: true,
                category: "Cà phê đặc biệt",
            },
            {
                id: 4,
                name: "Nước Mía 60 Năm",
                image: "/img-home/sugarcane-juice.jpg",
                rating: 5.0,
                reviews: 25,
                address: "230 Cống Quỳnh, Phạm Ngũ Lão, Quận...",
                isPromo: true,
                category: "Nước mía, Nước ép",
            },
            {
                id: 5,
                name: "Nâu Đá Cà Phê - Cống Quỳnh",
                image: "/img-home/iced-coffee.jpg",
                rating: 4.5,
                reviews: 119,
                address: "14B Cống Quỳnh, Phường Nguyễn Cư...",
                isPromo: true,
                category: "Cà phê đá",
            },
            {
                id: 6,
                name: "Trà sữa Đô Đô ",
                image: "https://bizweb.dktcdn.net/100/202/714/products/338433458-6413759671978216-7109278540002222755-n.jpg?v=1709605208717",
                rating: 4.6,
                reviews: 94,
                address: "245/10 Nguyễn Trãi, Nguyễn Cư Trinh...",
                isPromo: true,
                category: "Sinh tố, Nước ép",
            },
            {
                id: 7,
                name: "K&C - Nước Ép Tại Chỗ - Nguyễn Thượng Hiền",
                image: "/img-home/fresh-juice.jpg",
                rating: 4.9,
                reviews: 148,
                address: "127 Nguyễn Thượng Hiền, phường Bàn...",
                isPromo: true,
                category: "Nước ép tươi",
            },
            {
                id: 8,
                name: "Hồng Trà Ngô Gia - 232 Nguyễn Thượng Hiền",
                image: "/img-home/tea.jpg",
                rating: 4.4,
                reviews: 99,
                address: "232 Nguyễn Thượng Hiền, P. 4, Quận 3...",
                isPromo: true,
                category: "Trà, Hồng trà",
            },
            {
                id: 9,
                name: "Ghế Xỉu Đá - Juice & Smoothie",
                image: "/img-home/smoothie.jpg",
                rating: 4.6,
                reviews: 94,
                address: "245/10 Nguyễn Trãi, Nguyễn Cư Trinh...",
                isPromo: true,
                category: "Sinh tố, Nước ép",
            },
            {
                id: 10,
                name: "K&C - Nước Ép Tại Chỗ - Nguyễn Thượng Hiền",
                image: "/img-home/fresh-juice.jpg",
                rating: 4.9,
                reviews: 148,
                address: "127 Nguyễn Thượng Hiền, phường Bàn...",
                isPromo: true,
                category: "Nước ép tươi",
            },
         
        ],
    },
    "do-an": {
        title: "Thức Ăn",
        items: [
            {
                id: 14,
                name: "Bún Thịt Nướng Xuân Mai - Bún Mắm & Ăn Vặt",
                image: "/img-home/bun-thit-nuong.jpg",
                rating: 4.2,
                reviews: 29,
                address: "Sạp 1066/1090 Chợ Bến Thành, Lê Lợi...",
                isPromo: true,
                category: "Bún, Mắm",
            },
            {
                id: 15,
                name: "Pin Wei - Bánh Cuốn Tươi - Phan Bội Châu",
                image: "/img-home/banh-cuon.jpg",
                rating: 4.6,
                reviews: 89,
                address: "14 Phan Bội Châu, Phường Bến Thành...",
                isPromo: true,
                category: "Bánh cuốn",
            },
            {
                id: 16,
                name: "Cơm Tấm Sài Gòn - Nguyễn Trãi",
                image: "/img-home/com-tam.jpg",
                rating: 4.8,
                reviews: 156,
                address: "123 Nguyễn Trãi, Phường Bến Thành...",
                isPromo: true,
                category: "Cơm tấm",
            },
            {
                id: 17,
                name: "Phở Hà Nội - Lê Thánh Tôn",
                image: "/img-home/pho.jpg",
                rating: 4.7,
                reviews: 203,
                address: "45 Lê Thánh Tôn, Phường Bến Thành...",
                isPromo: true,
                category: "Phở, Bún",
            },
            {
                id: 18,
                name: "Bánh Mì Huỳnh Hoa - Lê Thị Riêng",
                image: "/img-home/banh-mi.jpg",
                rating: 4.9,
                reviews: 312,
                address: "26 Lê Thị Riêng, Phường Bến Thành...",
                isPromo: true,
                category: "Bánh mì",
            },
            {
                id: 19,
                name: "Gỏi Cuốn Sài Gòn - Nguyễn Thiện Thuật",
                image: "/img-home/goi-cuon.jpg",
                rating: 4.5,
                reviews: 87,
                address: "78 Nguyễn Thiện Thuật, Quận 3...",
                isPromo: true,
                category: "Gỏi cuốn, Nem",
            },
            {
                id: 20,
                name: "Hủ Tiếu Nam Vang - Pasteur",
                image: "/img-home/hu-tieu.jpg",
                rating: 4.6,
                reviews: 134,
                address: "167 Pasteur, Phường Võ Thị Sáu...",
                isPromo: true,
                category: "Hủ tiếu",
            },
            {
                id: 21,
                name: "Chả Cá Lã Vọng - Đồng Khởi",
                image: "/img-home/cha-ca.jpg",
                rating: 4.4,
                reviews: 76,
                address: "89 Đồng Khởi, Phường Bến Nghé...",
                isPromo: true,
                category: "Chả cá",
            },
             {
                id: 22,
                name: "Bún Đậu Đồng Mô",
                image: "https://duonggiahotel.vn/wp-content/uploads/2023/09/bun-dau-mam-tom-da-nang-c.jpg",
                rating: 4.4,
                reviews: 76,
                address: "89 Đồng Khởi, Phường Bến Nghé...",
                isPromo: true,
                category: "Bún đậu",
            },
           
        ],
    },
}

export const MenuListPage = () => {
  const { category } = useParams()
  const navigate = useNavigate()
  const [favorites, setFavorites] = useState([])
  const [searchQuery, setSearchQuery] = useState("")

  const categoryData = menuData[category]

  if (!categoryData) {
    return <div>Category not found</div>
  }

  const filteredItems = categoryData.items.filter(
    (item) =>
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.category.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const toggleFavorite = (id) => {
    setFavorites((prev) =>
      prev.includes(id) ? prev.filter((fav) => fav !== id) : [...prev, id]
    )
  }

  return (
    <div className="bg-gray-50">
    

      <div className="max-w-7xl mx-auto p-4 pt-10">
        {/* Category Title */}
        <h2 className="text-5xl font-bold text-gray-800 mb-6">
          {categoryData.title}
        </h2>

        {/* Menu Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map((item) => (
            <Card
              key={item.id}
              onClick={() => navigate(`/detail/${item.id}`)}
              className="overflow-hidden hover:shadow-lg transition-all duration-300 group cursor-pointer"
            >
              <div className="relative">
                <img
                  src={
                    item.image ||
                    `/placeholder.svg?height=200&width=300&query=${item.category}`
                  }
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
                    e.stopPropagation()
                    toggleFavorite(item.id)
                  }}
                  className="absolute top-3 right-3 w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white transition-colors"
                >
                  <Heart
                    className={`w-4 h-4 ${
                      favorites.includes(item.id)
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
                  {item.address}
                </p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <span className="text-sm font-medium">{item.rating}</span>
                    <span className="text-xs text-gray-500">
                      ({item.reviews})
                    </span>
                  </div>
                  <span className="text-xs text-orange-600 font-medium">
                    {item.category}
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
  )
}
