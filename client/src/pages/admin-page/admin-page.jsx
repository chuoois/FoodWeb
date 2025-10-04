// ComponentStaff.jsx
import { useState } from "react";
import {
  Home,
  ShoppingBag,
  Users,
  Settings,
  TrendingUp,
  Package,
  Clock,
  CheckCircle,
  XCircle,
  Eye,
  Edit,
  Trash2,
  Plus,
  DollarSign,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";

export const AdminPage = () => {
  const [activeTab, setActiveTab] = useState("dashboard");

  // Mock data
  const stats = [
    {
      title: "Doanh thu hôm nay",
      value: "12.5 triệu",
      change: "+12%",
      icon: DollarSign,
      color: "bg-green-500",
    },
    {
      title: "Đơn hàng mới",
      value: "24",
      change: "+8%",
      icon: ShoppingBag,
      color: "bg-orange-500",
    },
    {
      title: "Món ăn đang bán",
      value: "48",
      change: "+2",
      icon: Package,
      color: "bg-blue-500",
    },
    {
      title: "Khách hàng",
      value: "156",
      change: "+15%",
      icon: Users,
      color: "bg-purple-500",
    },
  ];

  const orders = [
    {
      id: "#ORD001",
      customer: "Nguyễn Văn A",
      items: "Pizza Margherita x2, Sushi Combo x1",
      total: "677.000đ",
      status: "pending",
      time: "10 phút trước",
    },
    {
      id: "#ORD002",
      customer: "Trần Thị B",
      items: "Burger Bò Úc x1, Salad Caesar x1",
      total: "288.000đ",
      status: "preparing",
      time: "25 phút trước",
    },
    {
      id: "#ORD003",
      customer: "Lê Văn C",
      items: "Sashimi Cá Hồi x2",
      total: "498.000đ",
      status: "completed",
      time: "1 giờ trước",
    },
    {
      id: "#ORD004",
      customer: "Phạm Thị D",
      items: "Pizza Pepperoni x1",
      total: "209.000đ",
      status: "cancelled",
      time: "2 giờ trước",
    },
  ];

  const menuItems = [
    {
      id: 1,
      name: "Pizza Margherita",
      category: "Pizza",
      price: "189.000đ",
      stock: "Còn hàng",
      sales: 45,
    },
    {
      id: 2,
      name: "Sushi Combo Deluxe",
      category: "Sushi",
      price: "299.000đ",
      stock: "Còn hàng",
      sales: 32,
    },
    {
      id: 3,
      name: "Burger Bò Úc",
      category: "Burgers",
      price: "159.000đ",
      stock: "Sắp hết",
      sales: 28,
    },
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-700";
      case "preparing":
        return "bg-blue-100 text-blue-700";
      case "completed":
        return "bg-green-100 text-green-700";
      case "cancelled":
        return "bg-red-100 text-red-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case "pending":
        return "Chờ xử lý";
      case "preparing":
        return "Đang chuẩn bị";
      case "completed":
        return "Hoàn thành";
      case "cancelled":
        return "Đã hủy";
      default:
        return status;
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "pending":
        return Clock;
      case "preparing":
        return Package;
      case "completed":
        return CheckCircle;
      case "cancelled":
        return XCircle;
      default:
        return Clock;
    }
  };

  return (
    <div className="min-h-screen bg-[#F7EFDF]">

      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 bg-white border-r border-orange-200 min-h-[calc(100vh-73px)] sticky top-[73px]">
          <nav className="p-4 space-y-2">
            <Button
              variant={activeTab === "dashboard" ? "default" : "ghost"}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition justify-start ${activeTab === "dashboard" ? "bg-orange-500 text-white" : "text-gray-700 hover:bg-orange-50"}`}
              onClick={() => setActiveTab("dashboard")}
            >
              <Home className="w-5 h-5" />
              <span className="font-medium">Tổng quan</span>
            </Button>

            <Button
              variant={activeTab === "orders" ? "default" : "ghost"}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition justify-start ${activeTab === "orders" ? "bg-orange-500 text-white" : "text-gray-700 hover:bg-orange-50"}`}
              onClick={() => setActiveTab("orders")}
            >
              <ShoppingBag className="w-5 h-5" />
              <span className="font-medium">Đơn hàng</span>
              <Badge variant="destructive" className="ml-auto bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                3
              </Badge>
            </Button>

            <Button
              variant={activeTab === "menu" ? "default" : "ghost"}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition justify-start ${activeTab === "menu" ? "bg-orange-500 text-white" : "text-gray-700 hover:bg-orange-50"}`}
              onClick={() => setActiveTab("menu")}
            >
              <Package className="w-5 h-5" />
              <span className="font-medium">Thực đơn</span>
            </Button>

            <Button
              variant={activeTab === "analytics" ? "default" : "ghost"}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition justify-start ${activeTab === "analytics" ? "bg-orange-500 text-white" : "text-gray-700 hover:bg-orange-50"}`}
              onClick={() => setActiveTab("analytics")}
            >
              <TrendingUp className="w-5 h-5" />
              <span className="font-medium">Thống kê</span>
            </Button>

            <Button
              variant={activeTab === "customers" ? "default" : "ghost"}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition justify-start ${activeTab === "customers" ? "bg-orange-500 text-white" : "text-gray-700 hover:bg-orange-50"}`}
              onClick={() => setActiveTab("customers")}
            >
              <Users className="w-5 h-5" />
              <span className="font-medium">Khách hàng</span>
            </Button>

            <Button
              variant={activeTab === "settings" ? "default" : "ghost"}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition justify-start ${activeTab === "settings" ? "bg-orange-500 text-white" : "text-gray-700 hover:bg-orange-50"}`}
              onClick={() => setActiveTab("settings")}
            >
              <Settings className="w-5 h-5" />
              <span className="font-medium">Cài đặt</span>
            </Button>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6">
          {activeTab === "dashboard" && (
            <div className="space-y-6">
              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, index) => (
                  <Card key={index} className="border-orange-100 shadow-sm hover:shadow-md transition">
                    <CardHeader className="p-6 pb-4">
                      <div className="flex items-center justify-between mb-4">
                        <div className={`w-12 h-12 ${stat.color} rounded-lg flex items-center justify-center`}>
                          <stat.icon className="w-6 h-6 text-white" />
                        </div>
                        <Badge variant="default" className="text-green-600 text-sm font-medium bg-green-50">
                          {stat.change}
                        </Badge>
                      </div>
                      <CardTitle className="text-gray-600 text-sm mb-1">{stat.title}</CardTitle>
                      <CardDescription>
                        <span className="text-2xl font-bold text-gray-900">{stat.value}</span>
                      </CardDescription>
                    </CardHeader>
                  </Card>
                ))}
              </div>

              {/* Recent Orders */}
              <Card className="border-orange-100 shadow-sm">
                <CardHeader className="border-b border-gray-200 p-6">
                  <CardTitle className="text-xl font-bold text-gray-900">Đơn hàng gần đây</CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    {orders.slice(0, 3).map((order) => {
                      const StatusIcon = getStatusIcon(order.status);
                      return (
                        <div
                          key={order.id}
                          className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-orange-50 transition"
                        >
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                              <StatusIcon className="w-5 h-5 text-orange-500" />
                            </div>
                            <div>
                              <p className="font-semibold text-gray-900">{order.id}</p>
                              <p className="text-sm text-gray-600">{order.customer}</p>
                              <p className="text-xs text-gray-500 mt-1">{order.items}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-orange-500">{order.total}</p>
                            <Badge variant="outline" className={`mt-2 text-xs font-medium ${getStatusColor(order.status)}`}>
                              {getStatusText(order.status)}
                            </Badge>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <Button variant="outline" className="w-full mt-4 text-orange-500 font-medium hover:bg-orange-50 rounded-lg transition">
                    Xem tất cả đơn hàng
                  </Button>
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === "orders" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-gray-900">Quản lý đơn hàng</h1>
                <Select>
                  <SelectTrigger className="w-[180px] border-gray-300">
                    <SelectValue placeholder="Tất cả trạng thái" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tất cả trạng thái</SelectItem>
                    <SelectItem value="pending">Chờ xử lý</SelectItem>
                    <SelectItem value="preparing">Đang chuẩn bị</SelectItem>
                    <SelectItem value="completed">Hoàn thành</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Card className="border-orange-100 shadow-sm">
                <CardContent className="p-0">
                  <Table>
                    <TableHeader className="bg-orange-50 border-b border-orange-200">
                      <TableRow>
                        <TableHead className="text-left text-sm font-semibold text-gray-700">Mã đơn</TableHead>
                        <TableHead className="text-left text-sm font-semibold text-gray-700">Khách hàng</TableHead>
                        <TableHead className="text-left text-sm font-semibold text-gray-700">Món ăn</TableHead>
                        <TableHead className="text-left text-sm font-semibold text-gray-700">Tổng tiền</TableHead>
                        <TableHead className="text-left text-sm font-semibold text-gray-700">Trạng thái</TableHead>
                        <TableHead className="text-left text-sm font-semibold text-gray-700">Thời gian</TableHead>
                        <TableHead className="text-right text-sm font-semibold text-gray-700">Thao tác</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {orders.map((order) => (
                        <TableRow key={order.id} className="hover:bg-orange-50">
                          <TableCell className="text-sm font-medium text-gray-900">{order.id}</TableCell>
                          <TableCell className="text-sm text-gray-700">{order.customer}</TableCell>
                          <TableCell className="text-sm text-gray-600 max-w-xs">{order.items}</TableCell>
                          <TableCell className="text-sm font-semibold text-orange-500">{order.total}</TableCell>
                          <TableCell>
                            <Badge variant="outline" className={`text-xs font-medium ${getStatusColor(order.status)}`}>
                              {getStatusText(order.status)}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-sm text-gray-500">{order.time}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button variant="ghost" size="icon" className="hover:bg-orange-100">
                                <Eye className="w-4 h-4 text-gray-600" />
                              </Button>
                              <Button variant="ghost" size="icon" className="hover:bg-orange-100">
                                <Edit className="w-4 h-4 text-gray-600" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === "menu" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-gray-900">Quản lý thực đơn</h1>
                <Button className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg shadow-md transition">
                  <Plus className="w-4 h-4" />
                  Thêm món mới
                </Button>
              </div>

              <Card className="border-orange-100 shadow-sm">
                <CardContent className="p-0">
                  <Table>
                    <TableHeader className="bg-orange-50 border-b border-orange-200">
                      <TableRow>
                        <TableHead className="text-left text-sm font-semibold text-gray-700">Tên món</TableHead>
                        <TableHead className="text-left text-sm font-semibold text-gray-700">Danh mục</TableHead>
                        <TableHead className="text-left text-sm font-semibold text-gray-700">Giá</TableHead>
                        <TableHead className="text-left text-sm font-semibold text-gray-700">Tồn kho</TableHead>
                        <TableHead className="text-left text-sm font-semibold text-gray-700">Đã bán</TableHead>
                        <TableHead className="text-right text-sm font-semibold text-gray-700">Thao tác</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {menuItems.map((item) => (
                        <TableRow key={item.id} className="hover:bg-orange-50">
                          <TableCell className="text-sm font-medium text-gray-900">{item.name}</TableCell>
                          <TableCell className="text-sm text-gray-700">{item.category}</TableCell>
                          <TableCell className="text-sm font-semibold text-orange-500">{item.price}</TableCell>
                          <TableCell>
                            <Badge
                              variant="outline"
                              className={`text-xs font-medium ${
                                item.stock === "Còn hàng"
                                  ? "bg-green-100 text-green-700"
                                  : "bg-yellow-100 text-yellow-700"
                              }`}
                            >
                              {item.stock}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-sm text-gray-700">{item.sales}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button variant="ghost" size="icon" className="hover:bg-orange-100">
                                <Edit className="w-4 h-4 text-gray-600" />
                              </Button>
                              <Button variant="ghost" size="icon" className="hover:bg-red-100">
                                <Trash2 className="w-4 h-4 text-red-600" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === "analytics" && (
            <div className="space-y-6">
              <h1 className="text-2xl font-bold text-gray-900">Thống kê & Báo cáo</h1>
              <Card className="border-orange-100 shadow-sm text-center">
                <CardHeader className="p-8">
                  <TrendingUp className="w-16 h-16 text-orange-500 mx-auto mb-4" />
                  <CardTitle className="text-gray-600">Chức năng thống kê đang được phát triển</CardTitle>
                </CardHeader>
              </Card>
            </div>
          )}

          {activeTab === "customers" && (
            <div className="space-y-6">
              <h1 className="text-2xl font-bold text-gray-900">Quản lý khách hàng</h1>
              <Card className="border-orange-100 shadow-sm text-center">
                <CardHeader className="p-8">
                  <Users className="w-16 h-16 text-orange-500 mx-auto mb-4" />
                  <CardTitle className="text-gray-600">Chức năng quản lý khách hàng đang được phát triển</CardTitle>
                </CardHeader>
              </Card>
            </div>
          )}

          {activeTab === "settings" && (
            <div className="space-y-6">
              <h1 className="text-2xl font-bold text-gray-900">Cài đặt</h1>
              <Card className="border-orange-100 shadow-sm text-center">
                <CardHeader className="p-8">
                  <Settings className="w-16 h-16 text-orange-500 mx-auto mb-4" />
                  <CardTitle className="text-gray-600">Chức năng cài đặt đang được phát triển</CardTitle>
                </CardHeader>
              </Card>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};