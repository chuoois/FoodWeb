import { useState, useContext } from "react"
import { Link, useNavigate } from "react-router-dom"
import { Eye, EyeOff, Mail, Lock, Store } from "lucide-react"
import { useFormik } from "formik"
import * as Yup from "yup"
import toast from "react-hot-toast"
import { login, loginGoogle, getRoleNameById } from "@/services/auth.service"
import { GoogleLogin } from "@react-oauth/google"
import Cookies from "js-cookie"
import { AuthContext } from "@/context/AuthContext"
import { jwtDecode } from "jwt-decode"

export function StoreDirectorLogin() {
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

        const decoded = jwtDecode(res.data.token)
        const responseRole = await getRoleNameById({ id: decoded.roleId })
        const roleName = responseRole.data.name

        if (values.rememberMe) {
          Cookies.set("rememberedEmail", values.email, { expires: 7 })
        } else {
          Cookies.remove("rememberedEmail")
        }

        switch (roleName) {
          case "STORE_DIRECTOR":
            navigate("/store-director/manage/dashboard")
            break
          case "MANAGER_STAFF":
            navigate("/manager-staff/manage/home")
            break
          case "SELLER_STAFF":
            navigate("/seller/dashboard")
            break
          default:
            navigate("/403-forbidden")
            break
        }
      } catch (error) {
        toast.error(error.response?.data?.message || "Đăng nhập thất bại")
      } finally {
        setSubmitting(false)
      }
    },
  })

  const handleGoogleLogin = async (credentialResponse) => {
    try {
      const tokenId = credentialResponse.credential
      const res = await loginGoogle(tokenId)

      toast.success("Đăng nhập Google thành công!")
      loginContext(res.data.token)

      const decoded = jwtDecode(res.data.token)
      const responseRole = await getRoleNameById({ id: decoded.roleId })
      const roleName = responseRole.data.name

      switch (roleName) {
        case "STORE_DIRECTOR":
          navigate("/store-director/manage/home")
          break
        case "MANAGER_STAFF":
          navigate("/manager/dashboard")
          break
        default:
          navigate("/403-forbidden")
          break
      }
    } catch (error) {
      console.error(error)
      toast.error(error.response?.data?.message || "Đăng nhập Google thất bại")
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-orange-50 px-4">
      {/* Logo + Brand */}
      <Link to="/" className="flex flex-col items-center mb-6">
        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-white text-2xl font-bold shadow-lg">
          <Store className="w-8 h-8" />
        </div>
        <div className="mt-2 text-2xl font-bold text-gray-900">
          Yummy<span className="text-orange-500">Go</span>
        </div>
        <div className="flex items-center gap-2 mt-1">
          <div className="h-px w-8 bg-orange-300" />
          <p className="text-sm text-orange-600 font-medium">Store</p>
          <div className="h-px w-8 bg-orange-300" />
        </div>
      </Link>

      {/* Card */}
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8">
        <h2 className="text-2xl font-semibold text-center mb-1">Đăng nhập</h2>
        <p className="text-center text-gray-600 mb-8">
          Quản lý cửa hàng với <span className="font-medium">YummyGo</span>
        </p>

        <form onSubmit={formik.handleSubmit} className="space-y-6">
          {/* Email */}
          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium text-gray-700">
              Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                id="email"
                name="email"
                type="email"
                placeholder="Nhập email của bạn"
                value={formik.values.email}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className="pl-10 border rounded-lg w-full px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
            {formik.touched.email && formik.errors.email && (
              <p className="text-red-500 text-sm">{formik.errors.email}</p>
            )}
          </div>

          {/* Password */}
          <div className="space-y-2">
            <label htmlFor="password" className="text-sm font-medium text-gray-700">
              Mật khẩu
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                placeholder="Nhập mật khẩu"
                value={formik.values.password}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className="pl-10 pr-10 border rounded-lg w-full px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            {formik.touched.password && formik.errors.password && (
              <p className="text-red-500 text-sm">{formik.errors.password}</p>
            )}
          </div>

          {/* Remember me + Forgot */}
          <div className="flex items-center justify-between">
            <label className="flex items-center space-x-2 text-sm text-gray-600">
              <input
                id="rememberMe"
                type="checkbox"
                name="rememberMe"
                checked={formik.values.rememberMe}
                onChange={formik.handleChange}
                className="rounded"
              />
              <span>Ghi nhớ đăng nhập</span>
            </label>
            <Link
              to="/store-director/forgot-password"
              className="text-sm text-orange-500 hover:underline"
            >
              Quên mật khẩu?
            </Link>
          </div>

          {/* Login button */}
          <button
            type="submit"
            className="w-full bg-orange-500 text-white font-medium rounded-lg px-4 py-2 hover:bg-orange-600 disabled:opacity-70"
            disabled={formik.isSubmitting}
          >
            {formik.isSubmitting ? "Đang đăng nhập..." : "Đăng nhập"}
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

          {/* Google login */}
          <GoogleLogin
            onSuccess={handleGoogleLogin}
            onError={() => toast.error("Đăng nhập Google thất bại")}
          />

          {/* Register link */}
          <div className="text-center">
            <p className="text-sm text-gray-600">
              Chưa có tài khoản quản lý?{" "}
              <Link
                to="/store-director/register"
                className="text-orange-500 hover:underline font-medium"
              >
                Đăng ký ngay
              </Link>
            </p>
          </div>
        </form>

        <p className="mt-6 text-xs text-gray-500 text-center">
          Bằng cách tiếp tục, bạn đồng ý với{" "}
          <Link to="/terms" className="text-orange-500 hover:underline">
            Điều khoản dịch vụ
          </Link>{" "}
          và{" "}
          <Link to="/privacy" className="text-orange-500 hover:underline">
            Chính sách bảo mật
          </Link>{" "}
          của chúng tôi.
        </p>
      </div>
    </div>
  )
}