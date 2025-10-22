import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useFormik } from "formik";
import * as Yup from "yup";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { UserPlus } from "lucide-react";
import { createShopStaff } from "@/services/shop.service";
import { toast } from "react-hot-toast";

// Schema xác thực với Yup
const validationSchema = Yup.object({
  fullName: Yup.string()
    .required("Họ và tên là bắt buộc")
    .min(2, "Họ và tên phải có ít nhất 2 ký tự"),
  email: Yup.string()
    .email("Email không hợp lệ")
    .required("Email là bắt buộc"),
  password: Yup.string()
    .required("Mật khẩu là bắt buộc")
    .min(8, "Mật khẩu phải có ít nhất 8 ký tự"),
  confirmPassword: Yup.string()
    .required("Xác nhận mật khẩu là bắt buộc")
    .oneOf([Yup.ref("password"), null], "Mật khẩu xác nhận không khớp"),
});

export const CreateEmployeePage = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const formik = useFormik({
    initialValues: {
      fullName: "",
      email: "",
      password: "",
      confirmPassword: "",
      roleName: "MANAGER_STAFF", // Fixed role for manager
    },
    validationSchema,
    onSubmit: async (values, { setSubmitting }) => {
      setIsSubmitting(true);
      const submitToast = toast.loading("Đang đăng ký quản lý...");
      try {
        const payload = {
          full_name: values.fullName,
          email: values.email,
          password: values.password,
          confirmPassword: values.confirmPassword,
          roleName: "MANAGER_STAFF", // Hard-coded role
        };
        const res = await createShopStaff(payload);
        toast.success(res.data.message, { id: submitToast });
        navigate("/store-director/manage/create-shop");
      } catch (err) {
        console.error("[❌ Lỗi đăng ký quản lý]", err);
        const errorMessage =
          err.response?.data?.message || "Có lỗi xảy ra khi đăng ký quản lý.";
        toast.error(errorMessage, { id: submitToast });
      } finally {
        setIsSubmitting(false);
        setSubmitting(false);
      }
    },
  });

  return (
    <form onSubmit={formik.handleSubmit} className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
          Đăng ký quản lý
        </h1>
        <p className="mt-2 text-muted-foreground">
          Điền thông tin dưới đây để đăng ký tài khoản quản lý. OTP sẽ được gửi đến email để xác minh.
        </p>
      </div>

      <div className="mb-6">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <UserPlus className="h-5 w-5 text-muted-foreground" />
              <CardTitle>Thông tin quản lý</CardTitle>
            </div>
            <CardDescription>Thông tin cơ bản để tạo tài khoản quản lý</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Họ và tên */}
            <div className="space-y-2">
              <Label htmlFor="fullName">Họ và tên *</Label>
              <Input
                id="fullName"
                name="fullName"
                type="text"
                placeholder="Nhập họ và tên"
                value={formik.values.fullName}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                required
              />
              {formik.touched.fullName && formik.errors.fullName && (
                <p className="text-sm text-red-500">{formik.errors.fullName}</p>
              )}
            </div>

            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="Nhập email"
                value={formik.values.email}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                required
              />
              {formik.touched.email && formik.errors.email && (
                <p className="text-sm text-red-500">{formik.errors.email}</p>
              )}
            </div>

            {/* Mật khẩu */}
            <div className="space-y-2">
              <Label htmlFor="password">Mật khẩu *</Label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="Nhập mật khẩu"
                value={formik.values.password}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                required
              />
              {formik.touched.password && formik.errors.password && (
                <p className="text-sm text-red-500">{formik.errors.password}</p>
              )}
            </div>

            {/* Xác nhận mật khẩu */}
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Xác nhận mật khẩu *</Label>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                placeholder="Xác nhận mật khẩu"
                value={formik.values.confirmPassword}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                required
              />
              {formik.touched.confirmPassword && formik.errors.confirmPassword && (
                <p className="text-sm text-red-500">{formik.errors.confirmPassword}</p>
              )}
            </div>

            {/* Vai trò - Hiển thị tĩnh */}
            <div className="space-y-2">
              <Label>Vai trò *</Label>
              <p className="text-sm text-foreground">Quản lý</p>
              <input
                type="hidden"
                name="roleName"
                value="MANAGER_STAFF"
              />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex items-center justify-between border rounded-lg p-6">
        <div>
          <p className="text-sm font-medium">
            Bạn đã sẵn sàng đăng ký tài khoản quản lý?
          </p>
          <p className="text-sm text-muted-foreground">
            Hãy chắc chắn rằng tất cả thông tin đã chính xác trước khi tiếp tục.
          </p>
        </div>
        <Button type="submit" size="lg" disabled={isSubmitting}>
          {isSubmitting ? "Đang đăng ký..." : "Đăng ký"}
        </Button>
      </div>
    </form>
  );
};