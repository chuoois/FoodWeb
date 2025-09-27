import { MapPin, Crosshair } from "lucide-react"; // icon

export const HeroSectionHome = () => {
  return (
    <section className="w-full px-6 py-16 bg-[#FBF4E6]">
      <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
        {/* Left Content */}
        <div className="space-y-8">
          <div className="space-y-4">
            <h1 className="text-5xl lg:text-6xl font-bold text-foreground leading-tight text-balance">
              Đặt đồ ăn nhanh, <span className="text-orange-500">mọi lúc!</span>
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed max-w-lg">
              Đặt món ăn yêu thích từ các nhà hàng tốt nhất trong thành phố. Giao
              hàng nhanh chóng, đảm bảo chất lượng.
            </p>
          </div>

          {/* Thanh nhập địa chỉ */}
          <div className="flex items-center w-full max-w-lg border border-blue-400 rounded-lg px-3 py-2 bg-white shadow-sm">
            <MapPin className="w-5 h-5 text-gray-500" />
            <input
              type="text"
              placeholder="Nhập địa chỉ của bạn"
              className="flex-1 px-2 py-1 outline-none text-gray-700"
            />
            <button
              onClick={() => {
                if (navigator.geolocation) {
                  navigator.geolocation.getCurrentPosition(
                    (pos) => {
                      console.log("Vị trí hiện tại:", pos.coords);
                      alert(
                        `Lat: ${pos.coords.latitude}, Lng: ${pos.coords.longitude}`
                      );
                    },
                    (err) => alert("Không lấy được vị trí: " + err.message)
                  );
                } else {
                  alert("Trình duyệt không hỗ trợ định vị!");
                }
              }}
            >
              <Crosshair className="w-5 h-5 text-gray-500 hover:text-orange-500" />
            </button>
          </div>
        </div>

        {/* Right Illustration */}
        <div className="relative">
          <div className="relative w-full h-96 rounded-3xl overflow-hidden shadow-2xl shadow-orange-200 transform hover:scale-105 transition-transform duration-500 ease-in-out animate-fade-in">
            <img
              src="/img-home/img-hero-section.png"
              alt="Delivery illustration"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </div>
    </section>
  );
};
