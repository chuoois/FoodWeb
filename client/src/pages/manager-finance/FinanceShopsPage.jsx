import { useEffect, useState, useMemo } from "react"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Store, Calendar, DollarSign, ChevronDown, ChevronUp, Download, CheckCircle2 } from "lucide-react"
import { format, startOfMonth, endOfMonth, isWithinInterval } from "date-fns"
import { getAllCompletedOrders } from "@/services/order.service"
import * as XLSX from "xlsx"

export function FinanceShopsPage() {
  const [shopData, setShopData] = useState([])
  const [loading, setLoading] = useState(true)
  const [expandedMonths, setExpandedMonths] = useState(new Set())
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  
  // Trạng thái chuyển tiền cho từng shop
  const [paymentStatus, setPaymentStatus] = useState({})

  // Load trạng thái từ localStorage
  useEffect(() => {
    const saved = localStorage.getItem("shop-payment-status")
    if (saved) {
      setPaymentStatus(JSON.parse(saved))
    }
  }, [])

  // Lưu trạng thái khi thay đổi
  useEffect(() => {
    localStorage.setItem("shop-payment-status", JSON.stringify(paymentStatus))
  }, [paymentStatus])

  // Xác nhận đã chuyển tiền
  const confirmPayment = (shopId) => {
    setPaymentStatus(prev => ({
      ...prev,
      [shopId]: {
        confirmed: true,
        date: new Date().toISOString(),
      }
    }))
  }

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const response = await getAllCompletedOrders({ limit: 10000 })
        const orders = response.data.data.filter(
          (o) => o.shop_id && o.status === "DELIVERED" && o.payment_method === "PAYOS" // CHỈ LẤY ĐƠN PAYOS
        )

        const shopMap = new Map()

        orders.forEach((order) => {
          const shop = order.shop_id
          const date = new Date(order.createdAt)
          const yearMonth = format(date, "yyyy-MM")
          const day = format(date, "yyyy-MM-dd")
          const amount = order.subtotal // chỉ dùng subtotal

          const shopKey = shop._id
          if (!shopMap.has(shopKey)) {
            shopMap.set(shopKey, {
              _id: shop._id,
              name: shop.name || "Không tên",
              logoUrl: shop.logoUrl,
              ownerName: shop.owner?.full_name || "Chưa có",
              months: new Map(),
              total: 0,
            })
          }

          const shopEntry = shopMap.get(shopKey)
          if (!shopEntry.months.has(yearMonth)) {
            shopEntry.months.set(yearMonth, {
              yearMonth,
              total: 0,
              days: new Map(),
            })
          }

          const monthEntry = shopEntry.months.get(yearMonth)
          monthEntry.total += amount
          shopEntry.total += amount

          if (!monthEntry.days.has(day)) {
            monthEntry.days.set(day, { date: day, amount: 0 })
          }
          monthEntry.days.get(day).amount += amount
        })

        const result = Array.from(shopMap.values())
          .map((shop) => ({
            ...shop,
            months: Array.from(shop.months.values())
              .map((m) => ({
                ...m,
                days: Array.from(m.days.values()).sort((a, b) =>
                  a.date.localeCompare(b.date)
                ),
              }))
              .sort((a, b) => b.yearMonth.localeCompare(a.yearMonth)),
          }))
          .sort((a, b) => a.name.localeCompare(b.name))

        setShopData(result)
      } catch (err) {
        console.error("Lỗi tải dữ liệu:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  // Lọc theo khoảng thời gian
  const filteredData = useMemo(() => {
    if (!startDate && !endDate) return shopData

    return shopData
      .map((shop) => {
        const filteredMonths = shop.months
          .map((month) => {
            const monthStart = startOfMonth(new Date(month.yearMonth + "-01"))
            const monthEnd = endOfMonth(monthStart)

            const isMonthInRange =
              (!startDate || monthEnd >= new Date(startDate)) &&
              (!endDate || monthStart <= new Date(endDate))

            if (!isMonthInRange) return null

            const filteredDays = month.days.filter((day) => {
              const d = new Date(day.date)
              return (
                (!startDate || d >= new Date(startDate)) &&
                (!endDate || d <= new Date(endDate))
              )
            })

            if (filteredDays.length === 0) return null

            const total = filteredDays.reduce((sum, d) => sum + d.amount, 0)
            return { ...month, days: filteredDays, total }
          })
          .filter(Boolean)

        if (filteredMonths.length === 0) return null

        const total = filteredMonths.reduce((sum, m) => sum + m.total, 0)
        return { ...shop, months: filteredMonths, total }
      })
      .filter(Boolean)
  }, [shopData, startDate, endDate])

  const totalAll = filteredData.reduce((sum, shop) => sum + shop.total, 0)

  const toggleMonth = (shopId, yearMonth) => {
    const key = `${shopId}-${yearMonth}`
    setExpandedMonths((prev) => {
      const next = new Set(prev)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return next
    })
  }

  const exportToExcel = () => {
    const data = []

    filteredData.forEach((shop) => {
      const status = paymentStatus[shop._id]
      shop.months.forEach((month) => {
        month.days.forEach((day) => {
          data.push({
            "Tên quán": shop.name,
            "Chủ quán": shop.ownerName,
            "Tháng": format(new Date(month.yearMonth + "-01"), "MM/yyyy"),
            "Ngày": format(new Date(day.date), "dd/MM/yyyy"),
            "Doanh thu PAYOS (subtotal)": day.amount,
            "Trạng thái chuyển": status?.confirmed ? "ĐÃ CHUYỂN" : "CHƯA CHUYỂN",
            "Ngày chuyển": status?.confirmed ? format(new Date(status.date), "dd/MM/yyyy HH:mm") : "",
          })
        })
      })
    })

    const ws = XLSX.utils.json_to_sheet(data)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, "HoanTienShop_PAYOS")
    XLSX.writeFile(wb, `Hoan_Tien_Shop_PAYOS_${format(new Date(), "yyyyMMdd_HHmm")}.xlsx`)
  }

  const formatCurrency = (amount) =>
    new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(amount)

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <Skeleton className="h-32 w-full" />
        {[...Array(3)].map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-6 w-64" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-24 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Bộ lọc */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Lọc theo thời gian
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label>Từ ngày</Label>
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div>
              <Label>Đến ngày</Label>
              <Input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
            <div className="flex items-end">
              <Button onClick={exportToExcel} className="w-full">
                <Download className="w-4 h-4 mr-2" />
                Xuất Excel (PAYOS)
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tổng quan */}
      <Card className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white">
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-2xl">
            <DollarSign className="w-8 h-8" />
            Tổng tiền cần hoàn trả (chỉ PAYOS)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-4xl font-bold">{formatCurrency(totalAll)}</p>
          <p className="text-sm opacity-90 mt-1">
            Từ {filteredData.length} cửa hàng
            {startDate || endDate
              ? ` • ${startDate ? format(new Date(startDate), "dd/MM") : "..."} - ${
                  endDate ? format(new Date(endDate), "dd/MM/yyyy") : "..."
                }`
              : ""}
          </p>
        </CardContent>
      </Card>

      {/* Danh sách shop */}
      <div className="space-y-6">
        {filteredData.length === 0 ? (
          <Card>
            <CardContent className="py-16 text-center text-gray-500">
              Không có đơn PAYOS nào trong khoảng thời gian này
            </CardContent>
          </Card>
        ) : (
          filteredData.map((shop) => {
            const status = paymentStatus[shop._id]
            const isPaid = status?.confirmed

            return (
              <Card key={shop._id} className="overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-orange-50 to-red-50 border-b">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <Avatar className="w-14 h-14 ring-2 ring-orange-200">
                        <AvatarImage src={shop.logoUrl} />
                        <AvatarFallback className="bg-gradient-to-br from-orange-400 to-red-500 text-white font-bold">
                          {shop.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <CardTitle className="text-xl flex items-center gap-2">
                          <Store className="w-5 h-5 text-orange-600" />
                          {shop.name}
                        </CardTitle>
                        <p className="text-sm text-gray-600">Chủ: {shop.ownerName}</p>
                      </div>
                    </div>

                    <div className="flex flex-col sm:items-end gap-3">
                      <div className="text-right">
                        <p className="text-2xl font-bold text-green-600">
                          {formatCurrency(shop.total)}
                        </p>
                        <p className="text-xs text-gray-500">Tổng PAYOS cần hoàn</p>
                      </div>

                      {/* Trạng thái + Nút xác nhận */}
                      <div className="flex items-center gap-2">
                        {isPaid ? (
                          <>
                            <Badge variant="default" className="bg-green-100 text-green-800">
                              <CheckCircle2 className="w-3 h-3 mr-1" />
                              Đã chuyển
                            </Badge>
                            <span className="text-xs text-gray-500">
                              {format(new Date(status.date), "dd/MM HH:mm")}
                            </span>
                          </>
                        ) : (
                          <Button
                            size="sm"
                            variant="default"
                            className="bg-emerald-600 hover:bg-emerald-700"
                            onClick={() => confirmPayment(shop._id)}
                          >
                            <CheckCircle2 className="w-4 h-4 mr-1" />
                            Xác nhận chuyển
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="p-0">
                  {shop.months.map((month) => {
                    const key = `${shop._id}-${month.yearMonth}`
                    const isExpanded = expandedMonths.has(key)

                    return (
                      <div key={key} className="border-b last:border-b-0">
                        <button
                          onClick={() => toggleMonth(shop._id, month.yearMonth)}
                          className="w-full px-6 py-4 flex justify-between items-center hover:bg-gray-50 transition"
                        >
                          <div className="flex items-center gap-3">
                            <Calendar className="w-5 h-5 text-indigo-600" />
                            <span className="font-semibold text-lg">
                              Tháng {format(new Date(month.yearMonth + "-01"), "MM/yyyy")}
                            </span>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="font-bold text-green-700">
                              {formatCurrency(month.total)}
                            </span>
                            {isExpanded ? (
                              <ChevronUp className="w-5 h-5" />
                            ) : (
                              <ChevronDown className="w-5 h-5" />
                            )}
                          </div>
                        </button>

                        {isExpanded && (
                          <div className="px-6 pb-4 space-y-2 border-t">
                            {month.days.map((day) => (
                              <div
                                key={day.date}
                                className="flex justify-between items-center py-2 px-4 rounded bg-gray-50"
                              >
                                <span className="text-sm font-medium text-gray-700">
                                  {format(new Date(day.date), "EEEE, dd/MM")}
                                </span>
                                <span className="font-semibold text-green-600">
                                  {formatCurrency(day.amount)}
                                </span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )
                  })}
                </CardContent>
              </Card>
            )
          })
        )}
      </div>
    </div>
  )
}