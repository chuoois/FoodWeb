import { useEffect, useState, useMemo } from "react"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { BarChart3, Store, TrendingUp, MapPin, Package } from "lucide-react"
import { getAllCompletedOrders } from "@/services/order.service"

export function FinanceRevenuePage() {
  const [shopStats, setShopStats] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showAll, setShowAll] = useState(false)
  const [selectedShop, setSelectedShop] = useState(null)
  const [dialogOpen, setDialogOpen] = useState(false)

  const formatVND = (amount) =>
    new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
      minimumFractionDigits: 0,
    }).format(amount)

  useEffect(() => {
    const fetchRevenueData = async () => {
      try {
        setLoading(true)
        const response = await getAllCompletedOrders({ limit: 1000 })
        const orders = response.data.data.filter((o) => o.shop_id && o.status === "DELIVERED")

        const shopMap = {}

        orders.forEach((order) => {
          const shop = order.shop_id
          const shopId = shop._id

          if (!shopMap[shopId]) {
            shopMap[shopId] = {
              shop_id: shopId,
              name: shop.name || "Không tên",
              logoUrl: shop.logoUrl || null,
              coverUrl: shop.coverUrl || null,
              address: `${shop.address?.street || ""}, ${shop.address?.ward || ""}, ${shop.address?.district || ""}`.trim(),
              totalRevenue: 0,
              orderCount: 0,
            }
          }

          shopMap[shopId].totalRevenue += order.total_amount
          shopMap[shopId].orderCount += 1
        })

        const stats = Object.values(shopMap)
          .map((shop) => ({
            ...shop,
            avgPerOrder: Math.round(shop.totalRevenue / shop.orderCount),
          }))
          .sort((a, b) => b.totalRevenue - a.totalRevenue)

        setShopStats(stats)
      } catch (err) {
        console.error("Lỗi tải doanh thu:", err)
        setError("Không thể tải dữ liệu doanh thu")
      } finally {
        setLoading(false)
      }
    }

    fetchRevenueData()
  }, [])

  const totalSystemRevenue = shopStats.reduce((sum, s) => sum + s.totalRevenue, 0)
  const totalOrders = shopStats.reduce((sum, s) => sum + s.orderCount, 0)

  const chartData = useMemo(() => {
    return shopStats
      .slice(0, showAll ? undefined : 10)
      .map((s) => ({
        name: s.name.length > 18 ? s.name.substring(0, 18) + "..." : s.name,
        revenue: s.totalRevenue,
        orders: s.orderCount,
        logoUrl: s.logoUrl,
      }))
  }, [shopStats, showAll])

  const openShopDetail = (shop) => {
    setSelectedShop(shop)
    setDialogOpen(true)
  }

  if (loading) {
    return (
      <div className="p-6 space-y-8">
        <Skeleton className="h-12 w-80" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <Card key={i}>
              <CardContent className="pt-6">
                <Skeleton className="h-6 w-32 mb-2" />
                <Skeleton className="h-10 w-48" />
              </CardContent>
            </Card>
          ))}
        </div>
        <Card>
          <CardHeader><Skeleton className="h-6 w-48" /></CardHeader>
          <CardContent><Skeleton className="h-96 w-full" /></CardContent>
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
    <div className="p-6 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <BarChart3 className="w-9 h-9 text-primary" />
          Doanh thu theo cửa hàng
        </h1>
        <p className="text-gray-600 mt-2">
          Xem chi tiết doanh thu, logo, ảnh bìa và xếp hạng từng cửa hàng
        </p>
      </div>

      {/* Tổng quan */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-xl">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm">Tổng doanh thu hệ thống</p>
                <p className="text-3xl font-bold mt-2">{formatVND(totalSystemRevenue)}</p>
              </div>
              <TrendingUp className="w-12 h-12 opacity-80" />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-md">
          <CardContent className="pt-6 flex items-center gap-4">
            <div className="bg-green-100 p-3 rounded-full">
              <Package className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-gray-600 text-sm">Tổng đơn hàng</p>
              <p className="text-2xl font-bold">{totalOrders.toLocaleString()}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-md">
          <CardContent className="pt-6 flex items-center gap-4">
            <div className="bg-orange-100 p-3 rounded-full">
              <Store className="w-6 h-6 text-orange-600" />
            </div>
            <div>
              <p className="text-gray-600 text-sm">Cửa hàng hoạt động</p>
              <p className="text-2xl font-bold">{shopStats.length}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Biểu đồ */}
      <Card className="shadow-xl">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              Biểu đồ doanh thu (Top {showAll ? shopStats.length : 10})
            </span>
            {shopStats.length > 10 && (
              <Button variant="outline" size="sm" onClick={() => setShowAll(!showAll)}>
                {showAll ? "Ẩn bớt" : "Xem tất cả"}
              </Button>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={420}>
            <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 80 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="name"
                angle={-45}
                textAnchor="end"
                height={100}
                tick={{ fontSize: 12 }}
              />
              <YAxis tickFormatter={(v) => `${(v / 1000000).toFixed(1)}M`} />
              <Tooltip formatter={(value) => formatVND(value)} />
              <Bar dataKey="revenue" fill="#3b82f6" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Bảng xếp hạng có logo */}
      <Card className="shadow-xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Store className="w-6 h-6" />
            Bảng xếp hạng cửa hàng
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50">
                  <TableHead className="w-16">#</TableHead>
                  <TableHead>Cửa hàng</TableHead>
                  <TableHead>Địa chỉ</TableHead>
                  <TableHead className="text-right">Doanh thu</TableHead>
                  <TableHead className="text-center">Đơn</TableHead>
                  <TableHead className="text-right">Trung bình</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {shopStats.map((shop, index) => (
                  <TableRow
                    key={shop.shop_id}
                    className="hover:bg-gray-50 transition-all cursor-pointer"
                    onClick={() => openShopDetail(shop)}
                  >
                    <TableCell className="font-bold text-lg">
                      {index < 3 ? (
                        <span className="text-2xl">{index + 1}</span>
                      ) : (
                        index + 1
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="w-10 h-10 ring-2 ring-white shadow-md">
                          <AvatarImage src={shop.logoUrl} alt={shop.name} />
                          <AvatarFallback className="bg-gradient-to-br from-blue-400 to-blue-600 text-white">
                            {shop.name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-semibold text-base">{shop.name}</p>
                          {index < 3 && (
                            <Badge className="mt-1" variant={index === 0 ? "default" : "secondary"}>
                              {index === 0 ? "Champion" : index === 1 ? "Runner-up" : "Top 3"}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-gray-600 max-w-xs">
                      <div className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {shop.address || "Chưa có địa chỉ"}
                      </div>
                    </TableCell>
                    <TableCell className="text-right font-bold text-xl text-blue-600">
                      {formatVND(shop.totalRevenue)}
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant="outline" className="font-medium">
                        {shop.orderCount}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-medium text-green-600">
                      {formatVND(shop.avgPerOrder)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Dialog chi tiết cửa hàng */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl">
          {selectedShop && (
            <>
              <div className="relative -m-6 mb-4 h-48 rounded-t-lg overflow-hidden">
                <img
                  src={selectedShop.coverUrl || "https://via.placeholder.com/800x200?text=Cover+Image"}
                  alt="Cover"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                <div className="absolute bottom-4 left-6 flex items-end gap-4">
                  <Avatar className="w-20 h-20 ring-4 ring-white shadow-2xl">
                    <AvatarImage src={selectedShop.logoUrl} />
                    <AvatarFallback className="text-2xl font-bold bg-gradient-to-br from-blue-500 to-purple-600">
                      {selectedShop.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="text-white">
                    <h3 className="text-2xl font-bold drop-shadow-lg">{selectedShop.name}</h3>
                    <p className="text-sm opacity-90 flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      {selectedShop.address}
                    </p>
                  </div>
                </div>
              </div>

              <DialogHeader>
                <DialogTitle>Thông tin chi tiết</DialogTitle>
              </DialogHeader>

              <div className="grid grid-cols-2 gap-6 mt-4">
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tổng doanh thu</span>
                    <span className="font-bold text-xl text-blue-600">
                      {formatVND(selectedShop.totalRevenue)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Số đơn hàng</span>
                    <Badge variant="secondary" className="text-lg px-3">
                      {selectedShop.orderCount}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Trung bình đơn</span>
                    <span className="font-semibold text-green-600">
                      {formatVND(selectedShop.avgPerOrder)}
                    </span>
                  </div>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}