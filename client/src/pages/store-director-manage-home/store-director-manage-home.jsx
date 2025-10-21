import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, Store, FileCheck, ArrowRight } from "lucide-react";

export const ManagerHomePage = () => {
    const navigate = useNavigate();

    return (
        <div className="container mx-auto py-8">
            <div className="mb-8">
                <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
                    Trang chủ quản lý cửa hàng
                </h1>
                <p className="mt-2 text-muted-foreground">
                    Chào mừng bạn đến với trang chủ quản lý. Dưới đây là hướng dẫn từng bước để thiết lập và quản lý cửa hàng của bạn.
                </p>
            </div>

            {/* Steps Overview */}
            <div className="grid gap-6 md:grid-cols-3">
                {/* Step 1: Create and Manage Staff */}
                <Card className="relative overflow-hidden">
                    <Badge variant="secondary" className="absolute top-4 right-4">
                        Bước 1
                    </Badge>
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <Users className="h-5 w-5 text-muted-foreground" />
                            <CardTitle>Tạo và quản lý tài khoản quản lý</CardTitle>
                        </div>
                        <CardDescription>
                            Tạo tài khoản cho quản lý, theo dõi danh sách quản lý hiện có.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <ul className="list-disc pl-5 space-y-2 text-sm text-muted-foreground">
                            <li>Đăng ký tài khoản quản lý mới.</li>
                            <li>Xem và chỉnh sửa thông tin .</li>
                            <li>Giao vai trò và quyền hạn phù hợp.</li>
                            <li>Theo dõi hoạt động của đội ngũ.</li>
                        </ul>
                        <Button
                            variant="outline"
                            className="w-full justify-between"
                            onClick={() => navigate("/store-director/manage/create-staff")}
                        >
                            Tạo tài khoản quản lý
                            <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                    </CardContent>
                </Card>

                {/* Step 2: Create Shop */}
                <Card className="relative overflow-hidden">
                    <Badge variant="secondary" className="absolute top-4 right-4">
                        Bước 2
                    </Badge>
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <Store className="h-5 w-5 text-muted-foreground" />
                            <CardTitle>Tạo cửa hàng</CardTitle>
                        </div>
                        <CardDescription>
                            Gửi thông tin đăng ký cửa hàng mới để được bộ phận quản lý xem xét và phê duyệt.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <ul className="list-disc pl-5 space-y-2 text-sm text-muted-foreground">
                            <li>Điền thông tin cơ bản: tên, địa chỉ, loại hình.</li>
                            <li>Chọn quản lý từ danh sách .</li>
                            <li>Tải lên logo và ảnh bìa.</li>
                            <li>Gửi đơn đăng ký để chờ phê duyệt.</li>
                        </ul>
                        <Button
                            variant="outline"
                            className="w-full justify-between"
                            onClick={() => navigate("/store-director/manage/create-shop")}
                        >
                            Tạo cửa hàng mới
                            <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                    </CardContent>
                </Card>

                {/* Step 3: Track Approvals */}
                <Card className="relative overflow-hidden">
                    <Badge variant="secondary" className="absolute top-4 right-4">
                        Bước 3
                    </Badge>
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <FileCheck className="h-5 w-5 text-muted-foreground" />
                            <CardTitle>Theo dõi xét duyệt</CardTitle>
                        </div>
                        <CardDescription>
                            Kiểm tra trạng thái đơn đăng ký cửa hàng và quản lý các yêu cầu phê duyệt.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <ul className="list-disc pl-5 space-y-2 text-sm text-muted-foreground">
                            <li>Xem danh sách các đơn đăng ký đang chờ.</li>
                            <li>Nhận thông báo về trạng thái phê duyệt.</li>
                            <li>Chỉnh sửa đơn nếu bị từ chối.</li>
                            <li>Theo dõi tiến độ kích hoạt cửa hàng.</li>
                        </ul>
                        <Button
                            variant="outline"
                            className="w-full justify-between"
                            onClick={() => navigate("/store-director/manage/approval")}
                        >
                            Theo dõi đơn duyệt
                            <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                    </CardContent>
                </Card>
            </div>

            {/* Additional Tips */}
            <div className="mt-8 border rounded-lg p-6 bg-gradient-to-r from-blue-50 to-indigo-50">
                <h2 className="text-xl font-semibold mb-4">Lưu ý quan trọng</h2>
                <ul className="list-disc pl-5 space-y-2 text-sm text-muted-foreground">
                    <li>Bạn cần hoàn thành bước 1 trước khi tạo cửa hàng để có danh sách quản lý sẵn sàng.</li>
                    <li>Đơn đăng ký cửa hàng sẽ được xét duyệt trong vòng 24-48 giờ.</li>
                    <li>Nếu gặp vấn đề, liên hệ hỗ trợ qua email: support@storemanager.com.</li>
                    <li>Giữ thông tin chính xác để tránh trì hoãn quá trình phê duyệt.</li>
                </ul>
            </div>
        </div>
    );
};