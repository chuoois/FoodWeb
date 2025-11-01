import React from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { UtensilsCrossed, ClipboardList, ShoppingCart, ArrowRight } from "lucide-react"
import { Link } from "react-router-dom"

export function ManagerStaffHomePage() {
  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
          Trang chủ quản lý nhân viên cửa hàng
        </h1>
        <p className="mt-2 text-muted-foreground">
          Chào mừng bạn đến với trang quản lý. Dưới đây là các công cụ để quản lý menu, theo dõi đơn hàng và duyệt
          orders từ khách hàng.
        </p>
      </div>

      {/* Main Features */}
      <div className="grid gap-6 md:grid-cols-3">
        {/* Feature 1: Create Dishes */}
        <Card className="relative overflow-hidden hover:shadow-lg transition-shadow">
          <Badge variant="secondary" className="absolute top-4 right-4">
            Công cụ 1
          </Badge>
          <CardHeader>
            <div className="flex items-center gap-2">
              <UtensilsCrossed className="h-5 w-5 text-muted-foreground" />
              <CardTitle>Tạo món ăn mới</CardTitle>
            </div>
            <CardDescription>Thêm các món ăn mới vào menu của cửa hàng</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <ul className="list-disc pl-5 space-y-2 text-sm text-muted-foreground">
              <li>Nhập tên và mô tả món ăn.</li>
              <li>Thiết lập giá và danh mục.</li>
              <li>Tải lên hình ảnh món ăn.</li>
              <li>Xác định thành phần và allergenic.</li>
            </ul>
            <Link to="/manager-staff/manage/create-food" className="block">
              <Button variant="outline" className="w-full justify-between bg-transparent">
                Tạo món ăn
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Feature 2: View Dishes List */}
        <Card className="relative overflow-hidden hover:shadow-lg transition-shadow">
          <Badge variant="secondary" className="absolute top-4 right-4">
            Công cụ 2
          </Badge>
          <CardHeader>
            <div className="flex items-center gap-2">
              <ClipboardList className="h-5 w-5 text-muted-foreground" />
              <CardTitle>Danh sách món ăn</CardTitle>
            </div>
            <CardDescription>Xem, chỉnh sửa và quản lý tất cả món ăn</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <ul className="list-disc pl-5 space-y-2 text-sm text-muted-foreground">
              <li>Xem danh sách đầy đủ các món ăn.</li>
              <li>Chỉnh sửa thông tin và giá cả.</li>
              <li>Cập nhật trạng thái (có sẵn/hết hàng).</li>
              <li>Xóa món ăn khỏi menu.</li>
            </ul>
            <Link to="/manager-staff/manage/list-food" className="block">
              <Button variant="outline" className="w-full justify-between bg-transparent">
                Xem danh sách
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Feature 3: Review Orders */}
        <Card className="relative overflow-hidden hover:shadow-lg transition-shadow">
          <Badge variant="secondary" className="absolute top-4 right-4">
            Công cụ 3
          </Badge>
          <CardHeader>
            <div className="flex items-center gap-2">
              <ShoppingCart className="h-5 w-5 text-muted-foreground" />
              <CardTitle>Duyệt và quản lý đơn hàng</CardTitle>
            </div>
            <CardDescription>Xem và xử lý các đơn hàng từ khách hàng</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <ul className="list-disc pl-5 space-y-2 text-sm text-muted-foreground">
              <li>Xem danh sách đơn hàng đang chờ xử lý.</li>
              <li>Cập nhật trạng thái đơn hàng.</li>
              <li>Xác nhận hoặc từ chối đơn hàng.</li>
              <li>Theo dõi thời gian giao hàng dự kiến.</li>
            </ul>
            <Link to="/staff-manager/orders" className="block">
              <Button variant="outline" className="w-full justify-between bg-transparent">
                Duyệt đơn hàng
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Important Notes */}
      <div className="mt-8 border rounded-lg p-6 bg-gradient-to-r from-green-50 to-emerald-50">
        <h2 className="text-xl font-semibold mb-4">Hướng dẫn quan trọng</h2>
        <ul className="list-disc pl-5 space-y-2 text-sm text-muted-foreground">
          <li>Hãy đảm bảo tất cả thông tin menu được cập nhật đầy đủ trước khi mở cửa hàng.</li>
          <li>Kiểm tra và xử lý các đơn hàng mới ít nhất mỗi 30 phút.</li>
          <li>Cập nhật trạng thái đơn hàng kịp thời để khách hàng được thông báo.</li>
          <li>Nếu gặp vấn đề, liên hệ hỗ trợ qua email: support@foodstore.com.</li>
        </ul>
      </div>
    </div>
  )
}
