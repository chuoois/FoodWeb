import React from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, MapPin, Phone, Clock, Package, CheckCircle2, Loader } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const mockOrderDetails = {
  "001": {
    id: "001",
    restaurant: "Phở Hà Nội",
    status: "delivering",
    items: [
      { name: "Phở Bò Tái", quantity: 1, price: 50000, image: "/ph--b--t-i.jpg" },
      { name: "Phở Gà", quantity: 2, price: 45000, image: "/ph--g-.jpg" }
    ],
    subtotal: 140000,
    delivery: 15000,
    total: 155000,
    date: "2025-11-03 14:30",
    deliveryAddress: "123 Đường Nguyễn Huệ, Quận 1, TP.HCM",
    phone: "0912 345 678",
    notes: "Không cay, nhiều rau sống",
    estimatedTime: "15 phút"
  },
  "002": { /* dữ liệu giữ nguyên */ },
  "003": { /* dữ liệu giữ nguyên */ },
  "004": { /* dữ liệu giữ nguyên */ }
};

export function MyOrderDetailPage() {
  const { id } = useParams();
  const order = mockOrderDetails[id];

  if (!order) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-foreground/60 mb-4">Không tìm thấy đơn hàng</p>
            <Link to="/">
              <Button className="bg-orange-500 text-white">Quay lại</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const getStatusColor = (status) => {
    switch (status) {
      case "delivering": return "bg-blue-100 text-blue-700";
      case "completed": return "bg-green-100 text-green-700";
      case "cancelled": return "bg-red-100 text-red-700";
      default: return "bg-gray-100 text-gray-700";
    }
  };

  const getProgressSteps = () => [
    { label: "Đã đặt hàng", status: "completed" },
    { label: "Đã xác nhận", status: order.status !== "cancelled" ? "completed" : "pending" },
    {
      label: "Đang giao",
      status: order.status === "delivering" ? "active" : order.status === "completed" ? "completed" : "pending"
    },
    { label: "Hoàn thành", status: order.status === "completed" ? "completed" : "pending" }
  ];

  const progressSteps = getProgressSteps();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-orange-500 text-white py-6 px-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/myorder">
              <Button variant="ghost" size="icon" className="text-white hover:bg-white/20">
                <ArrowLeft size={24} />
              </Button>
            </Link>
            <h1 className="text-3xl font-bold">Chi Tiết Đơn Hàng</h1>
          </div>
          <div className={`px-4 py-2 rounded-full font-semibold ${getStatusColor(order.status)}`}>
            {order.status === "delivering"
              ? "Đang giao"
              : order.status === "completed"
                ? "Hoàn thành"
                : "Đã hủy"}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="grid gap-6">

          {/* Progress */}
          {order.status !== "cancelled" && (
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold mb-6 text-center">Tiến Trình Đơn Hàng</h3>
                <div className="flex items-center justify-between gap-2">
                  {progressSteps.map((step, index) => (
                    <div key={index} className="flex flex-col items-center flex-1">
                      <div className="flex items-center gap-2 w-full">
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center text-white ${
                            step.status === "completed"
                              ? "bg-orange-500"
                              : step.status === "active"
                                ? "bg-orange-400 border-2 border-orange-500"
                                : "bg-gray-300"
                          }`}
                        >
                          {step.status === "completed" ? (
                            <CheckCircle2 size={24} />
                          ) : step.status === "active" ? (
                            <Loader size={20} className="animate-spin" />
                          ) : (
                            index + 1
                          )}
                        </div>
                        {index < progressSteps.length - 1 && (
                          <div className={`flex-1 h-1 ${step.status === "completed" ? "bg-orange-500" : "bg-gray-300"}`} />
                        )}
                      </div>
                      <p className="text-xs mt-2 text-foreground/70">{step.label}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Restaurant & Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">{order.restaurant}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Clock size={20} className="text-primary" />
                  <div>
                    <p className="text-sm text-foreground/60">Thời gian đặt hàng</p>
                    <p className="font-semibold">{order.date}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Package size={20} className="text-primary" />
                  <div>
                    <p className="text-sm text-foreground/60">Mã đơn hàng</p>
                    <p className="font-semibold">#{order.id}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Delivery Info */}
          <Card>
            <CardHeader>
              <CardTitle>Thông Tin Giao Hàng</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex gap-3">
                  <MapPin size={20} className="text-primary flex-shrink-0 mt-1" />
                  <div>
                    <p className="text-sm text-foreground/60 mb-1">Địa chỉ giao hàng</p>
                    <p className="font-semibold">{order.deliveryAddress}</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <Phone size={20} className="text-primary flex-shrink-0 mt-1" />
                  <div>
                    <p className="text-sm text-foreground/60 mb-1">Số điện thoại</p>
                    <p className="font-semibold">{order.phone}</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <Clock size={20} className="text-primary flex-shrink-0 mt-1" />
                  <div>
                    <p className="text-sm text-foreground/60 mb-1">Thời gian dự kiến</p>
                    <p className="font-semibold">{order.estimatedTime}</p>
                  </div>
                </div>
                {order.notes && (
                  <div className="pt-3 border-t">
                    <p className="text-sm text-foreground/60 mb-1">Ghi chú</p>
                    <p className="italic">{order.notes}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Order Items */}
          <Card>
            <CardHeader>
              <CardTitle>Chi Tiết Sản Phẩm</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {order.items.map((item, idx) => (
                  <div key={idx} className="flex gap-4 pb-4 border-b last:border-0">
                    <div className="w-20 h-20 flex-shrink-0 bg-gray-200 rounded overflow-hidden">
                      <img
                        src={item.image || "/placeholder.svg"}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 flex justify-between items-start">
                      <div>
                        <p className="font-medium">{item.name}</p>
                        <p className="text-sm text-foreground/60">x {item.quantity}</p>
                      </div>
                      <p className="font-semibold text-orange-500">
                        {(item.price * item.quantity).toLocaleString("vi-VN")}₫
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Price Summary */}
          <Card>
            <CardContent className="p-6">
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-foreground/60">Tạm tính</span>
                  <span className="font-medium">{order.subtotal.toLocaleString("vi-VN")}₫</span>
                </div>
                {order.delivery > 0 && (
                  <div className="flex justify-between">
                    <span className="text-foreground/60">Phí giao hàng</span>
                    <span className="font-medium">{order.delivery.toLocaleString("vi-VN")}₫</span>
                  </div>
                )}
                <div className="border-t pt-3 flex justify-between items-center">
                  <span className="font-semibold text-lg">Tổng cộng</span>
                  <span className="text-2xl font-bold text-orange-500">{order.total.toLocaleString("vi-VN")}₫</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex gap-3">
            {order.status === "completed" && (
              <>
                <Button className="flex-1 bg-orange-500 hover:bg-orange-400 text-white">Đánh Giá Đơn Hàng</Button>
                <Button className="flex-1 variant-secondary bg-transparent" variant="outline">
                  Mua Lại
                </Button>
              </>
            )}
            {order.status === "delivering" && (
              <Button className="w-full bg-orange-500 hover:bg-orange-400 text-white">Theo Dõi Giao Hàng</Button>
            )}
            {order.status === "cancelled" && (
              <Button className="flex-1 bg-orange-500 hover:bg-orange-400 text-white">Đặt Hàng Lại</Button>
            )}
            <Link to="/myorder" className="flex-1">
              <Button variant="outline" className="w-full bg-transparent">
                Quay Lại
              </Button>
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
}
