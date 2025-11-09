import { useEffect, useState } from "react"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Skeleton } from "@/components/ui/skeleton"
import { Store, User } from "lucide-react"
import { getAllCompletedOrders } from "@/services/order.service"

export function FinanceShopsPage() {
  const [shops, setShops] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchShops = async () => {
      try {
        setLoading(true)
        const response = await getAllCompletedOrders({ limit: 1000 })
        const orders = response.data.data.filter(o => o.shop_id)

        // Lấy danh sách shop duy nhất
        const shopMap = new Map()

        orders.forEach(order => {
          const shop = order.shop_id
          if (!shopMap.has(shop._id)) {
            shopMap.set(shop._id, {
              _id: shop._id,
              name: shop.name || "Không tên",
              logoUrl: shop.logoUrl,
              ownerName: shop.owner?.full_name || "Chưa có chủ sở hữu",
            })
          }
        })

        // Chuyển Map thành array và sắp xếp theo tên
        const shopList = Array.from(shopMap.values())
          .sort((a, b) => a.name.localeCompare(b.name))

        setShops(shopList)
      } catch (err) {
        console.error("Lỗi tải danh sách quán:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchShops()
  }, [])

  if (loading) {
    return (
      <div className="p-6">
        <Card>
          <CardHeader>
            <Skeleton className="h-8 w-48" />
          </CardHeader>
          <CardContent className="space-y-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="flex items-center gap-4">
                <Skeleton className="w-12 h-12 rounded-full" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-5 w-64" />
                  <Skeleton className="h-4 w-40" />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="p-6">
      <Card className="shadow-lg border-0">
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-2xl">
            <Store className="w-8 h-8 text-orange-500" />
            Danh sách cửa hàng
          </CardTitle>
          <p className="text-gray-600 text-sm mt-1">
            Tổng cộng: <strong>{shops.length}</strong> cửa hàng đang hoạt động
          </p>
        </CardHeader>

        <CardContent>
          <div className="grid gap-4 md.grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {shops.length === 0 ? (
              <p className="col-span-full text-center py-12 text-gray-500">
                Chưa có cửa hàng nào
              </p>
            ) : (
              shops.map((shop) => (
                <div
                  key={shop._id}
                  className="flex items-center gap-4 p-4 rounded-lg border hover:shadow-md transition-all duration-200 bg-white"
                >
                  <Avatar className="w-14 h-14 ring-2 ring-orange-100">
                    <AvatarImage src={shop.logoUrl} alt={shop.name} />
                    <AvatarFallback className="bg-gradient-to-br from-orange-400 to-red-500 text-white font-bold text-lg">
                      {shop.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex-1">
                    <h3 className="font-semibold text-lg text-gray-800">
                      {shop.name}
                    </h3>
                    <div className="flex items-center gap-1 text-sm text-gray-600 mt-1">
                      <User className="w-3.5 h-3.5" />
                      <span>{shop.ownerName}</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}