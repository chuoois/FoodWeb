import { useEffect, useState, useContext } from "react";
import { getProfile, updateProfile } from "@/services/profile.service";
import { AuthContext } from "@/context/AuthContext";
import { Camera, Save, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export const ProfilePage = () => {
  const { user } = useContext(AuthContext);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  // 🧩 Chỉ gọi API khi có user (sau khi AuthContext load xong)
  useEffect(() => {
    if (!user) {
      console.warn("⚠️ AuthContext chưa có user, chờ thêm...");
      return; // Không gọi API khi chưa có user
    }

    const fetchProfile = async () => {
      try {
        const accountId = user.id || user.account_id || user._id;
        console.log("📡 Gọi API lấy profile:", accountId);
        const res = await getProfile(accountId);

        console.log("✅ API trả về:", res.data);
        setProfile(res.data?.user || res.data);
      } catch (err) {
        console.error("❌ Lỗi lấy profile:", err);
        setMessage("Không thể tải thông tin người dùng.");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [user]); // 👈 chỉ chạy lại khi user thay đổi

  // 🧩 Xử lý thay đổi input
  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfile((prev) => ({ ...prev, [name]: value }));
  };

  // 🧩 Lưu thay đổi
  const handleSave = async () => {
    if (!user) return;
    const accountId = user.id || user.account_id || user._id;
    setSaving(true);
    setMessage("");

    try {
      console.log("📡 Gọi API cập nhật profile:", accountId, profile);
      const res = await updateProfile(accountId, profile);
      setProfile(res.data?.user || res.data);
      setMessage("✅ Cập nhật thành công!");
    } catch (error) {
      console.error("❌ Lỗi cập nhật:", error);
      setMessage("❌ Cập nhật thất bại: " + (error.response?.data?.message || ""));
    } finally {
      setSaving(false);
    }
  };

  // 🌀 Loading
  if (loading)
    return (
      <div className="flex justify-center items-center h-[60vh] text-gray-600">
        <Loader2 className="w-6 h-6 animate-spin mr-2" /> Đang tải hồ sơ...
      </div>
    );

  // ⚠️ Không có profile
  if (!profile)
    return (
      <div className="text-center text-gray-500 py-20">
        Không có dữ liệu người dùng.
      </div>
    );

  // 🧠 Giao diện chính
  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white shadow-md rounded-2xl p-6 border border-orange-100">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
          {/* Avatar */}
          <div className="relative">
            <img
              src={profile.avatar_url || "/default-avatar.png"}
              alt="Avatar"
              className="w-28 h-28 rounded-full object-cover border-4 border-orange-300"
            />
            <button
              className="absolute bottom-0 right-0 bg-orange-500 hover:bg-orange-600 text-white rounded-full p-2 shadow-md"
              title="Đổi ảnh"
            >
              <Camera className="w-4 h-4" />
            </button>
          </div>

          {/* Thông tin cá nhân */}
          <div className="flex-1 w-full space-y-4">
            <div>
              <label className="block text-sm text-gray-600 mb-1">Họ và tên</label>
              <Input
                name="full_name"
                value={profile.full_name || ""}
                onChange={handleChange}
                className="border-orange-200 focus:ring-orange-400"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-600 mb-1">Số điện thoại</label>
              <Input
                name="phone"
                value={profile.phone || ""}
                onChange={handleChange}
                className="border-orange-200 focus:ring-orange-400"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-600 mb-1">Ngày sinh</label>
                <Input
                  type="date"
                  name="date_of_birth"
                  value={
                    profile.date_of_birth
                      ? new Date(profile.date_of_birth).toISOString().split("T")[0]
                      : ""
                  }
                  onChange={handleChange}
                  className="border-orange-200 focus:ring-orange-400"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-600 mb-1">Giới tính</label>
                <select
                  name="gender"
                  value={profile.gender || ""}
                  onChange={handleChange}
                  className="w-full border rounded-lg px-3 py-2 border-orange-200 focus:ring-orange-400"
                >
                  <option value="">-- Chọn giới tính --</option>
                  <option value="MALE">Nam</option>
                  <option value="FEMALE">Nữ</option>
                  <option value="OTHER">Khác</option>
                </select>
              </div>
            </div>

            {message && (
              <div
                className={`text-sm mt-2 ${
                  message.includes("✅")
                    ? "text-green-600"
                    : message.includes("❌")
                    ? "text-red-600"
                    : "text-gray-600"
                }`}
              >
                {message}
              </div>
            )}

            <div className="flex justify-end pt-4">
              <Button
                onClick={handleSave}
                disabled={saving}
                className="bg-orange-500 hover:bg-orange-600 text-white font-semibold px-6 py-2 rounded-full flex items-center gap-2 shadow-md"
              >
                {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                <Save className="w-4 h-4" />
                <span>Lưu thay đổi</span>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
