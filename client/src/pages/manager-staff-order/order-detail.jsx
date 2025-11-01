"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table"
import { Loader2, Calendar, DollarSign, Truck, Clock } from "lucide-react"

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
  const [orderDetails, setOrderDetails] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (isOpen) {
      const fetchOrderDetails = async () => {
        try {
          setLoading(true)
          const res = await fetch(`/api/orders/${order._id}/details`)
          const data = await res.json()
          setOrderDetails(data.data?.details || [])
        } catch (error) {
          console.error("Error fetching order details:", error)
        } finally {
          setLoading(false)
        }
      }

      fetchOrderDetails()
    }
  }, [isOpen, order._id])

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const statusConfig = STATUS_CONFIG[order.status] || STATUS_CONFIG.PENDING

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">Chi tiết đơn hàng</DialogTitle>
          <DialogDescription>
            Mã đơn: <span className="font-mono font-semibold text-foreground">{order.order_code}</span>
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center h-40">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <Card>
                <CardContent className="pt-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <p className="text-sm font-medium text-muted-foreground">Trạng thái</p>
                  </div>
                  <p className={`text-lg font-semibold ${statusConfig.color}`}>{statusConfig.label}</p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-4">
                  <div className="flex items-center gap-2 mb-2">
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                    <p className="text-sm font-medium text-muted-foreground">Thanh toán</p>
                  </div>
                  <p className="text-lg font-semibold">{order.payment_method === "COD" ? "Tiền mặt" : "PayOS"}</p>
                  <p className={`text-sm ${order.payment_status === "PAID" ? "text-green-600" : "text-orange-600"}`}>
                    {order.payment_status === "PAID" ? "Đã thanh toán" : "Chưa thanh toán"}
                  </p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Các món ăn trong đơn hàng</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/50">
                        <TableHead className="font-semibold">Tên món</TableHead>
                        <TableHead className="text-center font-semibold">Số lượng</TableHead>
                        <TableHead className="text-right font-semibold">Đơn giá</TableHead>
                        <TableHead className="text-right font-semibold">Thành tiền</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {orderDetails.map((detail) => {
                        const finalPrice = detail.unit_price - (detail.unit_price * detail.discount_percent) / 100
                        return (
                          <TableRow key={detail._id}>
                            <TableCell className="font-medium">{detail.food_name}</TableCell>
                            <TableCell className="text-center">{detail.quantity}</TableCell>
                            <TableCell className="text-right">
                              <div>
                                <p className="font-medium">{detail.unit_price.toLocaleString("vi-VN")}đ</p>
                                {detail.discount_percent > 0 && (
                                  <p className="text-xs text-orange-600">-{detail.discount_percent}%</p>
                                )}
                              </div>
                            </TableCell>
                            <TableCell className="text-right font-semibold text-green-600">
                              {(finalPrice * detail.quantity).toLocaleString("vi-VN")}đ
                            </TableCell>
                          </TableRow>
                        )
                      })}
                    </TableBody>
                  </Table>
                </div>

                {orderDetails.length === 0 && (
                  <p className="text-center py-4 text-muted-foreground">Không có món ăn nào</p>
                )}
              </CardContent>
            </Card>

            <Card className="bg-muted/50">
              <CardContent className="pt-6 space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Tạm tính:</span>
                  <span className="font-medium">{order.subtotal.toLocaleString("vi-VN")}đ</span>
                </div>
                {order.discount_amount > 0 && (
                  <div className="flex justify-between text-orange-600">
                    <span>Giảm giá:</span>
                    <span>-{order.discount_amount.toLocaleString("vi-VN")}đ</span>
                  </div>
                )}
                {order.shipping_fee > 0 && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Phí giao hàng:</span>
                    <span className="font-medium">{order.shipping_fee.toLocaleString("vi-VN")}đ</span>
                  </div>
                )}
                <div className="border-t border-border pt-2 flex justify-between text-lg font-bold">
                  <span>Tổng cộng:</span>
                  <span className="text-primary">{order.total_amount.toLocaleString("vi-VN")}đ</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Truck className="h-4 w-4" />
                  Thông tin giao hàng
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-start gap-2">
                  <Calendar className="h-4 w-4 mt-1 text-muted-foreground flex-shrink-0" />
                  <div>
                    <p className="text-sm text-muted-foreground">Dự kiến giao:</p>
                    <p className="font-medium">{formatDate(order.estimated_delivery_time || order.created_at)}</p>
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
        )}
      </DialogContent>
    </Dialog>
  )
}

