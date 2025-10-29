import { useEffect, useState, useContext } from "react";
import { getProfile, updateProfile } from "@/services/profile.service";
import { AuthContext } from "@/context/AuthContext";
import { Camera, Save, Loader2, MapPin, Plus, Trash2, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const ProfilePage = () => {
  const { user } = useContext(AuthContext);
  const [profile, setProfile] = useState({});
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [showAddAddress, setShowAddAddress] = useState(false);
  const [newAddress, setNewAddress] = useState({
    street: "", ward: "", district: "", city: "", province: "", lng: "", lat: "", isDefault: false
  });

  useEffect(() => {
    if (!user) return;

    const fetchProfile = async () => {
      try {
        const accountId = user.id || user.account_id || user._id;
        const res = await getProfile(accountId);
        setProfile(res.data?.user || {});
        setAddresses(res.data?.addresses || []);
      } catch (err) {
        setMessage("Không thể tải thông tin.");
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfile(prev => ({ ...prev, [name]: value }));
  };

  const handleAddressChange = (index, field, value) => {
    const updated = [...addresses];
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      updated[index][parent][child] = value;
    } else {
      updated[index][field] = value;
    }
    setAddresses(updated);
  };

  const addNewAddress = () => {
    if (addresses.length >= 3) {
      setMessage("Tối đa 3 địa chỉ!");
      return;
    }
    setAddresses([...addresses, {
      address: { street: "", ward: "", district: "", city: "", province: "" },
      gps: { lng: "", lat: "" },
      isDefault: addresses.length === 0
    }]);
  };

  const removeAddress = (index) => {
    const filtered = addresses.filter((_, i) => i !== index);
    if (filtered.length > 0 && !filtered.some(a => a.isDefault)) {
      filtered[0].isDefault = true;
    }
    setAddresses(filtered);
  };

  const setDefault = (index) => {
    setAddresses(addresses.map((a, i) => ({ ...a, isDefault: i === index })));
  };

  const handleSave = async () => {
    if (!user) return;
    const accountId = user.id || user.account_id || user._id;
    setSaving(true);
    setMessage("");

    try {
      await updateProfile(accountId, { ...profile, addresses });
      setMessage("Cập nhật thành công!");
    } catch (error) {
      setMessage("Lỗi: " + (error.response?.data?.message || ""));
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="flex justify-center items-center h-60"><Loader2 className="animate-spin mr-2" />Đang tải...</div>;
  if (!profile) return <div className="text-center py-20 text-gray-500">Không có dữ liệu.</div>;

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* === THÔNG TIN CÁ NHÂN === */}
      <div className="bg-white shadow-md rounded-2xl p-6 border border-orange-100">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
          <div className="relative">
            <img src={profile.avatar_url || "/default-avatar.png"} alt="Avatar"
              className="w-28 h-28 rounded-full object-cover border-4 border-orange-300" />
            <button className="absolute bottom-0 right-0 bg-orange-500 hover:bg-orange-600 text-white rounded-full p-2">
              <Camera className="w-4 h-4" />
            </button>
          </div>

          <div className="flex-1 space-y-4 w-full">
            <div><Label>Họ và tên</Label><Input name="full_name" value={profile.full_name || ""} onChange={handleChange} /></div>
            <div><Label>Số điện thoại</Label><Input name="phone" value={profile.phone || ""} onChange={handleChange} /></div>
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Ngày sinh</Label><Input type="date" name="date_of_birth"
                value={profile.date_of_birth ? new Date(profile.date_of_birth).toISOString().split("T")[0] : ""} onChange={handleChange} /></div>
              <div><Label>Giới tính</Label>
                <select name="gender" value={profile.gender || ""} onChange={handleChange} className="w-full border rounded-lg px-3 py-2">
                  <option value="">-- Chọn --</option>
                  <option value="MALE">Nam</option>
                  <option value="FEMALE">Nữ</option>
                  <option value="OTHER">Khác</option>
                </select>
              </div>
            </div>

            {message && <div className={`text-sm mt-2 ${message.includes("thành công") ? "text-green-600" : "text-red-600"}`}>{message}</div>}

            <div className="flex justify-end pt-4">
              <Button onClick={handleSave} disabled={saving} className="bg-orange-500 hover:bg-orange-600">
                {saving && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                <Save className="w-4 h-4" /> Lưu thay đổi
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* === ĐỊA CHỈ === */}
      <div className="bg-white shadow-md rounded-2xl p-6 border border-orange-100">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold flex items-center gap-2 text-orange-600">
            <MapPin className="w-5 h-5" /> Địa chỉ của bạn ({addresses.length}/3)
          </h2>
          {addresses.length < 3 && (
            <Button size="sm" onClick={addNewAddress} className="bg-orange-500 hover:bg-orange-600">
              <Plus className="w-4 h-4" /> Thêm
            </Button>
          )}
        </div>

        <div className="space-y-4">
          {addresses.map((addr, i) => (
            <div key={i} className={`p-4 border rounded-xl ${addr.isDefault ? "border-orange-400 bg-orange-50" : "border-gray-200"}`}>
              <div className="flex justify-between items-start mb-2">
                <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                  <Input placeholder="Số nhà, đường" value={addr.address?.street || ""} onChange={e => handleAddressChange(i, "address.street", e.target.value)} />
                  <Input placeholder="Phường/Xã" value={addr.address?.ward || ""} onChange={e => handleAddressChange(i, "address.ward", e.target.value)} />
                  <Input placeholder="Quận/Huyện" value={addr.address?.district || ""} onChange={e => handleAddressChange(i, "address.district", e.target.value)} />
                  <Input placeholder="Thành phố" value={addr.address?.city || ""} onChange={e => handleAddressChange(i, "address.city", e.target.value)} />
                  <Input placeholder="Tỉnh" value={addr.address?.province || ""} onChange={e => handleAddressChange(i, "address.province", e.target.value)} />
                  <div className="flex gap-2">
                    <Input placeholder="Kinh độ (lng)" value={addr.gps?.lng || ""} onChange={e => handleAddressChange(i, "gps.lng", e.target.value)} className="flex-1" />
                    <Input placeholder="Vĩ độ (lat)" value={addr.gps?.lat || ""} onChange={e => handleAddressChange(i, "gps.lat", e.target.value)} className="flex-1" />
                  </div>
                </div>
                <div className="flex gap-1 ml-2">
                  <Button size="sm" variant={addr.isDefault ? "default" : "outline"} onClick={() => setDefault(i)}>
                    {addr.isDefault ? <Check className="w-4 h-4" /> : "Mặc định"}
                  </Button>
                  {addresses.length > 1 && (
                    <Button size="sm" variant="destructive" onClick={() => removeAddress(i)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </div>
              <div className="text-xs text-gray-600">
                {[addr.address?.street, addr.address?.ward, addr.address?.district, addr.address?.city, addr.address?.province].filter(Boolean).join(", ")}
                {addr.isDefault && <span className="text-orange-600 font-semibold"> (Mặc định)</span>}
              </div>
            </div>
          ))}
          {addresses.length === 0 && <p className="text-gray-500 text-center py-4">Chưa có địa chỉ nào.</p>}
        </div>
      </div>
    </div>
  );
};