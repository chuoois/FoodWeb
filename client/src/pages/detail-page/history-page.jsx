import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Clock, ChevronRight } from "lucide-react";

export const HistoryPage = () => {
  const navigate = useNavigate();
  const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";

  useEffect(() => {
    if (!isLoggedIn) {
      navigate("/auth/login");
    }
  }, [isLoggedIn, navigate]);

  // Sample order data
  const orders = [
    {
      id: "ORD001",
      date: "2025-09-30",
      restaurant: "Nhà hàng Gà Rán KFC",
      total: 250000,
      status: "Hoàn thành",
    },
    {
      id: "ORD002",
      date: "2025-09-28",
      restaurant: "Quán Bún Bò Huế 123",
      total: 120000,
      status: "Hoàn thành",
    },
    {
      id: "ORD003",
      date: "2025-09-25",
      restaurant: "Pizza Hut",
      total: 350000,
      status: "Đã hủy",
    },
  ];

  return (
    <div className="min-h-screen bg-orange-50">
      <div className="flex flex-col items-center justify-center px-4 py-8">
        {/* Logo + Brand */}

        {/* White card */}
        <div className="w-full max-w-3xl bg-white rounded-2xl shadow-lg p-8">
          <h2 className="text-2xl font-semibold text-center mb-1">
            Lịch sử mua hàng
          </h2>
          <p className="text-center text-gray-600 mb-8">
            Xem lại các đơn hàng bạn đã đặt tại{" "}
            <span className="font-medium">YummyGo</span>
          </p>

          {/* Order List */}
          <div className="space-y-4">
            {orders.length === 0 ? (
              <p className="text-center text-gray-500">
                Bạn chưa có đơn hàng nào.
              </p>
            ) : (
              orders.map((order) => (
                <div
                  key={order.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-orange-50 transition"
                >
                  <div className="flex items-center gap-4">
                    <Clock className="w-6 h-6 text-orange-500" />
                    <div>
                      <div className="font-medium text-gray-900">
                        {order.restaurant}
                      </div>
                      <div className="text-sm text-gray-600">
                        Đơn hàng #{order.id} • {order.date}
                      </div>
                      <div className="text-sm text-gray-600">
                        Tổng: {order.total.toLocaleString("vi-VN")} VNĐ
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span
                      className={`text-sm font-medium ${
                        order.status === "Hoàn thành"
                          ? "text-green-500"
                          : "text-red-500"
                      }`}
                    >
                      {order.status}
                    </span>
                    <Link
                      to={`/order/${order.id}`}
                      className="text-orange-500 hover:underline flex items-center"
                    >
                      Chi tiết <ChevronRight className="w-4 h-4 ml-1" />
                    </Link>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
