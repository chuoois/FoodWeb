import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
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
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { Store, MapPin, ImageIcon, Crosshair, Check, Users } from "lucide-react";
import { createShop, getAllManagerStaffNames } from "@/services/shop.service";
import { getAddressFromCoordinates } from "@/services/goong.service";
import { uploadImages } from "@/utils/cloudinary";
import { fileToDataUrl, getCroppedImg } from "@/utils/imageCrop";
import { toast } from "react-hot-toast";
import Cropper from "react-easy-crop";
import goongjs from "@goongmaps/goong-js";

// Goong Maps API Key
const GOONG_API_KEY = import.meta.env.VITE_GOONG_API_KEY_ALT;

// Validation schema
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
  managers: Yup.array()
    .of(Yup.string())
    .min(1, "Phải chọn một quản lý")
    .max(1, "Chỉ được chọn một quản lý"),
});

export const CreateShopPage = () => {
  const navigate = useNavigate();
  const [uploading, setUploading] = useState({ logo: false, cover: false });
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [managers, setManagers] = useState([]);
  const [openManagers, setOpenManagers] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [cropSrc, setCropSrc] = useState(null);
  const [cropKey, setCropKey] = useState(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [showCropModal, setShowCropModal] = useState(false);
  const [pendingFileName, setPendingFileName] = useState("cropped.jpg");
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const markerRef = useRef(null);

  // Initialize Goong Maps
  useEffect(() => {
    goongjs.accessToken = GOONG_API_KEY;
    mapRef.current = new goongjs.Map({
      container: mapContainerRef.current,
      style: "https://tiles.goong.io/assets/goong_map_web.json",
      center: [105.5276, 21.0134],
      zoom: 12,
    });

    markerRef.current = new goongjs.Marker().setLngLat([105.5276, 21.0134]).addTo(mapRef.current);

    mapRef.current.on("click", async (e) => {
      const { lng, lat } = e.lngLat;
      markerRef.current.setLngLat([lng, lat]);
      formik.setFieldValue("gps.latitude", lat);
      formik.setFieldValue("gps.longitude", lng);

      try {
        const address = await getAddressFromCoordinates(lat, lng);
        formik.setFieldValue("address", {
          street: address.street || "",
          ward: address.ward || "",
          district: address.district || "",
          city: address.city || "",
          province: address.province || "Việt Nam",
        });
      } catch (err) {
        toast.error("Không thể lấy thông tin địa chỉ.");
        console.error("[Lỗi lấy địa chỉ từ tọa độ]", err);
      }
    });

    return () => mapRef.current.remove();
  }, []);

  // Fetch managers
  useEffect(() => {
    const fetchManagers = async () => {
      try {
        const response = await getAllManagerStaffNames();
        console.log("[Danh sách quản lý]", response.data);
        const managerData = Array.isArray(response.data.data) ? response.data.data : [];
        setManagers(managerData);
      } catch (err) {
        console.error("[Lỗi lấy danh sách quản lý]", err);
        toast.error("Không thể tải danh sách quản lý.");
        setManagers([]);
      }
    };
    fetchManagers();
  }, []);

  // Formik setup
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
      managers: [],
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
          managers: values.managers, // Mảng 1 phần tử
        };
        const res = await createShop(payload);
        console.log("[Tạo cửa hàng thành công]", res.data);
        toast.success("Tạo cửa hàng thành công! Đơn đăng ký của bạn đang chờ phê duyệt.", {
          id: submitToast,
        });
        setHasSubmitted(true);
        setTimeout(() => navigate("/store-director/manage/approval"), 2000);
      } catch (err) {
        console.error("[Lỗi tạo cửa hàng]", err);
        const errorMessage = err.response?.data?.message || "Có lỗi xảy ra khi tạo cửa hàng.";
        toast.error(errorMessage, { id: submitToast });
      } finally {
        setSubmitting(false);
      }
    },
  });

  // Handle file selection for cropping
  const handleSelectFileForCrop = async (e, key) => {
    const files = e.target.files;
    if (!files || !files.length) return;
    const file = files[0];
    try {
      const dataUrl = await fileToDataUrl(file);
      setCropSrc(dataUrl);
      setCropKey(key);
      setPendingFileName(file.name || `${key}.jpg`);
      setShowCropModal(true);
    } catch (err) {
      console.error("[Lỗi đọc file ảnh]", err);
      toast.error("Không thể đọc file ảnh.");
    }
  };

  // Handle crop and upload
  const handleCropAndUpload = async () => {
    if (!cropSrc || !croppedAreaPixels || !cropKey) {
      setShowCropModal(false);
      return;
    }
    setShowCropModal(false);
    try {
      setUploading((prev) => ({ ...prev, [cropKey]: true }));
      const uploadToast = toast.loading(`Đang tải ảnh ${cropKey === "logoUrl" ? "logo" : "bìa"}...`);
      const file = await getCroppedImg(cropSrc, croppedAreaPixels, pendingFileName);
      const urls = await uploadImages([file], () => { });
      if (urls.length > 0) {
        formik.setFieldValue(cropKey, urls[0]);
        toast.success(`Tải ảnh thành công!`, { id: uploadToast });
      } else {
        toast.error("Không nhận được URL ảnh.", { id: uploadToast });
      }
    } catch (err) {
      console.error("[Lỗi tải ảnh sau crop]", err);
      toast.error("Có lỗi xảy ra khi tải ảnh.");
    } finally {
      setUploading((prev) => ({ ...prev, [cropKey]: false }));
      setCropSrc(null);
      setCropKey(null);
      setZoom(1);
      setCrop({ x: 0, y: 0 });
      setCroppedAreaPixels(null);
    }
  };

  // Filter managers
  const filteredManagers = managers.filter((manager) =>
    manager.full_name?.toLowerCase().includes(searchValue.toLowerCase())
  );

  // Handle manager selection - CHỈ 1 QUẢN LÝ
  const handleManagerSelect = (managerId) => {
    const current = formik.values.managers;

    if (current.includes(managerId)) {
      formik.setFieldValue("managers", []);
    } else {
      formik.setFieldValue("managers", [managerId]);
    }

    formik.setFieldTouched("managers", true);
    setOpenManagers(false);
  };

  // Get current location
  const handleGetLocation = () => {
    if (navigator.geolocation) {
      setIsGettingLocation(true);
      const locationToast = toast.loading("Đang lấy vị trí...");
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          const lat = pos.coords.latitude;
          const lng = pos.coords.longitude;
          formik.setFieldValue("gps.latitude", lat);
          formik.setFieldValue("gps.longitude", lng);
          mapRef.current.setCenter([lng, lat]);
          markerRef.current.setLngLat([lng, lat]);

          try {
            const address = await getAddressFromCoordinates(lat, lng);
            formik.setFieldValue("address", {
              street: address.street || "",
              ward: address.ward || "",
              district: address.district || "",
              city: address.city || "",
              province: address.province || "Việt Nam",
            });
            toast.success("Lấy vị trí thành công!", { id: locationToast });
          } catch (err) {
            console.error("[Lỗi lấy địa chỉ từ tọa độ]", err);
            toast.error("Không thể lấy thông tin địa chỉ.", { id: locationToast });
          } finally {
            setIsGettingLocation(false);
          }
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

  return (
    <form onSubmit={formik.handleSubmit} className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
          Tạo cửa hàng của bạn
        </h1>
        <p className="mt-2 text-muted-foreground">
          Điền mẫu dưới đây để đăng ký cửa hàng. Đơn của bạn sẽ được xem xét trước khi kích hoạt.
        </p>
      </div>

      {/* Basic Information Card */}
      <div className="mb-6">
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
              <Label htmlFor="name">Tên cửa hàng <span className="text-red-500">*</span></Label>
              <Input
                id="name"
                name="name"
                placeholder="Nhập tên cửa hàng"
                value={formik.values.name}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                disabled={formik.isSubmitting || hasSubmitted}
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
                disabled={formik.isSubmitting || hasSubmitted}
              />
              {formik.touched.description && formik.errors.description && (
                <p className="text-sm text-red-500">{formik.errors.description}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Số điện thoại <span className="text-red-500">*</span></Label>
              <Input
                id="phone"
                name="phone"
                type="tel"
                placeholder="Nhập số điện thoại"
                value={formik.values.phone}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                disabled={formik.isSubmitting || hasSubmitted}
                required
              />
              {formik.touched.phone && formik.errors.phone && (
                <p className="text-sm text-red-500">{formik.errors.phone}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="type">Loại cửa hàng <span className="text-red-500">*</span></Label>
              <select
                id="type"
                name="type"
                value={formik.values.type}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className="w-full rounded-md border border-input bg-background px-3 py-2"
                disabled={formik.isSubmitting || hasSubmitted}
                required
              >
                <option value="Food">Đồ ăn</option>
                <option value="Drink">Đồ uống</option>
              </select>
              {formik.touched.type && formik.errors.type && (
                <p className="text-sm text-red-500">{formik.errors.type}</p>
              )}
            </div>

            {/* Quản lý - CHỈ 1 */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                Quản lý <span className="text-red-500">*</span>
              </Label>
              <Popover open={openManagers} onOpenChange={setOpenManagers}>
                <PopoverTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    role="combobox"
                    className="w-full justify-between h-10"
                    disabled={formik.isSubmitting || hasSubmitted}
                  >
                    {formik.values.managers.length > 0
                      ? managers.find(m => m._id === formik.values.managers[0])?.full_name || "Đang tải..."
                      : "Chọn quản lý..."}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[600px] px-2 py-1 max-h-[300px]" align="start">
                  <Command>
                    <CommandInput
                      placeholder="Tìm kiếm quản lý..."
                      value={searchValue}
                      onValueChange={setSearchValue}
                      className="text-left pl-2"
                    />
                    <CommandList>
                      <CommandEmpty>Không tìm thấy quản lý</CommandEmpty>
                      <CommandGroup className="max-h-[200px] overflow-y-auto">
                        {filteredManagers.length > 0 ? (
                          filteredManagers.map((manager) => (
                            <CommandItem
                              key={manager._id}
                              value={manager.full_name}
                              onSelect={() => handleManagerSelect(manager._id)}
                              className="cursor-pointer"
                            >
                              <div className="mr-2 flex items-center">
                                <Check
                                  className={`h-4 w-4 ${formik.values.managers.includes(manager._id)
                                      ? "opacity-100"
                                      : "opacity-0"
                                    }`}
                                />
                              </div>
                              <span>{manager.full_name}</span>
                            </CommandItem>
                          ))
                        ) : (
                          <CommandItem className="justify-center text-muted-foreground">
                            Không có quản lý nào
                          </CommandItem>
                        )}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>

              {/* Badge: Chỉ 1 quản lý */}
              {formik.values.managers.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {(() => {
                    const managerId = formik.values.managers[0];
                    const manager = managers.find((m) => m._id === managerId);
                    return manager ? (
                      <Badge
                        key={managerId}
                        variant="secondary"
                        className="flex items-center gap-1 px-2 py-1"
                      >
                        {manager.full_name}
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="h-4 w-4 p-0 ml-1"
                          onClick={() => {
                            formik.setFieldValue("managers", []);
                            formik.setFieldTouched("managers", true);
                          }}
                        >
                          X
                        </Button>
                      </Badge>
                    ) : null;
                  })()}
                </div>
              )}

              {formik.touched.managers && formik.errors.managers && (
                <p className="text-sm text-red-500 mt-1">{formik.errors.managers}</p>
              )}
              {managers.length === 0 && (
                <p className="text-sm text-muted-foreground mt-1">
                  Đang tải danh sách quản lý...
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Location Card */}
      <div className="mb-6">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-muted-foreground" />
              <CardTitle>Vị trí</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Nút lấy vị trí – luôn hiển thị */}
            <div className="space-y-2">
              <Label>Lấy vị trí cửa hàng</Label>
              <Button
                type="button"
                variant="outline"
                className="w-full justify-start"
                onClick={handleGetLocation}
                disabled={isGettingLocation || formik.isSubmitting || hasSubmitted}
              >
                {isGettingLocation ? (
                  <>Đang lấy vị trí...</>
                ) : (
                  <>
                    <Crosshair className="mr-2 h-4 w-4" />
                    Lấy vị trí hiện tại
                  </>
                )}
              </Button>
            </div>

            {/* Bản đồ – luôn hiển thị */}
            <div className="space-y-2">
              <Label>Bản đồ (nhấp để chọn chính xác)</Label>
              <div ref={mapContainerRef} className="w-full h-[300px] rounded-md border" />
            </div>

            {/* ------------------- HIỂN THỊ SAU KHI LẤY VỊ TRÍ ------------------- */}
            {(formik.values.gps.latitude && formik.values.gps.longitude) && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                {/* Địa chỉ chi tiết */}
                <div className="space-y-4">
                  <h3 className="font-medium text-foreground">Thông tin địa chỉ</h3>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="address.street">Địa chỉ cụ thể <span className="text-red-500">*</span></Label>
                      <Input
                        id="address.street"
                        name="address.street"
                        placeholder="Số nhà, tên đường"
                        value={formik.values.address.street}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        disabled={formik.isSubmitting || hasSubmitted}
                      />
                      {formik.touched.address?.street && formik.errors.address?.street && (
                        <p className="text-sm text-red-500">{formik.errors.address.street}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="address.ward">Phường/Xã <span className="text-red-500">*</span></Label>
                      <Input
                        id="address.ward"
                        name="address.ward"
                        placeholder="Phường/Xã"
                        value={formik.values.address.ward}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        disabled={formik.isSubmitting || hasSubmitted}
                      />
                      {formik.touched.address?.ward && formik.errors.address?.ward && (
                        <p className="text-sm text-red-500">{formik.errors.address.ward}</p>
                      )}
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="address.district">Quận/Huyện <span className="text-red-500">*</span></Label>
                      <Input
                        id="address.district"
                        name="address.district"
                        placeholder="Quận/Huyện"
                        value={formik.values.address.district}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        disabled={formik.isSubmitting || hasSubmitted}
                      />
                      {formik.touched.address?.district && formik.errors.address?.district && (
                        <p className="text-sm text-red-500">{formik.errors.address.district}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="address.city">Tỉnh/Thành phố <span className="text-red-500">*</span></Label>
                      <Input
                        id="address.city"
                        name="address.city"
                        placeholder="Tỉnh/Thành phố"
                        value={formik.values.address.city}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        disabled={formik.isSubmitting || hasSubmitted}
                      />
                      {formik.touched.address?.city && formik.errors.address?.city && (
                        <p className="text-sm text-red-500">{formik.errors.address.city}</p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Quốc gia</Label>
                    <Input
                      value="Việt Nam"
                      readOnly
                      className="bg-muted/50 cursor-not-allowed"
                    />
                  </div>
                </div>

                {/* Tọa độ GPS – chỉ đọc */}
                <div className="space-y-2">
                  <Label>Tọa độ GPS <span className="text-red-500">*</span></Label>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <Label className="text-muted-foreground">Vĩ độ</Label>
                      <Input
                        value={formik.values.gps.latitude}
                        readOnly
                        className="bg-muted/50"
                      />
                    </div>
                    <div>
                      <Label className="text-muted-foreground">Kinh độ</Label>
                      <Input
                        value={formik.values.gps.longitude}
                        readOnly
                        className="bg-muted/50"
                      />
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Nhấp vào bản đồ để điều chỉnh vị trí chính xác.
                  </p>
                </div>
              </div>
            )}

            {/* Thông báo khi chưa lấy vị trí */}
            {!(formik.values.gps.latitude && formik.values.gps.longitude) && (
              <div className="text-center py-8 text-muted-foreground">
                <MapPin className="mx-auto h-12 w-12 mb-3 opacity-30" />
                <p>Vui lòng nhấn nút "Lấy vị trí hiện tại" hoặc nhấp vào bản đồ để chọn vị trí cửa hàng. Lưu ý quan trọng hãy yêu cầu quản lý cập nhật vị trí hiện tại của cửa hàng</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Images Card */}
      <div className="mb-6">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <ImageIcon className="h-5 w-5 text-muted-foreground" />
              <CardTitle>Hình ảnh</CardTitle>
            </div>
            <CardDescription>Logo và ảnh bìa cửa hàng (tùy chọn)</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Logo cửa hàng</Label>
              <div className="flex items-center gap-4">
                <Input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleSelectFileForCrop(e, "logoUrl")}
                  disabled={uploading.logo || uploading.cover || formik.isSubmitting || hasSubmitted}
                />
                {uploading.logo && (
                  <div className="flex items-center gap-2">
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12c0-4.411 3.589-8 8-8a7.962 7.962 0 014.709 2.291l-2.52 2.52a4.996 4.996 0 00-1.492-1.402l-.31-.31a7 7 0 00-9.9 9.9l.31.31a4.996 4.996 0 001.492 1.402l2.52-2.52A7.962 7.962 0 0112 20c4.411 0 8-3.589 8-8h-4z" />
                    </svg>
                    <span className="text-sm text-muted-foreground">Đang tải...</span>
                  </div>
                )}
                {formik.values.logoUrl && (
                  <div className="mt-2">
                    <img
                      src={formik.values.logoUrl}
                      alt="Logo Preview"
                      className="h-24 w-24 rounded-md border object-cover"
                    />
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Ảnh bìa</Label>
              <div className="flex items-center gap-4">
                <Input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleSelectFileForCrop(e, "coverUrl")}
                  disabled={uploading.logo || uploading.cover || formik.isSubmitting || hasSubmitted}
                />
                {uploading.cover && (
                  <div className="flex items-center gap-2">
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12c0-4.411 3.589-8 8-8a7.962 7.962 0 014.709 2.291l-2.52 2.52a4.996 4.996 0 00-1.492-1.402l-.31-.31a7 7 0 00-9.9 9.9l.31.31a4.996 4.996 0 001.492 1.402l2.52-2.52A7.962 7.962 0 0112 20c4.411 0 8-3.589 8-8h-4z" />
                    </svg>
                    <span className="text-sm text-muted-foreground">Đang tải...</span>
                  </div>
                )}
              </div>
              {formik.values.coverUrl && (
                <div className="mt-2">
                  <img
                    src={formik.values.coverUrl}
                    alt="Cover Preview"
                    className="h-32 w-full rounded-md border object-cover"
                  />
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Submit Section */}
      <div className="flex items-center justify-between border rounded-lg p-6 bg-gradient-to-r from-blue-50 to-indigo-50">
        <div>
          <p className="text-sm font-medium text-foreground">
            Bạn đã sẵn sàng gửi đăng ký cửa hàng?
          </p>
          <p className="text-sm text-muted-foreground">
            Chúng tôi sẽ xem xét và phê duyệt trong vòng 24-48 giờ.
          </p>
        </div>
        <Button
          type="submit"
          size="lg"
          className="min-w-[140px]"
          disabled={formik.isSubmitting || uploading.logo || uploading.cover || hasSubmitted}
        >
          {formik.isSubmitting ? (
            <>
              <svg className="mr-2 h-4 w-4 animate-spin" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12c0-4.411 3.589-8 8-8a7.962 7.962 0 014.709 2.291l-2.52 2.52a4.996 4.996 0 00-1.492-1.402l-.31-.31a7 7 0 00-9.9 9.9l.31.31a4.996 4.996 0 001.492 1.402l2.52-2.52A7.962 7.962 0 0112 20c4.411 0 8-3.589 8-8h-4z" />
              </svg>
              Đang gửi...
            </>
          ) : hasSubmitted ? (
            "Đã gửi thành công"
          ) : (
            "Gửi đăng ký"
          )}
        </Button>
      </div>

      {/* Crop Modal */}
      {showCropModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-[90%] max-w-3xl bg-white rounded shadow-lg p-4">
            <div className="h-[400px] relative bg-gray-100">
              <Cropper
                image={cropSrc}
                crop={crop}
                zoom={zoom}
                aspect={cropKey === "logoUrl" ? 1 / 1 : 16 / 9}
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onCropComplete={(_, croppedAreaPixels_) => setCroppedAreaPixels(croppedAreaPixels_)}
              />
            </div>
            <div className="flex items-center gap-3 mt-3">
              <label className="flex-1">
                Zoom
                <input
                  type="range"
                  min={1}
                  max={3}
                  step={0.01}
                  value={zoom}
                  onChange={(e) => setZoom(Number(e.target.value))}
                  className="w-full"
                />
              </label>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => {
                    setShowCropModal(false);
                    setCropSrc(null);
                  }}
                >
                  Hủy
                </Button>
                <Button type="button" onClick={handleCropAndUpload}>
                  Crop & Upload
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </form>
  );
};