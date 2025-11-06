import { useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Calendar } from "lucide-react";
import { toast } from "react-hot-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { createVoucher } from "@/services/voucher.service";

const validationSchema = Yup.object({
  code: Yup.string()
    .required("Mã voucher là bắt buộc")
    .min(3, "Mã phải có ít nhất 3 ký tự"),
  description: Yup.string().max(300, "Mô tả không được vượt quá 300 ký tự"),
  discount_type: Yup.string().required("Loại giảm giá là bắt buộc"),
  discount_value: Yup.number().required("Giá trị giảm là bắt buộc").min(1, "Phải lớn hơn 0"),
  min_order_amount: Yup.number().min(0, "Giá trị tối thiểu không hợp lệ"),
  max_discount: Yup.number().min(0, "Giảm giá tối đa không hợp lệ"),
  start_date: Yup.date().required("Ngày bắt đầu là bắt buộc"),
  end_date: Yup.date()
    .required("Ngày kết thúc là bắt buộc")
    .min(Yup.ref("start_date"), "Ngày kết thúc phải sau ngày bắt đầu"),
  usage_limit: Yup.number().min(0, "Số lượt sử dụng không hợp lệ"),
});

export const CreateVoucherPage = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const formik = useFormik({
    initialValues: {
      code: "",
      description: "",
      discount_type: "PERCENT",
      discount_value: "",
      min_order_amount: "",
      max_discount: "",
      start_date: "",
      end_date: "",
      usage_limit: "",
      is_active: true,
    },
    validationSchema,
   onSubmit: async (values) => {
  setIsSubmitting(true);
  const loadingToast = toast.loading("Đang tạo voucher...");

  try {
    // Gọi API tạo voucher
    
    const response = await createVoucher(values);

    toast.success("Tạo mã khuyến mãi thành công!", { id: loadingToast });


    // Reset form sau khi tạo thành công
    formik.resetForm();
  } catch (err) {
    console.error("[Lỗi tạo voucher]", err);
    const message = err.response?.data?.message || "Có lỗi xảy ra khi tạo voucher.";
    toast.error(message, { id: loadingToast });
  } finally {
    setIsSubmitting(false);
  }
},

  });

  return (
    <form onSubmit={formik.handleSubmit} className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
          Tạo mã khuyến mãi
        </h1>
        <p className="mt-2 text-muted-foreground">
          Điền thông tin bên dưới để tạo một mã giảm giá mới cho khách hàng.
        </p>
      </div>

      {/* Basic Information Card */}
      <div className="mb-6">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-muted-foreground" />
              <CardTitle>Thông tin mã khuyến mãi</CardTitle>
            </div>
            <CardDescription>Thông tin chi tiết về mã khuyến mãi của bạn</CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="code">Mã khuyến mãi <span className="text-red-500">*</span></Label>
              <Input
                id="code"
                name="code"
                placeholder="Nhập mã voucher"
                value={formik.values.code}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                disabled={isSubmitting}
              />
              {formik.touched.code && formik.errors.code && (
                <p className="text-sm text-red-500">{formik.errors.code}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Mô tả</Label>
              <Textarea
                id="description"
                name="description"
                placeholder="Mô tả voucher..."
                value={formik.values.description}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                rows={3}
                disabled={isSubmitting}
              />
              {formik.touched.description && formik.errors.description && (
                <p className="text-sm text-red-500">{formik.errors.description}</p>
              )}
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="discount_type">Loại giảm giá <span className="text-red-500">*</span></Label>
                <Select
                  name="discount_type"
                  value={formik.values.discount_type}
                  onValueChange={(value) => formik.setFieldValue("discount_type", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn loại giảm giá" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PERCENT">Phần trăm (%)</SelectItem>
                    <SelectItem value="FIXED">Cố định (VNĐ)</SelectItem>
                  </SelectContent>
                </Select>
                {formik.touched.discount_type && formik.errors.discount_type && (
                  <p className="text-sm text-red-500">{formik.errors.discount_type}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="discount_value">Giá trị giảm <span className="text-red-500">*</span></Label>
                <Input
                  id="discount_value"
                  name="discount_value"
                  type="number"
                  placeholder="Nhập giá trị giảm"
                  value={formik.values.discount_value}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  disabled={isSubmitting}
                />
                {formik.touched.discount_value && formik.errors.discount_value && (
                  <p className="text-sm text-red-500">{formik.errors.discount_value}</p>
                )}
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="min_order_amount">Giá trị đơn hàng tối thiểu</Label>
                <Input
                  id="min_order_amount"
                  name="min_order_amount"
                  type="number"
                  placeholder="Nhập giá trị tối thiểu"
                  value={formik.values.min_order_amount}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  disabled={isSubmitting}
                />
                {formik.touched.min_order_amount && formik.errors.min_order_amount && (
                  <p className="text-sm text-red-500">{formik.errors.min_order_amount}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="max_discount">Giảm giá tối đa</Label>
                <Input
                  id="max_discount"
                  name="max_discount"
                  type="number"
                  placeholder="Nhập mức giảm tối đa"
                  value={formik.values.max_discount}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  disabled={isSubmitting}
                />
                {formik.touched.max_discount && formik.errors.max_discount && (
                  <p className="text-sm text-red-500">{formik.errors.max_discount}</p>
                )}
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="start_date">Ngày bắt đầu <span className="text-red-500">*</span></Label>
                <Input
                  id="start_date"
                  name="start_date"
                  type="date"
                  value={formik.values.start_date}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  disabled={isSubmitting}
                />
                {formik.touched.start_date && formik.errors.start_date && (
                  <p className="text-sm text-red-500">{formik.errors.start_date}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="end_date">Ngày kết thúc <span className="text-red-500">*</span></Label>
                <Input
                  id="end_date"
                  name="end_date"
                  type="date"
                  value={formik.values.end_date}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  disabled={isSubmitting}
                />
                {formik.touched.end_date && formik.errors.end_date && (
                  <p className="text-sm text-red-500">{formik.errors.end_date}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="usage_limit">Số lần sử dụng tối đa</Label>
              <Input
                id="usage_limit"
                name="usage_limit"
                type="number"
                placeholder="Nhập số lần (0 = không giới hạn)"
                value={formik.values.usage_limit}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                disabled={isSubmitting}
              />
              {formik.touched.usage_limit && formik.errors.usage_limit && (
                <p className="text-sm text-red-500">{formik.errors.usage_limit}</p>
              )}
            </div>

        

          </CardContent>
        </Card>
      </div>

      <div className="flex items-center justify-between border rounded-lg p-6 bg-gradient-to-r from-blue-50 to-indigo-50">
        <div>
          <p className="text-sm font-medium text-foreground">
            Sẵn sàng “ướp vị” ưu đãi cho khách chưa?
          </p>
          <p className="text-sm text-muted-foreground">
            Voucher sẽ “lên đĩa” phục vụ ngay khi bạn lưu và kích hoạt!
          </p>
        </div>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Đang tạo..." : "Tạo voucher"}
        </Button>
      </div>
    </form>
  );
};
