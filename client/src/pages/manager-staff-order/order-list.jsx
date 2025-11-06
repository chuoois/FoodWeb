import { useState, useEffect, useRef, useCallback } from "react"
import { Package, X, Loader2, Clock, CheckCircle2, Truck, PackageCheck, XCircle,Eye } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table"
import { OrderDetailDialog } from "./order-detail"
import { getShopOrders, connectOrderSSE, disconnectOrderSSE, acceptOrder, updateOrderStatus } from "@/services/orderManage.service"
import toast from "react-hot-toast"
import useDebounce from "@/hooks/useDebounce"

/**
 * Ghi chú:
 * - connectOrderSSE nên trả về EventSource (hoặc null nếu không thể kết nối)
 * - disconnectOrderSSE() sẽ đóng kết nối toàn cục (nếu service quản lý singleton)
 */

const STATUS_CONFIG = {
  PENDING: {
    label: "Chờ xác nhận",
    color: "text-yellow-600",
    bgColor: "bg-yellow-100",
    icon: Clock,
  },
  CONFIRMED: {
    label: "Đã xác nhận",
    color: "text-blue-600",
    bgColor: "bg-blue-100",
    icon: CheckCircle2,
  },
  SHIPPING: {
    label: "Đang giao",
    color: "text-indigo-600",
    bgColor: "bg-indigo-100",
    icon: Truck,
  },
  DELIVERED: {
    label: "Đã giao",
    color: "text-green-600",
    bgColor: "bg-green-100",
    icon: PackageCheck,
  },
  CANCELLED: {
    label: "Đã hủy",
    color: "text-red-600",
    bgColor: "bg-red-100",
    icon: XCircle,
  },
}

const safeNumber = (v) => {
  const n = Number(v)
  return Number.isFinite(n) ? n : 0
}

