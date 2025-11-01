import { useState, useEffect } from "react"
import { Package, Search, X, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table"
import { OrderDetailDialog } from "./order-detail"
import useDebounce from "@/hooks/useDebounce"

const STATUS_CONFIG = {
  PENDING_PAYMENT: { label: "Chờ thanh toán", color: "text-orange-600", bgColor: "bg-orange-100" },
  PENDING: { label: "Chờ xác nhận", color: "text-yellow-600", bgColor: "bg-yellow-100" },
  CONFIRMED: { label: "Đã xác nhận", color: "text-blue-600", bgColor: "bg-blue-100" },
  PREPARING: { label: "Đang chuẩn bị", color: "text-purple-600", bgColor: "bg-purple-100" },
  SHIPPING: { label: "Đang giao", color: "text-indigo-600", bgColor: "bg-indigo-100" },
  DELIVERED: { label: "Đã giao", color: "text-green-600", bgColor: "bg-green-100" },
  CANCELLED: { label: "Đã hủy", color: "text-red-600", bgColor: "bg-red-100" },
  REFUNDED: { label: "Đã hoàn tiền", color: "text-gray-600", bgColor: "bg-gray-100" },
}

export function OrdersList() {
  const [orders, setOrders] = useState([])
  const [search, setSearch] = useState("")
  const [loading, setLoading] = useState(true)
  const [selectedStatus, setSelectedStatus] = useState("ALL")
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [isDetailOpen, setIsDetailOpen] = useState(false)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  const debouncedSearch = useDebounce(search, 500)

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true)
        const params = new URLSearchParams({
          page: page.toString(),
          limit: "10",
          search: debouncedSearch,
          status: selectedStatus !== "ALL" ? selectedStatus : "",
          sort_by: "created_at",
          sort_order: "desc",
        })
        const res = await fetch(`/api/orders?${params}`)
        const data = await res.json()

        setOrders(data.data?.orders || [])
        setTotalPages(data.data?.pagination?.total_pages || 1)
      } catch (error) {
        console.error("Error fetching orders:", error)
      } finally {
        setLoading(false)
      }
    }
    fetchOrders()
  }, [debouncedSearch, selectedStatus, page])

  const getStatusBadge = (status) => {
    const config = STATUS_CONFIG[status] || STATUS_CONFIG.PENDING
    return (
      <span className={`inline-block rounded-full px-3 py-1 text-xs font-medium ${config.color} ${config.bgColor}`}>
        {config.label}
      </span>
    )
  }

  const formatDate = (date) =>
    new Date(date).toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    })

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-2" />
          <p className="text-muted-foreground">Đang tải đơn hàng...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8">
        
      <div className="mb-8">
        <h1 className="text-3xl font-semibold">Quản lý món ăn</h1>
        <p className="text-muted-foreground">
          Danh sách tất cả món ăn trong cửa hàng
        </p>
      </div>
      {/* 🔍 Thanh tìm kiếm + filter */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-4">
            <div className="relative flex-1 max-w-sm">
          
              <input
                type="text"
                placeholder="Tìm mã đơn hàng hoặc cửa hàng..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="border p-2 rounded-md w-full pr-10"
              />
              {search && (
                <button
                  onClick={() => setSearch("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            <select
              value={selectedStatus}
              onChange={(e) => {
                setSelectedStatus(e.target.value)
                setPage(1)
              }}
              className="rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="ALL">Tất cả trạng thái</option>
              {Object.entries(STATUS_CONFIG).map(([key, config]) => (
                <option key={key} value={key}>
                  {config.label}
                </option>
              ))}
            </select>
          </div>
      <Card>

        <CardContent>         
          {/* Bảng đơn hàng */}
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow >
                  <TableHead>Mã đơn</TableHead>
                  <TableHead>Cửa hàng</TableHead>
                  <TableHead>Ngày đặt</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead>Tổng tiền</TableHead>
                  <TableHead>Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <Package className="h-8 w-8 text-muted-foreground" />
                        <p className="text-muted-foreground">Không có đơn hàng nào</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  orders.map((order) => (
                    <TableRow key={order._id} className="hover:bg-muted/50 transition-colors">
                      <TableCell className="font-mono font-semibold text-sm">{order.order_code}</TableCell>
                      <TableCell className="text-sm">{order.shop_id?.name || "-"}</TableCell>
                      <TableCell className="text-sm">{formatDate(order.created_at)}</TableCell>
                      <TableCell>{getStatusBadge(order.status)}</TableCell>
                      <TableCell className="font-semibold text-green-600">
                        {order.total_amount.toLocaleString("vi-VN")}đ
                      </TableCell>
                      <TableCell>
                        <Button size="sm" variant="outline" onClick={() => setSelectedOrder(order)}>
                          Xem chi tiết
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Phân trang */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-4">
              <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>
                Trang trước
              </Button>
              <span className="text-sm text-muted-foreground px-3">
                Trang {page} / {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={page === totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              >
                Trang sau
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialog chi tiết */}
      {selectedOrder && (
        <OrderDetailDialog
          order={selectedOrder}
          isOpen={isDetailOpen}
          onClose={() => {
            setIsDetailOpen(false)
            setSelectedOrder(null)
          }}
        />
      )}
    </div>
  )
}
