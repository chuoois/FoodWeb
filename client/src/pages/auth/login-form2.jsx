import { useState } from "react";
import { Eye, EyeOff, Mail, Lock, XCircle, CheckCircle } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

export const AdminLoginForm = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState(null); // overlay message
  const [type, setType] = useState("success"); // "success" | "error"
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    rememberMe: false,
  });

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    // giả lập API login
    await new Promise((resolve) => setTimeout(resolve, 1000));

    if (formData.email === "admin@gmail.com" && formData.password === "123456") {
      localStorage.setItem("isLoggedIn", "true");
      setType("success");
      setMessage("Đăng nhập thành công! Đang chuyển hướng...");
      setTimeout(() => {
        navigate("/staff");
      }, 1500);
    } else {
      setType("error");
      setMessage("Sai tài khoản hoặc mật khẩu!");
    }

    setIsLoading(false);
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 px-4">
      {/* Overlay Thông báo */}
      {message && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50">
          <div className="bg-white rounded-xl shadow-xl p-6 flex flex-col items-center space-y-3 animate-fade-in">
            {type === "success" ? (
              <CheckCircle className="w-12 h-12 text-green-500" />
            ) : (
              <XCircle className="w-12 h-12 text-red-500" />
            )}
            <p className="text-lg font-medium text-gray-800">{message}</p>
            <button
              onClick={() => setMessage(null)}
              className="px-4 py-2 bg-yellow-400 text-black rounded-lg hover:bg-yellow-500"
            >
              Đóng
            </button>
          </div>
        </div>
      )}

      {/* Logo + Brand */}
      <Link to="/">
        <div className="mb-6">
          <h1 className="text-4xl font-bold text-yellow-400">beFood Admin</h1>
        </div>
      </Link>

      {/* White card */}
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8">
        {/* Title */}
        <h2 className="text-2xl font-semibold text-center mb-1">Đăng nhập quản trị</h2>
        <p className="text-center text-gray-600 mb-8">
          Dành cho <span className="font-medium text-yellow-500">Admin / Quản lý nhà hàng</span>
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Email */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 block">Email quản trị</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="email"
                placeholder="Nhập email quản trị"
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                className="pl-10 border border-gray-300 rounded-lg w-full px-3 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                required
              />
            </div>
          </div>

          {/* Password */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 block">Mật khẩu</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Nhập mật khẩu quản trị"
                value={formData.password}
                onChange={(e) => handleInputChange("password", e.target.value)}
                className="pl-10 pr-10 border border-gray-300 rounded-lg w-full px-3 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Remember me + Forgot */}
          <div className="flex items-center justify-between">
            <label className="flex items-center space-x-2 text-sm text-gray-600 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.rememberMe}
                onChange={(e) => handleInputChange("rememberMe", e.target.checked)}
                className="rounded border-gray-300 text-yellow-400 focus:ring-yellow-400"
              />
              <span>Ghi nhớ đăng nhập</span>
            </label>
            <a
              href="/auth/forgot-password"
              className="text-sm text-yellow-500 hover:text-yellow-600 hover:underline"
            >
              Quên mật khẩu?
            </a>
          </div>

          {/* Login button */}
          <button
            type="submit"
            className="w-full bg-yellow-400 text-black font-semibold rounded-lg px-4 py-2.5 hover:bg-yellow-500 disabled:opacity-70 transition-colors"
            disabled={isLoading}
          >
            {isLoading ? "Đang đăng nhập..." : "Đăng nhập quản trị"}
          </button>
        </form>

        {/* Footer note */}
        <p className="mt-6 text-xs text-gray-500 text-center">
          Bằng cách tiếp tục, bạn đồng ý với{" "}
          <button className="text-yellow-500 hover:underline">Điều khoản dịch vụ</button> và{" "}
          <button className="text-yellow-500 hover:underline">Chính sách bảo mật</button> của chúng tôi.
        </p>
      </div>
    </div>
  );
};
