// src/pages/MyProfile.jsx
import { useState, useEffect } from "react";
import { getProfile, updateProfile } from "@/services/profile.service";
import toast from "react-hot-toast";

export const MyProfile = () => {
  const [user, setUser] = useState(null);
  const [form, setForm] = useState({});
  const [loading, setLoading] = useState(true); // Bắt đầu là true
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await getProfile();
      const u = res.data.user;
      setUser(u);
      setForm({
        full_name: u.full_name || "",
        phone: u.phone || "",
        date_of_birth: u.date_of_birth
          ? new Date(u.date_of_birth).toISOString().split("T")[0]
          : "",
        gender: u.gender || "MALE",
        avatar_url: u.avatar_url || "",
      });
    } catch (err) {
      const msg = err.response?.data?.message || "Không thể tải hồ sơ";
      toast.error(msg);
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      await updateProfile(form);
      toast.success("Cập nhật hồ sơ thành công!");
      fetchProfile();
    } catch (err) {
      const msg = err.response?.data?.message || "Cập nhật thất bại";
      toast.error(msg);
      setError(msg);
    } finally {
      setSaving(false);
    }
  };

  const maskEmail = (email) => {
    if (!email) return "Chưa có email";
    const [local, domain] = email.split("@");
    if (local.length <= 2) return email;
    return `${local.slice(0, 2)}****@${domain}`;
  };

  // TRƯỚC KHI RENDER FORM: KIỂM TRA USER CÓ DỮ LIỆU CHƯA
  if (loading) {
    return (
      <div className="flex bg-gray-50 min-h-screen items-center justify-center">
        <div className="text-gray-600">Đang tải hồ sơ...</div>
      </div>
    );
  }

  if (error && !user) {
    return (
      <div className="flex bg-gray-50 min-h-screen items-center justify-center">
        <div className="text-red-600 text-center">
          <p>{error}</p>
          <button
            onClick={fetchProfile}
            className="mt-3 text-sm underline hover:text-red-800"
          >
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  // BÂY GIỜ MỚI CHẮC CHẮN user !== null
  return (
    <div className="flex bg-gray-50 min-h-screen">
      <main className="flex-1 p-8">
        <form onSubmit={handleSubmit} className="space-y-6 max-w-3xl">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6">Hồ sơ cá nhân</h2>

          {/* Avatar + Tên đăng nhập */}
          <div className="flex items-center gap-6 mb-6">
            <img
              src={user.avatar_url || "https://via.placeholder.com/80"}
              alt="Avatar"
              className="w-20 h-20 rounded-full object-cover border"
            />
            <div>
              <p className="text-sm text-gray-600">Tên đăng nhập</p>
              <p className="font-medium text-lg">
                {maskEmail(user.email) || "Chưa có email"}
              </p>
            </div>
          </div>

          {/* Email (ẩn) */}
          <div>
            <label className="block text-gray-600 mb-1">Email</label>
            <input
              type="text"
              value={maskEmail(user.email)}
              disabled
              className="w-full border rounded-md px-3 py-2 bg-gray-100 text-gray-500"
            />
          </div>

          {/* Họ và tên */}
          <div>
            <label className="block text-gray-600 mb-1">Họ và tên</label>
            <input
              type="text"
              value={form.full_name}
              onChange={(e) => setForm({ ...form, full_name: e.target.value })}
              className="w-full border rounded-md px-3 py-2 focus:ring-2 focus:ring-orange-500"
              placeholder="Nhập họ và tên"
              required
            />
          </div>

          {/* Số điện thoại */}
          <div>
            <label className="block text-gray-600 mb-1">Số điện thoại</label>
            <input
              type="text"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              className="w-full border rounded-md px-3 py-2 focus:ring-2 focus:ring-orange-500"
              placeholder="0977217368"
            />
          </div>

          {/* Giới tính */}
          <div>
            <label className="block text-gray-600 mb-1">Giới tính</label>
            <div className="flex gap-6">
              {["MALE", "FEMALE", "OTHER"].map((g) => (
                <label key={g} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="gender"
                    value={g}
                    checked={form.gender === g}
                    onChange={(e) => setForm({ ...form, gender: e.target.value })}
                    className="text-orange-500"
                  />
                  <span>{g === "MALE" ? "Nam" : g === "FEMALE" ? "Nữ" : "Khác"}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Ngày sinh */}
          <div>
            <label className="block text-gray-600 mb-1">Ngày sinh</label>
            <input
              type="date"
              value={form.date_of_birth}
              onChange={(e) => setForm({ ...form, date_of_birth: e.target.value })}
              className="w-full border rounded-md px-3 py-2 focus:ring-2 focus:ring-orange-500"
              max={new Date().toISOString().split("T")[0]}
            />
          </div>

          {/* Lỗi inline */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
              {error}
            </div>
          )}

          {/* Nút */}
          <div className="flex gap-3">
            <button
              type="submit"
              disabled={saving}
              className="bg-orange-500 text-white px-8 py-2.5 rounded-md hover:bg-orange-600 disabled:opacity-70 flex items-center gap-2 transition"
            >
              {saving ? (
                <>
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                  </svg>
                  Đang lưu...
                </>
              ) : (
                "Lưu thay đổi"
              )}
            </button>
            <button
              type="button"
              onClick={fetchProfile}
              className="border border-gray-300 text-gray-700 px-6 py-2.5 rounded-md hover:bg-gray-50 transition"
            >
              Làm mới
            </button>
          </div>
        </form>
      </main>
    </div>
  );
};