import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { CheckCircle, Truck, XCircle, ArrowLeft } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getUserOrders } from "@/services/order.service"; // Import đúng API

export function MyOrderPage() {
  const [activeTab, setActiveTab] = useState("all");
  const [orders, setOrders] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Ánh xạ tab → status API
  const mapTabToStatus = (tab) => {
    if (tab === "delivering") return "DELIVERING";
    if (tab === "completed") return "COMPLETED";
    if (tab === "cancelled") return "CANCELLED";
    if (tab === "pending") return "PENDING";
    return ""; // "all" → không gửi status
  };

  // Gọi API lấy danh sách đơn hàng
  const fetchOrders = async (tab = activeTab, page = 1) => {
    try {
      setLoading(true);
      setError(null);

      const status = mapTabToStatus(tab);
      const params = { page, limit: 10 };
      if (status) params.status = status;

      const response = await getUserOrders(params);

      if (response.data.success) {
        setOrders(response.data.data || []);
        setPagination(response.data.pagination || pagination);
      } else {
        setError("Không thể tải đơn hàng");
      }
    } catch (err) {
      setError("Lỗi kết nối server");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Load lần đầu
  useEffect(() => {
    fetchOrders(activeTab, 1);
  }, []);

  // Khi đổi tab
  useEffect(() => {
    fetchOrders(activeTab, 1);
  }, [activeTab]);

  // Badge trạng thái
  const getStatusBadge = (status) => {
    switch (status) {
      case "DELIVERING":
      case "SHIPPED":
        return (
          <div className="flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
            <Truck size={16} /> Đang giao
          </div>
        );
      case "COMPLETED":
        return (
          <div className="flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
            <CheckCircle size={16} /> Hoàn thành
          </div>
        );
      case "CANCELLED":
        return (
          <div className="flex items-center gap-1 px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm font-medium">
            <XCircle size={16} /> Đã hủy
          </div>
        );
      default:
        return (
          <div className="flex items-center gap-1 px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-sm font-medium">
            Chờ xử lý
          </div>
        );
    }
  };

  // Lấy ảnh đầu tiên
  const getFirstImage = (items) => items?.[0]?.food_image_url || "/placeholder.svg";

  // Tổng số món
  const getTotalItems = (items) =>
    items?.reduce((sum, item) => sum + item.quantity, 0) || 0;

  // Xử lý thay đổi trang
  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      fetchOrders(activeTab, newPage);
      window.scrollTo(0, 0);
    }
  };

  if (loading && orders.length === 0) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-lg">Đang tải đơn hàng...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-lg text-red-500">{error}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-orange-500 text-white py-6 px-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate(-1)} className="lg:hidden">
              <ArrowLeft size={24} />
            </button>
            <h1 className="text-2xl lg:text-4xl font-bold">Đơn Hàng Của Tôi</h1>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4">
          <div className="flex overflow-x-auto">
            {[
              { id: "all", label: "Tất cả" },
              { id: "pending", label: "Chờ xử lý" },
              { id: "delivering", label: "Đang giao" },
              { id: "completed", label: "Hoàn thành" },
              { id: "cancelled", label: "Đã hủy" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-shrink-0 px-4 py-3 font-medium text-sm border-b-2 transition-colors whitespace-nowrap ${
                  activeTab === tab.id
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
        {orders.length === 0 ? (
          <Card className="text-center py-12">
            <p className="text-foreground/60 text-lg">Không có đơn hàng nào</p>
          </Card>
        ) : (
          <>
            <div className="space-y-4">
              {orders.map((order) => (
                <Card key={order._id} className="hover:shadow-lg transition-shadow overflow-hidden">
                  <CardContent className="p-0">
                    <div className="flex gap-6 p-4">
                      <div className="w-32 h-32 flex-shrink-0 bg-gray-200 overflow-hidden rounded-lg">
                        <img
                          src={getFirstImage(order.items)}
                          alt={order.items?.[0]?.food_name || "Order"}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 flex flex-col justify-between">
                        <div className="flex items-start justify-between gap-4 mb-2">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="text-lg font-semibold">{order.shop_id.name}</h3>
                              {getStatusBadge(order.status)}
                            </div>
                            <p className="text-sm text-foreground/60">
                              {getTotalItems(order.items)} món •{" "}
                              {new Date(order.createdAt).toLocaleDateString("vi-VN")}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-2xl font-bold text-orange-500">
                              {order.total_amount.toLocaleString("vi-VN")}₫
                            </p>
                            <p className="text-xs text-foreground/60 mt-1">
                              Mã: {order.order_code}
                            </p>
                          </div>
                        </div>

                        <div className="flex gap-2">
                          <Button
                            className="flex-1 bg-orange-500 hover:bg-orange-600 text-white"
                            onClick={() => navigate(`/myorder/${order._id}`)}
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

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="flex justify-center items-center gap-2 mt-8">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={pagination.page === 1}
                >
                  Trước
                </Button>

                <span className="text-sm text-foreground/60">
                  Trang {pagination.page} / {pagination.totalPages}
                </span>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={pagination.page === pagination.totalPages}
                >
                  Sau
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}