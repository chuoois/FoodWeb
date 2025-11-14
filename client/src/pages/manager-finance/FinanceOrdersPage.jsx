import { useEffect, useState, useMemo } from "react"
import { format } from "date-fns"
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Pagination } from "@/components/ui/pagination"
import { CheckSquare, Search, Calendar, Store, User, Package, DollarSign } from "lucide-react"
import { getAllCompletedOrders } from "@/services/order.service"

const ITEMS_PER_PAGE = 10

export function FinanceOrdersPage() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Filters
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedShop, setSelectedShop] = useState("all")
  const [dateFilter, setDateFilter] = useState("all")
  const [currentPage, setCurrentPage] = useState(1)

  // Dialog
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [dialogOpen, setDialogOpen] = useState(false)

  // Format
  const formatVND = (amount) =>
    new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(amount)

  const formatDate = (date) =>
    format(new Date(date), "dd/MM/yyyy HH:mm")

  // Helper: class màu cho COD / PAYOS
  const amountColorClass = (method) =>
    method === "COD" ? "text-red-600" : "text-green-600"

  // Fetch data
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true)
        const response = await getAllCompletedOrders({ limit: 500 })
        const validOrders = response.data.data
          .filter((o) => o.shop_id)
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        setOrders(validOrders)
      } catch (err) {
        setError("Không thể tải dữ liệu đơn hàng")
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchOrders()
  }, [])

  // Extract unique shops
  const shops = useMemo(() => {
    const unique = [...new Set(orders.map((o) => o.shop_id?._id))]
    return unique.map((id) => {
      const shop = orders.find((o) => o.shop_id?._id === id)?.shop_id
      return { _id: id, name: shop?.name || "Không xác định" }
    })
  }, [orders])

  // Filter logic
  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const matchesSearch =
        order.order_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (order.customer_id?.full_name || "")
          .toLowerCase()
          .includes(searchTerm.toLowerCase())

      const matchesShop = selectedShop === "all" || order.shop_id?._id === selectedShop

      const orderDate = new Date(order.createdAt)
      const today = new Date()
      today.setHours(0, 0, 0, 0)

      const matchesDate =
        dateFilter === "all" ||
        (dateFilter === "today" &&
          orderDate.toDateString() === today.toDateString()) ||
        (dateFilter === "yesterday" &&
          orderDate.toDateString() ===
            new Date(today.getTime() - 86400000).toDateString()) ||
        (dateFilter === "week" &&
          orderDate >= new Date(today.getTime() - 7 * 86400000))

      return matchesSearch && matchesShop && matchesDate
    })
  }, [orders, searchTerm, selectedShop, dateFilter])

  // Pagination
  const paginatedOrders = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE
    return filteredOrders.slice(start, start + ITEMS_PER_PAGE)
  }, [filteredOrders, currentPage])

  const totalPages = Math.ceil(filteredOrders.length / ITEMS_PER_PAGE)

  // Tổng hợp doanh thu theo phương thức
  const { codTotal, payosTotal } = useMemo(() => {
    const cod = filteredOrders
      .filter((o) => o.payment_method === "COD")
      .reduce((sum, o) => sum + o.total_amount, 0)

    const payos = filteredOrders
      .filter((o) => o.payment_method === "PAYOS")
      .reduce((sum, o) => sum + o.total_amount, 0)

    return { codTotal: cod, payosTotal: payos }
  }, [filteredOrders])

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <Card>
          <CardHeader>
            <Skeleton className="h-8 w-64" />
          </CardHeader>
          <CardContent className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-6">
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6 text-red-600 text-center">{error}</CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <CheckSquare className="w-7 h-7 text-green-500" />
            Đơn hàng hoàn thành
            <Badge variant="secondary" className="ml-2">
              {filteredOrders.length} đơn
            </Badge>
          </h1>
          <div className="flex gap-3 mt-2 text-sm">
            <Badge className="bg-red-500 text-white flex items-center gap-1">
              <DollarSign className="w-3 h-3" />
              COD: {formatVND(codTotal)}
            </Badge>
            <Badge className="bg-green-500 text-white flex items-center gap-1">
              <DollarSign className="w-3 h-3" />
              PAYOS: {formatVND(payosTotal)}
            </Badge>
          </div>
        </div>
      </div>

      {/* Filters */}
      <Card className="shadow-sm">
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top- 3 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Tìm mã đơn, khách hàng..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value)
                  setCurrentPage(1)
                }}
                className="pl-10"
              />
            </div>

            <Select value={selectedShop} onValueChange={setSelectedShop}>
              <SelectTrigger>
                <Store className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Tất cả cửa hàng" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả cửa hàng</SelectItem>
                {shops.map((shop) => (
                  <SelectItem key={shop._id} value={shop._id}>
                    {shop.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={dateFilter} onValueChange={setDateFilter}>
              <SelectTrigger>
                <Calendar className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Thời gian" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả thời gian</SelectItem>
                <SelectItem value="today">Hôm nay</SelectItem>
                <SelectItem value="yesterday">Hôm qua</SelectItem>
                <SelectItem value="week">7 ngày qua</SelectItem>
              </SelectContent>
            </Select>

            <Button
              variant="outline"
              onClick={() => {
                setSearchTerm("")
                setSelectedShop("all")
                setDateFilter("all")
                setCurrentPage(1)
              }}
            >
              Xóa bộ lọc
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card className="shadow-lg border-0">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50">
                  <TableHead className="font-bold">Mã đơn</TableHead>
                  <TableHead className="font-bold">Đơn</TableHead>
                  <TableHead>Cửa hàng</TableHead>
                  <TableHead>Khách hàng</TableHead>
                  <TableHead>Ngày đặt</TableHead>
                  <TableHead>Sản phẩm</TableHead>
                  <TableHead className="text-right font-bold">Tổng tiền</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedOrders.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-12 text-gray-500">
                      Không tìm thấy đơn hàng nào
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedOrders.map((order) => (
                    <TableRow
                      key={order._id}
                      className="hover:bg-gray-50 transition-colors cursor-pointer"
                      onClick={() => {
                        setSelectedOrder(order)
                        setDialogOpen(true)
                      }}
                    >
                      <TableCell className="font-mono font-semibold text-blue-600">
                        {order.order_code}
                      </TableCell>

                      {/* CỘT ĐƠN */}
                      <TableCell>
                        <Badge
                          variant={order.payment_method === "COD" ? "destructive" : "default"}
                          className={
                            order.payment_method === "COD"
                              ? "bg-red-500 text-white"
                              : "bg-green-500 text-white"
                          }
                        >
                          {order.payment_method === "COD" ? "COD" : "PAYOS"}
                        </Badge>
                      </TableCell>

                      <TableCell className="max-w-xs">
                        <div className="flex items-center gap-2">
                          <Store className="w-4 h-4 text-gray-400" />
                          <span className="truncate font-medium">
                            {order.shop_id?.name || "N/A"}
                          </span>
                        </div>
                      </TableCell>

                      <TableCell>
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-gray-400" />
                          {order.customer_id?.full_name || "Khách lẻ"}
                        </div>
                      </TableCell>

                      <TableCell className="whitespace-nowrap text-sm">
                        {formatDate(order.createdAt)}
                      </TableCell>

                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Package className="w-4 h-4 text-gray-400" />
                          <span className="text-sm">{order.items.length} món</span>
                          {order.items.length > 0 && (
                            <img
                              src={order.items[0].food_image_url}
                              alt={order.items[0].food_name}
                              className="w-8 h-8 rounded object-cover ml-2 border"
                            />
                          )}
                        </div>
                      </TableCell>

                      {/* CỘT TỔNG TIỀN – MÀU ĐỎ CHO COD */}
                      <TableCell
                        className={`text-right font-bold text-lg ${amountColorClass(
                          order.payment_method
                        )}`}
                      >
                        {formatVND(order.total_amount)}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="border-t p-4">
              <Pagination>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                >
                  Trước
                </Button>
                <span className="mx-4 text-sm text-gray-600">
                  Trang {currentPage} / {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                >
                  Sau
                </Button>
              </Pagination>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialog chi tiết đơn hàng */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-3xl max-h-screen overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl">
              Chi tiết đơn hàng: {selectedOrder?.order_code}
            </DialogTitle>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-6 mt-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium">Cửa hàng:</span> {selectedOrder.shop_id?.name}
                </div>
                <div>
                  <span className="font-medium">Khách hàng:</span>{" "}
                  {selectedOrder.customer_id?.full_name || "Khách lẻ"}
                </div>
                <div>
                  <span className="font-medium">Thời gian:</span>{" "}
                  {formatDate(selectedOrder.createdAt)}
                </div>
                <div>
                  <span className="font-medium">Phương thức:</span>{" "}
                  <Badge
                    variant={selectedOrder.payment_method === "COD" ? "destructive" : "default"}
                    className={
                      selectedOrder.payment_method === "COD"
                        ? "bg-red-500 text-white"
                        : "bg-green-500 text-white"
                    }
                  >
                    {selectedOrder.payment_method === "COD" ? "COD (Quán thu)" : "PAYOS (Web thu)"}
                  </Badge>
                </div>
                <div>
                  <span className="font-medium">Phí ship:</span>{" "}
                  {formatVND(selectedOrder.shipping_fee)}
                </div>
                <div>
                  <span className="font-medium">Trạng thái TT:</span>{" "}
                  <Badge
                    variant={
                      selectedOrder.payment_status === "PAID" ||
                      selectedOrder.payment_status === "COD_PENDING"
                        ? "default"
                        : "secondary"
                    }
                  >
                    {selectedOrder.payment_status === "PAID"
                      ? "Đã thanh toán"
                      : selectedOrder.payment_status === "COD_PENDING"
                      ? "Chờ thu hộ"
                      : selectedOrder.payment_status}
                  </Badge>
                </div>
              </div>

              {/* Danh sách món ăn */}
              <div>
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  <Package className="w-5 h-5" />
                  Danh sách món ăn
                </h4>
                <div className="space-y-3">
                  {selectedOrder.items.map((item) => (
                    <div
                      key={item._id}
                      className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg"
                    >
                      <img
                        src={item.food_image_url}
                        alt={item.food_name}
                        className="w-16 h-16 rounded-lg object-cover border"
                      />
                      <div className="flex-1">
                        <p className="font-medium">{item.food_name}</p>
                        <p className="text-sm text-gray-600">
                          {formatVND(item.unit_price)} × {item.quantity}
                        </p>
                      </div>
                      <p className="font-semibold text-green-600">
                        {formatVND(item.subtotal)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {selectedOrder.note && (
                <div>
                  <Label>Ghi chú</Label>
                  <p className="mt-1 text-sm bg-yellow-50 p-3 rounded border">
                    {selectedOrder.note}
                  </p>
                </div>
              )}

              <div className="border-t pt-4">
                <div className="flex justify-between text-lg font-bold">
                  <span>Tổng cộng</span>
                  {/* MÀU ĐỎ CHO COD trong dialog (tùy chọn) */}
                  <span className={amountColorClass(selectedOrder.payment_method)}>
                    {formatVND(selectedOrder.total_amount)}
                  </span>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}