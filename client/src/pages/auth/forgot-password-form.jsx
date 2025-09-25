import { useState } from "react";
import { Link } from "react-router-dom"
import { Mail } from "lucide-react";

export function ForgotPasswordForm() {
    const [email, setEmail] = useState("");

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log("Submit reset password for:", email);
        // TODO: gọi API reset password
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-orange-50 px-4">

            {/* Logo + Brand OUTSIDE card */}
            <Link to="/" className="flex flex-col items-center mb-6">
                {/* Circle with Y */}
                <div className="w-16 h-16 rounded-full bg-orange-500 flex items-center justify-center text-white text-2xl font-bold">
                    Y
                </div>
                {/* Brand name */}
                <div className="mt-2 text-2xl font-bold text-gray-900">
                    Yummy<span className="text-orange-500">Go</span>
                </div>
            </Link>
            <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8">
                {/* Header */}
                <h2 className="text-2xl font-bold text-center mb-2 text-gray-800">
                    Quên mật khẩu
                </h2>
                <p className="text-center text-gray-600 mb-6">
                    Nhập email để nhận liên kết đặt lại mật khẩu
                </p>

                {/* Icon */}
                <div className="w-16 h-16 rounded-full bg-orange-100 flex items-center justify-center mx-auto mb-6">
                    <Mail className="w-8 h-8 text-orange-500" />
                </div>

                <p className="text-center text-gray-600 mb-6">
                    Nhập địa chỉ email đã đăng ký với tài khoản{" "}
                    <span className="font-medium">YummyGo</span> của bạn. <br />
                    Chúng tôi sẽ gửi liên kết để đặt lại mật khẩu.
                </p>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Email
                        </label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type="email"
                                placeholder="Nhập email của bạn"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-400 focus:border-orange-400 outline-none"
                                required
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        className="w-full py-2 rounded-lg bg-orange-500 text-white font-medium hover:bg-orange-600 transition"
                    >
                        Gửi liên kết đặt lại
                    </button>
                </form>

                {/* Back to login */}
                <div className="mt-4 text-center">
                    <a
                        href="/auth/login"
                        className="text-sm text-gray-600 hover:text-orange-500 transition"
                    >
                        ← Quay lại đăng nhập
                    </a>
                </div>

                {/* Support Box */}
                <div className="mt-8 p-4 rounded-xl border bg-gray-50 text-sm text-gray-700 space-y-2">
                    <div className="font-medium text-gray-800">Không nhận được email?</div>
                    <ul className="list-disc pl-5 space-y-1">
                        <li>Kiểm tra thư mục spam hoặc thư rác</li>
                        <li>Đảm bảo email đã được nhập chính xác</li>
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
    );
}