const sortByCreatedDesc = (a, b) => {
  const ta = a.created_at ? new Date(a.created_at).getTime() : 0
  const tb = b.created_at ? new Date(b.created_at).getTime() : 0
  return tb - ta
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
  const [error, setError] = useState(null)

  const debouncedSearch = useDebounce(search, 500)

  // refs để tránh race & giữ eventSource handle
  const fetchAbortRef = useRef(null)
  const mountedRef = useRef(true)
  const eventSourceRef = useRef(null)

  // Helper: merge SSE data vào state (không replace toàn bộ)
  const mergeOrderFromSSE = useCallback((incoming) => {
    if (!incoming || !incoming._id) return

    // Validate created_at - nếu không có created_at, giữ nguyên nếu tồn tại, hoặc set thời điểm hiện tại
    if (!incoming.created_at) incoming.created_at = new Date().toISOString()

    setOrders((prev) => {
      // Nếu prev rỗng, trả về mảng 1 phần tử
      const idx = prev.findIndex((o) => o._id === incoming._id)
      if (idx !== -1) {
        const clone = [...prev]
        clone[idx] = { ...clone[idx], ...incoming }
        return clone.sort(sortByCreatedDesc)
      } else {
        // push mới lên đầu, giữ tối đa 200 item để tránh phình bộ nhớ
        const merged = [incoming, ...prev]
        merged.sort(sortByCreatedDesc)
        return merged.slice(0, 200)
      }
    })
  }, [])

  // Fetch orders (safe) - dùng AbortController để cancel requests cũ
  useEffect(() => {
    mountedRef.current = true
    const fetchOrders = async () => {
      if (fetchAbortRef.current) {
        fetchAbortRef.current.abort()
      }
      const ac = new AbortController()
      fetchAbortRef.current = ac

      setLoading(true)
      setError(null)

      try {
        const params = {
          page,
          limit: 10,
          search: debouncedSearch || undefined,
          status: selectedStatus !== "ALL" ? selectedStatus : undefined,
          sort_by: "created_at",
          sort_order: "desc",
        }

        const res = await getShopOrders(params, { signal: ac.signal }) // nếu getShopOrders hỗ trợ signal
        // HỖ TRỢ NHIỀU KIỂU RESPONSE:
        // - { data: { orders: [...], pagination: { total_pages } } }
        // - { orders: [...], pagination: {...} }
        const payload = res?.data
        const result = payload?.data ?? payload
        const ordersFromApi = result?.orders ?? result?.orders // safe
        const pagination = result?.pagination ?? payload?.pagination ?? {}

        // Nếu API trả mảng orders (có khả năng rỗng) -> set. Nếu trả undefined, giữ nguyên (không ghi đè)
        if (Array.isArray(ordersFromApi)) {
          // Ensure created_at exists to avoid Invalid Date in UI
          const normalized = ordersFromApi.map((o) => ({
            ...o,
            created_at: o.created_at || new Date().toISOString(),
          }))
          setOrders(normalized.sort(sortByCreatedDesc))
        }

        const tp = pagination?.total_pages ?? pagination?.totalPages ?? 1
        setTotalPages(typeof tp === "number" ? tp : Number(tp) || 1)
      } catch (err) {
        if (err.name === "CanceledError" || err.name === "AbortError") {
          // ignore aborted requests
        } else {
          console.error("❌ Lỗi khi tải đơn hàng:", err)
          setError(err.message || "Lỗi khi tải đơn hàng")
        }
      } finally {
        if (mountedRef.current) setLoading(false)
      }
    }

    fetchOrders()

    return () => {
      // cleanup: abort fetch khi unmount hoặc khi deps thay đổi
      if (fetchAbortRef.current) fetchAbortRef.current.abort()
      fetchAbortRef.current = null
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch, selectedStatus, page])

  // SSE: connect once khi mount, disconnect on unmount
  useEffect(() => {
    mountedRef.current = true

    // Kết nối SSE, truyền callback merge
    const es = connectOrderSSE((msg) => {
      // msg có thể là { type: "orders", data: [...] } hoặc single object
      try {
        if (!msg) return

        // Nếu backend gửi event kiểu { type, data }
        if (msg.type === "orders" && Array.isArray(msg.data)) {
          // merge mọi phần tử (không overwrite toàn bộ nếu API đã tải)
          const normalized = msg.data
            .filter(Boolean)
            .map((o) => ({ ...o, created_at: o.created_at || new Date().toISOString() }))
          setOrders((prev) => {
            const map = new Map(prev.map((p) => [p._id, p]))
            normalized.forEach((o) => {
              map.set(o._id, { ...(map.get(o._id) || {}), ...o })
            })
            const merged = Array.from(map.values()).sort(sortByCreatedDesc)
            return merged.slice(0, 200)
          })
          return
        }

        // Nếu backend gửi single order object
        const incoming = msg.data ?? msg
        if (Array.isArray(incoming)) {
          incoming.forEach((o) => mergeOrderFromSSE(o))
        } else {
          mergeOrderFromSSE(incoming)
        }
      } catch (err) {
        console.error("⚠️ Lỗi xử lý SSE message:", err)
      }
    })

    eventSourceRef.current = es

    return () => {
      mountedRef.current = false
      // Đóng kết nối SSE an toàn
      try {
        if (eventSourceRef.current && typeof eventSourceRef.current.close === "function") {
          eventSourceRef.current.close()
        } else {
          // nếu service quản lý singleton, gọi disconnect
          disconnectOrderSSE?.()
        }
      } catch (err) {
        console.warn("Lỗi đóng SSE:", err)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const getStatusBadge = (status) => {
    const config = STATUS_CONFIG[status] || STATUS_CONFIG.PENDING
    const Icon = config.icon
    return (
      <span
        className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium ${config.color} ${config.bgColor}`}
      >
        <Icon className="w-4 h-4" />
        {config.label}
      </span>
    )
  }


  const formatDate = (date) => {
    if (!date) return "—"
    const d = new Date(date)
    if (Number.isNaN(d.getTime())) return "—"
    return d.toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  // Reset page khi user thay đổi search (tránh fetch page cũ gây rỗng)
  const handleSearchChange = (e) => {
    setSearch(e.target.value)
    setPage(1)
  }

  // Render
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
        <h1 className="text-3xl font-semibold">Quản lý đơn hàng</h1>
        <p className="text-muted-foreground">Danh sách tất cả đơn hàng của cửa hàng</p>
      </div>

      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-4">
        <div className="relative flex-1 max-w-sm">
          <input
            type="text"
            placeholder="Tìm mã đơn hàng hoặc cửa hàng..."
            value={search}
            onChange={handleSearchChange}
            className="border p-2 rounded-md w-full pr-10"
          />
          {search && (
            <button
              onClick={() => {
                setSearch("")
                setPage(1)
              }}
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
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
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
                      <TableCell className="font-mono font-semibold text-sm">{order.order_code ?? "—"}</TableCell>
                      <TableCell className="text-sm">
                        {order.shop_id?.name ?? order.shop?.name ?? "-"}
                      </TableCell>
                      <TableCell className="text-sm">{formatDate(order.created_at)}</TableCell>
                      <TableCell>{getStatusBadge(order.status)}</TableCell>
                      <TableCell className="font-semibold text-green-600">
                        {safeNumber(order.total_amount).toLocaleString("vi-VN")}đ
                      </TableCell>
                      <TableCell className="flex gap-2">
                        {/* Xem chi tiết */}
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSelectedOrder(order)
                            setIsDetailOpen(true)
                          }}
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          Xem
                        </Button>

                        {/* PENDING: Có thể chấp nhận hoặc hủy */}
                        {order.status === "PENDING" && (
                          <>
                            <Button
                              size="sm"
                              variant="secondary"
                              className="hover:bg-primary hover:text-white"
                              onClick={async () => {
                                try {
                                  await acceptOrder(order._id)
                                  setOrders((prev) =>
                                    prev.map((o) =>
                                      o._id === order._id ? { ...o, status: "CONFIRMED" } : o
                                    )
                                  )
                                  toast.success("Đã chấp nhận đơn hàng!")
                                } catch (err) {
                                  toast.error("Lỗi khi chấp nhận đơn hàng: " + err.message)
                                }
                              }}
                            >
                              <CheckCircle2 className="w-4 h-4 mr-1" />
                              Chấp nhận
                            </Button>

                            <Button
                              size="sm"
                              variant="destructive"
                              className="hover:bg-red-600 hover:text-white hover:border-red-600"
                              onClick={async () => {
                                try {
                                  await updateOrderStatus(order._id, "CANCELLED")
                                  setOrders((prev) =>
                                    prev.map((o) =>
                                      o._id === order._id ? { ...o, status: "CANCELLED" } : o
                                    )
                                  )
                                  toast.success("Đã hủy đơn hàng!")
                                } catch (err) {
                                  toast.error("Lỗi khi hủy đơn hàng: " + err.message)
                                }
                              }}
                            >
                              <XCircle className="w-4 h-4 mr-1" />
                              Hủy đơn
                            </Button>
                          </>
                        )}

                        {/* CONFIRMED: Có thể giao hoặc hủy */}
                        {order.status === "CONFIRMED" && (
                          <>
                            <Button
                              size="sm"
                              variant="secondary"
                              className="hover:bg-primary hover:text-white"
                              onClick={async () => {
                                try {
                                  await updateOrderStatus(order._id, "SHIPPING")
                                  setOrders((prev) =>
                                    prev.map((o) =>
                                      o._id === order._id ? { ...o, status: "SHIPPING" } : o
                                    )
                                  )
                                  toast.success("Đã chuyển sang trạng thái: Đang giao")
                                } catch (err) {
                                  toast.error("Lỗi khi cập nhật trạng thái: " + err.message)
                                }
                              }}
                            >
                              <Truck className="w-4 h-4 mr-1" />
                              Bắt đầu giao
                            </Button>

                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={async () => {
                                try {
                                  await updateOrderStatus(order._id, "CANCELLED")
                                  setOrders((prev) =>
                                    prev.map((o) =>
                                      o._id === order._id ? { ...o, status: "CANCELLED" } : o
                                    )
                                  )
                                  toast.success("Đã hủy đơn hàng!")
                                } catch (err) {
                                  toast.error("Lỗi khi hủy đơn hàng: " + err.message)
                                }
                              }}
                            >
                              <XCircle className="w-4 h-4 mr-1" />
                              Hủy đơn
                            </Button>
                          </>
                        )}

                        {/* SHIPPING: chỉ hoàn tất giao */}
                        {order.status === "SHIPPING" && (
                          <Button
                            size="sm"
                            variant="secondary"
                            className="hover:bg-primary hover:text-white"
                            onClick={async () => {
                              try {
                                await updateOrderStatus(order._id, "DELIVERED")
                                setOrders((prev) =>
                                  prev.map((o) =>
                                    o._id === order._id
                                      ? { ...o, status: "DELIVERED", payment_status: "PAID" }
                                      : o
                                  )
                                )
                                toast.success("Đã giao hàng thành công!")
                              } catch (err) {
                                toast.error("Lỗi khi cập nhật trạng thái: " + err.message)
                              }
                            }}
                          >
                            <PackageCheck className="w-4 h-4 mr-1" />
                            Hoàn tất giao
                          </Button>
                        )}
                      </TableCell>



                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {error && <div className="text-red-600 mt-3">{error}</div>}

          {/* Pagination */}
          {totalPages >= 1 && (
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
