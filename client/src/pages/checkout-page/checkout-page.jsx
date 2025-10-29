import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  MapPin,
  ChevronDown,
  Tag,
  Shield,
  AlertCircle,
  Trash2,
  Edit,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { getCart, removeFromCart } from "@/services/cart.service";
import toast from "react-hot-toast";

export const CheckOutPage = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Lấy shop_id từ URL: /checkout?shop_id=...
  const searchParams = new URLSearchParams(location.search);
  const shopId = searchParams.get("shop_id");

  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedPayment, setSelectedPayment] = useState("cash");
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [driverNote, setDriverNote] = useState("");
  const [fastDelivery, setFastDelivery] = useState(false);

  // Lấy giỏ hàng từ API
  useEffect(() => {
    if (!shopId) {
      toast.error("Không tìm thấy cửa hàng");
      navigate(-1);
      return;
    }

    const fetchCart = async () => {
      try {
        setLoading(true);
        const data = await getCart(shopId);
        setCart(data);
      } catch (err) {
        toast.error("Không thể tải giỏ hàng");
        navigate(-1);
      } finally {
        setLoading(false);
      }
    };

    fetchCart();
  }, [shopId, navigate]);

  // Xóa món
  const handleRemove = async (itemId) => {
    try {
      await removeFromCart(itemId);
      setCart((prev) => ({
        ...prev,
        items: prev.items.filter((i) => i.id !== itemId),
      }));
      toast.success("Đã xóa món");
    } catch (err) {
      toast.error("Xóa thất bại");
    }
  };

  const paymentMethods = [
    { id: "cake", name: "Cake by VPBank", icon: "C", color: "bg-pink-100 text-pink-600" },
    { id: "momo", name: "Ví MoMo", icon: "M", color: "bg-purple-100 text-purple-600" },
    { id: "zalopay", name: "ZaloPay", icon: "Z", color: "bg-blue-100 text-blue-600" },
    { id: "credit", name: "Thẻ tín dụng/Ghi nợ", icon: "💳", color: "bg-gray-100 text-gray-600" },
    { id: "cash", name: "Tiền mặt", icon: "💵", color: "bg-green-100 text-green-600" },
  ];

  const getCurrentPayment = () => paymentMethods.find((m) => m.id === selectedPayment) || paymentMethods[4];

  // Tính tiền
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  if (!cart || !cart.items || cart.items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <p className="text-gray-500 text-lg">Giỏ hàng trống</p>
        <Button onClick={() => navigate(-1)} className="mt-4">
          Quay lại
        </Button>
      </div>
    );
  }

  const subtotal = cart.items.reduce((sum, item) => sum + item.subtotal, 0);
  const shippingFee = fastDelivery ? 30000 : 25000;
  const discount = 0; // Có thể lấy từ backend sau
  const total = subtotal + shippingFee - discount;

  return (
    <div className="bg-[#F7EFDF] min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cột trái */}
          <div className="lg:col-span-2 space-y-6">
            {/* Giao hàng */}
            <Card className="border-orange-100 shadow-sm">
              <CardHeader className="p-6">
                <CardTitle className="text-xl font-bold text-gray-900 mb-4">Giao tới</CardTitle>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700">Địa chỉ</Label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-orange-500" />
                      <Input
                        type="text"
                        value={deliveryAddress}
                        onChange={(e) => setDeliveryAddress(e.target.value)}
                        placeholder="Nhập địa chỉ giao hàng"
                        className="pl-10 pr-10 py-3 border-orange-300 focus:border-orange-500 focus:ring-2 focus:ring-orange-200"
                      />
                      <Button variant="ghost" size="sm" className="absolute right-3 top-1/2 -translate-y-1/2 p-0 h-5 w-5">
                        <Edit className="w-5 h-5 text-gray-400 hover:text-orange-500" />
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700">Ghi chú cho tài xế</Label>
                    <Input
                      type="text"
                      value={driverNote}
                      onChange={(e) => setDriverNote(e.target.value)}
                      placeholder="Vd: Gọi trước khi giao"
                      className="px-4 py-3 border-orange-300 focus:border-orange-500 focus:ring-2 focus:ring-orange-200"
                    />
                  </div>

                  <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                    <span className="text-sm font-medium text-gray-900">
                      Giao nhanh +5.000đ
                    </span>
                    <Checkbox checked={fastDelivery} onCheckedChange={setFastDelivery} />
                  </div>
                </div>
              </CardHeader>
            </Card>

            {/* Danh sách món */}
            <Card className="border-orange-100 shadow-sm">
              <CardHeader className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <CardTitle className="text-xl font-bold text-gray-900">
                    ĐƠN HÀNG ({cart.items.length})
                  </CardTitle>
                  <Button
                    variant="link"
                    className="text-sm text-orange-500 hover:text-orange-600 font-medium p-0 h-auto"
                    onClick={() => navigate(-1)}
                  >
                    Thêm món
                  </Button>
                </div>

                <div className="space-y-4">
                  {cart.items.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center gap-4 py-4 border-b border-orange-100 last:border-0"
                    >
                      <img
                        src={item.image_url || "/placeholder.svg"}
                        alt={item.name}
                        className="w-16 h-16 rounded-lg object-cover"
                      />
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-1">
                          <div>
                            <span className="text-sm font-medium text-gray-900">
                              {item.quantity}×
                            </span>
                            <span className="ml-2 text-sm font-semibold text-gray-900">
                              {item.name}
                            </span>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemove(item.id)}
                            className="text-gray-400 hover:text-red-500 p-0 h-auto"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                        <div className="mt-2 text-sm font-semibold text-orange-600">
                          {item.subtotal.toLocaleString()}đ
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardHeader>
            </Card>

            {/* Thanh toán */}
            <Card className="border-orange-100 shadow-sm">
              <CardHeader className="p-6">
                <CardTitle className="text-xl font-bold text-gray-900 mb-4">
                  Hình thức thanh toán & ưu đãi
                </CardTitle>

                <div className="mb-4">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full flex items-center justify-between p-4 border-orange-300 hover:bg-orange-50"
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold ${getCurrentPayment().color}`}>
                            {getCurrentPayment().icon}
                          </div>
                          <span className="font-medium text-gray-900">
                            {getCurrentPayment().name}
                          </span>
                        </div>
                        <ChevronDown className="w-5 h-5 text-gray-400" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-lg max-h-[80vh] rounded-xl">
                      <DialogHeader>
                        <DialogTitle className="text-xl font-bold text-gray-900">
                          Chọn phương thức thanh toán
                        </DialogTitle>
                      </DialogHeader>
                      <div className="space-y-3 pt-0">
                        {paymentMethods.map((method) => (
                          <Button
                            key={method.id}
                            variant={selectedPayment === method.id ? "default" : "outline"}
                            className={`w-full flex items-center justify-between p-4 rounded-lg transition ${
                              selectedPayment === method.id
                                ? "bg-orange-50 border-orange-500"
                                : "border-gray-200 hover:border-orange-300"
                            }`}
                            onClick={() => setSelectedPayment(method.id)}
                          >
                            <div className="flex items-center gap-3">
                              <div className={`w-12 h-12 rounded-lg flex items-center justify-center text-xl font-bold ${method.color}`}>
                                {method.icon}
                              </div>
                              <div className="text-left">
                                <div className="font-medium text-gray-900">{method.name}</div>
                              </div>
                            </div>
                            {selectedPayment === method.id && (
                              <div className="w-5 h-5 bg-orange-500 rounded-full flex items-center justify-center">
                                <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                </svg>
                              </div>
                            )}
                          </Button>
                        ))}
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>

                <div className="p-4 bg-orange-50 rounded-lg">
                  <Button variant="ghost" className="w-full flex items-center justify-between p-0 h-auto">
                    <div className="flex items-center gap-3">
                      <Shield className="w-5 h-5 text-orange-500" />
                      <span className="text-sm font-medium text-gray-900">
                        Đơn hàng có Bảo hiểm Food Care
                      </span>
                    </div>
                    <ChevronDown className="w-5 h-5 text-gray-400" />
                  </Button>
                </div>
              </CardHeader>
            </Card>
          </div>

          {/* Cột phải - Tổng tiền */}
          <div className="lg:col-span-1">
            <Card className="border-orange-200 shadow-lg sticky top-24">
              <CardHeader className="p-6">
                <CardTitle className="text-xl font-bold text-gray-900 mb-4">Thanh toán</CardTitle>

                <div className="space-y-3 mb-4 pb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Tạm tính ({cart.items.length} phần)</span>
                    <span className="font-medium text-gray-900">{subtotal.toLocaleString()}đ</span>
                  </div>
                  <Separator className="border-orange-100" />
                  <div className="flex justify-between text-sm">
                    <div className="flex items-center gap-1">
                      <span className="text-gray-600">Phí vận chuyển</span>
                      <AlertCircle className="w-3 h-3 text-gray-400" />
                    </div>
                    <span className="font-medium text-gray-900">{shippingFee.toLocaleString()}đ</span>
                  </div>
                  {discount > 0 && (
                    <>
                      <Separator className="border-orange-100" />
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Giảm giá</span>
                        <Badge variant="secondary" className="font-medium text-green-600">
                          -{discount.toLocaleString()}đ
                        </Badge>
                      </div>
                    </>
                  )}
                </div>

                <div className="space-y-2 mb-6">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-semibold text-gray-900">Tổng số tiền</span>
                    <div className="text-right">
                      <span className="text-sm text-gray-400 line-through block">
                        {(subtotal + (fastDelivery ? 30000 : 25000)).toLocaleString()}đ
                      </span>
                      <span className="text-2xl font-bold text-orange-500">{total.toLocaleString()}đ</span>
                    </div>
                  </div>
                </div>

                <Button className="w-full bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 text-gray-900 font-bold py-4 rounded-lg shadow-md transition">
                  Đặt món
                </Button>

                <div className="mt-4 flex items-start gap-2 text-xs text-gray-500">
                  <AlertCircle className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
                  <p>
                    Bằng việc tiếp tục, bạn đồng ý với{" "}
                    <a href="#" className="text-orange-500 hover:underline">
                      Điều khoản sử dụng
                    </a>{" "}
                    của YummyGo
                  </p>
                </div>
              </CardHeader>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};