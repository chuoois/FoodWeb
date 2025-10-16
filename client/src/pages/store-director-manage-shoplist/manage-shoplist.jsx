import React, { useContext } from "react";
import { Link } from "react-router-dom";
import { AuthContext } from "@/context/AuthContext"; // <-- Cập nhật đường dẫn tới file context của bạn
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Store, MapPin, Loader2 } from "lucide-react";

export const ShopListPage = () => {
  // Lấy trạng thái và dữ liệu shop trực tiếp từ AuthContext
  // Điều này giúp tránh gọi lại API và đảm bảo dữ liệu luôn đồng nhất
  const { hasShop, shop } = useContext(AuthContext);

  // --- 1. Xử lý trạng thái đang tải ---
  // Khi `hasShop` là `null`, có nghĩa là AuthContext đang trong quá trình kiểm tra.
  // Chúng ta sẽ hiển thị một spinner để người dùng biết hệ thống đang xử lý.
  if (hasShop === null) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // --- 2. Xử lý trường hợp không có cửa hàng ---
  // Khi `hasShop` là `false`, hiển thị thông báo và nút để tạo cửa hàng mới.
  if (!hasShop) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50/50">
        <Card className="max-w-md text-center shadow-sm">
          <CardHeader>
            <CardTitle>Chưa có cửa hàng</CardTitle>
            <CardDescription>
              Bạn chưa đăng ký cửa hàng nào. Hãy tạo một cửa hàng mới để bắt đầu kinh doanh nhé!
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild>
              <Link to="/create-shop">Tạo cửa hàng mới</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // --- 3. Hiển thị thông tin cửa hàng (khi đã có) ---
  // Nếu `hasShop` là true nhưng không có dữ liệu `shop`, có thể có lỗi.
  // Trường hợp này hiếm khi xảy ra nếu context được thiết lập đúng.
  if (!shop) {
     return (
        <div className="flex h-screen items-center justify-center">
            <p className="text-red-500">Lỗi: Không thể tải dữ liệu cửa hàng.</p>
        </div>
     )
  }

  // API chỉ trả về một shop cho mỗi owner, nên ta đưa shop vào một mảng để map cho tiện
  const shopsArray = [shop]; 

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
          Quản lý cửa hàng
        </h1>
        <p className="mt-2 text-muted-foreground">
          Xem chi tiết và quản lý thông tin cửa hàng của bạn.
        </p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Store className="h-5 w-5 text-muted-foreground" />
            <CardTitle>Thông tin cửa hàng</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tên cửa hàng</TableHead>
                  <TableHead>Loại</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead>Số điện thoại</TableHead>
                  <TableHead>Địa chỉ</TableHead>
                  <TableHead>Ngày tạo</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {shopsArray.map((s) => (
                  <TableRow key={s._id}>
                    <TableCell className="font-medium">{s.name}</TableCell>
                    <TableCell>{s.type === "Food" ? "Đồ ăn" : "Đồ uống"}</TableCell>
                    <TableCell>
                      <span
                        className={`inline-block whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-medium ${
                          s.status === "PENDING_APPROVAL"
                            ? "bg-yellow-100 text-yellow-800"
                            : s.status === "ACTIVE"
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {s.status === "PENDING_APPROVAL"
                          ? "Đang chờ duyệt"
                          : s.status === "ACTIVE"
                          ? "Đang hoạt động"
                          : "Bị cấm/Ngừng hoạt động"}
                      </span>
                    </TableCell>
                    <TableCell>{s.phone}</TableCell>
                    <TableCell>
                      <div className="flex items-start gap-1.5">
                        <MapPin className="h-4 w-4 flex-shrink-0 text-muted-foreground mt-0.5" />
                        <span>{`${s.address.street}, ${s.address.ward}, ${s.address.district}, ${s.address.city}`}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {new Date(s.createdAt).toLocaleDateString("vi-VN")}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};