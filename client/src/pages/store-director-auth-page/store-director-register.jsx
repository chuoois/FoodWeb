import { useState, useRef, useEffect } from "react"
import { Link, useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Eye, EyeOff, Mail, Lock, Store, ShieldCheck, CheckCircle2 } from "lucide-react"
import toast from "react-hot-toast"
import { useFormik } from "formik"
import * as Yup from "yup"
import { register, verifyOtp, resendOtp } from "@/services/auth.service"
import { GoogleLogin } from "@react-oauth/google"

export function StoreDirectorRegister() {
  const navigate = useNavigate()
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [step, setStep] = useState("register") // "register" | "verify"
  const [email, setEmail] = useState("")
  const [otp, setOtp] = useState(["", "", "", "", "", ""])
  const inputRefs = useRef([])
  const [countdown, setCountdown] = useState(60)
  const [isResending, setIsResending] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  // Countdown timer
  useEffect(() => {
    if (step === "verify" && countdown > 0) {
      const timer = setTimeout(() => setCountdown((prev) => prev - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [countdown, step])

  // Validation
  const validationSchema = Yup.object({
    email: Yup.string().email("Email không hợp lệ").required("Vui lòng nhập email"),
    password: Yup.string().min(6, "Mật khẩu tối thiểu 6 ký tự").required("Vui lòng nhập mật khẩu"),
    confirmPassword: Yup.string()
      .oneOf([Yup.ref("password"), null], "Mật khẩu xác nhận không khớp")
      .required("Vui lòng nhập lại mật khẩu"),
    agreeToTerms: Yup.boolean().oneOf([true], "Bạn phải đồng ý với điều khoản"),
  })

  const formik = useFormik({
    initialValues: {
      email: "",
      password: "",
      confirmPassword: "",
      agreeToTerms: false,
    },
    validationSchema,
    onSubmit: async (values, { setSubmitting }) => {
      try {
        await register({
          email: values.email,
          password: values.password,
          confirmPassword: values.confirmPassword,
          role: "STORE_DIRECTOR",
        })
        setEmail(values.email)
        toast.success("Đăng ký thành công! Vui lòng kiểm tra email để nhập OTP.")
        setStep("verify")
      } catch (error) {
        toast.error(error.response?.data?.message || "Đăng ký thất bại. Vui lòng thử lại.")
      } finally {
        setSubmitting(false)
      }
    },
  })

  // OTP Logic
  const handleChange = (index, value) => {
    if (value && !/^\d$/.test(value)) return
    const newOtp = [...otp]
    newOtp[index] = value
    setOtp(newOtp)
    if (value && index < 5) inputRefs.current[index + 1]?.focus()
  }

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  const handlePaste = (e) => {
    e.preventDefault()
    const pasted = e.clipboardData.getData("text").slice(0, 6)
    if (!/^\d+$/.test(pasted)) return
    const newOtp = [...otp]
    pasted.split("").forEach((char, i) => {
      if (i < 6) newOtp[i] = char
    })
    setOtp(newOtp)
    inputRefs.current[Math.min(pasted.length, 5)]?.focus()
  }

  const handleVerify = async (e) => {
    e.preventDefault()
    const otpCode = otp.join("")
    try {
      await verifyOtp({ email, otp_code: otpCode })
      toast.success("Xác thực thành công!")
      setIsSuccess(true)
      setTimeout(() => navigate("/store-director/login"), 2000)
    } catch (error) {
      toast.error(error.response?.data?.message || "OTP không hợp lệ hoặc đã hết hạn")
    }
  }

  const handleResend = async () => {
    if (countdown > 0) return
    setIsResending(true)
    try {
      await resendOtp(email)
      toast.success("OTP mới đã được gửi!")
      setCountdown(60)
    } catch (error) {
      toast.error(error.response?.data?.message || "Không thể gửi lại OTP")
    } finally {
      setIsResending(false)
    }
  }

  const isOtpComplete = otp.every((d) => d !== "")

  // ========== UI ==========

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-50 via-orange-50 to-red-50 p-4 py-12">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl flex items-center justify-center mb-3 shadow-lg">
            <Store className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-800">
            Yummy<span className="text-orange-600">Go</span>
          </h1>
          <p className="text-sm text-orange-600 mt-1 font-medium">Store Director</p>
        </div>

        {step === "register" && (
          <div className="bg-white rounded-2xl shadow-xl p-8 border border-orange-100">
            <form className="space-y-4" onSubmit={formik.handleSubmit}>
              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="Nhập email"
                    onChange={formik.handleChange}
                    value={formik.values.email}
                    className="pl-10 h-11"
                  />
                </div>
                {formik.touched.email && formik.errors.email && (
                  <p className="text-red-500 text-sm">{formik.errors.email}</p>
                )}
              </div>

              {/* Password */}
              <div className="space-y-2">
                <Label htmlFor="password">Mật khẩu</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Nhập mật khẩu"
                    onChange={formik.handleChange}
                    value={formik.values.password}
                    className="pl-10 pr-10 h-11"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                  >
                    {showPassword ? <EyeOff /> : <Eye />}
                  </button>
                </div>
                {formik.touched.password && formik.errors.password && (
                  <p className="text-red-500 text-sm">{formik.errors.password}</p>
                )}
              </div>

              {/* Confirm */}
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Xác nhận mật khẩu</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Nhập lại mật khẩu"
                    onChange={formik.handleChange}
                    value={formik.values.confirmPassword}
                    className="pl-10 pr-10 h-11"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                  >
                    {showConfirmPassword ? <EyeOff /> : <Eye />}
                  </button>
                </div>
                {formik.touched.confirmPassword && formik.errors.confirmPassword && (
                  <p className="text-red-500 text-sm">{formik.errors.confirmPassword}</p>
                )}
              </div>

              {/* Terms */}
              <div className="flex items-start space-x-2 pt-2">
                <Checkbox
                  id="agreeToTerms"
                  name="agreeToTerms"
                  checked={formik.values.agreeToTerms}
                  onCheckedChange={(v) => formik.setFieldValue("agreeToTerms", v)}
                />
                <label htmlFor="agreeToTerms" className="text-sm text-gray-600">
                  Tôi đồng ý với{" "}
                  <Link to="/terms" className="text-orange-600 hover:underline">
                    Điều khoản
                  </Link>{" "}
                  và{" "}
                  <Link to="/privacy" className="text-orange-600 hover:underline">
                    Chính sách
                  </Link>
                </label>
              </div>
              {formik.touched.agreeToTerms && formik.errors.agreeToTerms && (
                <p className="text-red-500 text-sm">{formik.errors.agreeToTerms}</p>
              )}

              <Button
                type="submit"
                disabled={formik.isSubmitting}
                className="w-full bg-gradient-to-r from-amber-500 to-orange-600 text-white mt-4"
              >
                {formik.isSubmitting ? "Đang đăng ký..." : "Đăng ký"}
              </Button>
           <div className="relative">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-300" /></div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Hoặc</span>
              </div>
            </div>

            <GoogleLogin
              onSuccess={async (res) => {
                try {
                  await registerGoogle(res.credential)
                  toast.success("Đăng ký Google thành công!")
                  navigate("/auth/login")
                } catch (error) {
                  toast.error(error.response?.data?.message || "Đăng ký Google thất bại")
                }
              }}
              onError={() => toast.error("Đăng ký Google thất bại")}
            />

            <p className="text-sm text-gray-600 text-center">
              Đã có tài khoản? <a href="/store-director/login" className="text-orange-500 hover:underline">Đăng nhập</a>
            </p>
            </form>

          </div>
        )}

        {step === "verify" && (
          <div className="bg-white rounded-2xl shadow-xl p-8 border border-orange-100">
            {isSuccess ? (
              <div className="text-center">
                <div className="w-20 h-20 rounded-full bg-green-100 mx-auto flex items-center justify-center mb-6">
                  <CheckCircle2 className="w-12 h-12 text-green-500" />
                </div>
                <h2 className="text-2xl font-bold mb-2 text-gray-800">Xác thực thành công!</h2>
                <p className="text-gray-600">Đang chuyển hướng đến trang đăng nhập...</p>
              </div>
            ) : (
              <>
                <h2 className="text-2xl font-bold text-center mb-4">Xác thực OTP</h2>
                <p className="text-center text-gray-600 mb-6">
                  Nhập mã OTP đã được gửi đến <span className="font-medium">{email}</span>
                </p>
                <div className="flex justify-center gap-2 mb-4">
                  {otp.map((digit, i) => (
                    <input
                      key={i}
                      ref={(el) => (inputRefs.current[i] = el)}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleChange(i, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(i, e)}
                      onPaste={handlePaste}
                      className="w-12 h-14 text-center text-xl font-bold border-2 rounded-lg focus:ring-2 focus:ring-orange-400"
                    />
                  ))}
                </div>

                <div className="text-center mb-6">
                  {countdown > 0 ? (
                    <p className="text-sm text-gray-600">
                      Gửi lại mã sau <span className="text-orange-500 font-medium">{countdown}s</span>
                    </p>
                  ) : (
                    <button
                      type="button"
                      onClick={handleResend}
                      disabled={isResending}
                      className="text-sm text-orange-600 hover:underline"
                    >
                      {isResending ? "Đang gửi..." : "Gửi lại mã OTP"}
                    </button>
                  )}
                </div>

                <Button
                  onClick={handleVerify}
                  disabled={!isOtpComplete}
                  className="w-full bg-orange-500 hover:bg-orange-600 text-white"
                >
                  Xác thực
                </Button>

                <div className="text-center mt-4">
                  <Link to="/store-director/login" className="text-sm text-gray-600 hover:text-orange-500">
                    ← Quay lại đăng nhập
                  </Link>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
