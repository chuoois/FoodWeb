export const HeroSectionHome = () => {
  return (
    <section className="w-full px-6 py-16 bg-[#FBF4E6]">
      <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
        {/* Left Content */}
        <div className="space-y-8">
          <div className="space-y-4">
            <h1 className="text-5xl lg:text-6xl font-bold text-foreground leading-tight text-balance">
              Giao hàng nhanh, <span className="text-orange-500">mọi lúc!</span>
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed max-w-lg">
              Đặt món ăn yêu thích từ các nhà hàng tốt nhất trong thành phố. Giao
              hàng nhanh chóng, đảm bảo chất lượng.
            </p>
          </div>

          <div className="flex items-center gap-4">
            <button className="bg-orange-500 hover:bg-orange-600 text-white font-semibold px-8 py-3 rounded-full text-lg transition-colors duration-300">
              Khám phá ngay
            </button>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></div>
              <span>Giao hàng trong 30 phút</span>
            </div>
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
