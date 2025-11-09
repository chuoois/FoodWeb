import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { BarChart3, CheckSquare, Store, Loader2 } from "lucide-react"
import { getAllCompletedOrders } from "@/services/order.service" // sửa path nếu cần

export function ManagerFinanceDashboard() {
  const [stats, setStats] = useState({
    todayRevenue: 0,
    todayOrders: 0,
    activeShopsToday: 0,
    totalCompletedOrders: 0,
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Format tiền VND đẹp
  const formatVND = (amount) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
      minimumFractionDigits: 0,
    }).format(amount)
  }

  useEffect(() => {
    const fetchFinanceData = async () => {
      try {
        setLoading(true)
        setError(null)

        // Lấy tất cả đơn hoàn thành
        const response = await getAllCompletedOrders({ limit: 1000 })
        const orders = response.data.data.filter(order => order.shop_id) // loại bỏ đơn test

        // Xác định hôm nay (00:00:00)
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        const todayEnd = new Date()
        todayEnd.setHours(23, 59, 59, 999)

        // Lọc đơn hôm nay
        const todayOrders = orders.filter(order => {
          const orderDate = new Date(order.createdAt)
          return orderDate >= today && orderDate <= todayEnd
        })

        // Tính doanh thu hôm nay
        const todayRevenue = todayOrders.reduce((sum, order) => sum + order.total_amount, 0)

        // Đếm cửa hàng hoạt động hôm nay
        const shopIdsToday = new Set(todayOrders.map(order => order.shop_id._id))
        const activeShopsToday = shopIdsToday.size

        // Tổng đơn hoàn thành (tất cả thời gian)
        const totalCompletedOrders = orders.length

        setStats({
          todayRevenue,
          todayOrders: todayOrders.length,
          activeShopsToday,
          totalCompletedOrders,
        })
      } catch (err) {
        console.error("Lỗi tải dữ liệu tài chính:", err)
        setError("Không thể tải dữ liệu tài chính")
      } finally {
        setLoading(false)
      }
    }

    fetchFinanceData()
  }, [])

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <Skeleton className="h-10 w-64" />
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="shadow-md">
              <CardContent className="p-5">
                <Skeleton className="h-5 w-32 mb-2" />
                <Skeleton className="h-10 w-48" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-6">
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6 text-red-600 text-center font-medium">
            {error}
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-800">Tổng quan tài chính</h1>
        <p className="text-gray-500 mt-1">
          Cập nhật đến: {new Date().toLocaleDateString("vi-VN")} - {new Date().toLocaleTimeString("vi-VN")}
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {/* Doanh thu hôm nay */}
        <Card className="shadow-lg border-0 bg-gradient-to-br from-blue-500 to-blue-600 text-white">
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm font-medium">Doanh thu hôm nay</p>
              <h2 className="text-3xl font-bold mt-2">
                {formatVND(stats.todayRevenue)}
              </h2>
              <p className="text-blue-100 text-xs mt-1">
                {stats.todayOrders} đơn hàng
              </p>
            </div>
            <div className="bg-white/20 rounded-full p-4">
              <BarChart3 className="w-10 h-10" />
            </div>
          </CardContent>
        </Card>

        {/* Đơn hàng hoàn thành hôm nay */}
        <Card className="shadow-lg border-0 bg-gradient-to-br from-green-500 to-emerald-600 text-white">
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm font-medium">Đơn hoàn thành hôm nay</p>
              <h2 className="text-3xl font-bold mt-2">
                {stats.todayOrders.toLocaleString()}
              </h2>
              <p className="text-green-100 text-xs mt-1">
                Tổng cộng: {stats.totalCompletedOrders.toLocaleString()} đơn
              </p>
            </div>
            <div className="bg-white/20 rounded-full p-4">
              <CheckSquare className="w-10 h-10" />
            </div>
          </CardContent>
        </Card>

        {/* Cửa hàng hoạt động hôm nay */}
        <Card className="shadow-lg border-0 bg-gradient-to-br from-orange-500 to-red-600 text-white">
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-orange-100 text-sm font-medium">Cửa hàng hoạt động hôm nay</p>
              <h2 className="text-3xl font-bold mt-2">
                {stats.activeShopsToday}
              </h2>
              <p className="text-orange-100 text-xs mt-1">
                Có đơn hàng trong ngày
              </p>
            </div>
            <div className="bg-white/20 rounded-full p-4">
              <Store className="w-10 h-10" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bonus: Tổng hợp nhanh */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
        <div className="bg-gray-50 rounded-lg p-4 border">
          <p className="text-sm text-gray-600">Doanh thu trung bình/đơn</p>
          <p className="text-2xl font-bold text-gray-800 mt-1">
            {stats.todayOrders > 0
              ? formatVND(Math.round(stats.todayRevenue / stats.todayOrders))
              : "₫0"}
          </p>
        </div>
        <div className="bg-gray-50 rounded-lg p-4 border">
          <p className="text-sm text-gray-600">Tỷ lệ đơn hôm nay</p>
          <p className="text-2xl font-bold text-gray-800 mt-1">
            {stats.totalCompletedOrders > 0
              ? `${Math.round((stats.todayOrders / stats.totalCompletedOrders) * 100)}%`
              : "0%"}
          </p>
        </div>
        <div className="bg-gray-50 rounded-lg p-4 border">
          <p className="text-sm text-gray-600">Cập nhật lúc</p>
          <p className="text-lg font-medium text-gray-800 mt-1">
            {new Date().toLocaleTimeString("vi-VN")}
          </p>
        </div>
      </div>
    </div>
  )
}