import { useState } from "react";
import {
  Search,
  Bell,
  User,
  LogOut,
  Home,
  ShoppingBag,
  Users,
  Settings,
  TrendingUp,
  DollarSign,
  Package,
  Clock,
  CheckCircle,
  XCircle,
  Eye,
  Edit,
  Trash2,
  Plus,
  ChevronDown,
} from "lucide-react";

export const ComponentStaff =() => {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [showUserMenu, setShowUserMenu] = useState(false);

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
      {/* Header */}
      <header className="bg-[#FBF4E6] border-b border-orange-200 shadow-sm sticky top-0 z-40">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 bg-orange-500 rounded-full flex items-center justify-center shadow-md">
                <span className="text-white font-bold text-lg">Y</span>
              </div>
              <span className="text-2xl font-bold text-gray-900">
                Yummy<span className="text-orange-500">Go</span>
              </span>
              <span className="ml-2 text-sm text-gray-500">| Quản lý</span>
            </div>

            {/* Search */}
            <div className="flex items-center gap-2 max-w-md w-full px-4 py-2 border border-orange-300 rounded-full bg-white">
              <Search className="w-5 h-5 text-gray-500" />
              <input
                type="text"
                placeholder="Tìm kiếm đơn hàng, món ăn..."
                className="w-full outline-none text-sm"
              />
            </div>

            {/* Right actions */}
            <div className="flex items-center gap-4">
              <button className="relative p-2 hover:bg-orange-50 rounded-full transition">
                <Bell className="w-5 h-5 text-gray-700" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>

              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-2 px-3 py-2 hover:bg-orange-50 rounded-full transition"
                >
                  <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center">
                    <User className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-sm font-medium">Nhân viên A</span>
                  <ChevronDown className="w-4 h-4 text-gray-500" />
                </button>

                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2">
                    <button className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2">
                      <User className="w-4 h-4" />
                      Thông tin cá nhân
                    </button>
                    <button className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2">
                      <Settings className="w-4 h-4" />
                      Cài đặt
                    </button>
                    <hr className="my-2" />
                    <button className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2 text-red-600">
                      <LogOut className="w-4 h-4" />
                      Đăng xuất
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 bg-white border-r border-orange-200 min-h-[calc(100vh-73px)] sticky top-[73px]">
          <nav className="p-4 space-y-2">
            <button
              onClick={() => setActiveTab("dashboard")}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition ${
                activeTab === "dashboard"
                  ? "bg-orange-500 text-white"
                  : "hover:bg-orange-50 text-gray-700"
              }`}
            >
              <Home className="w-5 h-5" />
              <span className="font-medium">Tổng quan</span>
            </button>

            <button
              onClick={() => setActiveTab("orders")}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition ${
                activeTab === "orders"
                  ? "bg-orange-500 text-white"
                  : "hover:bg-orange-50 text-gray-700"
              }`}
            >
              <ShoppingBag className="w-5 h-5" />
              <span className="font-medium">Đơn hàng</span>
              <span className="ml-auto bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                3
              </span>
            </button>

            <button
              onClick={() => setActiveTab("menu")}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition ${
                activeTab === "menu"
                  ? "bg-orange-500 text-white"
                  : "hover:bg-orange-50 text-gray-700"
              }`}
            >
              <Package className="w-5 h-5" />
              <span className="font-medium">Thực đơn</span>
            </button>

            <button
              onClick={() => setActiveTab("analytics")}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition ${
                activeTab === "analytics"
                  ? "bg-orange-500 text-white"
                  : "hover:bg-orange-50 text-gray-700"
              }`}
            >
              <TrendingUp className="w-5 h-5" />
              <span className="font-medium">Thống kê</span>
            </button>

            <button
              onClick={() => setActiveTab("customers")}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition ${
                activeTab === "customers"
                  ? "bg-orange-500 text-white"
                  : "hover:bg-orange-50 text-gray-700"
              }`}
            >
              <Users className="w-5 h-5" />
              <span className="font-medium">Khách hàng</span>
            </button>

            <button
              onClick={() => setActiveTab("settings")}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition ${
                activeTab === "settings"
                  ? "bg-orange-500 text-white"
                  : "hover:bg-orange-50 text-gray-700"
              }`}
            >
              <Settings className="w-5 h-5" />
              <span className="font-medium">Cài đặt</span>
            </button>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6">
          {activeTab === "dashboard" && (
            <div className="space-y-6">
              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, index) => (
                  <div
                    key={index}
                    className="bg-white rounded-xl p-6 shadow-sm border border-orange-100 hover:shadow-md transition"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div
                        className={`w-12 h-12 ${stat.color} rounded-lg flex items-center justify-center`}
                      >
                        <stat.icon className="w-6 h-6 text-white" />
                      </div>
                      <span className="text-green-600 text-sm font-medium">
                        {stat.change}
                      </span>
                    </div>
                    <h3 className="text-gray-600 text-sm mb-1">{stat.title}</h3>
                    <p className="text-2xl font-bold text-gray-900">
                      {stat.value}
                    </p>
                  </div>
                ))}
              </div>

              {/* Recent Orders */}
              <div className="bg-white rounded-xl shadow-sm border border-orange-100">
                <div className="p-6 border-b border-gray-200">
                  <h2 className="text-xl font-bold text-gray-900">
                    Đơn hàng gần đây
                  </h2>
                </div>
                <div className="p-6">
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
                              <p className="font-semibold text-gray-900">
                                {order.id}
                              </p>
                              <p className="text-sm text-gray-600">
                                {order.customer}
                              </p>
                              <p className="text-xs text-gray-500 mt-1">
                                {order.items}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-orange-500">
                              {order.total}
                            </p>
                            <span
                              className={`inline-block px-3 py-1 rounded-full text-xs font-medium mt-2 ${getStatusColor(
                                order.status
                              )}`}
                            >
                              {getStatusText(order.status)}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <button className="w-full mt-4 py-2 text-orange-500 font-medium hover:bg-orange-50 rounded-lg transition">
                    Xem tất cả đơn hàng
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === "orders" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-gray-900">
                  Quản lý đơn hàng
                </h1>
                <div className="flex gap-2">
                  <select className="px-4 py-2 border border-gray-300 rounded-lg bg-white">
                    <option>Tất cả trạng thái</option>
                    <option>Chờ xử lý</option>
                    <option>Đang chuẩn bị</option>
                    <option>Hoàn thành</option>
                  </select>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-orange-100">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-orange-50 border-b border-orange-200">
                      <tr>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                          Mã đơn
                        </th>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                          Khách hàng
                        </th>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                          Món ăn
                        </th>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                          Tổng tiền
                        </th>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                          Trạng thái
                        </th>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                          Thời gian
                        </th>
                        <th className="px-6 py-3 text-right text-sm font-semibold text-gray-700">
                          Thao tác
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {orders.map((order) => (
                        <tr key={order.id} className="hover:bg-orange-50">
                          <td className="px-6 py-4 text-sm font-medium text-gray-900">
                            {order.id}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-700">
                            {order.customer}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600 max-w-xs">
                            {order.items}
                          </td>
                          <td className="px-6 py-4 text-sm font-semibold text-orange-500">
                            {order.total}
                          </td>
                          <td className="px-6 py-4">
                            <span
                              className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                                order.status
                              )}`}
                            >
                              {getStatusText(order.status)}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-500">
                            {order.time}
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex justify-end gap-2">
                              <button className="p-2 hover:bg-orange-100 rounded-lg transition">
                                <Eye className="w-4 h-4 text-gray-600" />
                              </button>
                              <button className="p-2 hover:bg-orange-100 rounded-lg transition">
                                <Edit className="w-4 h-4 text-gray-600" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeTab === "menu" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-gray-900">
                  Quản lý thực đơn
                </h1>
                <button className="flex items-center gap-2 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg shadow-md transition">
                  <Plus className="w-4 h-4" />
                  Thêm món mới
                </button>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-orange-100">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-orange-50 border-b border-orange-200">
                      <tr>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                          Tên món
                        </th>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                          Danh mục
                        </th>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                          Giá
                        </th>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                          Tồn kho
                        </th>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                          Đã bán
                        </th>
                        <th className="px-6 py-3 text-right text-sm font-semibold text-gray-700">
                          Thao tác
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {menuItems.map((item) => (
                        <tr key={item.id} className="hover:bg-orange-50">
                          <td className="px-6 py-4 text-sm font-medium text-gray-900">
                            {item.name}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-700">
                            {item.category}
                          </td>
                          <td className="px-6 py-4 text-sm font-semibold text-orange-500">
                            {item.price}
                          </td>
                          <td className="px-6 py-4">
                            <span
                              className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                                item.stock === "Còn hàng"
                                  ? "bg-green-100 text-green-700"
                                  : "bg-yellow-100 text-yellow-700"
                              }`}
                            >
                              {item.stock}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-700">
                            {item.sales}
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex justify-end gap-2">
                              <button className="p-2 hover:bg-orange-100 rounded-lg transition">
                                <Edit className="w-4 h-4 text-gray-600" />
                              </button>
                              <button className="p-2 hover:bg-red-100 rounded-lg transition">
                                <Trash2 className="w-4 h-4 text-red-600" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeTab === "analytics" && (
            <div className="space-y-6">
              <h1 className="text-2xl font-bold text-gray-900">
                Thống kê & Báo cáo
              </h1>
              <div className="bg-white rounded-xl shadow-sm border border-orange-100 p-8 text-center">
                <TrendingUp className="w-16 h-16 text-orange-500 mx-auto mb-4" />
                <p className="text-gray-600">
                  Chức năng thống kê đang được phát triển
                </p>
              </div>
            </div>
          )}

          {activeTab === "customers" && (
            <div className="space-y-6">
              <h1 className="text-2xl font-bold text-gray-900">
                Quản lý khách hàng
              </h1>
              <div className="bg-white rounded-xl shadow-sm border border-orange-100 p-8 text-center">
                <Users className="w-16 h-16 text-orange-500 mx-auto mb-4" />
                <p className="text-gray-600">
                  Chức năng quản lý khách hàng đang được phát triển
                </p>
              </div>
            </div>
          )}

          {activeTab === "settings" && (
            <div className="space-y-6">
              <h1 className="text-2xl font-bold text-gray-900">Cài đặt</h1>
              <div className="bg-white rounded-xl shadow-sm border border-orange-100 p-8 text-center">
                <Settings className="w-16 h-16 text-orange-500 mx-auto mb-4" />
                <p className="text-gray-600">
                  Chức năng cài đặt đang được phát triển
                </p>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}