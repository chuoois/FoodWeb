import { useState } from "react"
import { Link } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Eye, EyeOff, Mail, Lock, Store } from "lucide-react"

export  function StoreDirectorLogin() {
  const [showPassword, setShowPassword] = useState(false)

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-50 via-orange-50 to-red-50 p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl flex items-center justify-center mb-3 shadow-lg">
            <Store className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-800">
            Yummy<span className="text-orange-600">Go</span>
          </h1>
          <div className="flex items-center gap-2 mt-1">
            <div className="h-px w-8 bg-orange-300" />
            <p className="text-sm text-orange-600 font-medium">Store Director</p>
            <div className="h-px w-8 bg-orange-300" />
          </div>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-orange-100">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Đăng nhập</h2>
            <p className="text-sm text-gray-600">Quản lý cửa hàng của bạn với YummyGo</p>
          </div>

          <form className="space-y-5">
            {/* Email Field */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                Email
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  id="email"
                  type="email"
                  placeholder="Nhập email của bạn"
                  className="pl-10 h-12 border-gray-300 focus:border-orange-500 focus:ring-orange-500"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                Mật khẩu
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Nhập mật khẩu"
                  className="pl-10 pr-10 h-12 border-gray-300 focus:border-orange-500 focus:ring-orange-500"
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

            {/* Remember & Forgot */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Checkbox id="remember" />
                <label htmlFor="remember" className="text-sm text-gray-600 cursor-pointer select-none">
                  Ghi nhớ đăng nhập
                </label>
              </div>
              <Link
                to="/store-director/forgot-password"
                className="text-sm text-orange-600 hover:text-orange-700 font-medium"
              >
                Quên mật khẩu?
              </Link>
            </div>

            {/* Login Button */}
            <Button
              type="submit"
              className="w-full h-12 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-semibold text-base shadow-md"
            >
              Đăng nhập
            </Button>

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-gray-500">Hoặc</span>
              </div>
            </div>

            {/* Google Login */}
            <Button
              type="button"
              variant="outline"
              className="w-full h-12 border-gray-300 hover:bg-gray-50 font-medium bg-transparent"
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
              Đăng nhập bằng Google
            </Button>
          </form>

          {/* Register Link */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Chưa có tài khoản quản lý?{" "}
              <Link to="/store-director/register" className="text-orange-600 hover:text-orange-700 font-semibold">
                Đăng ký ngay
              </Link>
            </p>
          </div>

          {/* Footer Note */}
          <div className="mt-6 pt-6 border-t border-gray-100">
            <p className="text-xs text-center text-gray-500 leading-relaxed">
              Bằng cách tiếp tục, bạn đồng ý với{" "}
              <Link to="/terms" className="text-orange-600 hover:underline">
                Điều khoản dịch vụ
              </Link>{" "}
              và{" "}
              <Link to="/privacy" className="text-orange-600 hover:underline">
                Chính sách bảo mật
              </Link>{" "}
              của chúng tôi.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
