import { useState, useContext } from "react";
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
import { Store, MapPin, ImageIcon, Crosshair } from "lucide-react";
import { createShop } from "@/services/shop.service";
import { uploadImages } from "@/utils/cloudinary";
import { toast } from "react-hot-toast";
import { AuthContext } from "@/context/AuthContext";

// Validation schema with Yup
const validationSchema = Yup.object({
  name: Yup.string()
    .required("Tên cửa hàng là bắt buộc")
    .min(3, "Tên cửa hàng phải có ít nhất 3 ký tự"),
  description: Yup.string().max(500, "Mô tả không được vượt quá 500 ký tự"),
  phone: Yup.string()
    .required("Số điện thoại là bắt buộc")
    .matches(/^[0-9]{10,11}$/, "Số điện thoại phải có 10-11 chữ số"),
  type: Yup.string().required("Loại cửa hàng là bắt buộc"),
  address: Yup.object({
    street: Yup.string().required("Địa chỉ cụ thể là bắt buộc"),
    ward: Yup.string().required("Phường/Xã là bắt buộc"),
    district: Yup.string().required("Quận/Huyện là bắt buộc"),
    city: Yup.string().required("Tỉnh/Thành phố là bắt buộc"),
    province: Yup.string().required("Quốc Gia là bắt buộc"),
  }),
  gps: Yup.object({
    latitude: Yup.number()
      .required("Vĩ độ là bắt buộc")
      .min(-90, "Vĩ độ phải từ -90 đến 90")
      .max(90, "Vĩ độ phải từ -90 đến 90"),
    longitude: Yup.number()
      .required("Kinh độ là bắt buộc")
      .min(-180, "Kinh độ phải từ -180 đến 180")
      .max(180, "Kinh độ phải từ -180 đến 180"),
  }),
  logoUrl: Yup.string().url("Logo phải là một URL hợp lệ"),
  coverUrl: Yup.string().url("Ảnh bìa phải là một URL hợp lệ"),
});

