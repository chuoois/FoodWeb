import { useState, useEffect, useContext } from "react";
import {
  MapPin,
  ChevronDown,
  Tag,
  Shield,
  AlertCircle,
  Trash2,
  Edit,
  Navigation,
  Percent,
  Clock,
  Package,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
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
import { useSearchParams, useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { getCart, removeFromCart } from "@/services/cart.service";
import { getProfile } from "@/services/profile.service";
import { checkoutOrder, getVouchers } from "@/services/order.service";
import { AuthContext } from "@/context/AuthContext";
import { getPublicVouchers } from "@/services/voucher.service"; // THAY getVouchers

export const CheckOutPage = () => {
  const { user } = useContext(AuthContext);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const shopId = searchParams.get("shop_id");

  // State
  const [cartItems, setCartItems] = useState([]);
  const [shop, setShop] = useState(null);
  const [loading, setLoading] = useState(true);

  const [selectedPayment, setSelectedPayment] = useState("PAYOS");
  const [recipientName, setRecipientName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [note, setNote] = useState("");
  const [fastDelivery, setFastDelivery] = useState(true);

  const [vouchers, setVouchers] = useState([]);
  const [selectedVoucher, setSelectedVoucher] = useState(null);
  const [voucherCode, setVoucherCode] = useState(""); // mã người dùng gõ
  const [voucherError, setVoucherError] = useState(""); // lỗi nhập mã

  // Profile & Addresses
  const [profile, setProfile] = useState(null);
  const [addresses, setAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState("");

  // Dialogs
  const [showLoginDialog, setShowLoginDialog] = useState(false);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [showErrorDialog, setShowErrorDialog] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [showLocationErrorDialog, setShowLocationErrorDialog] = useState(false);
  const [locationErrorMessage, setLocationErrorMessage] = useState("");

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
        setCartItems(
          data.items.map((item) => ({
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
          }))
        );
      } catch (err) {
        console.error(err);
        toast.error("Không thể tải giỏ hàng");
        navigate(-1);
      } finally {
        setLoading(false);
      }
    };

    fetchCart();
  }, [shopId, navigate]);

  // LẤY PROFILE + ĐỊA CHỈ (SỬA THEO API THỰC TẾ)
  useEffect(() => {
    if (!user?.id) return;

    const fetchProfile = async () => {
      try {
        const res = await getProfile(user.id);
        const data = res.data || res;

        setProfile(data.user);
        setAddresses(data.addresses || []);

        if (data.user) {
          setRecipientName(data.user.full_name || "");
          setPhone(data.user.phone || "");
        }

        const defaultAddr = data.addresses?.find((a) => a.isDefault);
        if (defaultAddr) {
          setSelectedAddressId(defaultAddr._id);
          setDeliveryAddress(formatAddress(defaultAddr.address));
        }
      } catch (err) {
        console.error("Lỗi lấy profile:", err);
        toast.error("Không thể tải thông tin");
      }
    };

    fetchProfile();
  }, [user]);

  // === LẤY VOUCHER TỪ API PUBLIC MỚI ===
  useEffect(() => {
    if (!shopId) return;

    const fetchVouchers = async () => {
      try {
        const res = await getPublicVouchers(shopId, { is_active: true });
        const vouchersData =
          res.data?.vouchers || res.data?.data?.vouchers || [];

        const formatted = vouchersData.map((v) => ({
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
        }));

        setVouchers(formatted);
      } catch (err) {
        console.error("Lỗi lấy voucher:", err);
        toast.error("Không thể tải mã giảm giá");
      }
    };

    fetchVouchers();
  }, [shopId]);

  // Cập nhật địa chỉ khi chọn
  useEffect(() => {
    const selected = addresses.find((a) => a._id === selectedAddressId);
    if (selected) {
      setDeliveryAddress(formatAddress(selected.address));
    }
  }, [selectedAddressId, addresses]);

  // Format địa chỉ
  const formatAddress = (addr) => {
    return [addr.street, addr.ward, addr.district, addr.city, addr.province]
      .filter(Boolean)
      .join(", ");
  };

  // TÍNH TOÁN
  const subtotal = cartItems.reduce((sum, item) => sum + item.subtotal, 0);
  const shippingFee = fastDelivery ? 15000 : 5000;

  const calculateDiscount = (voucher, amount) => {
    if (!voucher?.isActive) return 0;
    const now = new Date();
    if (now < new Date(voucher.startDate) || now > new Date(voucher.endDate))
      return 0;
    if (voucher.usedCount >= voucher.usageLimit) return 0;
    if (amount < voucher.minOrderAmount) return 0;

    if (voucher.discountType === "PERCENT") {
      const disc = amount * (voucher.discountValue / 100);
      return Math.min(disc, voucher.maxDiscount || disc);
    } else {
      return voucher.discountValue;
    }
  };

  const voucherDiscount = selectedVoucher
    ? calculateDiscount(selectedVoucher, subtotal)
    : 0;

  const total = subtotal + shippingFee - voucherDiscount;

  const validVouchers = vouchers.filter(
    (v) => calculateDiscount(v, subtotal) > 0
  );

  // XÓA MÓN
  const handleRemoveItem = async (cartItemId) => {
    if (!window.confirm("Xóa món này khỏi giỏ hàng?")) return;

    try {
      await removeFromCart(cartItemId);
      setCartItems((prev) => prev.filter((i) => i.cartItemId !== cartItemId));
      toast.success("Đã xóa món");
    } catch (err) {
      toast.error("Xóa thất bại");
    }
  };

  // LẤY VỊ TRÍ
  const handleGetLocation = async () => {
    if (!navigator.geolocation) {
      setLocationErrorMessage("Trình duyệt không hỗ trợ định vị!");
      setShowLocationErrorDialog(true);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json&addressdetails=1`,
            { headers: { "User-Agent": "YummyGo/1.0" } }
          );
          const data = await res.json();
          const addr = data.address || {};
          const formatted = [
            addr.house_number,
            addr.road,
            addr.neighbourhood,
            addr.suburb,
            addr.city_district,
            addr.city,
            addr.state,
          ]
            .filter(Boolean)
            .join(", ");
          setDeliveryAddress(
            formatted ||
              `Vị trí: ${latitude.toFixed(4)}, ${longitude.toFixed(4)}`
          );
          setSelectedAddressId("");
        } catch (err) {
          setLocationErrorMessage("Không thể lấy địa chỉ");
          setShowLocationErrorDialog(true);
        }
      },
      (err) => {
        setLocationErrorMessage("Không lấy được vị trí: " + err.message);
        setShowLocationErrorDialog(true);
      }
    );
  };

  // ĐẶT HÀNG
  const handlePlaceOrder = async () => {
    if (!deliveryAddress.trim()) {
      toast.error("Vui lòng chọn hoặc nhập địa chỉ giao hàng");
      return;
    }

    const orderDetails = cartItems.map((item) => ({
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
      delivery_address_id: selectedAddressId || null,
      delivery_address_manual: !selectedAddressId ? deliveryAddress : null,

      subtotal,
      discount_amount: voucherDiscount,
      shipping_fee: shippingFee,
      total_amount: total,

      voucher_id: selectedVoucher?._id || null,

      payment_method: selectedPayment === "cash" ? "COD" : "PAYOS",
      payment_status: selectedPayment === "cash" ? "COD_PENDING" : "UNPAID",

      note,
      receiver_name: recipientName,
      receiver_phone: phone,
      receiver_email: email || null,

      order_details: orderDetails,
    };

    try {
      setLoading(true);
      // ✅ Mới
      const res = await checkoutOrder(payload);

      // 🔸 XỬ LÝ THANH TOÁN COD
      if (selectedPayment === "cash") {
        if (res.status === 201 || res.data?.message || res.data?.order) {
          toast.success("Đặt món thành công!");
          setShowSuccessDialog(true);
          setTimeout(() => {
            setShowSuccessDialog(false);
            navigate("/myorder", { replace: true });
          }, 1200);
        } else {
          throw new Error("Không nhận được xác nhận từ server");
        }
      }
      // 🔸 XỬ LÝ THANH TOÁN PAYOS
      else if (selectedPayment === "PAYOS") {
        const paymentUrl = res.data?.url || res.url;

        if (paymentUrl) {
          toast.success("Đang chuyển đến trang thanh toán...");
          // Redirect sang trang thanh toán PayOS
          // window.location.href = paymentUrl;

          window.open(paymentUrl, "_blank");
        } else {
          throw new Error("Không nhận được link thanh toán");
        }
      }
    } catch (err) {
      console.error("Lỗi đặt hàng:", err);
      const msg =
        err.response?.data?.message || err.message || "Đặt món thất bại!";
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
            {/* Giao hàng */}
            <Card className="border-orange-200 shadow-md">
              <CardHeader className="bg-orange-50 rounded-t-lg">
                <CardTitle className="flex items-center gap-2 text-xl">
                  <MapPin className="w-5 h-5 text-orange-600" />
                  Địa chỉ giao hàng
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Tên người nhận *</Label>
                    <Input
                      value={recipientName}
                      onChange={(e) => setRecipientName(e.target.value)}
                      placeholder="Nguyễn Văn A"
                    />
                  </div>
                  <div>
                    <Label>Số điện thoại *</Label>
                    <Input
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="0901234567"
                    />
                  </div>
                </div>

                <div>
                  <Label>Email (không bắt buộc)</Label>
                  <Input
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="email@example.com"
                  />
                </div>

                {/* Chọn địa chỉ */}
                <div>
                  <Label>Chọn địa chỉ đã lưu</Label>
                  <Select
                    value={selectedAddressId}
                    onValueChange={setSelectedAddressId}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn địa chỉ..." />
                    </SelectTrigger>
                    <SelectContent>
                      {addresses.map((addr) => (
                        <SelectItem key={addr._id} value={addr._id}>
                          <div className="flex items-center gap-2">
                            {addr.isDefault && (
                              <Badge variant="secondary" className="text-xs">
                                Mặc định
                              </Badge>
                            )}
                            <span>{formatAddress(addr.address)}</span>
                          </div>
                        </SelectItem>
                      ))}
                      {addresses.length === 0 && (
                        <div className="p-2 text-sm text-gray-500">
                          Chưa có địa chỉ nào
                        </div>
                      )}
                    </SelectContent>
                  </Select>
                </div>

                {/* Nhập địa chỉ chi tiết */}
                <div>
                  <Label>Địa chỉ chi tiết *</Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 w-5 h-5 text-orange-500" />
                    <Input
                      value={deliveryAddress}
                      onChange={(e) => setDeliveryAddress(e.target.value)}
                      placeholder="Số nhà, tên đường, phường/xã..."
                      className="pl-10 pr-20"
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      className="absolute right-10 top-1/2 -translate-y-1/2"
                      onClick={() => navigate("/profile?tab=addresses")}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="absolute right-2 top-1/2 -translate-y-1/2"
                      onClick={handleGetLocation}
                    >
                      <Navigation className="w-4 h-4 text-orange-500" />
                    </Button>
                  </div>
                </div>

                <div>
                  <Label>Ghi chú cho tài xế</Label>
                  <Input
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="Gọi trước khi giao..."
                  />
                </div>

                <div className="flex items-center justify-between p-4 bg-amber-50 rounded-lg border border-amber-200">
                  <div className="flex items-center gap-2">
                    <Clock className="w-5 h-5 text-amber-600" />
                    <div>
                      <p className="font-medium">Giao nhanh 30 phút</p>
                      <p className="text-xs text-amber-700">+10.000đ</p>
                    </div>
                  </div>
                  <Checkbox
                    checked={fastDelivery}
                    onCheckedChange={setFastDelivery}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Danh sách món */}
            <Card className="border-orange-200 shadow-md">
              <CardHeader className="bg-gradient-to-r from-orange-100 to-orange-50 rounded-t-lg">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2 text-xl">
                    <Package className="w-5 h-5 text-orange-600" />
                    Đơn hàng ({cartItems.length} món)
                  </CardTitle>
                  <Button
                    variant="link"
                    className="text-orange-600 font-medium"
                    onClick={() => navigate(-1)}
                  >
                    Thêm món
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                {loading ? (
                  <p className="text-center py-8 text-gray-500">Đang tải...</p>
                ) : cartItems.length === 0 ? (
                  <p className="text-center py-8 text-gray-500">
                    Giỏ hàng trống
                  </p>
                ) : (
                  <div className="space-y-4">
                    {cartItems.map((item) => (
                      <div
                        key={item.cartItemId}
                        className="flex gap-4 p-4 bg-gray-50 rounded-lg border border-gray-200"
                      >
                        <img
                          src={item.image_url || "/placeholder.svg"}
                          alt={item.name}
                          className="w-20 h-20 rounded-lg object-cover"
                        />
                        <div className="flex-1 space-y-1">
                          <div className="flex justify-between items-start">
                            <h4 className="font-semibold text-gray-900">
                              {item.name}
                            </h4>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleRemoveItem(item.cartItemId)}
                              className="text-red-500 hover:bg-red-50"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>

                          {item.size && (
                            <p className="text-xs text-gray-600">
                              Size: {item.size}
                            </p>
                          )}

                          <div className="text-sm text-gray-600">
                            {item.quantity} ×{" "}
                            {(
                              item.price *
                              (1 - item.discount_percent / 100)
                            ).toLocaleString()}
                            đ
                            {item.discount_percent > 0 && (
                              <Badge
                                variant="secondary"
                                className="ml-1 text-xs"
                              >
                                -{item.discount_percent}%
                              </Badge>
                            )}
                          </div>

                          {item.note && (
                            <p className="text-xs italic text-gray-500">
                              Ghi chú: {item.note}
                            </p>
                          )}
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-orange-600">
                            {item.subtotal.toLocaleString()}đ
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Thanh toán */}
          <div className="lg:col-span-1">
            <Card className="border-orange-300 shadow-lg sticky top-4">
              <CardHeader className="bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-t-lg">
                <CardTitle className="text-xl">Thanh toán</CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                {/* Phương thức thanh toán */}
                <div>
                  <Label className="flex items-center gap-2 mb-3">
                    <Shield className="w-4 h-4" />
                    Phương thức thanh toán
                  </Label>
                  <div className="space-y-2">
                    <label className="flex items-center justify-between p-3 border rounded-lg cursor-pointer hover:bg-orange-50">
                      <div className="flex items-center gap-3">
                        <input
                          type="radio"
                          name="payment"
                          value="PAYOS"
                          checked={selectedPayment === "PAYOS"}
                          onChange={(e) => setSelectedPayment(e.target.value)}
                          className="w-4 h-4 text-orange-600"
                        />
                        <div>
                          <p className="font-medium">QR VNPAY / PAYOS</p>
                          <p className="text-xs text-gray-500">
                            Thanh toán online
                          </p>
                        </div>
                      </div>
                    </label>
                    <label className="flex items-center justify-between p-3 border rounded-lg cursor-pointer hover:bg-orange-50">
                      <div className="flex items-center gap-3">
                        <input
                          type="radio"
                          name="payment"
                          value="cash"
                          checked={selectedPayment === "cash"}
                          onChange={(e) => setSelectedPayment(e.target.value)}
                          className="w-4 h-4 text-orange-600"
                        />
                        <div>
                          <p className="font-medium">Tiền mặt (COD)</p>
                          <p className="text-xs text-gray-500">
                            Thanh toán khi nhận hàng
                          </p>
                        </div>
                      </div>
                    </label>
                  </div>
                </div>

                {/* Voucher - Nhập mã */}
                <div>
                  <Label className="flex items-center gap-2 mb-3">
                    <Tag className="w-4 h-4" />
                    Mã giảm giá
                  </Label>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Nhập mã giảm giá..."
                      value={voucherCode}
                      onChange={(e) => {
                        setVoucherCode(e.target.value.trim().toUpperCase());
                        setVoucherError("");
                      }}
                      className="flex-1"
                      disabled={!!selectedVoucher}
                    />
                    <Button
                      size="sm"
                      onClick={
                        selectedVoucher
                          ? () => {
                              setSelectedVoucher(null);
                              setVoucherCode("");
                              toast.success("Đã hủy mã giảm giá");
                            }
                          : async () => {
                              if (!voucherCode.trim()) {
                                setVoucherError("Vui lòng nhập mã");
                                return;
                              }

                              const found = vouchers.find(
                                (v) =>
                                  v.code === voucherCode &&
                                  calculateDiscount(v, subtotal) > 0
                              );

                              if (found) {
                                setSelectedVoucher(found);
                                setVoucherError("");
                                toast.success(`Áp dụng mã: ${found.code}`);
                              } else {
                                setVoucherError(
                                  "Mã không hợp lệ hoặc không áp dụng được"
                                );
                              }
                            }
                      }
                      className={`whitespace-nowrap font-medium transition-all ${
                        selectedVoucher
                          ? "bg-orange-100 hover:bg-orange-200 text-orange-700 border border-orange-300"
                          : "bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white"
                      }`}
                    >
                      {selectedVoucher ? "Hủy" : "Áp dụng"}
                    </Button>
                  </div>
                  {voucherError && (
                    <p className="text-xs text-red-500 mt-1">{voucherError}</p>
                  )}
                  {selectedVoucher && (
                    <div className="mt-2 p-3 bg-emerald-50 border border-emerald-200 rounded-lg flex items-center gap-2">
                      <Tag className="w-4 h-4 text-emerald-600" />
                      <p className="text-sm text-emerald-700">
                        Đã áp dụng: <strong>{selectedVoucher.code}</strong>
                        {selectedVoucher.description &&
                          ` – ${selectedVoucher.description}`}
                      </p>
                      <span className="ml-auto font-bold text-emerald-700">
                        -{voucherDiscount.toLocaleString()}đ
                      </span>
                    </div>
                  )}
                </div>

                {/* Tính tiền */}
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span>Tạm tính</span>
                    <span>{subtotal.toLocaleString()}đ</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Phí giao hàng {fastDelivery && "(nhanh)"}</span>
                    <span>{shippingFee.toLocaleString()}đ</span>
                  </div>
                  {voucherDiscount > 0 && (
                    <div className="flex justify-between text-sm text-green-600">
                      <span>Giảm giá voucher</span>
                      <span>-{voucherDiscount.toLocaleString()}đ</span>
                    </div>
                  )}
                  <Separator />
                  <div className="flex justify-between text-lg font-bold">
                    <span>Tổng cộng</span>
                    <span className="text-orange-600">
                      {total.toLocaleString()}đ
                    </span>
                  </div>
                </div>

                <Button
                  size="lg"
                  className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-bold text-lg py-6"
                  onClick={handlePlaceOrder}
                  disabled={loading}
                >
                  {loading ? "Đang xử lý..." : "Đặt món ngay"}
                </Button>

                <p className="text-xs text-gray-500 text-center">
                  Bằng việc đặt món, bạn đồng ý với{" "}
                  <a href="#" className="text-orange-600 underline">
                    điều khoản sử dụng
                  </a>
                  .
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <Dialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Đặt món thành công!</DialogTitle>
            <DialogDescription>
              Đơn hàng đã được gửi. Vui lòng kiểm tra lịch sử đơn hàng.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={() => setShowSuccessDialog(false)}>OK</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showErrorDialog} onOpenChange={setShowErrorDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Lỗi</DialogTitle>
            <DialogDescription>{errorMessage}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={() => setShowErrorDialog(false)}>OK</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={showLocationErrorDialog}
        onOpenChange={setShowLocationErrorDialog}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Lỗi định vị</DialogTitle>
            <DialogDescription>{locationErrorMessage}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={() => setShowLocationErrorDialog(false)}>
              OK
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
