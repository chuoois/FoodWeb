"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card"
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table"
import {
  Calendar,
  DollarSign,
  Truck,
  Clock,
  User,
  MapPin,
  Tag,
} from "lucide-react"

const STATUS_CONFIG = {
  PENDING_PAYMENT: { label: "Chờ thanh toán", color: "text-orange-600" },
  PENDING: { label: "Chờ xác nhận", color: "text-yellow-600" },
  CONFIRMED: { label: "Đã xác nhận", color: "text-blue-600" },
  PREPARING: { label: "Đang chuẩn bị", color: "text-purple-600" },
  SHIPPING: { label: "Đang giao", color: "text-indigo-600" },
  DELIVERED: { label: "Đã giao", color: "text-green-600" },
  CANCELLED: { label: "Đã hủy", color: "text-red-600" },
  REFUNDED: { label: "Đã hoàn tiền", color: "text-gray-600" },
}

export function OrderDetailDialog({ order, isOpen, onClose }) {
  // ✅ Xử lý danh sách món ăn kể cả khi không có order.details
  const [orderDetails] = useState(() => {
  if (Array.isArray(order.details) && order.details.length > 0) {
    return order.details;
  }

  // ✅ Tự động tách tên món, số lượng và ảnh thành từng dòng riêng
  const names = order.order_name ? order.order_name.split(",").map(n => n.trim()) : [];
  const quantities = order.quantity ? order.quantity.split(",").map(q => q.trim()) : [];
  const images = Array.isArray(order.images) ? order.images : [];

  // ✅ Gộp lại thành danh sách món chi tiết
  return names.map((name, index) => ({
    _id: `${order._id}-${index}`,
    food_name: name,
    quantity: Number(quantities[index]) || 1,
    unit_price:
      order.subtotal && names.length > 0
        ? Number(order.subtotal) / names.length
        : Number(order.subtotal) || 0,
    discount_percent: 0,
    note: order.note || "",
    food_image_url: images[index] || "",
  }));
});


  const formatDate = (date) => {
    if (!date) return "-"
    return new Date(date).toLocaleString("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const formatAddress = (addressObj) => {
    if (!addressObj?.address) return "-"
    const addr = addressObj.address
    const parts = [addr.street, addr.ward, addr.district, addr.city, addr.province].filter(Boolean)
    return parts.join(", ")
  }

  const statusConfig = STATUS_CONFIG[order.status] || STATUS_CONFIG.PENDING

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">Chi tiết đơn hàng</DialogTitle>
          <DialogDescription>
            Mã đơn:{" "}
            <span className="font-mono font-semibold text-foreground">
              {order.order_code}
            </span>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* ==== THÔNG TIN KHÁCH HÀNG ==== */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <User className="h-4 w-4" />
                Thông tin khách hàng
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Họ tên:</span>
                <span className="font-medium">{order.customer_id?.full_name || "-"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Số điện thoại:</span>
                <span className="font-medium">{order.customer_id?.phone || "-"}</span>
              </div>
            </CardContent>
          </Card>

          {/* ==== TRẠNG THÁI & THANH TOÁN ==== */}
          <div className="grid grid-cols-2 gap-4">
            <Card>
              <CardContent className="pt-4">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <p className="text-sm font-medium text-muted-foreground">Trạng thái</p>
                </div>
                <p className={`text-lg font-semibold ${statusConfig.color}`}>
                  {statusConfig.label}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-4">
                <div className="flex items-center gap-2 mb-2">
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                  <p className="text-sm font-medium text-muted-foreground">Thanh toán</p>
                </div>
                <p className="text-lg font-semibold">
                  {order.payment_method === "COD" ? "Tiền mặt" : "PayOS"}
                </p>
                <p
                  className={`text-sm ${order.status === "DELIVERED" || order.payment_status === "PAID"
                      ? "text-green-600"
                      : "text-orange-600"
                    }`}
                >
                  {order.status === "DELIVERED" || order.payment_status === "PAID"
                    ? "Đã thanh toán"
                    : "Chưa thanh toán"}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* ==== DANH SÁCH MÓN ĂN ==== */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Các món ăn trong đơn hàng</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                     <TableHead className="font-semibold w-[80px] text-center">Ảnh</TableHead>
                      <TableHead className="font-semibold">Tên món</TableHead>
                      <TableHead className="text-center font-semibold">SL</TableHead>
                      <TableHead className="text-center font-semibold">Đơn giá</TableHead>
                      <TableHead className="text-center font-semibold">Ghi chú</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {orderDetails.length > 0 ? (
                      orderDetails.map((detail) => {
                        const finalPrice =
                          detail.unit_price -
                          (detail.unit_price * (detail.discount_percent || 0)) / 100
                        return (
                      <TableRow key={detail._id}>
  <TableCell className="text-center">
    <img
      src={detail.food_image_url || "/images/no-image.png"}
      alt={detail.food_name || "Món ăn"}
      className="w-14 h-14 object-cover rounded-md border"
    />
  </TableCell>

  <TableCell className="font-medium">
    {detail.food_name || detail.order_name}
  </TableCell>
  <TableCell className="text-center">{detail.quantity}</TableCell>
  <TableCell className="text-center">
    <p className="font-medium">
      {detail.unit_price.toLocaleString("vi-VN")}đ
    </p>
    {detail.discount_percent > 0 && (
      <p className="text-xs text-orange-600">
        -{detail.discount_percent}%
      </p>
    )}
  </TableCell>
  <TableCell className="text-center font-medium">
    {detail.note || "Ghi chú trống"}
  </TableCell>
</TableRow>
                        )
                      })
                    ) : (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-4 text-muted-foreground">
                          Không có món ăn nào
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          {/* ==== TỔNG TIỀN & VOUCHER ==== */}
          <Card className="bg-muted/50">
            <CardContent className="pt-6 space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Tạm tính:</span>
                <span className="font-medium">{order.subtotal.toLocaleString("vi-VN")}đ</span>
              </div>

              {order.discount_amount > 0 ? (
                <div className="flex justify-between text-orange-600">
                  <div className="flex items-center gap-1">
                    <Tag className="h-4 w-4" />
                    <span>Giảm giá</span>
                  </div>
                  <span>-{order.discount_amount.toLocaleString("vi-VN")}đ</span>
                </div>
              ) : (
                <div className="flex justify-between text-muted-foreground">
                  <span>Không có giảm giá</span>
                  <span>0đ</span>
                </div>
              )}

              {order.shipping_fee > 0 && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Phí giao hàng:</span>
                  <span className="font-medium">
                    {order.shipping_fee.toLocaleString("vi-VN")}đ
                  </span>
                </div>
              )}

              <div className="border-t border-border pt-2 flex justify-between text-lg font-bold">
                <span>Tổng cộng:</span>
                <span className="text-primary">
                  {order.total_amount.toLocaleString("vi-VN")}đ
                </span>
              </div>
            </CardContent>
          </Card>

          {/* ==== ĐỊA CHỈ GIAO HÀNG ==== */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Truck className="h-4 w-4" />
                Thông tin giao hàng
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-start gap-2">
                <MapPin className="h-4 w-4 mt-1 text-muted-foreground flex-shrink-0" />
                <div>
                  <p className="text-sm text-muted-foreground">Địa chỉ:</p>
                  <p className="font-medium">
                    {order.delivery_address_id
                      ? formatAddress(order.delivery_address_id)
                      : "Không có địa chỉ"}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <Calendar className="h-4 w-4 mt-1 text-muted-foreground flex-shrink-0" />
                <div>
                  <p className="text-sm text-muted-foreground">Ngày tạo đơn:</p>
                  <p className="font-medium">{formatDate(order.createdAt)}</p>
                </div>
              </div>

              {order.note && (
                <div className="border-t border-border pt-3">
                  <p className="text-sm text-muted-foreground mb-1">Ghi chú:</p>
                  <p className="text-sm">{order.note}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  )
}
