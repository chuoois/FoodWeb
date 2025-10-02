import { Search, User } from "lucide-react";
import { Facebook, Instagram, Youtube } from "lucide-react";


export const FooterHome = () => {
  return (
    <footer className="bg-gray-50 border-t border-gray-200">
      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Top Section */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          {/* Column 1 - About */}
          <div>
            <h2 className="text-2xl font-bold text-blue-600 mb-6">beFood</h2>
            <ul className="space-y-3">
              <li><a href="#" className="text-gray-700 hover:text-blue-600">Về befood</a></li>
              <li><a href="#" className="text-gray-700 hover:text-blue-600">Tin tức</a></li>
              <li><a href="#" className="text-gray-700 hover:text-blue-600">Đăng ký làm nhà hàng</a></li>
              <li><a href="#" className="text-gray-700 hover:text-blue-600">Trở thành tài xế beFood</a></li>
            </ul>
          </div>

          {/* Column 2 - Contact */}
          <div>
            <ul className="space-y-3 mt-14">
              <li className="text-gray-700">
                <span className="font-semibold">Hotline:</span> 1900232345
              </li>
              <li className="text-gray-700">
                <span className="font-semibold">Email:</span> hotro@be.com.vn
              </li>
              <li><a href="#" className="text-gray-700 hover:text-blue-600">Câu hỏi thường gặp</a></li>
            </ul>
          </div>

          {/* Column 3 - Social Media */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Kết nối với chúng tôi</h3>
            <div className="flex gap-4">
              <a href="#" className="text-blue-600 hover:text-blue-700">
                <Facebook className="h-8 w-8" fill="currentColor" />
              </a>
              <a href="#" className="text-pink-600 hover:text-pink-700">
                <Instagram className="h-8 w-8" />
              </a>
              <a href="#" className="text-red-600 hover:text-red-700">
                <Youtube className="h-8 w-8" fill="currentColor" />
              </a>
            </div>
          </div>

          {/* Column 4 - QR Code */}
          <div>
            <div className="flex items-start gap-4">
              <div className="w-32 h-32 bg-black rounded-lg flex items-center justify-center flex-shrink-0">
                <div className="w-28 h-28 bg-white"></div>
              </div>
              <div>
                <p className="text-gray-900 font-semibold">Quét mã này</p>
                <p className="text-gray-700">để tải ứng dụng</p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section - Company Info */}
        <div className="border-t border-gray-200 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-start gap-6">
            <div className="flex-1">
              <h3 className="text-lg font-bold text-gray-900 mb-4">CÔNG TY CỔ PHẦN BE GROUP</h3>
              <div className="text-sm text-gray-600 space-y-1">
                <p>Giấy chứng nhận ĐKDN: 0108269207. Cấp lần đầu: 11/5/2018. Cơ quan cấp: do Sở Kế Hoạch và Đầu tư Thành Phố Hà Nội.</p>
                <p>Đăng ký thay đổi lần 9: 08/09/2021. Cơ quan cấp: Sở Kế Hoạch và Đầu tư Thành Phố Hồ Chí Minh.</p>
                <p>Giấy phép kinh doanh vận tải bằng xe ô tô cấp lần đầu: số 7942, ngày 01/11/2018; Cấp lần thứ 6: số 10362, ngày 07/06/2021 bởi Sở Giao Thông Vận Tải Thành Phố Hồ Chí Minh.</p>
                <p>Địa chỉ trụ sở chính: Tầng 16, Tòa Nhà Sài Gòn Tower, 29 Lê Duẩn, Phường Sài Gòn, Thành phố Hồ Chí Minh, Việt Nam.</p>
                <p>Đại diện công ty: Bà Vũ Hoàng Yến. Chức vụ: Tổng Giám Đốc.</p>
              </div>
            </div>
            
            <div className="flex gap-4 flex-shrink-0">
              <div className="w-32 h-32 bg-blue-500 rounded-lg flex items-center justify-center">
                <div className="text-white text-center text-xs font-semibold">
                  <div>ĐÃ THÔNG BÁO</div>
                  <div>BỘ CÔNG THƯƠNG</div>
                </div>
              </div>
              <div className="w-32 h-32 bg-red-500 rounded-lg flex items-center justify-center">
                <div className="text-white text-center text-xs font-semibold">
                  <div>ĐÃ ĐĂNG KÝ</div>
                  <div>BỘ CÔNG THƯƠNG</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}