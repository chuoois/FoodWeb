import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import {
  ArrowLeft,
  MapPin,
  Phone,
  Clock,
  Package,
  CheckCircle2,
  Loader,
  Wallet,
  StickyNote
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getOrderDetail } from "@/services/order.service";

export function MyOrderDetailPage() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  // ✅ Gọi API
  useEffect(() => {
    const fetchDetail = async () => {
      try {
        const res = await getOrderDetail(id);
        setOrder(res.data.data);
      } catch (err) {
        console.error("❌ getOrderDetail error:", err);
        setOrder(null);
      } finally {
        setLoading(false);
      }
    };
    fetchDetail();
  }, [id]);

  // 🌀 Loading
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader size={36} className="animate-spin text-orange-500" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <p className="text-gray-500 mb-4">Không tìm thấy đơn hàng</p>
        <Link to="/myorder">
          <Button className="bg-orange-500 text-white">Quay lại</Button>
        </Link>
      </div>
    );
  }

  // 🧭 Helper
  const formatMoney = (n) =>
    n?.toLocaleString("vi-VN", { style: "currency", currency: "VND" });

  const formatDate = (d) =>
    new Date(d).toLocaleString("vi-VN", { hour12: false });

  const fullAddress = order.delivery_address_id?.address
    ? Object.values(order.delivery_address_id.address)
        .filter(Boolean)
        .join(", ")
    : "—";

  // 🎯 Gộp trạng thái
  // 🎯 Gộp trạng thái
const normalizeStatus = (status) => {
  switch (status) {
    case "PENDING_PAYMENT":
      return { label: "Chờ thanh toán", color: "bg-yellow-100 text-yellow-700" };
    case "PENDING":
      return { label: "Chờ xác nhận", color: "bg-gray-100 text-gray-700" };
    case "CONFIRMED":
      return { label: "Đã xác nhận", color: "bg-blue-100 text-blue-700" };
    case "PREPARING":
      return { label: "Đang chuẩn bị", color: "bg-indigo-100 text-indigo-700" };
    case "SHIPPING":
      return { label: "Đang giao", color: "bg-orange-100 text-orange-700" };
    case "DELIVERED":
      return { label: "Đã giao", color: "bg-green-100 text-green-700" };
    case "CANCELLED":
      return { label: "Đã huỷ", color: "bg-red-100 text-red-700" };
    case "REFUNDED":
      return { label: "Đã hoàn tiền", color: "bg-pink-100 text-pink-700" };
    default:
      return { label: "Không xác định", color: "bg-gray-100 text-gray-700" };
  }
};

const statusInfo = normalizeStatus(order.status);

