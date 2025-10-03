import React, { useState, useRef, useEffect } from "react"
import { ShieldCheck, CheckCircle2 } from "lucide-react"

export function VerifyOtpForm() {
  const [otp, setOtp] = useState(["", "", "", "", "", ""])
  const [isResending, setIsResending] = useState(false)
  const [countdown, setCountdown] = useState(60)
  const [isSuccess, setIsSuccess] = useState(false)
  const inputRefs = useRef([])

  // Countdown timer for resend button
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [countdown])

  const handleChange = (index, value) => {
    // Only allow numbers
    if (value && !/^\d$/.test(value)) return

    const newOtp = [...otp]
    newOtp[index] = value
    setOtp(newOtp)

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  const handleKeyDown = (index, e) => {
    // Handle backspace
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  const handlePaste = (e) => {
    e.preventDefault()
    const pastedData = e.clipboardData.getData("text").slice(0, 6)

    if (!/^\d+$/.test(pastedData)) return

    const newOtp = [...otp]
    pastedData.split("").forEach((char, index) => {
      if (index < 6) newOtp[index] = char
    })
    setOtp(newOtp)

    // Focus last filled input or next empty
    const nextIndex = Math.min(pastedData.length, 5)
    inputRefs.current[nextIndex]?.focus()
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const otpCode = otp.join("")
    console.log("Verify OTP:", otpCode)
    // TODO: gọi API verify OTP

    // Simulate successful verification
    setIsSuccess(true)

    // Redirect to login after 2 seconds
    setTimeout(() => {
      window.location.href = "/auth/login"
    }, 2000)
  }

  const handleResend = () => {
    if (countdown > 0) return

    setIsResending(true)
    console.log("Resend OTP")
    // TODO: gọi API resend OTP

    // Simulate API call
    setTimeout(() => {
      setIsResending(false)
      setCountdown(60)
    }, 1000)
  }

  const isOtpComplete = otp.every((digit) => digit !== "")

  if (isSuccess) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-orange-50 px-4">
        {/* Logo + Brand OUTSIDE card */}
        <a href="/" className="flex flex-col items-center mb-6">
          <div className="w-16 h-16 rounded-full bg-orange-500 flex items-center justify-center text-white text-2xl font-bold">
            Y
          </div>
          <div className="mt-2 text-2xl font-bold text-gray-900">
            Yummy<span className="text-orange-500">Go</span>
          </div>
        </a>

        <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8">
          {/* Success Icon */}
          <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-12 h-12 text-green-500" />
          </div>

          {/* Success Message */}
          <h2 className="text-2xl font-bold text-center mb-2 text-gray-800">Xác thực thành công!</h2>
          <p className="text-center text-gray-600 mb-6">
            Mã OTP của bạn đã được xác thực thành công.
            <br />
            Đang chuyển hướng đến trang đăng nhập...
          </p>

          {/* Loading indicator */}
          <div className="flex justify-center">
            <div className="w-8 h-8 border-4 border-orange-200 border-t-orange-500 rounded-full animate-spin"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-orange-50 px-4">
      {/* Logo + Brand OUTSIDE card */}
      <a href="/" className="flex flex-col items-center mb-6">
        {/* Circle with Y */}
        <div className="w-16 h-16 rounded-full bg-orange-500 flex items-center justify-center text-white text-2xl font-bold">
          Y
        </div>
        {/* Brand name */}
        <div className="mt-2 text-2xl font-bold text-gray-900">
          Yummy<span className="text-orange-500">Go</span>
        </div>
      </a>

      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8">
        {/* Header */}
        <h2 className="text-2xl font-bold text-center mb-2 text-gray-800">Xác thực OTP</h2>
        <p className="text-center text-gray-600 mb-6">Nhập mã OTP đã được gửi đến email của bạn</p>

        {/* Icon */}
        <div className="w-16 h-16 rounded-full bg-orange-100 flex items-center justify-center mx-auto mb-6">
          <ShieldCheck className="w-8 h-8 text-orange-500" />
        </div>

        <p className="text-center text-gray-600 mb-6">
          Chúng tôi đã gửi mã xác thực 6 chữ số đến email{" "}
          <span className="font-medium text-gray-800">example@email.com</span>
          <br />
          Vui lòng nhập mã để tiếp tục.
        </p>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* OTP Input */}
          <div className="flex justify-center gap-2">
            {otp.map((digit, index) => (
              <input
                key={index}
                ref={(el) => (inputRefs.current[index] = el)}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                onPaste={handlePaste}
                className="w-12 h-14 text-center text-xl font-bold border-2 rounded-lg focus:ring-2 focus:ring-orange-400 focus:border-orange-400 outline-none transition"
                required
              />
            ))}
          </div>

          {/* Resend OTP */}
          <div className="text-center">
            {countdown > 0 ? (
              <p className="text-sm text-gray-600">
                Gửi lại mã sau <span className="font-medium text-orange-500">{countdown}s</span>
              </p>
            ) : (
              <button
                type="button"
                onClick={handleResend}
                disabled={isResending}
                className="text-sm text-orange-500 hover:text-orange-600 font-medium transition disabled:opacity-50"
              >
                {isResending ? "Đang gửi..." : "Gửi lại mã OTP"}
              </button>
            )}
          </div>

          <button
            type="submit"
            disabled={!isOtpComplete}
            className="w-full py-2 rounded-lg bg-orange-500 text-white font-medium hover:bg-orange-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Xác thực
          </button>
        </form>

        {/* Back to login */}
        <div className="mt-4 text-center">
          <a href="/auth/login" className="text-sm text-gray-600 hover:text-orange-500 transition">
            ← Quay lại đăng nhập
          </a>
        </div>

        {/* Support Box */}
        <div className="mt-8 p-4 rounded-xl border bg-gray-50 text-sm text-gray-700 space-y-2">
          <div className="font-medium text-gray-800">Không nhận được mã?</div>
          <ul className="list-disc pl-5 space-y-1">
            <li>Kiểm tra thư mục spam hoặc thư rác</li>
            <li>Đảm bảo email đã được nhập chính xác</li>
            <li>Nhấn "Gửi lại mã OTP" để nhận mã mới</li>
            <li>Liên hệ bộ phận hỗ trợ nếu vẫn gặp vấn đề</li>
          </ul>
        </div>

        {/* Footer */}
        <p className="mt-6 text-xs text-gray-500 text-center">
          Cần hỗ trợ?{" "}
          <a href="/support" className="text-orange-500 hover:underline">
            Liên hệ với chúng tôi
          </a>
        </p>
      </div>
    </div>
  )
}
