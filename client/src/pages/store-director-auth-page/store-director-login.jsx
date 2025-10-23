import { useState, useContext } from "react"
import { Link, useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
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
        const res = await login(values);
        toast.success("Đăng nhập thành công!");

        // Lưu token vào context
        loginContext(res.data.token);

        // Giải mã token
        const decoded = jwtDecode(res.data.token);

        // Lấy role name từ API
        const responseRole = await getRoleNameById({ id: decoded.roleId });
        const roleName = responseRole.data.name;

        // Xử lý ghi nhớ email
        if (values.rememberMe) {
          Cookies.set("rememberedEmail", values.email, { expires: 7 });
        } else {
          Cookies.remove("rememberedEmail");
        }

        // Điều hướng theo role
        switch (roleName) {
          case "STORE_DIRECTOR":
            navigate("/store-director/manage/dashboard");
            break;
          case "MANAGER_STAFF":
            navigate("/manager/dashboard");
            break;
          case "SELLER_STAFF":
            navigate("/seller/dashboard");
            break;
          default:
            navigate("/403-forbidden");
            break;
        }

      } catch (error) {
        toast.error(error.response?.data?.message || "Đăng nhập thất bại");
      } finally {
        setSubmitting(false);
      }
    },
  })

  const handleGoogleLogin = async (credentialResponse) => {
    try {
      const tokenId = credentialResponse.credential;
      const res = await loginGoogle(tokenId);

      toast.success("Đăng nhập Google thành công!");
      loginContext(res.data.token);

      // Giải mã token để lấy roleId
      const decoded = jwtDecode(res.data.token);

      // Lấy roleName từ API
      const responseRole = await getRoleNameById({ id: decoded.roleId });
      const roleName = responseRole.data.name;

      // Điều hướng theo role
      switch (roleName) {
        case "STORE_DIRECTOR":
          navigate("/store-director/manage/home");
          break;
        case "MANAGER_STAFF":
          navigate("/manager/dashboard");
          break;
        default:
          navigate("/403-forbidden");
          break;
      }

    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Đăng nhập Google thất bại");
    }
  };

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
    onCheckedChange={(checked) =>
      formik.setFieldValue("rememberMe", checked)
    }
  />
  <Label htmlFor="rememberMe">Ghi nhớ đăng nhập</Label>
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
            <GoogleLogin
              onSuccess={handleGoogleLogin}
              onError={() => toast.error("Đăng nhập Google thất bại")}
            />
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
              <Link to="/terms" className="text-orange-600 hover:underline">Điều khoản dịch vụ</Link> và{" "}
              <Link to="/privacy" className="text-orange-600 hover:underline">Chính sách bảo mật</Link> của chúng tôi.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}