export const CreateShopPage = () => {
  const { hasShop, checkShopStatus } = useContext(AuthContext);
  const [uploading, setUploading] = useState({ logo: false, cover: false });
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [isGettingLocation, setIsGettingLocation] = useState(false);

  const formik = useFormik({
    initialValues: {
      name: "",
      description: "",
      phone: "",
      type: "Food",
      address: {
        street: "",
        ward: "",
        district: "",
        city: "",
        province: "Việt Nam",
      },
      gps: {
        latitude: "",
        longitude: "",
      },
      logoUrl: "",
      coverUrl: "",
    },
    validationSchema,
    onSubmit: async (values, { setSubmitting }) => {
      if (uploading.logo || uploading.cover) {
        toast.error("Vui lòng chờ tải ảnh xong trước khi gửi!");
        return;
      }

      if (hasSubmitted) {
        toast.error("Bạn đã nộp đơn đăng ký. Vui lòng chờ xét duyệt!");
        return;
      }

      if (hasShop) {
        toast.error("Bạn đã có cửa hàng. Không thể đăng ký thêm!");
        return;
      }

      const submitToast = toast.loading("Đang gửi đăng ký cửa hàng...");
      try {
        const payload = {
          name: values.name,
          description: values.description,
          phone: values.phone,
          type: values.type,
          address: values.address,
          gps: {
            coordinates: [parseFloat(values.gps.longitude), parseFloat(values.gps.latitude)],
          },
          logoUrl: values.logoUrl,
          coverUrl: values.coverUrl,
        };

        const res = await createShop(payload);
        console.log("[✅ Tạo shop thành công]", res.data);
        toast.success("Tạo cửa hàng thành công! Đơn đăng ký của bạn đang chờ phê duyệt.", {
          id: submitToast,
        });
        setHasSubmitted(true);

        // Update shop status in AuthContext
        await checkShopStatus();
      } catch (err) {
        console.error("[❌ Lỗi tạo cửa hàng]", err);
        const errorMessage = err.response?.data?.message || "Có lỗi xảy ra khi tạo cửa hàng.";
        toast.error(errorMessage, { id: submitToast });

        // If error indicates shop already exists, refresh shop status
        if (errorMessage.includes("already exists") || errorMessage.includes("đã tồn tại")) {
          await checkShopStatus();
        }
      } finally {
        setSubmitting(false);
      }
    },
  });

  // Handle getting GPS location
  const handleGetLocation = () => {
    if (navigator.geolocation) {
      setIsGettingLocation(true);
      const locationToast = toast.loading("Đang lấy vị trí...");
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const lat = pos.coords.latitude;
          const lng = pos.coords.longitude;
          formik.setFieldValue("gps.latitude", lat.toString());
          formik.setFieldValue("gps.longitude", lng.toString());
          toast.success("Lấy vị trí thành công!", { id: locationToast });
          setIsGettingLocation(false);
        },
        (err) => {
          toast.error("Không lấy được vị trí: " + err.message, { id: locationToast });
          setIsGettingLocation(false);
        }
      );
    } else {
      toast.error("Trình duyệt không hỗ trợ định vị!");
      setIsGettingLocation(false);
    }
  };

  // Handle image upload
  const handleUpload = async (e, key) => {
    const files = e.target.files;
    if (!files?.length) return;

    setUploading((prev) => ({ ...prev, [key]: true }));
    const uploadToast = toast.loading(`Đang tải ảnh ${key === "logoUrl" ? "logo" : "bìa"}...`);
    try {
      const urls = await uploadImages([files[0]], () => { });
      if (urls.length > 0) {
        formik.setFieldValue(key, urls[0]);
        toast.success(`Tải ảnh ${key === "logoUrl" ? "logo" : "bìa"} thành công!`, {
          id: uploadToast,
        });
      } else {
        toast.error(`Không nhận được URL ảnh ${key === "logoUrl" ? "logo" : "bìa"}.`, {
          id: uploadToast,
        });
      }
    } catch (err) {
      console.error(`[Lỗi tải ảnh ${key}]`, err);
      toast.error(`Có lỗi xảy ra khi tải ảnh ${key === "logoUrl" ? "logo" : "bìa"}.`, {
        id: uploadToast,
      });
    } finally {
      setUploading((prev) => ({ ...prev, [key]: false }));
    }
  };

  // Show loading state while checking shop (hasShop is null during initial check)
  if (hasShop === null) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-lg text-muted-foreground">Đang kiểm tra trạng thái cửa hàng...</p>
        </div>
      </div>
    );
  }

  // If user has a shop, show disabled message
  if (hasShop) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>Cửa hàng đã tồn tại</CardTitle>
            <CardDescription>
              Bạn đã có một cửa hàng được đăng ký hoặc đang chờ xét duyệt. Không thể tạo thêm cửa hàng mới.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button disabled className="w-full">Đã có cửa hàng</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // If no shop, render the form
  return (
    <form onSubmit={formik.handleSubmit} className="container mx-auto py-8 ">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
          Tạo cửa hàng của bạn
        </h1>
        <p className="mt-2 text-muted-foreground">
          Điền mẫu dưới đây để đăng ký cửa hàng. Đơn của bạn sẽ được xem xét trước khi kích hoạt.
        </p>
      </div>

      {/* Basic Info */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Store className="h-5 w-5 text-muted-foreground" />
            <CardTitle>Thông tin cơ bản</CardTitle>
          </div>
          <CardDescription>Thông tin chính về cửa hàng của bạn</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Tên cửa hàng *</Label>
            <Input
              id="name"
              name="name"
              placeholder="Nhập tên cửa hàng"
              value={formik.values.name}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              required
            />
            {formik.touched.name && formik.errors.name && (
              <p className="text-sm text-red-500">{formik.errors.name}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Mô tả</Label>
            <Textarea
              id="description"
              name="description"
              placeholder="Mô tả cửa hàng..."
              value={formik.values.description}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              rows={3}
            />
            {formik.touched.description && formik.errors.description && (
              <p className="text-sm text-red-500">{formik.errors.description}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Số điện thoại *</Label>
            <Input
              id="phone"
              name="phone"
              type="tel"
              placeholder="Nhập số điện thoại"
              value={formik.values.phone}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              required
            />
            {formik.touched.phone && formik.errors.phone && (
              <p className="text-sm text-red-500">{formik.errors.phone}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="type">Loại cửa hàng</Label>
            <select
              id="type"
              name="type"
              value={formik.values.type}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              className="w-full rounded-md border border-input bg-background p-2"
            >
              <option value="Food">Đồ ăn</option>
              <option value="Drink">Đồ uống</option>
            </select>
            {formik.touched.type && formik.errors.type && (
              <p className="text-sm text-red-500">{formik.errors.type}</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Address */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-muted-foreground" />
            <CardTitle>Vị trí</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="address.street">Địa chỉ cụ thể *</Label>
            <Input
              id="address.street"
              name="address.street"
              placeholder="Địa chỉ cụ thể"
              value={formik.values.address.street}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              required
            />
            {formik.touched.address?.street && formik.errors.address?.street && (
              <p className="text-sm text-red-500">{formik.errors.address.street}</p>
            )}
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="address.ward">Phường/Xã *</Label>
              <Input
                id="address.ward"
                name="address.ward"
                placeholder="Phường/Xã"
                value={formik.values.address.ward}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                required
              />
              {formik.touched.address?.ward && formik.errors.address?.ward && (
                <p className="text-sm text-red-500">{formik.errors.address.ward}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="address.district">Quận/Huyện *</Label>
              <Input
                id="address.district"
                name="address.district"
                placeholder="Quận/Huyện"
                value={formik.values.address.district}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                required
              />
              {formik.touched.address?.district && formik.errors.address?.district && (
                <p className="text-sm text-red-500">{formik.errors.address.district}</p>
              )}
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="address.city">Tỉnh/Thành phố *</Label>
              <Input
                id="address.city"
                name="address.city"
                placeholder="Tỉnh/Thành phố"
                value={formik.values.address.city}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                required
              />
              {formik.touched.address?.city && formik.errors.address?.city && (
                <p className="text-sm text-red-500">{formik.errors.address.city}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="address.province">Quốc Gia *</Label>
              <Input
                id="address.province"
                name="address.province"
                placeholder="Quốc Gia"
                value={formik.values.address.province}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                required
                readOnly
                className="opacity-60 cursor-not-allowed bg-gray-100"
              />
              {formik.touched.address?.province && formik.errors.address?.province && (
                <p className="text-sm text-red-500">{formik.errors.address.province}</p>
              )}
            </div>
          </div>

          {/* Get current location button */}
          <div className="space-y-2">
            <Label>Lấy vị trí hiện tại</Label>
            <div className="flex items-center gap-4">
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={handleGetLocation}
                disabled={isGettingLocation || formik.isSubmitting}
              >
                {isGettingLocation ? (
                  <>
                    <svg
                      className="animate-spin h-5 w-5 mr-2"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                      />
                    </svg>
                    Đang lấy vị trí...
                  </>
                ) : (
                  <>
                    <Crosshair className="w-5 h-5 mr-2" />
                    Lấy vị trí hiện tại
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* GPS Inputs */}
          <div className="space-y-2">
            <Label>Tọa độ GPS</Label>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="gps.latitude">Vĩ độ (latitude) *</Label>
                <Input
                  id="gps.latitude"
                  name="gps.latitude"
                  placeholder="Vĩ độ (latitude)"
                  type="number"
                  step="any"
                  value={formik.values.gps.latitude}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  required
                />
                {formik.touched.gps?.latitude && formik.errors.gps?.latitude && (
                  <p className="text-sm text-red-500">{formik.errors.gps.latitude}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="gps.longitude">Kinh độ (longitude) *</Label>
                <Input
                  id="gps.longitude"
                  name="gps.longitude"
                  placeholder="Kinh độ (longitude)"
                  type="number"
                  step="any"
                  value={formik.values.gps.longitude}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  required
                />
                {formik.touched.gps?.longitude && formik.errors.gps?.longitude && (
                  <p className="text-sm text-red-500">{formik.errors.gps.longitude}</p>
                )}
              </div>
            </div>
          </div>
          {formik.values.gps.latitude && formik.values.gps.longitude && (
            <p className="text-sm text-muted-foreground">
              Tọa độ: {formik.values.gps.latitude}, {formik.values.gps.longitude}
            </p>
          )}
        </CardContent>
      </Card>

      {/* Branding with Upload */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <ImageIcon className="h-5 w-5 text-muted-foreground" />
            <CardTitle>Hình ảnh</CardTitle>
          </div>
          <CardDescription>Logo và ảnh bìa cửa hàng</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Logo cửa hàng</Label>
            <div className="flex items-center gap-4">
              <Input
                type="file"
                accept="image/*"
                onChange={(e) => handleUpload(e, "logoUrl")}
                disabled={uploading.logo || uploading.cover || formik.isSubmitting}
              />
              {uploading.logo && <p className="text-sm text-muted-foreground">Đang tải...</p>}
            </div>
            {formik.values.logoUrl && (
              <img
                src={formik.values.logoUrl}
                alt="Logo Preview"
                className="mt-2 h-24 rounded-md border object-cover"
              />
            )}
            {formik.touched.logoUrl && formik.errors.logoUrl && (
              <p className="text-sm text-red-500">{formik.errors.logoUrl}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Ảnh bìa</Label>
            <div className="flex items-center gap-4">
              <Input
                type="file"
                accept="image/*"
                onChange={(e) => handleUpload(e, "coverUrl")}
                disabled={uploading.logo || uploading.cover || formik.isSubmitting}
              />
              {uploading.cover && <p className="text-sm text-muted-foreground">Đang tải...</p>}
            </div>
            {formik.values.coverUrl && (
              <img
                src={formik.values.coverUrl}
                alt="Cover Preview"
                className="mt-2 h-32 w-full rounded-md border object-cover"
              />
            )}
            {formik.touched.coverUrl && formik.errors.coverUrl && (
              <p className="text-sm text-red-500">{formik.errors.coverUrl}</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Submit */}
      <div className="flex items-center justify-between border rounded-lg p-6">
        <div>
          <p className="text-sm font-medium">
            Bạn đã sẵn sàng gửi đăng ký cửa hàng?
          </p>
          <p className="text-sm text-muted-foreground">
            Chúng tôi sẽ xem xét và phê duyệt trong thời gian sớm nhất.
          </p>
        </div>
        <Button
          type="submit"
          size="lg"
          disabled={formik.isSubmitting || uploading.logo || uploading.cover || hasSubmitted}
        >
          {formik.isSubmitting
            ? "Đang gửi..."
            : hasSubmitted
              ? "Đã gửi đăng ký"
              : "Gửi đăng ký"}
        </Button>
      </div>
    </form>
  );
}