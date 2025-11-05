import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  ShoppingCart,
  Users,
  Store,
  Star,
  ArrowRight,
  Package,
} from "lucide-react";
import {
  getOverview,
  getRevenueStats,
  getRevenueComparison,
  getTopFoods,
  getShopsPerformance,
  getCustomerStats,
} from "@/services/dashboard.service";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export const OwnerDashboardPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({
    overview: {},
    revenueStats: [],
    revenueComparison: {},
    topFoods: [],
    shopsPerformance: [],
    customerStats: {},
  });

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const [
          overviewRes,
          revenueStatsRes,
          revenueComparisonRes,
          topFoodsRes,
          shopsPerformanceRes,
          customerStatsRes,
        ] = await Promise.all([
          getOverview(),
          getRevenueStats({ period: "month" }),
          getRevenueComparison(),
          getTopFoods(5),
          getShopsPerformance(),
          getCustomerStats(),
        ]);

        const overview = overviewRes.data || {};
        const revenueStats = revenueStatsRes.data || [];
        const revenueComparison = revenueComparisonRes.data || {};
        const topFoods = topFoodsRes.data || [];
        const shopsPerformance = shopsPerformanceRes.data || [];
        const customerStats = customerStatsRes.data || {};

        setData({
          overview,
          revenueStats,
          revenueComparison,
          topFoods,
          shopsPerformance,
          customerStats,
        });
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="container mx-auto py-8 flex items-center justify-center min-h-screen">
        <div className="text-muted-foreground">Đang tải dữ liệu...</div>
      </div>
    );
  }

  const {
    overview,
    revenueStats,
    revenueComparison,
    shopsPerformance,
    customerStats,
  } = data;

  const formatCurrency = (value) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(value || 0);
  };

  // Tính số cửa hàng đang hoạt động
  const activeShopsCount = shopsPerformance.filter(
    (shop) => shop.status === "ACTIVE"
  ).length;

  // Tính khách VIP (chi tiêu > 10 triệu)
  const vipCustomers = customerStats.topCustomers?.filter(
    (c) => c.totalSpent >= 10_000_000
  ).length || 0;

  // Tính giá trị đơn trung bình
  const avgOrderValue =
    customerStats.topCustomers?.length > 0
      ? customerStats.topCustomers.reduce((sum, c) => sum + c.avgOrderValue, 0) /
        customerStats.topCustomers.length
      : 0;

  // Chuẩn bị dữ liệu biểu đồ: chuyển _id thành ngày/tháng
  const chartData = revenueStats.map((item) => ({
    date: item._id.length === 7 ? item._id.slice(5) : item._id,
    revenue: item.revenue || 0,
  }));

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
          Tổng quan hệ thống
        </h1>
        <p className="mt-2 text-muted-foreground">
          Theo dõi hiệu suất kinh doanh, cửa hàng và khách hàng của bạn.
        </p>
      </div>

      {/* Overview Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Doanh thu hôm nay</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(revenueComparison.today)}
            </div>
            <p className="text-xs text-muted-foreground">
              {revenueComparison.todayGrowth > 0 ? (
                <span className="text-green-600 flex items-center">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  +{revenueComparison.todayGrowth}%
                </span>
              ) : revenueComparison.todayGrowth < 0 ? (
                <span className="text-red-600 flex items-center">
                  <TrendingDown className="h-3 w-3 mr-1" />
                  {revenueComparison.todayGrowth}%
                </span>
              ) : (
                <span className="text-muted-foreground">±0%</span>
              )}{" "}
              so với hôm qua
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tổng đơn hàng</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overview.totalOrders || 0}</div>
            <p className="text-xs text-muted-foreground">
              Trong toàn hệ thống
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Khách hàng mới</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {customerStats.newCustomersThisMonth || 0}
            </div>
            <p className="text-xs text-muted-foreground">Trong tháng này</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cửa hàng hoạt động</CardTitle>
            <Store className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeShopsCount}</div>
            <p className="text-xs text-muted-foreground">
              / {overview.totalShops || 0} tổng
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
        {/* Revenue Chart */}
        <Card className="col-span-12">
          <CardHeader>
            <CardTitle>Doanh thu theo tháng</CardTitle>
            <CardDescription>Theo từng tháng</CardDescription>
          </CardHeader>
          <CardContent className="pl-2">
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip formatter={(value) => formatCurrency(value)} />
                  <Bar dataKey="revenue" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-64 flex items-center justify-center text-muted-foreground">
                Không có dữ liệu doanh thu
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Shops Performance */}
      <Card className="mt-6">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Hiệu suất cửa hàng</CardTitle>
            <Store className="h-5 w-5 text-muted-foreground" />
          </div>
          <CardDescription>Doanh thu và đơn hàng theo cửa hàng</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {shopsPerformance.length > 0 ? (
              shopsPerformance.map((shop) => (
                <div
                  key={shop.shopId}
                  className="border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => navigate(`/owner/shops/${shop.shopId}`)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold">{shop.shopName}</h4>
                    <Badge
                      variant={shop.status === "ACTIVE" ? "default" : "secondary"}
                    >
                      {shop.status === "ACTIVE" ? "Hoạt động" : "Tạm dừng"}
                    </Badge>
                  </div>
                  <div className="space-y-1 text-sm">
                    <p className="text-muted-foreground">
                      Doanh thu:{" "}
                      <span className="font-medium text-foreground">
                        {formatCurrency(shop.totalRevenue)}
                      </span>
                    </p>
                    <p className="text-muted-foreground">
                      Đơn hàng: <span className="font-medium">{shop.totalOrders}</span>
                    </p>
                    <p className="text-muted-foreground">
                      Tỷ lệ hoàn thành:{" "}
                      <span className="font-medium">{shop.completionRate}%</span>
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p className="col-span-full text-center text-muted-foreground">
                Chưa có cửa hàng nào
              </p>
            )}
          </div>
          <Button
            variant="outline"
            className="w-full mt-4 justify-between"
            onClick={() => navigate("/store-director/manage/approval")}
          >
            Quản lý cửa hàng
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </CardContent>
      </Card>

      {/* Customer Stats */}
      <div className="mt-6 grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Tổng khách hàng</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{customerStats.totalCustomers || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">
              +{customerStats.newCustomersThisMonth || 0} khách mới tháng này
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Khách VIP</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{vipCustomers}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Đã chi tiêu trên 10 triệu
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Đơn trung bình</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {formatCurrency(avgOrderValue)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Giá trị trung bình mỗi đơn
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tips */}
      <div className="mt-8 border rounded-lg p-6 bg-gradient-to-r from-blue-50 to-indigo-50">
        <h2 className="text-xl font-semibold mb-4">Mẹo tối ưu</h2>
        <ul className="list-disc pl-5 space-y-2 text-sm text-muted-foreground">
          <li>Theo dõi món ăn bán chạy để điều chỉnh thực đơn phù hợp.</li>
          <li>Khuyến khích khách hàng quay lại bằng chương trình tích điểm.</li>
          <li>Kiểm tra hiệu suất từng cửa hàng để tối ưu vận hành.</li>
          <li>Sử dụng biểu đồ doanh thu để dự báo và lập kế hoạch.</li>
        </ul>
      </div>
    </div>
  );
};