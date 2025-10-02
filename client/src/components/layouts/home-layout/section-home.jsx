import { MapPin, Target } from 'lucide-react';

export const HeroSection = () => {
  return (
    <section className="bg-gradient-to-b from-gray-50 to-white py-20">
      <div className="max-w-4xl mx-auto px-6">
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Địa chỉ bạn muốn giao món
          </h1>
        </div>

        <div className="max-w-2xl mx-auto">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <MapPin className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Giải Phóng, Giải Phóng, P.Giáp Bát, Q.Hoàn"
              className="w-full pl-12 pr-12 py-4 text-lg rounded-full border-2 border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none shadow-sm"
            />
            <button className="absolute inset-y-0 right-0 pr-4 flex items-center">
              <Target className="h-5 w-5 text-gray-400 hover:text-blue-500 transition-colors" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}