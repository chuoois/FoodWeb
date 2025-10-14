import { useState, useContext } from "react"
import { Link, useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Eye, EyeOff, Mail, Lock, UserLock  } from "lucide-react"
import { useFormik } from "formik"
import * as Yup from "yup"
import toast from "react-hot-toast"
import { login, loginGoogle } from "@/services/auth.service"
import { GoogleLogin } from "@react-oauth/google"
import Cookies from "js-cookie"
import { AuthContext } from "@/context/AuthContext"

export function StaffLogin() {
  const [showPassword, setShowPassword] = useState(false)
  const navigate = useNavigate()
  const { login: loginContext } = useContext(AuthContext)

  const savedEmail = Cookies.get("rememberedEmail") || ""

  const validationSchema = Yup.object({
    email: Yup.string().email("Email không hợp lệ").required("Vui lòng nhập email"),
    password: Yup.string().min(6, "Mật khẩu tối thiểu 6 ký tự").required("Vui lòng nhập mật khẩu"),
  })

  const formik = useFormik({
    initialValues: {
      email: savedEmail,
      password: "",
      rememberMe: !!savedEmail,
    },
    validationSchema,
    onSubmit: async (values, { setSubmitting }) => {
      try {
        const res = await login(values)
        toast.success("Đăng nhập thành công!")

        loginContext(res.data.token)

        if (values.rememberMe) {
          Cookies.set("rememberedEmail", values.email, { expires: 7 })
        } else {
          Cookies.remove("rememberedEmail")
        }

        navigate("/store-director/dashboard")
      } catch (error) {
        toast.error(error.response?.data?.message || "Đăng nhập thất bại")
      } finally {
        setSubmitting(false)
      }
    },
  })

  

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-50 via-orange-50 to-red-50 p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl flex items-center justify-center mb-3 shadow-lg">
            < UserLock  className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-800">
            Yummy<span className="text-orange-600">Go</span>
          </h1>
          <div className="flex items-center gap-2 mt-1">
            <div className="h-px w-8 bg-orange-300" />
            <p className="text-sm text-orange-600 font-medium">Staff</p>
            <div className="h-px w-8 bg-orange-300" />
          </div>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-orange-100">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Đăng nhập</h2>
            <p className="text-sm text-gray-600">Chào mừng bạn đến với YummyGo Staff Portal</p>
          </div>

          <form onSubmit={formik.handleSubmit} className="space-y-5">
            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium text-gray-700">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="Nhập email của bạn"
                  value={formik.values.email}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className="pl-10 h-12 border-gray-300 focus:border-orange-500 focus:ring-orange-500"
                />
              </div>
              {formik.touched.email && formik.errors.email && (
                <p className="text-red-500 text-sm">{formik.errors.email}</p>
              )}
            </div>

            {/* Password */}
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium text-gray-700">Mật khẩu</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Nhập mật khẩu"
                  value={formik.values.password}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
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
              {formik.touched.password && formik.errors.password && (
                <p className="text-red-500 text-sm">{formik.errors.password}</p>
              )}
            </div>

            {/* Remember & Forgot */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="rememberMe"
                  name="rememberMe"
                  checked={formik.values.rememberMe}
                  onChange={formik.handleChange}
                />
                <label htmlFor="rememberMe" className="text-sm text-gray-600 cursor-pointer select-none">Ghi nhớ đăng nhập</label>
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
              disabled={formik.isSubmitting}
              className="w-full h-12 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-semibold text-base shadow-md"
            >
              {formik.isSubmitting ? "Đang đăng nhập..." : "Đăng nhập"}
            </Button>

           
          </form>

         

          {/* Footer Note */}
          <div className="mt-6 pt-6 border-t border-gray-100">
            <p className="text-xs text-center text-gray-500 leading-relaxed">
              Bằng cách tiếp tục, bạn đồng ý với{" "}
              <Link to="/terms" className="text-orange-600 hover:underline">Điều khoản dịch vụ</Link> và{" "}
              <Link to="/privacy" className="text-orange-600 hover:underline">Chính sách bảo mật</Link> của chúng tôi.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}