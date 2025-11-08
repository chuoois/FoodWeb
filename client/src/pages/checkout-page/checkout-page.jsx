// src/pages/Checkout/CheckOutPage.jsx
import { useState, useEffect, useContext, useRef } from "react";
import {
  MapPin,
  Tag,
  Shield,
  Trash2,
  Navigation,
  Clock,
  Package,
  Plus,
  X,
  Search,
  Crosshair,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { useSearchParams, useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { getCart, removeFromCart } from "@/services/cart.service";
import {
  getUserAddresses,
  createAddress,
  updateAddress,
} from "@/services/profile.service";
import { checkoutOrder } from "@/services/order.service";
import { AuthContext } from "@/context/AuthContext";
import { getPublicVouchers } from "@/services/voucher.service";
import { getAddressFromCoordinates, searchAddress } from "@/services/goong.service";
import goongjs from "@goongmaps/goong-js";

const GOONG_MAP_KEY = import.meta.env.VITE_GOONG_MAP_API_KEY;
const GOONG_REST_KEY = import.meta.env.VITE_GOONG_API_KEY;

export const CheckOutPage = () => {
  const { user } = useContext(AuthContext);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const shopId = searchParams.get("shop_id");

  // State chính
  const [cartItems, setCartItems] = useState([]);
  const [shop, setShop] = useState(null);
  const [loading, setLoading] = useState(true);

  const [selectedPayment, setSelectedPayment] = useState("PAYOS");
  const [note, setNote] = useState("");
  const [fastDelivery, setFastDelivery] = useState(true);

  // Voucher
  const [vouchers, setVouchers] = useState([]);
  const [selectedVoucher, setSelectedVoucher] = useState(null);
  const [voucherCode, setVoucherCode] = useState("");
  const [voucherError, setVoucherError] = useState("");

  // Address
  const [addresses, setAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState("");

  // Dialogs
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [showErrorDialog, setShowErrorDialog] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Popup địa chỉ
  const [addressPopup, setAddressPopup] = useState({ isOpen: false, address: null });
  const [addressForm, setAddressForm] = useState({
    address: { street: "", ward: "", district: "", city: "", province: "Việt Nam" },
    gps: { lat: 21.0133, lng: 105.5276 },
    isDefault: false,
  });
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isGettingLocation, setIsGettingLocation] = useState(false);

  const mapRef = useRef(null);
  const markerRef = useRef(null);
  const mapContainerRef = useRef(null);
  const searchTimeout = useRef(null);

  // Kiểm tra shop_id
  useEffect(() => {
    if (!shopId) {
      toast.error("Không tìm thấy cửa hàng");
      navigate(-1);
    }
  }, [shopId, navigate]);

  // LẤY GIỎ HÀNG
  useEffect(() => {
    const fetchCart = async () => {
      if (!shopId) return;
      try {
        setLoading(true);
        const data = await getCart(shopId);
        if (!data.items.length) {
          toast.error("Giỏ hàng trống");
          navigate(-1);
          return;
        }
        setShop(data.shop);
        setCartItems(data.items.map((item) => ({
          cartItemId: item.id,
          food_id: item.food_id,
          name: item.name,
          image_url: item.image_url,
          price: item.unit_price,
          discount_percent: item.discount_percent || 0,
          quantity: item.quantity,
          subtotal: item.subtotal,
          note: item.note || "",
          size: item.size || "Mặc định",
        })));
      } catch (err) {
        toast.error("Không thể tải giỏ hàng");
        navigate(-1);
      } finally {
        setLoading(false);
      }
    };
    fetchCart();
  }, [shopId, navigate]);

  // LẤY ĐỊA CHỈ
  useEffect(() => {
    if (!user?.id) return;
    const fetchAddresses = async () => {
      try {
        const res = await getUserAddresses();
        const list = res.data.addresses || [];
        setAddresses(list);
        const defaultAddr = list.find(a => a.isDefault);
        if (defaultAddr && !selectedAddressId) {
          setSelectedAddressId(defaultAddr._id);
        }
      } catch (err) {
        toast.error("Không tải được địa chỉ");
      }
    };
    fetchAddresses();
  }, [user, selectedAddressId]);

  // LẤY VOUCHER
  useEffect(() => {
    if (!shopId) return;
    const fetchVouchers = async () => {
      try {
        const res = await getPublicVouchers(shopId, { is_active: true });
        const vouchersData = res.data?.vouchers || res.data?.data?.vouchers || [];
        setVouchers(vouchersData.map(v => ({
          _id: v._id,
          code: v.code,
          description: v.description,
          discountType: v.discount_type,
          discountValue: parseFloat(v.discount_value),
          minOrderAmount: parseFloat(v.min_order_amount),
          maxDiscount: v.max_discount ? parseFloat(v.max_discount) : null,
          startDate: v.start_date,
          endDate: v.end_date,
          usageLimit: v.usage_limit,
          usedCount: v.used_count,
          isActive: v.is_active,
        })));
      } catch (err) {
        toast.error("Không tải được mã giảm giá");
      }
    };
    fetchVouchers();
  }, [shopId]);

  // TÍNH TOÁN
  const subtotal = cartItems.reduce((sum, item) => sum + item.subtotal, 0);
  const shippingFee = fastDelivery ? 15000 : 5000;

  const calculateDiscount = (voucher, amount) => {
    if (!voucher?.isActive) return 0;
    const now = new Date();
    if (now < new Date(voucher.startDate) || now > new Date(voucher.endDate)) return 0;
    if (voucher.usedCount >= voucher.usageLimit) return 0;
    if (amount < voucher.minOrderAmount) return 0;

    if (voucher.discountType === "PERCENT") {
      const disc = amount * (voucher.discountValue / 100);
      return Math.min(disc, voucher.maxDiscount || disc);
    } else {
      return voucher.discountValue;
    }
  };

  const voucherDiscount = selectedVoucher ? calculateDiscount(selectedVoucher, subtotal) : 0;
  const total = subtotal + shippingFee - voucherDiscount;

  // XÓA MÓN
  const handleRemoveItem = async (cartItemId) => {
    if (!window.confirm("Xóa món này?")) return;
    try {
      await removeFromCart(cartItemId);
      setCartItems(prev => prev.filter(i => i.cartItemId !== cartItemId));
      toast.success("Đã xóa món");
    } catch (err) {
      toast.error("Xóa thất bại");
    }
  };

  // === GOONG MAPS + POPUP ĐỊA CHỈ ===
  const openAddressPopup = (addr = null) => {
    if (addr) {
      const lat = addr.gps.coordinates[1];
      const lng = addr.gps.coordinates[0];
      setAddressForm({
        address: { ...addr.address },
        gps: { lat, lng },
        isDefault: addr.isDefault,
      });
    } else {
      setAddressForm({
        address: { street: "", ward: "", district: "", city: "", province: "Việt Nam" },
        gps: { lat: 21.0133, lng: 105.5276 },
        isDefault: false,
      });
    }
    setSuggestions([]);
    setShowSuggestions(false);
    setAddressPopup({ isOpen: true, address: addr });
  };

  // Khởi tạo bản đồ
  useEffect(() => {
    if (!addressPopup.isOpen || !mapContainerRef.current) return;

    if (!GOONG_MAP_KEY) {
      toast.error("Thiếu GOONG_MAP_API_KEY");
      return;
    }

    // Xóa bản đồ cũ nếu có
    if (mapRef.current) {
      mapRef.current.remove();
      mapRef.current = null;
    }

    goongjs.accessToken = GOONG_MAP_KEY;
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
      const { lat, lng } = addressForm.gps;
      if (lat && lng && lat !== 0 && lng !== 0) {
        mapRef.current.setCenter([lng, lat]);
        markerRef.current.setLngLat([lng, lat]);
      }
    });

    mapRef.current.on("click", async (e) => {
      const { lng, lat } = e.lngLat;
      markerRef.current.setLngLat([lng, lat]);
      await updateLocation(lat, lng);
    });

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [addressPopup.isOpen]);

  const updateLocation = async (lat, lng) => {
    setAddressForm(prev => ({ ...prev, gps: { lat, lng } }));
    try {
      const addr = await getAddressFromCoordinates(lat, lng);
      setAddressForm(prev => ({
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

        setAddressForm({
          ...addressForm,
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
      }
    } catch (err) {
      toast.error("Lỗi lấy chi tiết địa chỉ");
    }
  };

  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      toast.error("Trình duyệt không hỗ trợ định vị");
      return;
    }
    setIsGettingLocation(true);
    toast.loading("Đang lấy vị trí...");
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        await updateLocation(lat, lng);
        if (mapRef.current) {
          mapRef.current.setCenter([lng, lat]);
          markerRef.current.setLngLat([lng, lat]);
        }
        toast.success("Đã lấy vị trí!");
        setIsGettingLocation(false);
      },
      (err) => {
        toast.error("Không lấy được vị trí: " + err.message);
        setIsGettingLocation(false);
      }
    );
  };

  const handleSaveAddress = async () => {
    if (!addressForm.address.street.trim()) {
      toast.error("Vui lòng nhập địa chỉ cụ thể");
      return;
    }

    try {
      const payload = {
        address: {
          street: addressForm.address.street.trim(),
          ward: addressForm.address.ward?.trim() || "",
          district: addressForm.address.district?.trim() || "",
          city: addressForm.address.city?.trim() || "",
          province: "Việt Nam"
        },
        gps: {
          lat: parseFloat(addressForm.gps.lat),
          lng: parseFloat(addressForm.gps.lng)
        },
        isDefault: addressForm.isDefault
      };

      if (addressPopup.address) {
        await updateAddress(addressPopup.address._id, payload);
        toast.success("Cập nhật thành công!");
      } else {
        await createAddress(payload);
        toast.success("Thêm địa chỉ thành công!");
      }

      const res = await getUserAddresses();
      const newList = res.data.addresses || [];
      setAddresses(newList);

      // Tự động chọn địa chỉ vừa thêm/sửa
      const updatedAddr = newList.find(a =>
        a.address.street === payload.address.street &&
        Math.abs(a.gps.coordinates[1] - payload.gps.lat) < 0.0001 &&
        Math.abs(a.gps.coordinates[0] - payload.gps.lng) < 0.0001
      );
      if (updatedAddr) {
        setSelectedAddressId(updatedAddr._id);
      }

      setAddressPopup({ isOpen: false, address: null });
    } catch (err) {
      toast.error(err.response?.data?.message || "Lỗi lưu địa chỉ");
    }
  };

  // Format địa chỉ
  const formatAddress = (addr) => {
    return [addr.street, addr.ward, addr.district, addr.city]
      .filter(Boolean)
      .join(", ");
  };

  // ĐẶT HÀNG
  const handlePlaceOrder = async () => {
    if (!selectedAddressId) {
      toast.error("Vui lòng chọn địa chỉ giao hàng");
      return;
    }

    const orderDetails = cartItems.map(item => ({
      food_id: item.food_id,
      food_name: item.name,
      food_image_url: item.image_url,
      food_size: item.size,
      unit_price: item.price,
      quantity: item.quantity,
      discount_percent: item.discount_percent,
      subtotal: item.subtotal,
      note: item.note,
    }));

    const payload = {
      customer_id: user._id,
      shop_id: shop._id,
      delivery_address_id: selectedAddressId,

      subtotal,
      discount_amount: voucherDiscount,
      shipping_fee: shippingFee,
      total_amount: total,

      voucher_id: selectedVoucher?._id || null,

      payment_method: selectedPayment === "cash" ? "COD" : "PAYOS",
      payment_status: selectedPayment === "cash" ? "COD_PENDING" : "UNPAID",

      note,
      order_details: orderDetails,
    };

    try {
      setLoading(true);
      const res = await checkoutOrder(payload);

      if (selectedPayment === "cash") {
        toast.success("Đặt món thành công!");
        setShowSuccessDialog(true);
        setTimeout(() => {
          setShowSuccessDialog(false);
          navigate("/myorder", { replace: true });
        }, 1500);
      } else {
        const paymentUrl = res.data?.url || res.url;
        if (paymentUrl) {
          toast.success("Đang chuyển đến thanh toán...");
          window.open(paymentUrl, "_blank");
        } else {
          throw new Error("Không nhận được link thanh toán");
        }
      }
    } catch (err) {
      const msg = err.response?.data?.message || err.message || "Đặt món thất bại!";
      setErrorMessage(msg);
      setShowErrorDialog(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gradient-to-b from-orange-50 to-white min-h-screen py-6">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">

            {/* ĐỊA CHỈ GIAO HÀNG */}
            <Card className="border-orange-200 shadow-md">
              <CardHeader className="bg-orange-50 rounded-t-lg">
                <CardTitle className="flex items-center gap-2 text-xl">
                  <MapPin className="w-5 h-5 text-orange-600" />
                  Địa chỉ giao hàng
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-6">

                {/* Chọn địa chỉ */}
                <div>
                  <Label>Chọn địa chỉ đã lưu *</Label>
                  <Select value={selectedAddressId} onValueChange={setSelectedAddressId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn địa chỉ..." />
                    </SelectTrigger>
                    <SelectContent>
                      {addresses.map((addr) => (
                        <SelectItem key={addr._id} value={addr._id}>
                          <div className="flex items-center gap-2">
                            {addr.isDefault && <Badge variant="secondary">Mặc định</Badge>}
                            <span>{formatAddress(addr.address)}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Nút thêm/sửa */}
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => openAddressPopup(null)}
                  >
                    <Plus className="w-4 h-4 mr-2" /> Thêm địa chỉ mới
                  </Button>
                  {selectedAddressId && (
                    <Button
                      variant="outline"
                      onClick={() => {
                        const addr = addresses.find(a => a._id === selectedAddressId);
                        openAddressPopup(addr);
                      }}
                    >
                      Sửa địa chỉ này
                    </Button>
                  )}
                </div>

                {/* Hiển thị địa chỉ đã chọn */}
                {selectedAddressId && (
                  <div className="p-4 bg-gray-50 rounded-lg border">
                    <p className="font-medium flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-orange-600" />
                      Địa chỉ giao hàng:
                    </p>
                    <p className="text-sm mt-1">
                      {formatAddress(addresses.find(a => a._id === selectedAddressId)?.address)}
                    </p>
                  </div>
                )}

                {/* Ghi chú */}
                <div>
                  <Label>Ghi chú cho tài xế</Label>
                  <Input value={note} onChange={(e) => setNote(e.target.value)} placeholder="Gọi trước khi giao..." />
                </div>

                {/* Giao nhanh */}
                <div className="flex items-center justify-between p-4 bg-amber-50 rounded-lg border border-amber-200">
                  <div className="flex items-center gap-2">
                    <Clock className="w-5 h-5 text-amber-600" />
                    <div>
                      <p className="font-medium">Giao nhanh 30 phút</p>
                      <p className="text-xs text-amber-700">+10.000đ</p>
                    </div>
                  </div>
                  <Checkbox checked={fastDelivery} onCheckedChange={setFastDelivery} />
                </div>
              </CardContent>
            </Card>

            {/* DANH SÁCH MÓN */}
            <Card className="border-orange-200 shadow-md">
              <CardHeader className="bg-gradient-to-r from-orange-100 to-orange-50 rounded-t-lg">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2 text-xl">
                    <Package className="w-5 h-5 text-orange-600" />
                    Đơn hàng ({cartItems.length} món)
                  </CardTitle>
                  <Button variant="link" className="text-orange-600" onClick={() => navigate(-1)}>
                    Thêm món
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                {loading ? (
                  <p className="text-center py-8 text-gray-500">Đang tải...</p>
                ) : cartItems.length === 0 ? (
                  <p className="text-center py-8 text-gray-500">Giỏ hàng trống</p>
                ) : (
                  <div className="space-y-4">
                    {cartItems.map((item) => (
                      <div key={item.cartItemId} className="flex gap-4 p-4 bg-gray-50 rounded-lg border">
                        <img src={item.image_url || "/placeholder.svg"} alt={item.name} className="w-20 h-20 rounded-lg object-cover" />
                        <div className="flex-1 space-y-1">
                          <div className="flex justify-between items-start">
                            <h4 className="font-semibold">{item.name}</h4>
                            <Button variant="ghost" size="sm" onClick={() => handleRemoveItem(item.cartItemId)}>
                              <Trash2 className="w-4 h-4 text-red-500" />
                            </Button>
                          </div>
                          {item.size !== "Mặc định" && <p className="text-xs text-gray-600">Size: {item.size}</p>}
                          <div className="text-sm text-gray-600">
                            {item.quantity} × {(item.price * (1 - item.discount_percent / 100)).toLocaleString()}đ
                          </div>
                          {item.note && <p className="text-xs italic text-gray-500">Ghi chú: {item.note}</p>}
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-orange-600">{item.subtotal.toLocaleString()}đ</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* RIGHT - THANH TOÁN */}
          <div className="lg:col-span-1">
            <Card className="border-orange-300 shadow-lg sticky top-4">
              <CardHeader className="bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-t-lg">
                <CardTitle className="text-xl">Thanh toán</CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-6">

                <div>
                  <Label className="flex items-center gap-2 mb-3"><Shield className="w-4 h-4" /> Phương thức</Label>
                  <div className="space-y-2">
                    <label className="flex items-center justify-between p-3 border rounded-lg cursor-pointer hover:bg-orange-50">
                      <div className="flex items-center gap-3">
                        <input type="radio" name="payment" value="PAYOS" checked={selectedPayment === "PAYOS"} onChange={(e) => setSelectedPayment(e.target.value)} />
                        <div><p className="font-medium">Thanh toán online</p></div>
                      </div>
                    </label>
                    <label className="flex items-center justify-between p-3 border rounded-lg cursor-pointer hover:bg-orange-50">
                      <div className="flex items-center gap-3">
                        <input type="radio" name="payment" value="cash" checked={selectedPayment === "cash"} onChange={(e) => setSelectedPayment(e.target.value)} />
                        <div><p className="font-medium">Tiền mặt (COD)</p></div>
                      </div>
                    </label>
                  </div>
                </div>

                <div>
                  <Label className="flex items-center gap-2 mb-3"><Tag className="w-4 h-4" /> Mã giảm giá</Label>
                  <div className="flex gap-2">
                    <Input placeholder="Nhập mã..." value={voucherCode} onChange={(e) => { setVoucherCode(e.target.value.trim().toUpperCase()); setVoucherError(""); }} disabled={!!selectedVoucher} />
                    <Button size="sm" onClick={
                      selectedVoucher
                        ? () => { setSelectedVoucher(null); setVoucherCode(""); toast.success("Đã hủy mã"); }
                        : () => {
                            const found = vouchers.find(v => v.code === voucherCode && calculateDiscount(v, subtotal) > 0);
                            if (found) { setSelectedVoucher(found); toast.success("Áp dụng thành công!"); }
                            else { setVoucherError("Mã không hợp lệ"); }
                          }
                    }>
                      {selectedVoucher ? "Hủy" : "Áp dụng"}
                    </Button>
                  </div>
                  {voucherError && <p className="text-xs text-red-500 mt-1">{voucherError}</p>}
                  {selectedVoucher && (
                    <div className="mt-2 p-3 bg-emerald-50 border border-emerald-200 rounded-lg">
                      <p className="text-sm font-medium text-emerald-700">Đã áp dụng: {selectedVoucher.code}</p>
                      <p className="font-bold text-emerald-700">-{voucherDiscount.toLocaleString()}đ</p>
                    </div>
                  )}
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between text-sm"><span>Tạm tính</span><span>{subtotal.toLocaleString()}đ</span></div>
                  <div className="flex justify-between text-sm"><span>Phí giao hàng</span><span>{shippingFee.toLocaleString()}đ</span></div>
                  {voucherDiscount > 0 && <div className="flex justify-between text-sm text-green-600"><span>Giảm giá</span><span>-{voucherDiscount.toLocaleString()}đ</span></div>}
                  <Separator />
                  <div className="flex justify-between text-lg font-bold"><span>Tổng cộng</span><span className="text-orange-600">{total.toLocaleString()}đ</span></div>
                </div>

                <Button
                  size="lg"
                  className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-bold py-6"
                  onClick={handlePlaceOrder}
                  disabled={loading || !selectedAddressId}
                >
                  {loading ? "Đang xử lý..." : "Đặt món ngay"}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* POPUP THÊM/SỬA ĐỊA CHỈ */}
      {addressPopup.isOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-4 border-b sticky top-0 bg-white z-10">
              <h2 className="text-lg font-bold">{addressPopup.address ? "Sửa địa chỉ" : "Thêm địa chỉ mới"}</h2>
              <button onClick={() => setAddressPopup({ isOpen: false, address: null })} className="p-2 hover:bg-gray-100 rounded-full">
                <X size={20} />
              </button>
            </div>

            <div className="p-4 space-y-4">
              <div className="relative">
                <Label>Tìm kiếm địa chỉ</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-3 text-gray-400" size={18} />
                  <Input
                    className="pl-10"
                    placeholder="Nhập số nhà, tên đường..."
                    value={addressForm.address.street}
                    onChange={(e) => {
                      const val = e.target.value;
                      setAddressForm(prev => ({ ...prev, address: { ...prev.address, street: val } }));
                      handleSearch(val);
                    }}
                  />
                </div>
                {showSuggestions && suggestions.length > 0 && (
                  <div className="absolute z-20 w-full mt-1 bg-white border rounded-lg shadow-lg max-h-60 overflow-y-auto">
                    {suggestions.map((s, i) => (
                      <div key={i} className="p-3 hover:bg-gray-50 cursor-pointer border-b last:border-b-0" onClick={() => selectSuggestion(s)}>
                        <p className="font-medium text-sm">{s.structured_formatting.main_text}</p>
                        <p className="text-xs text-gray-600">{s.structured_formatting.secondary_text}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <Button type="button" variant="outline" className="w-full" onClick={handleGetLocation} disabled={isGettingLocation}>
                <Crosshair className="mr-2 h-4 w-4" /> {isGettingLocation ? "Đang lấy..." : "Lấy vị trí hiện tại"}
              </Button>

              <div ref={mapContainerRef} className="h-64 rounded-lg overflow-hidden border"></div>

              <div className="grid grid-cols-2 gap-3 text-sm">
                <div><Label>Phường/Xã</Label><Input value={addressForm.address.ward} readOnly className="bg-gray-50" /></div>
                <div><Label>Quận/Huyện</Label><Input value={addressForm.address.district} readOnly className="bg-gray-50" /></div>
                <div><Label>Tỉnh/Thành</Label><Input value={addressForm.address.city} readOnly className="bg-gray-50" /></div>
                <div><Label>Quốc gia</Label><Input value="Việt Nam" readOnly className="bg-gray-50" /></div>
              </div>

              <div className="flex items-center gap-2">
                <input type="checkbox" checked={addressForm.isDefault} onChange={(e) => setAddressForm(prev => ({ ...prev, isDefault: e.target.checked }))} />
                <label>Đặt làm địa chỉ mặc định</label>
              </div>

              <div className="flex gap-3 pt-4">
                <Button variant="outline" className="flex-1" onClick={() => setAddressPopup({ isOpen: false, address: null })}>Hủy</Button>
                <Button className="flex-1 bg-orange-500 hover:bg-orange-600" onClick={handleSaveAddress}>
                  {addressPopup.address ? "Cập nhật" : "Thêm"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Dialogs */}
      <Dialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
        <DialogContent><DialogHeader><DialogTitle>Thành công!</DialogTitle></DialogHeader><DialogFooter><Button onClick={() => navigate("/myorder")}>Xem đơn</Button></DialogFooter></DialogContent>
      </Dialog>

      <Dialog open={showErrorDialog} onOpenChange={setShowErrorDialog}>
        <DialogContent><DialogHeader><DialogTitle>Lỗi</DialogTitle><DialogDescription>{errorMessage}</DialogDescription></DialogHeader><DialogFooter><Button onClick={() => setShowErrorDialog(false)}>OK</Button></DialogFooter></DialogContent>
      </Dialog>
    </div>
  );
};