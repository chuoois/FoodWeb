// src/pages/MyProfile/MyAddress.jsx
import { useState, useEffect, useRef } from "react";
import { MapPin, X, Edit, Trash2, Plus, Crosshair, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  getUserAddresses,
  createAddress,
  updateAddress,
  deleteAddress
} from "@/services/profile.service";
import { getAddressFromCoordinates, searchAddress } from "@/services/goong.service";
import toast from "react-hot-toast";
import goongjs from "@goongmaps/goong-js";

const GOONG_MAP_KEY = import.meta.env.VITE_GOONG_MAP_API_KEY;
const GOONG_REST_KEY = import.meta.env.VITE_GOONG_API_KEY;

export const MyAddress = () => {
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [popup, setPopup] = useState({ isOpen: false, address: null });
  const [form, setForm] = useState({
    address: { street: "", ward: "", district: "", city: "", province: "Việt Nam" },
    gps: { lat: 0, lng: 0 },
    isDefault: false
  });
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isGettingLocation, setIsGettingLocation] = useState(false);

  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const markerRef = useRef(null);
  const searchTimeout = useRef(null);

  // Khởi tạo Goong Maps
  useEffect(() => {
    if (!popup.isOpen || !mapContainerRef.current) return;
    if (!GOONG_MAP_KEY) {
      toast.error("Thiếu GOONG_MAP_API_KEY");
      return;
    }

    goongjs.accessToken = GOONG_MAP_KEY;

    try {
      mapRef.current = new goongjs.Map({
        container: mapContainerRef.current,
        style: "https://tiles.goong.io/assets/goong_map_web.json",
        center: [105.5276, 21.0134],
        zoom: 15,
      });

      markerRef.current = new goongjs.Marker()
        .setLngLat([105.5276, 21.0134])
        .addTo(mapRef.current);

      mapRef.current.on("load", () => {
        console.log("Goong Map LOADED!");
      });

      mapRef.current.on("click", async (e) => {
        const { lng, lat } = e.lngLat;
        markerRef.current.setLngLat([lng, lat]);
        await updateLocation(lat, lng);
      });
    } catch (err) {
      console.error("Lỗi khởi tạo map:", err);
      toast.error("Không thể tải bản đồ");
    }

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [popup.isOpen, GOONG_MAP_KEY]);

  const updateLocation = async (lat, lng) => {
    setForm(prev => ({ ...prev, gps: { lat, lng } }));
    try {
      const addr = await getAddressFromCoordinates(lat, lng);
      setForm(prev => ({
        ...prev,
        address: {
          street: addr.street || "",
          ward: addr.ward || "",
          district: addr.district || "",
          city: addr.city || "",
          province: "Việt Nam"
        }
      }));
    } catch (err) {
      toast.error("Không lấy được địa chỉ");
    }
  };

  useEffect(() => {
    fetchAddresses();
  }, []);

  const fetchAddresses = async () => {
    setLoading(true);
    try {
      const res = await getUserAddresses();
      setAddresses(res.data.addresses || []);
    } catch (err) {
      toast.error(err.response?.data?.message || "Lỗi tải địa chỉ");
    } finally {
      setLoading(false);
    }
  };

  const openPopup = (addr = null) => {
    if (addr) {
      const lat = addr.gps.coordinates[1];
      const lng = addr.gps.coordinates[0];
      setForm({
        address: { ...addr.address },
        gps: { lat, lng },
        isDefault: addr.isDefault
      });
      setTimeout(() => {
        if (mapRef.current) {
          mapRef.current.setCenter([lng, lat]);
          markerRef.current.setLngLat([lng, lat]);
        }
      }, 100);
    } else {
      setForm({
        address: { street: "", ward: "", district: "", city: "", province: "Việt Nam" },
        gps: { lat: 21.0133, lng: 105.5276 },
        isDefault: false
      });
    }
    setPopup({ isOpen: true, address: addr });
    setSuggestions([]);
  };

  const closePopup = () => {
    setPopup({ isOpen: false, address: null });
    setSuggestions([]);
    setShowSuggestions(false);
  };

  const handleSearch = async (input) => {
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(async () => {
      if (!input.trim()) {
        setSuggestions([]);
        setShowSuggestions(false);
        return;
      }
      try {
        const results = await searchAddress(input);
        setSuggestions(results);
        setShowSuggestions(true);
      } catch (err) {
        toast.error("Lỗi tìm kiếm");
      }
    }, 300);
  };

  const selectSuggestion = async (suggestion) => {
    if (!GOONG_REST_KEY) {
      toast.error("Thiếu VITE_GOONG_API_KEY");
      return;
    }

    try {
      const res = await fetch(
        `https://rsapi.goong.io/Place/Detail?place_id=${suggestion.place_id}&api_key=${GOONG_REST_KEY}`
      );
      const data = await res.json();

      if (data.status === "OK") {
        const { geometry, compound } = data.result;
        const lat = geometry.location.lat;
        const lng = geometry.location.lng;

        setForm({
          ...form,
          address: {
            street: suggestion.structured_formatting?.main_text || "",
            ward: compound?.commune || "",
            district: compound?.district || "",
            city: compound?.province || "",
            province: "Việt Nam"
          },
          gps: { lat, lng }
        });

        if (mapRef.current) {
          mapRef.current.setCenter([lng, lat]);
          markerRef.current.setLngLat([lng, lat]);
        }

        setShowSuggestions(false);
      } else {
        toast.error("Không tìm thấy địa chỉ chi tiết");
      }
    } catch (err) {
      console.error(err);
      toast.error("Lỗi lấy chi tiết địa chỉ");
    }
  };

  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      toast.error("Trình duyệt không hỗ trợ GPS");
      return;
    }
    setIsGettingLocation(true);
    const toastId = toast.loading("Đang lấy vị trí...");
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        await updateLocation(lat, lng);
        if (mapRef.current) {
          mapRef.current.setCenter([lng, lat]);
          markerRef.current.setLngLat([lng, lat]);
        }
        toast.success("Lấy vị trí thành công!", { id: toastId });
        setIsGettingLocation(false);
      },
      (err) => {
        toast.error("Không lấy được vị trí: " + err.message, { id: toastId });
        setIsGettingLocation(false);
      }
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.address.street.trim()) {
      toast.error("Vui lòng nhập địa chỉ cụ thể");
      return;
    }

    try {
      const payload = {
        address: {
          street: form.address.street.trim(),
          ward: form.address.ward?.trim() || "",
          district: form.address.district?.trim() || "",
          city: form.address.city?.trim() || "",
          province: "Việt Nam"
        },
        gps: {
          lat: parseFloat(form.gps.lat),
          lng: parseFloat(form.gps.lng)
        },
        isDefault: form.isDefault
      };

      if (popup.address) {
        await updateAddress(popup.address._id, payload);
        toast.success("Cập nhật thành công!");
      } else {
        await createAddress(payload);
        toast.success("Thêm địa chỉ thành công!");
      }
      fetchAddresses();
      closePopup();
    } catch (err) {
      toast.error(err.response?.data?.message || "Lỗi lưu");
    }
  };

  // XÓA ĐỊA CHỈ - DÙNG TOAST XÁC NHẬN
  const handleDelete = (addrId) => {
    const toastId = toast(
      <div>
        <p className="mb-3">Xóa địa chỉ này?</p>
        <div className="flex gap-2 justify-end">
          <button
            onClick={() => {
              toast.dismiss(toastId);
              performDelete(addrId);
            }}
            className="px-3 py-1.5 bg-red-500 text-white text-sm rounded hover:bg-red-600 transition"
          >
            Xóa
          </button>
          <button
            onClick={() => toast.dismiss(toastId)}
            className="px-3 py-1.5 bg-gray-300 text-gray-700 text-sm rounded hover:bg-gray-400 transition"
          >
            Hủy
          </button>
        </div>
      </div>,
      {
        duration: 10000,
        style: {
          maxWidth: '400px',
        },
      }
    );
  };

  const performDelete = async (addrId) => {
    try {
      await deleteAddress(addrId);
      toast.success("Xóa thành công!");
      fetchAddresses();
    } catch (err) {
      toast.error("Lỗi xóa địa chỉ");
    }
  };

  return (
    <div className="flex bg-gray-50 min-h-screen">
      <main className="flex-1 p-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold text-gray-800">Địa chỉ của tôi</h2>
          <Button onClick={() => openPopup()} className="bg-orange-500 hover:bg-orange-600 text-white flex items-center gap-2">
            <Plus size={18} /> Thêm địa chỉ
          </Button>
        </div>

        <div className="space-y-4">
          {loading ? (
            <p className="text-center text-gray-600">Đang tải...</p>
          ) : addresses.length === 0 ? (
            <div className="border border-dashed rounded-lg bg-white p-12 text-center text-gray-500">
              Bạn chưa có địa chỉ nào
            </div>
          ) : (
            addresses.map((addr) => {
              const fullAddr = [
                addr.address.street,
                addr.address.ward,
                addr.address.district,
                addr.address.city
              ].filter(Boolean).join(", ");

              return (
                <div key={addr._id} className="border rounded-lg bg-white p-4 hover:shadow-sm transition">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center gap-2">
                        <MapPin size={16} className="text-orange-500" />
                        <h3 className="font-semibold">{addr.address.street}</h3>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">{fullAddr}</p>
                      {addr.isDefault && (
                        <span className="mt-2 inline-block bg-orange-100 text-orange-600 text-xs px-2 py-0.5 rounded">
                          Mặc định
                        </span>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="icon" onClick={() => openPopup(addr)} className="text-blue-600 hover:bg-blue-50">
                        <Edit size={16} />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(addr._id)} className="text-red-600 hover:bg-red-50">
                        <Trash2 size={16} />
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* POPUP */}
        {popup.isOpen && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center p-4 border-b">
                <h2 className="text-lg font-bold">
                  {popup.address ? "Cập nhật địa chỉ" : "Thêm địa chỉ mới"}
                </h2>
                <button onClick={closePopup} className="p-1 hover:bg-gray-100 rounded-full">
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-4 space-y-4">
                {/* Tìm kiếm */}
                <div className="relative">
                  <Label>Tìm kiếm địa chỉ</Label>
                  <div className="relative">
                    <Search size={18} className="absolute left-3 top-3 text-gray-400" />
                    <Input
                      className="pl-10"
                      placeholder="Nhập số nhà, tên đường..."
                      value={form.address.street}
                      onChange={(e) => {
                        const val = e.target.value;
                        setForm(prev => ({
                          ...prev,
                          address: { ...prev.address, street: val }
                        }));
                        handleSearch(val);
                      }}
                    />
                  </div>
                  {showSuggestions && suggestions.length > 0 && (
                    <div className="absolute z-10 w-full mt-1 bg-white border rounded-lg shadow-lg max-h-60 overflow-y-auto">
                      {suggestions.map((s, i) => (
                        <div
                          key={i}
                          className="p-3 hover:bg-gray-50 cursor-pointer border-b last:border-b-0"
                          onClick={() => selectSuggestion(s)}
                        >
                          <p className="font-medium text-sm">{s.structured_formatting.main_text}</p>
                          <p className="text-xs text-gray-600">{s.structured_formatting.secondary_text}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Nút lấy vị trí */}
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={handleGetLocation}
                  disabled={isGettingLocation}
                >
                  {isGettingLocation ? "Đang lấy..." : (
                    <>
                      <Crosshair className="mr-2 h-4 w-4" />
                      Lấy vị trí hiện tại
                    </>
                  )}
                </Button>

                {/* Bản đồ */}
                <div className="h-64 rounded-lg overflow-hidden border">
                  <div ref={mapContainerRef} className="w-full h-full" />
                </div>

                {/* Thông tin địa chỉ */}
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div><Label>Phường/Xã</Label><Input value={form.address.ward} readOnly className="bg-gray-50" /></div>
                  <div><Label>Quận/Huyện</Label><Input value={form.address.district} readOnly className="bg-gray-50" /></div>
                  <div><Label>Tỉnh/Thành phố</Label><Input value={form.address.city} readOnly className="bg-gray-50" /></div>
                  <div><Label>Quốc gia</Label><Input value="Việt Nam" readOnly className="bg-gray-50" /></div>
                </div>

                {/* GPS */}
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div><Label>Vĩ độ</Label><Input value={form.gps.lat.toFixed(6)} readOnly className="bg-gray-50" /></div>
                  <div><Label>Kinh độ</Label><Input value={form.gps.lng.toFixed(6)} readOnly className="bg-gray-50" /></div>
                </div>

                {/* Mặc định */}
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="isDefault"
                    checked={form.isDefault}
                    onChange={(e) => setForm(prev => ({ ...prev, isDefault: e.target.checked }))}
                  />
                  <label htmlFor="isDefault" className="cursor-pointer">
                    Đặt làm địa chỉ mặc định
                  </label>
                </div>

                {/* Nút */}
                <div className="flex gap-3 pt-4">
                  <Button type="button" variant="outline" className="flex-1" onClick={closePopup}>
                    Hủy
                  </Button>
                  <Button type="submit" className="flex-1 bg-red-500 hover:bg-red-600 text-white">
                    {popup.address ? "Cập nhật" : "Thêm"}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};