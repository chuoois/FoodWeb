import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import {
  Plus,
  X,
  ImageIcon,
  UtensilsCrossed,
  CircleDollarSign,
  ListChecks,
} from "lucide-react";
import { createFoodWithCategory } from "@/services/food.service";
import { uploadImages } from "@/utils/cloudinary";
import { fileToDataUrl, getCroppedImg } from "@/utils/imageCrop"; // ✅ Giữ import này
import Cropper from "react-easy-crop";
import toast from "react-hot-toast";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";

export function CreateFoodPage() {
  const imageInputRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [newOption, setNewOption] = useState({ type: "SIZE", name: "", price: 0 });

  // 🟡 Crop states
  const [showCropModal, setShowCropModal] = useState(false);
  const [cropSrc, setCropSrc] = useState(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [setFieldValueRef, setSetFieldValueRef] = useState(null);

  // ✅ Validation
  const FoodSchema = Yup.object().shape({
    name: Yup.string().required("Tên món là bắt buộc"),
    description: Yup.string(),
    price: Yup.number().min(0, "Giá không hợp lệ").required("Giá là bắt buộc"),
    discount: Yup.number().min(0).max(100),
    category_name: Yup.string().required("Danh mục là bắt buộc"),
    image_url: Yup.string().url("Ảnh không hợp lệ").required("Cần tải ảnh lên"),
  });

  // 🟢 Khi chọn file => hiển thị crop modal
  const handleImageChange = async (e, setFieldValue) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const dataUrl = await fileToDataUrl(file);
      setCropSrc(dataUrl);
      setShowCropModal(true);
      setSetFieldValueRef(() => setFieldValue);
    } catch {
      toast.error("Không đọc được ảnh, vui lòng thử lại.");
    }
  };

  // 🟢 Crop và upload
  const handleCropAndUpload = async () => {
    try {
      if (!cropSrc || !croppedAreaPixels) return;
      setUploading(true);
      toast.loading("Đang tải ảnh đã crop...", { id: "upload" });

      const blob = await getCroppedImg(cropSrc, croppedAreaPixels);
      const file = new File([blob], "cropped.jpg", { type: "image/jpeg" });

      const urls = await uploadImages([file], setUploading);
      if (urls?.length > 0) {
        setFieldValueRef("image_url", urls[0]);
        toast.success("Tải ảnh thành công!", { id: "upload" });
      } else {
        toast.error("Tải ảnh thất bại!", { id: "upload" });
      }
    } catch (err) {
      console.error(err);
      toast.error("Có lỗi khi crop ảnh!", { id: "upload" });
    } finally {
      setUploading(false);
      setShowCropModal(false);
      setCropSrc(null);
    }
  };

  // 🟢 Submit form
  const handleSubmit = async (values, { resetForm }) => {
    try {
      setIsLoading(true);
      const payload = {
        ...values,
        price: Number(values.price),
        discount: Number(values.discount),
      };
      const res = await createFoodWithCategory(payload);
      toast.success(`Tạo món "${res.data.data.food.name}" thành công!`);
      if (imageInputRef.current) imageInputRef.current.value = "";
      resetForm();
    } catch (err) {
      const serverMessage = err.response?.data?.message || "";
      const errorDetail = err.response?.data?.error || "";
      if (
        serverMessage.includes("Shop not found for this staff") ||
        errorDetail.includes("Shop not found for this staff")
      ) {
        toast.error(
          "Tài khoản này chưa được gán cho cửa hàng nào. Vui lòng liên hệ quản lý để được thêm vào cửa hàng."
        );
      } else {
        toast.error(serverMessage || "Không thể tạo món ăn.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  // 🟢 Option thêm/xóa
  const handleAddOption = (values, setFieldValue) => {
    if (newOption.name.trim()) {
      setFieldValue("options", [...values.options, newOption]);
      setNewOption({ type: "SIZE", name: "", price: 0 });
    }
  };
  const handleRemoveOption = (index, values, setFieldValue) => {
    const updated = values.options.filter((_, i) => i !== index);
    setFieldValue("options", updated);
  };

 
  return (
    <Formik
      initialValues={{
        name: "",
        description: "",
        price: 0,
        discount: 0,
        image_url: "",
        is_available: true,
        category_name: "",
        options: [],
      }}
      validationSchema={FoodSchema}
      onSubmit={handleSubmit}
    >
      {({ values, setFieldValue }) => (
        <>
          <Form className="container mx-auto py-8">
            <div className="mb-8">
              <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
                Tạo món ăn mới
              </h1>
              <p className="mt-2 text-muted-foreground">
                Điền thông tin chi tiết về món ăn của bạn bên dưới.
              </p>
            </div>

            {/* 🧩 Thông tin cơ bản */}
            <Card className="mb-6">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <UtensilsCrossed className="h-5 w-5 text-muted-foreground" />
                  <CardTitle>Thông tin cơ bản</CardTitle>
                </div>
                <CardDescription>
                  Nhập tên, mô tả và danh mục của món ăn
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>
                    Tên món <span className="text-red-500">*</span>
                  </Label>
                  <Field as={Input} name="name" placeholder="Nhập tên món" required />
                  <ErrorMessage
                    name="name"
                    component="p"
                    className="text-red-500 text-sm"
                  />
                </div>
                <div>
                  <Label>Mô tả</Label>
                  <Field
                    as="textarea"
                    name="description"
                    placeholder="Nhập mô tả món ăn"
                    rows={4}
                    className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>
                <div>
                  <Label>
                    Tên danh mục <span className="text-red-500">*</span>
                  </Label>
                  <Field
                    as={Input}
                    name="category_name"
                    placeholder="Nhập tên danh mục"
                    required
                  />
                  <ErrorMessage
                    name="category_name"
                    component="p"
                    className="text-red-500 text-sm"
                  />
                </div>
              </CardContent>
            </Card>

            {/* 🖼️ Hình ảnh */}
            <Card className="mb-6">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <ImageIcon className="h-5 w-5 text-muted-foreground" />
                  <CardTitle>Hình ảnh món ăn</CardTitle>
                </div>
                <CardDescription>
                  Tải lên hình ảnh minh họa cho món ăn
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>
                    Ảnh minh họa <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    type="file"
                    accept="image/*"
                    ref={imageInputRef}
                    onChange={(e) => handleImageChange(e, setFieldValue)}
                  />
                  <ErrorMessage
                    name="image_url"
                    component="p"
                    className="text-red-500 text-sm"
                  />
                  {values.image_url && (
                    <div className="mt-2">
                      <img
                        src={values.image_url}
                        alt="Preview"
                        className="h-24 w-24 rounded-md border object-cover"
                      />
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* 💰 Giá */}
            <Card className="mb-6">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <CircleDollarSign className="h-5 w-5 text-muted-foreground" />
                  <CardTitle>Giá món ăn</CardTitle>
                </div>
                <CardDescription>Thiết lập giá bán và mức giảm giá</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>
                      Giá (VND)<span className="text-red-500">*</span>
                    </Label>
                    <Field
                      as={Input}
                      type="number"
                      name="price"
                      placeholder="0"
                      min="0"
                      step="5000"
                      required
                    />
                    <ErrorMessage
                      name="price"
                      component="p"
                      className="text-red-500 text-sm"
                    />
                  </div>
                  <div>
                    <Label>Giảm giá (%)</Label>
                    <Field
                      as={Input}
                      type="number"
                      name="discount"
                      placeholder="0"
                      min="0"
                      max="100"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* ⚙️ Tuỳ chọn */}
            <Card className="mb-6">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <ListChecks className="h-5 w-5 text-muted-foreground" />
                  <CardTitle>Tùy chọn món ăn</CardTitle>
                </div>
                <CardDescription>
                  Thêm các tuỳ chọn như Size, Topping, Extra, hoặc Spicy
                </CardDescription>
              </CardHeader>
              <CardContent>
                {/* Form thêm option */}
                <div className="mb-6 p-4 border border-border rounded-lg bg-card shadow-sm space-y-3">
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <Label>Loại</Label>
                      <select
                        value={newOption.type}
                        onChange={(e) =>
                          setNewOption((prev) => ({ ...prev, type: e.target.value }))
                        }
                        className="w-full border border-input rounded-md px-3 py-2 text-sm bg-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      >
                        <option value="SIZE">Size</option>
                        <option value="TOPPING">Topping</option>
                        <option value="EXTRA">Extra</option>
                        <option value="SPICY">Spicy</option>
                      </select>
                    </div>
                    <div>
                      <Label>Tên</Label>
                      <Input
                        type="text"
                        value={newOption.name}
                        onChange={(e) =>
                          setNewOption((prev) => ({ ...prev, name: e.target.value }))
                        }
                        placeholder="e.g., Large, Cheese"
                      />
                    </div>
                    <div>
                      <Label>Giá (VND)</Label>
                      <Input
                        type="number"
                        value={newOption.price}
                        onChange={(e) =>
                          setNewOption((prev) => ({
                            ...prev,
                            price: Number(e.target.value),
                          }))
                        }
                        placeholder="0"
                        min="0"
                        step="10000"
                      />
                    </div>
                  </div>
                  <Button
                    type="button"
                    onClick={() => handleAddOption(values, setFieldValue)}
                    variant="outline"
                    className="w-full bg-transparent"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Thêm tuỳ chọn
                  </Button>
                </div>

                {/* Danh sách options */}
                {values.options.length > 0 && (
                  <div className="space-y-3">
                    {values.options.map((option, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-4 border border-border rounded-xl bg-card shadow-sm hover:shadow-md transition-shadow"
                      >
                        <div className="flex flex-col">
                          <span className="font-semibold text-foreground">
                            {option.name}
                          </span>
                          <span className="text-sm text-muted-foreground">
                            {option.type} •{" "}
                            <span className="text-primary font-medium">
                              {option.price.toLocaleString()} VND
                            </span>
                          </span>
                        </div>

                        <button
                          type="button"
                          onClick={() =>
                            handleRemoveOption(index, values, setFieldValue)
                          }
                          className="p-2 hover:bg-destructive/10 rounded-lg transition-colors"
                        >
                          <X className="w-4 h-4 text-destructive" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* 🟢 Buttons */}
            <div className="flex gap-3">
              <Button type="button" variant="outline" className="flex-1 bg-transparent">
                Huỷ
              </Button>
              <Button type="submit" disabled={isLoading} className="flex-1">
                {isLoading ? "Đang tạo..." : "Tạo món ăn"}
              </Button>
            </div>
          </Form>

          {/* 🟣 Crop Modal */}
          {showCropModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
              <div className="w-[90%] max-w-3xl bg-white rounded-xl shadow-lg p-4">
                <div className="h-[400px] relative bg-gray-100 rounded-lg overflow-hidden">
                  <Cropper
                    image={cropSrc}
                    crop={crop}
                    zoom={zoom}
                    aspect={1 / 1}
                    onCropChange={setCrop}
                    onZoomChange={setZoom}
                    onCropComplete={(_, croppedAreaPixels) =>
                      setCroppedAreaPixels(croppedAreaPixels)
                    }
                  />
                </div>

                <div className="flex items-center justify-between mt-4">
                  <input
                    type="range"
                    min={1}
                    max={3}
                    step={0.1}
                    value={zoom}
                    onChange={(e) => setZoom(Number(e.target.value))}
                    className="w-[70%]"
                  />
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setShowCropModal(false);
                        setCropSrc(null);
                      }}
                    >
                      Hủy
                    </Button>
                    <Button onClick={handleCropAndUpload} disabled={uploading}>
                      {uploading ? "Đang tải..." : "Crop & Upload"}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </Formik>
  );
}
