import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { CheckCircle, Truck, XCircle, ArrowLeft, Star } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getUserOrders } from "@/services/order.service";
import { ReviewPopup } from "./ReviewPopup";

export function MyOrderPage() {
  const [activeTab, setActiveTab] = useState("all");
  const [orders, setOrders] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 5,
    total: 0,
    totalPages: 1,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reviewPopup, setReviewPopup] = useState({
    isOpen: false,
    order: null,
  });
  const navigate = useNavigate();

  const tabs = [
    { id: "all", label: "Tất cả" },
    { id: "pending", label: "Chờ xác nhận" },
    { id: "preparing", label: "Đang chuẩn bị" },
    { id: "shipping", label: "Đang giao" },
    { id: "delivered", label: "Hoàn thành" },
    { id: "cancelled", label: "Đã hủy" },
  ];

  const mapTabToStatus = (tab) => {
    switch (tab) {
      case "pending":
        return ["PENDING_PAYMENT", "PENDING"];
      case "preparing":
        return ["CONFIRMED", "PREPARING"];
      case "shipping":
        return ["SHIPPING"];
      case "delivered":
        return ["DELIVERED"];
      case "cancelled":
        return ["CANCELLED", "REFUNDED"];
      default:
        return [];
    }
  };

  const fetchOrders = async (tab = activeTab, page = 1) => {
    try {
      setLoading(true);
      setError(null);
      const statusList = mapTabToStatus(tab);
      const params = { page, limit: pagination.limit };
      if (statusList.length > 0) params.status = statusList.join(",");

      const response = await getUserOrders(params);
      if (response?.data?.success) {
        setOrders(response.data.data || []);
        setPagination(response.data.pagination || { ...pagination, page });
      } else setError("Không thể tải đơn hàng");
    } catch {
      setError("Lỗi kết nối server");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders(activeTab, 1);
    // eslint-disable-next-line
  }, [activeTab]);

  const handlePageChange = (newPage) => {
    if (newPage < 1 || newPage > pagination.totalPages) return;
    fetchOrders(activeTab, newPage);
  };

  const handleOpenReview = (order) => {
    setReviewPopup({ isOpen: true, order });
  };

  const handleCloseReview = () => {
    setReviewPopup({ isOpen: false, order: null });
  };

  const handleReviewSuccess = (orderId) => {
    // Update local state immediately - mark order as reviewed
    setOrders(prevOrders => 
      prevOrders.map(order => 
        order._id === orderId 
          ? { ...order, isReviewed: true } 
          : order
      )
    );
    
    // Optionally refresh from server to ensure data consistency
    // fetchOrders(activeTab, pagination.page);
  };

  const getStatusBadge = (status = "") => {
    const s = status.toUpperCase();
    const base = "flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium";
    if (s === "PENDING_PAYMENT" || s === "PENDING")
      return <div className={`${base} bg-yellow-100 text-yellow-700`}><CheckCircle size={16} /> Chờ xác nhận</div>;
    if (s === "CONFIRMED" || s === "PREPARING")
      return <div className={`${base} bg-purple-100 text-purple-700`}><CheckCircle size={16} /> Đang chuẩn bị</div>;
    if (s === "SHIPPING")
      return <div className={`${base} bg-blue-100 text-blue-700`}><Truck size={16} /> Đang giao</div>;
    if (s === "DELIVERED")
      return <div className={`${base} bg-green-100 text-green-700`}><CheckCircle size={16} /> Đã giao</div>;
    if (["CANCELLED", "REFUNDED"].includes(s))
      return <div className={`${base} bg-red-100 text-red-700`}><XCircle size={16} /> Đã hủy</div>;
    return <div className={`${base} bg-gray-100 text-gray-600`}>Không xác định</div>;
  };

  const getFirstImage = (items) => items?.[0]?.food_image_url || "/placeholder.svg";
  const getTotalItems = (items) => items?.reduce((sum, item) => sum + item.quantity, 0) || 0;

  if (loading && !orders.length) {
    return <div className="min-h-screen flex items-center justify-center">Đang tải...</div>;
  }
  if (error) {
    return <div className="min-h-screen flex items-center justify-center text-red-500">{error}</div>;
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-orange-500 text-white py-6 px-4">
        <div className="max-w-4xl mx-auto flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="lg:hidden">
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-2xl font-bold">Đơn hàng của tôi</h1>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 flex overflow-x-auto">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`px-4 py-3 font-medium text-sm border-b-2 whitespace-nowrap ${
                activeTab === t.id ? "border-orange-500 text-orange-500" : "border-transparent text-gray-500"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6">
        {orders.length === 0 ? (
          <Card className="text-center py-12"><p className="text-gray-500 text-lg">Không có đơn hàng</p></Card>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => {
              const isDelivered = order.status?.toUpperCase() === "DELIVERED";

              return (
                <Card key={order._id} className="hover:shadow-lg transition">
                  <CardContent className="p-0">
                    <div className="flex gap-6 p-4">
                      <div className="w-32 h-32 overflow-hidden rounded-lg flex-shrink-0">
                        <img src={getFirstImage(order.items)} className="w-full h-full object-cover" alt="food" />
                      </div>

                      <div className="flex-1 flex flex-col justify-between min-w-0">
                        <div className="flex justify-between mb-2 gap-4">
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-3 mb-2 flex-wrap">
                              <h3 className="text-lg font-semibold truncate">{order.shop_id?.name}</h3>
                              {getStatusBadge(order.status)}
                            </div>
                            <p className="text-sm text-gray-500">
                              {getTotalItems(order.items)} món •{" "}
                              {new Date(order.createdAt).toLocaleDateString("vi-VN")}
                            </p>
                          </div>
                          <div className="text-right flex-shrink-0">
                            <p className="text-2xl font-bold text-orange-500">
                              {order.total_amount.toLocaleString("vi-VN")}₫
                            </p>
                            <p className="text-xs text-gray-500 mt-1">Mã: {order.order_code}</p>
                          </div>
                        </div>

                        <div className="flex gap-2">
                          <Button
                            className="flex-1 bg-orange-500 text-white hover:bg-orange-600"
                            onClick={() => navigate(`/myorder/${order._id}`)}
                          >
                            Xem Chi Tiết
                          </Button>
                          
                          {/* Show Review button only if delivered and not reviewed */}
                          {isDelivered && !order.isReviewed && (
                            <Button
                              variant="outline"
                              className="flex items-center gap-1 border-orange-500 text-orange-500 hover:bg-orange-50"
                              onClick={() => handleOpenReview(order)}
                            >
                              <Star size={16} /> Đánh giá
                            </Button>
                          )}
                          
                          {/* Show "Reviewed" button if already reviewed */}
                          {isDelivered && order.isReviewed && (
                            <Button
                              variant="outline"
                              disabled
                              className="flex items-center gap-1 border-green-500 text-green-600 bg-green-50 cursor-not-allowed opacity-75"
                            >
                              <CheckCircle size={16} /> Đã đánh giá
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* Pagination UI */}
        {pagination.totalPages >= 1 && (
          <div className="flex justify-center items-center gap-2 mt-6">
            <button
              onClick={() => handlePageChange(pagination.page - 1)}
              disabled={pagination.page === 1}
              className={`px-3 py-1 rounded border ${
                pagination.page === 1
                  ? "text-gray-400 border-gray-300 cursor-not-allowed"
                  : "text-orange-500 border-orange-500 hover:bg-orange-50"
              }`}
            >
              Trước
            </button>

            {[...Array(pagination.totalPages)].map((_, index) => {
              const page = index + 1;
              return (
                <button
                  key={page}
                  onClick={() => handlePageChange(page)}
                  className={`px-3 py-1 rounded border ${
                    pagination.page === page
                      ? "bg-orange-500 text-white border-orange-500"
                      : "text-orange-500 border-orange-500 hover:bg-orange-50"
                  }`}
                >
                  {page}
                </button>
              );
            })}

            <button
              onClick={() => handlePageChange(pagination.page + 1)}
              disabled={pagination.page === pagination.totalPages}
              className={`px-3 py-1 rounded border ${
                pagination.page === pagination.totalPages
                  ? "text-gray-400 border-gray-300 cursor-not-allowed"
                  : "text-orange-500 border-orange-500 hover:bg-orange-50"
              }`}
            >
              Sau
            </button>
          </div>
        )}
      </div>

      {/* Review Popup */}
      <ReviewPopup
        isOpen={reviewPopup.isOpen}
        onClose={handleCloseReview}
        order={reviewPopup.order}
        onSuccess={handleReviewSuccess}
      />
    </div>
  );
}