// ✅ Tiến trình đơn hàng (theo flow thực tế)
const progressSteps = [
  { label: "Chờ thanh toán", active: ["PENDING_PAYMENT", "PENDING", "CONFIRMED", "PREPARING", "SHIPPING", "DELIVERED"].includes(order.status) },
  { label: "Xác nhận", active: ["PENDING", "CONFIRMED", "PREPARING", "SHIPPING", "DELIVERED"].includes(order.status) },
  { label: "Chuẩn bị", active: ["CONFIRMED", "PREPARING", "SHIPPING", "DELIVERED"].includes(order.status) },
  { label: "Đang giao", active: ["SHIPPING", "DELIVERED"].includes(order.status) },
  { label: "Đã giao", active: order.status === "DELIVERED" },
];


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
          <div className={`px-4 py-2 rounded-full font-semibold ${statusInfo.color}`}>
            {statusInfo.label}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">

        {/* Tiến trình */}
        <Card>
          <CardContent className="p-6">
            <h3 className="font-semibold mb-6 text-center">Tiến trình đơn hàng</h3>
            <div className="flex justify-between items-center">
              {progressSteps.map((step, i) => (
                <div key={i} className="flex-1 flex flex-col items-center">
                  <div
                    className={`w-10 h-10 flex items-center justify-center rounded-full text-white ${
                      step.active ? "bg-orange-500" : "bg-gray-300"
                    }`}
                  >
                    {step.active ? <CheckCircle2 size={22} /> : i + 1}
                  </div>
                  {i < progressSteps.length - 1 && (
                    <div
                      className={`h-1 w-full ${
                        progressSteps[i + 1].active ? "bg-orange-500" : "bg-gray-300"
                      }`}
                    ></div>
                  )}
                  <p className="text-xs mt-2">{step.label}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Thông tin cơ bản */}
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">{order.shop_id?.name}</CardTitle>
            <p className="text-sm text-gray-500">
              {order.shop_id?.address?.street}, {order.shop_id?.address?.city}
            </p>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-center gap-2">
              <Package size={18} className="text-primary" />
              <span className="text-sm text-gray-600">
                Mã đơn hàng: <strong>{order.order_code}</strong>
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Clock size={18} className="text-primary" />
              <span className="text-sm text-gray-600">
                Thời gian đặt: {formatDate(order.createdAt)}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <StickyNote  size={18} className="text-primary" />
              <span className="text-sm text-gray-600">
                Ghi chú cho quán: {order.note}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Wallet size={18} className="text-primary" />
              <span className="text-sm text-gray-600">
                Phương thức thanh toán:{" "}
                <strong>{order.payment_method === "PAYOS" ? "PayOS" : "COD"}</strong> (
                {order.payment_status === "PAID" ? "Đã thanh toán" : "Chưa thanh toán"})
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Thông tin giao hàng */}
        <Card>
          <CardHeader>
            <CardTitle>Thông tin giao hàng</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-start gap-2">
              <MapPin className="text-primary mt-1" size={18} />
              <div>
                <p className="text-sm text-gray-500 mb-1">Địa chỉ</p>
                <p className="font-semibold">{fullAddress}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Danh sách món */}
        <Card>
          <CardHeader>
            <CardTitle>Chi tiết món ăn</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {order.items?.map((item) => (
              <div
                key={item._id}
                className="flex gap-4 border-b pb-4 last:border-0"
              >
                <div className="w-20 h-20 flex-shrink-0 rounded overflow-hidden bg-gray-100">
                  <img
                    src={item.food_image_url}
                    alt={item.food_name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1 flex justify-between">
                  <div>
                    <p className="font-medium">{item.food_name}</p>
                    <p className="text-sm text-gray-500">x{item.quantity}</p>
                  </div>
                  <p className="font-semibold text-orange-500">
                    {formatMoney(item.subtotal)}
                  </p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Tổng tiền */}
        <Card>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>Tạm tính</span>
              <span>{formatMoney(order.subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span>Phí giao hàng</span>
              <span>{formatMoney(order.shipping_fee)}</span>
            </div>
            {order.discount_amount > 0 && (
              <div className="flex justify-between">
                <span>Giảm giá</span>
                <span>-{formatMoney(order.discount_amount)}</span>
              </div>
            )}
            <div className="border-t mt-2 pt-2 flex justify-between text-lg font-bold">
              <span>Tổng cộng</span>
              <span className="text-orange-500">{formatMoney(order.total_amount)}</span>
            </div>
          </CardContent>
        </Card>

        {/* Nút hành động */}
        <div className="flex gap-3">
          {order.status === "CANCELED" ? (
            <Button className="flex-1 bg-orange-500 text-white hover:bg-orange-400">
              Đặt lại
            </Button>
          ) : order.status === "COMPLETED" ? (
            <>
              <Button className="flex-1 bg-orange-500 text-white hover:bg-orange-400">
                Đánh giá đơn hàng
              </Button>
              <Button variant="outline" className="flex-1">
                Mua lại
              </Button>
            </>
          ) : (
            <Button className="flex-1 bg-orange-500 text-white hover:bg-orange-400">
              Theo dõi giao hàng
            </Button>
          )}
          <Link to="/myorder" className="flex-1">
            <Button variant="outline" className="w-full">
              Quay lại
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
