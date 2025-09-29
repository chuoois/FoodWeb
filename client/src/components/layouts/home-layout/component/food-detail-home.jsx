import React, { useState } from "react";
import { Star, Heart, User, ShoppingCart } from "lucide-react";

    const products = [
      {
        id: 1,
        title: "BLACK COFFEE - Cà phê đen kiểu Tonkin",
        desc: "Tràn đầy cảm hứng bắt đầu ngày mới",
        sold: 6,
        price: 49000,
        img: "https://images.unsplash.com/photo-1509042239860-f550ce710b93",
      },
      {
        id: 2,
        title: "MILK COFFEE - Cà phê Bạc xỉu kiểu Tonkin",
        desc: "Công thức Bạc xỉu độc quyền tại quán",
        sold: 50,
        price: 49000,
        img: "https://images.unsplash.com/photo-1509042239861-f550ce710b94",
      },
      {
        id: 3,
        title: "COCONUT MILK COFFEE - Cà phê sữa dừa kiểu Tonkin",
        desc: "Hương vị sữa dừa thơm béo kết hợp độc đáo",
        sold: 10,
        price: 59000,
        img: "https://images.unsplash.com/photo-1509042239862-f550ce710b95",
      },
      {
        id: 4,
        title: "NUT MILK COFFEE - Cà phê sữa hạt kiểu Tonkin",
        desc: "Lựa chọn tinh tế cho sức khỏe với sữa hạt",
        sold: 0,
        price: 55000,
        img: "https://images.unsplash.com/photo-1509042239863-f550ce710b96",
      },
    ];

    const CartItem = ({ item, onDecrease, onIncrease }) => (
      <div className="flex items-center justify-between border-b border-gray-200 py-3">
        <img src={item.img} alt={item.title} className="w-12 h-12 rounded-md object-cover" />
        <div className="flex-1 mx-3">
          <div className="text-sm font-semibold text-gray-800">{item.title}</div>
          <div className="text-xs text-gray-500">Số lượng: {item.qty}</div>
          <div className="text-xs font-medium text-gray-700">{item.price.toLocaleString()}đ</div>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => onDecrease(item.id)}
            className="w-8 h-8 rounded-full bg-gray-200 text-gray-700 font-bold flex items-center justify-center hover:bg-gray-300 transition"
          >
            −
          </button>
          <div className="text-sm font-medium">{item.qty}</div>
          <button
            onClick={() => onIncrease(item.id)}
            className="w-8 h-8 rounded-full bg-yellow-400 text-white font-bold flex items-center justify-center hover:bg-yellow-500 transition"
          >
            +
          </button>
        </div>
      </div>
    );

 export const FoodDetailHome = () => {
      const [cartItems, setCartItems] = useState([
        {
          id: 1,
          qty: 1,
          title: products[0].title,
          price: 49000,
          img: products[0].img,
        },
        {
          id: 2,
          qty: 1,
          title: products[1].title,
          price: 49000,
          img: products[1].img,
        },
      ]);

      const handleIncrease = (id) => {
        setCartItems((prev) =>
          prev.map((item) =>
            item.id === id ? { ...item, qty: item.qty + 1 } : item
          )
        );
      };

      const handleDecrease = (id) => {
        setCartItems((prev) =>
          prev.map((item) =>
            item.id === id && item.qty > 1 ? { ...item, qty: item.qty - 1 } : item
          )
        );
      };

      const handleAddToCart = (product) => {
        setCartItems((prev) => {
          const existingItem = prev.find((item) => item.id === product.id);
          if (existingItem) {
            return prev.map((item) =>
              item.id === product.id ? { ...item, qty: item.qty + 1 } : item
            );
          }
          return [
            ...prev,
            {
              id: product.id,
              qty: 1,
              title: product.title,
              price: product.price,
              img: product.img,
            },
          ];
        });
      };

      const total = cartItems.reduce((sum, i) => sum + i.qty * i.price, 0);

      return (
        <div className="bg-gray-50 min-h-screen">
          <div className="max-w-7xl mx-auto px-4 py-6 flex flex-col lg:flex-row gap-8">
            <div className="flex-1 p-5">
              <div>
                <img
                  src="https://example.com/cafe-image.jpg"
                  alt="Cafe Tonkin Cottage"
                  className="w-full h-48 rounded-lg object-cover"
                />
              </div>
              <div className="flex justify-between items-center mt-4 mb-3">
                <h2 className="text-xl font-bold text-blue-900">
                  Cafe Tonkin Cottage - Lý Tự Trọng
                </h2>
                <button
                  aria-label="Like"
                  className="flex items-center space-x-1 text-gray-600 bg-white px-3 py-1.5 rounded-full shadow hover:shadow-lg transition"
                >
                  <Heart className="text-red-500 w-4 h-4" />
                  <span className="text-sm">Yêu thích</span>
                </button>
              </div>
              <p className="text-gray-600 text-sm mb-3">
                91 Lý Tự Trọng, Bến Thành, Quận 1, Hồ Chí Minh, Việt Nam
              </p>
              <div className="flex items-center space-x-3 mb-4">
                <div className="flex items-center space-x-1">
                  <Star className="w-4 h-4 text-yellow-500" />
                  <span className="font-semibold text-gray-900">4.7</span>
                  <a href="#" className="text-blue-600 hover:underline text-sm">
                    (63 Đánh giá)
                  </a>
                </div>
                <a
                  href="#"
                  className="text-gray-500 text-sm underline hover:text-gray-700"
                >
                  Thông tin quán
                </a>
              </div>
              <div className="flex items-center space-x-3 mb-4">
                <button className="border border-gray-300 rounded-full px-4 py-1.5 text-gray-700 text-sm hover:bg-gray-100 transition flex items-center justify-between min-w-[140px]">
                  Nhà hàng tương tự <span className="ml-1">▼</span>
                </button>
                <button className="border border-gray-300 rounded-full px-4 py-1.5 text-gray-700 text-sm hover:bg-gray-100 transition flex items-center min-w-[140px]">
                  <User className="mr-1 w-4 h-4" />
                  Đặt theo nhóm
                </button>
              </div>
              <div className="mb-4">
                <input
                  type="search"
                  placeholder="Tìm kiếm trong nhà hàng"
                  className="w-full border border-gray-300 rounded-md py-2 px-4 text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
              </div>
              <div className="flex space-x-2 overflow-x-auto scrollbar-hide pb-2">
                <button className="bg-blue-900 text-white uppercase text-xs font-bold px-3 py-1.5 rounded-full whitespace-nowrap flex items-center">
                  TONKIN SIGNATURE: CAFE ĐỈNH
                  <span className="bg-blue-400 text-white rounded-full px-1.5 ml-1.5 text-xs">
                    4
                  </span>
                </button>
                <button className="bg-gray-200 text-gray-600 uppercase text-xs font-semibold px-3 py-1.5 rounded-full whitespace-nowrap flex items-center">
                  CAFE VIỆT NAM - ROBUSTA CHẤT LƯỢNG CAO
                  <span className="bg-blue-400 text-white rounded-full px-1.5 ml-1.5 text-xs">
                    4
                  </span>
                </button>
                <button className="bg-gray-200 text-gray-600 uppercase text-xs font-semibold px-3 py-1.5 rounded-full whitespace-nowrap flex items-center">
                  CAFE PHA MÁY - ROBUSTA CHẤT LƯỢNG CAO
                  <span className="bg-blue-400 text-white rounded-full px-1.5 ml-1.5 text-xs">
                    5
                  </span>
                </button>
                <button className="bg-gray-200 text-gray-600 uppercase text-xs font-semibold px-3 py-1.5 rounded-full whitespace-nowrap">
                  COLD BREW
                </button>
              </div>
            </div>
          </div>
          <div className="max-w-7xl mx-auto px-4 py-6 flex flex-col lg:flex-row gap-8">
            <div className="flex-1">
              <h2 className="text-xl font-bold text-blue-900 mb-4">
                CAFE VIỆT NAM – ROBUSTA CHẤT LƯỢNG CAO
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                {products.map((p) => (
                  <div
                    key={p.id}
                    className="border rounded-lg p-4 shadow-sm bg-white flex flex-col hover:shadow-md transition"
                  >
                    <img
                      src={p.img}
                      alt={p.title}
                      className="w-full h-40 rounded-lg object-cover mb-3"
                    />
                    <div className="font-semibold text-sm text-gray-800 mb-1">
                      {p.title}
                    </div>
                    <div className="text-xs text-gray-600 mb-2 line-clamp-2">
                      {p.desc}
                    </div>
                    <div className="flex items-center text-xs text-gray-600 mb-3">
                      <ShoppingCart className="w-4 h-4 mr-1" />
                      {p.sold}+ đã bán
                    </div>
                    <div className="mt-auto flex justify-between items-center">
                      <div className="font-semibold text-lg text-gray-800">
                        {p.price.toLocaleString()}đ
                      </div>
                      <button
                        onClick={() => handleAddToCart(p)}
                        className="w-8 h-8 rounded-full bg-yellow-400 text-white font-bold flex items-center justify-center hover:bg-yellow-500 transition"
                      >
                        +
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="w-full lg:w-80 bg-white shadow rounded-lg p-4 sticky top-4 h-fit max-h-[80vh] flex flex-col">
              <h3 className="font-semibold text-lg text-blue-900 mb-4">
                Giỏ hàng của tôi
              </h3>
              <div className="flex-1 overflow-y-auto">
                {cartItems.map((item) => (
                  <CartItem
                    key={item.id}
                    item={item}
                    onDecrease={handleDecrease}
                    onIncrease={handleIncrease}
                  />
                ))}
              </div>
              <div className="border-t border-gray-200 pt-4 mt-4">
                <div className="flex justify-between font-semibold text-gray-800 mb-3">
                  <span>Tổng số tiền</span>
                  <span>{total.toLocaleString()}đ</span>
                </div>
                <button className="w-full bg-yellow-400 text-white font-bold rounded-md py-2 hover:bg-yellow-500 transition">
                  Đăng nhập để đặt đơn
                </button>
                <p className="text-xs text-gray-500 mt-2 text-center">
                  Xem phí áp dụng và dùng mã khuyến mại ở bước tiếp theo
                </p>
              </div>
            </div>
          </div>
        </div>
      );
    };