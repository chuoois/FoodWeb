import React, { useState } from "react"
import { useNavigate,Link } from "react-router-dom"
import { CheckCircle, Star, XCircle, Truck,ArrowLeft } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

const mockOrders = [
  { id: "001", restaurant: "Phở Hà Nội", status: "delivering", total: 125000, date: "2025-11-03", items: 3, image: "/ph--n--c-d-ng-h--n-i.jpg" },
  { id: "002", restaurant: "Pizza Max", status: "completed", total: 250000, date: "2025-11-02", items: 2, image: "/pizza-margherita-cheese.jpg" },
  { id: "003", restaurant: "Sushi Paradise", status: "completed", total: 350000, date: "2025-11-01", items: 4, image: "/sushi-set-premium.jpg" },
  { id: "004", restaurant: "Cơm Tấm Sài Gòn", status: "cancelled", total: 85000, date: "2025-10-31", items: 2, image: "/c-m-t-m-th-t-n--c-m-m.jpg" },
  { id: "005", restaurant: "Bánh Mì Huyền", status: "delivering", total: 95000, date: "2025-11-03", items: 1, image: "/b-nh-m--th-p-c-m.jpg" },
]

export function MyOrderPage() {
  const [activeTab, setActiveTab] = useState("all")
  const navigate = useNavigate()

  const filterOrders = () => {
    if (activeTab === "all") return mockOrders
    if (activeTab === "delivering") return mockOrders.filter((o) => o.status === "delivering")
    if (activeTab === "completed") return mockOrders.filter((o) => o.status === "completed")
    if (activeTab === "reviewed") return mockOrders.filter((o) => o.status === "completed")
    if (activeTab === "cancelled") return mockOrders.filter((o) => o.status === "cancelled")
    return mockOrders
  }

  const filteredOrders = filterOrders()

  const getStatusBadge = (status) => {
    switch (status) {
      case "delivering":
        return (
          <div className="flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
            <Truck size={16} /> Đang giao
          </div>
        )
      case "completed":
        return (
          <div className="flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
            <CheckCircle size={16} /> Hoàn thành
          </div>
        )
      case "cancelled":
        return (
          <div className="flex items-center gap-1 px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm font-medium">
            <XCircle size={16} /> Đã hủy
          </div>
        )
      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-orange-500 text-white py-6 px-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            
            <h1 className="text-4xl font-bold">Đơn Hàng Của Tôi</h1>
           
          </div>
          
        </div>
      </div>   
     {/* Tabs */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4">
          <div className="flex">
            {[
              { id: "all", label: "Tất cả" },
              { id: "delivering", label: "Đang giao" },
              { id: "completed", label: "Hoàn thành" },
              { id: "reviewed", label: "Đánh giá ⭐" },
              { id: "cancelled", label: "Đã hủy" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 py-3 font-medium text-sm border-b-2 text-center transition-colors ${activeTab === tab.id
                  ? "border-orange-500 text-orange-500"
                  : "border-transparent text-foreground/60 hover:text-foreground"
                  }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Orders List */}
      <div className="max-w-4xl mx-auto px-4 py-6">
        {filteredOrders.length === 0 ? (
          <Card className="text-center py-12">
            <p className="text-foreground/60 text-lg">Không có đơn hàng nào</p>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredOrders.map((order) => (
              <Card key={order.id} className="hover:shadow-lg transition-shadow overflow-hidden">
                <CardContent className="p-0">
                  <div className="flex gap-6 p-4">
                    <div className="w-32 h-32 flex-shrink-0 bg-gray-200 overflow-hidden rounded-lg">
                      <img src={order.image || "/placeholder.svg"} alt={order.restaurant} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 flex flex-col justify-between">
                      <div className="flex items-center justify-between gap-4 mb-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-lg font-semibold">{order.restaurant}</h3>
                            {getStatusBadge(order.status)}
                          </div>
                          <p className="text-sm text-foreground/60">
                            {order.items} món • {new Date(order.date).toLocaleDateString("vi-VN")}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold text-orange-500">
                            {order.total.toLocaleString("vi-VN")}₫
                          </p>
                          <p className="text-xs text-foreground/60 mt-1">Mã: #{order.id}</p>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Button
                          className="flex-1 bg-orange-500 hover:bg-orange-600 text-white"
                          onClick={() => navigate(`/myorder/${order.id}`)}
                        >
                          Xem Chi Tiết
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
