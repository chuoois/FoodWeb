import { useState } from "react";
import { Mail } from "lucide-react";

export const ForgotPasswordForm = () => {
    const [email, setEmail] = useState("");

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log("Submit reset password for:", email);
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 px-4">

            {/* Logo + Brand */}
            <div className="mb-6">
                <h1 className="text-4xl font-bold text-yellow-400">beFood</h1>
            </div>

            <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8">
                {/* Header */}
                <h2 className="text-2xl font-bold text-center mb-2 text-gray-800">
                    Quên mật khẩu
                </h2>
                <p className="text-center text-gray-600 mb-6">
                    Nhập email để nhận liên kết đặt lại mật khẩu
                </p>

                {/* Icon */}
                <div className="w-16 h-16 rounded-full bg-yellow-100 flex items-center justify-center mx-auto mb-6">
                    <Mail className="w-8 h-8 text-yellow-500" />
                </div>

                <p className="text-center text-gray-600 mb-6">
                    Nhập địa chỉ email đã đăng ký với tài khoản{" "}
                    <span className="font-medium text-yellow-500">beFood</span> của bạn. <br />
                    Chúng tôi sẽ gửi liên kết để đặt lại mật khẩu.
                </p>

                {/* Form */}
                <div className="space-y-4">
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
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent outline-none"
                            />
                        </div>
                    </div>

                    <button
                        onClick={handleSubmit}
                        className="w-full py-2.5 rounded-lg bg-yellow-400 text-black font-semibold hover:bg-yellow-500 transition"
                    >
                        Gửi liên kết đặt lại
                    </button>
                </div>

                {/* Back to login */}
                <div className="mt-4 text-center">
                    <a href="/auth/login" className="text-sm text-gray-600 hover:text-yellow-500 transition">
                        ← Quay lại đăng nhập
                    </a>
                </div>

                {/* Support Box */}
                <div className="mt-8 p-4 rounded-xl border border-gray-200 bg-gray-50 text-sm text-gray-700 space-y-2">
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
                    <button className="text-yellow-500 hover:underline">
                        Liên hệ với chúng tôi
                    </button>
                </p>
            </div>
        </div>
    );
}