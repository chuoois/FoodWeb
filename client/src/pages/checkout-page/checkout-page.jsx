import { useState } from "react";
import {
  MapPin,
  ChevronDown,
  Tag,
  Shield,
  AlertCircle,
  Trash2,
  Edit,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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

export const CheckOutPage = () => {
  const [selectedPayment, setSelectedPayment] = useState("cake");
  const [deliveryAddress, setDeliveryAddress] = useState(
    "Giải Phóng, Giải Phóng, P.Giáp Bát, Q.Hoàng Mai, Hà Nội"
  );
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [fastDelivery, setFastDelivery] = useState(false);

  const cartItems = [
    {
      id: 1,
      name: "Bún bò Huế chả cua",
      price: 55000,
      quantity: 1,
      img: "https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43",
    },
  ];

  const paymentMethods = [
    { id: "cake", name: "Cake by VPBank", icon: "C", color: "bg-pink-100 text-pink-600" },
    { id: "momo", name: "Ví MoMo", icon: "M", color: "bg-purple-100 text-purple-600" },
    { id: "zalopay", name: "ZaloPay", icon: "Z", color: "bg-blue-100 text-blue-600" },
    { id: "credit", name: "Thẻ tín dụng/Ghi nợ", icon: "💳", color: "bg-gray-100 text-gray-600" },
    { id: "cash", name: "Tiền mặt", icon: "💵", color: "bg-green-100 text-green-600" },
  ];

  const subtotal = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  const shippingFee = 76000;
  const discount = 25000;
  const total = subtotal + shippingFee - discount;

  const getCurrentPayment = () => {
    return paymentMethods.find((m) => m.id === selectedPayment);
  };

  return (
    <div className="bg-[#F7EFDF] min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Delivery Section */}
            <Card className="border-orange-100 shadow-sm">
              <CardHeader className="p-6">
                <CardTitle className="text-xl font-bold text-gray-900 mb-4">Giao tới</CardTitle>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700">Địa chỉ</Label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-orange-500 pointer-events-none" />
                      <Input
                        type="text"
                        value={deliveryAddress}
                        onChange={(e) => setDeliveryAddress(e.target.value)}
                        className="w-full pl-10 pr-10 py-3 border-orange-300 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 text-gray-700"
                      />
                      <Button
                        variant="ghost"
                        size="sm"
                        className="absolute right-3 top-1/2 -translate-y-1/2 p-0 h-5 w-5"
                      >
                        <Edit className="w-5 h-5 text-gray-400 hover:text-orange-500" />
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700">Ghi chú cho tài xế</Label>
                    <Input
                      type="text"
                      placeholder="Vd: Bác tài vui lòng gọi trước khi đến giao"
                      className="w-full px-4 py-3 border-orange-300 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 placeholder:text-gray-400"
                    />
                  </div>

                  <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                    <span className="text-sm font-medium text-gray-900">
                      Giao hàng tận cửa chỉ với 5.000đ
                    </span>
                    <Checkbox
                      checked={fastDelivery}
                      onCheckedChange={(checked) => setFastDelivery(!!checked)}
                    />
                  </div>
                </div>
              </CardHeader>
            </Card>

            {/* Order Items */}
            <Card className="border-orange-100 shadow-sm">
              <CardHeader className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <CardTitle className="text-xl font-bold text-gray-900">
                    ĐƠN HÀNG ({cartItems.length})
                  </CardTitle>
                  <Button variant="link" className="text-sm text-orange-500 hover:text-orange-600 font-medium p-0 h-auto">
                    Thêm món
                  </Button>
                </div>

                <div className="space-y-4">
                  {cartItems.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center gap-4 py-4 border-b border-orange-100 last:border-0"
                    >
                      <img
                        src={item.img}
                        alt={item.name}
                        className="w-16 h-16 rounded-lg object-cover"
                      />
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-1">
                          <div>
                            <span className="text-sm font-medium text-gray-900">
                              {item.quantity}X
                            </span>
                            <span className="ml-2 text-sm font-semibold text-gray-900">
                              {item.name}
                            </span>
                          </div>
                          <Button variant="ghost" size="sm" className="text-gray-400 hover:text-red-500 p-0 h-auto">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                        <Button variant="link" className="text-xs text-orange-500 hover:underline p-0 h-auto">
                          Chỉnh sửa món
                        </Button>
                        <div className="mt-2 text-sm font-semibold text-gray-900">
                          {item.price.toLocaleString()}đ
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardHeader>
            </Card>

            {/* Payment Method */}
            <Card className="border-orange-100 shadow-sm">
              <CardHeader className="p-6">
                <CardTitle className="text-xl font-bold text-gray-900 mb-4">
                  Hình thức thanh toán & ưu đãi
                </CardTitle>

                <div className="mb-4">
                  <Dialog open={showPaymentModal} onOpenChange={setShowPaymentModal}>
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
                            className={`w-full flex items-center justify-between p-4 rounded-lg transition ${selectedPayment === method.id ? "bg-orange-50 border-orange-500" : "border-gray-200 hover:border-orange-300"}`}
                            onClick={() => {
                              setSelectedPayment(method.id);
                              setShowPaymentModal(false);
                            }}
                          >
                            <div className="flex items-center gap-3">
                              <div className={`w-12 h-12 rounded-lg flex items-center justify-center text-xl font-bold ${method.color}`}>
                                {method.icon}
                              </div>
                              <div className="text-left">
                                <div className="font-medium text-gray-900">
                                  {method.name}
                                </div>
                              </div>
                            </div>
                            {selectedPayment === method.id && (
                              <div className="w-5 h-5 bg-orange-500 rounded-full flex items-center justify-center">
                                <svg
                                  className="w-3 h-3 text-white"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={3}
                                    d="M5 13l4 4L19 7"
                                  />
                                </svg>
                              </div>
                            )}
                          </Button>
                        ))}
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>

                <div className="mb-4 space-y-2">
                  <div className="flex items-center gap-2">
                    <Tag className="w-4 h-4 text-orange-500" />
                    <span className="text-sm font-medium text-gray-900">
                      Đã áp dụng 1 mã KM
                    </span>
                    <Button variant="link" className="ml-auto text-sm text-orange-500 hover:underline font-medium p-0 h-auto">
                      Chọn mã
                    </Button>
                  </div>
                  <p className="text-xs text-gray-500">
                    Bạn có thể áp dụng nhiều mã giảm giá một lúc
                  </p>
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

          {/* Right Column - Summary */}
          <div className="lg:col-span-1">
            <Card className="border-orange-200 shadow-lg sticky top-24">
              <CardHeader className="p-6">
                <CardTitle className="text-xl font-bold text-gray-900 mb-4">
                  Thanh toán
                </CardTitle>

                <div className="space-y-3 mb-4 pb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Tạm tính (1 phần)</span>
                    <span className="font-medium text-gray-900">
                      {subtotal.toLocaleString()}đ
                    </span>
                  </div>
                  <Separator className="border-orange-100" />
                  <div className="flex justify-between text-sm">
                    <div className="flex items-center gap-1">
                      <span className="text-gray-600">Phí áp dụng</span>
                      <AlertCircle className="w-3 h-3 text-gray-400" />
                    </div>
                    <span className="font-medium text-gray-900">
                      {shippingFee.toLocaleString()}đ
                    </span>
                  </div>
                  <Separator className="border-orange-100" />
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">[Chào bạn mới] - Giá...</span>
                    <Badge variant="secondary" className="font-medium text-green-600">
                      -{discount.toLocaleString()}đ
                    </Badge>
                  </div>
                </div>

                <div className="space-y-2 mb-6">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-semibold text-gray-900">
                      Tổng số tiền
                    </span>
                    <div className="text-right">
                      <span className="text-sm text-gray-400 line-through block">
                        {(subtotal + shippingFee).toLocaleString()}đ
                      </span>
                      <span className="text-2xl font-bold text-orange-500">
                        {total.toLocaleString()}đ
                      </span>
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