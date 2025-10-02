import { useState } from "react";
import { Eye, EyeOff, Mail, Lock, XCircle, CheckCircle } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

export const LoginForm = () => {
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

    if (formData.email === "user@gmail.com" && formData.password === "123456") {
      localStorage.setItem("isLoggedIn", "true");
      setType("success");
      setMessage("Đăng nhập thành công! Đang chuyển hướng...");
      setTimeout(() => {
        navigate("/");
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
          <h1 className="text-4xl font-bold text-yellow-400">beFood</h1>
        </div>
      </Link>

      {/* White card */}
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8">
        {/* Title */}
        <h2 className="text-2xl font-semibold text-center mb-1">Đăng nhập</h2>
        <p className="text-center text-gray-600 mb-8">
          Chào mừng bạn trở lại với{" "}
          <span className="font-medium text-yellow-500">beFood</span>
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Email */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 block">
              Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="email"
                placeholder="Nhập email của bạn"
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                className="pl-10 border border-gray-300 rounded-lg w-full px-3 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                required
              />
            </div>
          </div>

          {/* Password */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 block">
              Mật khẩu
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Nhập mật khẩu"
                value={formData.password}
                onChange={(e) => handleInputChange("password", e.target.value)}
                className="pl-10 pr-10 border border-gray-300 rounded-lg w-full px-3 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>

          {/* Remember me + Forgot */}
          <div className="flex items-center justify-between">
            <label className="flex items-center space-x-2 text-sm text-gray-600 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.rememberMe}
                onChange={(e) =>
                  handleInputChange("rememberMe", e.target.checked)
                }
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
            {isLoading ? "Đang đăng nhập..." : "Đăng nhập"}
          </button>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">Hoặc</span>
            </div>
          </div>

          {/* Social login */}
          <div className="space-y-3">
            <button
              type="button"
              className="w-full border border-gray-300 rounded-lg px-4 py-2 flex items-center justify-center hover:bg-gray-50 transition-colors"
            >
              <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Đăng nhập với Google
            </button>
          </div>

          {/* Register link */}
          <div className="text-center">
            <p className="text-sm text-gray-600">
              Chưa có tài khoản?{" "}
              <a
                href="/auth/register"
                className="text-yellow-500 hover:text-yellow-600 hover:underline font-medium"
              >
                Đăng ký ngay
              </a>
            </p>
          </div>
        </form>

        {/* Footer note */}
        <p className="mt-6 text-xs text-gray-500 text-center">
          Bằng cách tiếp tục, bạn đồng ý với{" "}
          <button className="text-yellow-500 hover:underline">
            Điều khoản dịch vụ
          </button>{" "}
          và{" "}
          <button className="text-yellow-500 hover:underline">
            Chính sách bảo mật
          </button>{" "}
          của chúng tôi.
        </p>
      </div>
    </div>
  );
};
