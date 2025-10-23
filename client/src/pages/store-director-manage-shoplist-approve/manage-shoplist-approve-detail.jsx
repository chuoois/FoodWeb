import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin, Store, Phone, User, Star, Calendar } from "lucide-react";
import { getShopDetailByID } from "@/services/shop.service";
import { Toaster, toast } from "react-hot-toast";
import { Loader2 } from "lucide-react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Sửa lỗi biểu tượng marker mặc định của Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

export const ShopDetailPage = () => {
  const { shopId } = useParams();
  const [shop, setShop] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchShopDetails = async () => {
      try {
        setLoading(true);
        const response = await getShopDetailByID(shopId);
        console.log("Fetched shop details:", response.data);
        setShop(response.data);
      } catch (err) {
        console.error("Error fetching shop details:", err);
        toast.error("Không thể tải thông tin cửa hàng");
      } finally {
        setLoading(false);
      }
    };

    fetchShopDetails();
  }, [shopId]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!shop) {
    return (
      <div className="container mx-auto py-8 text-center">
        <p className="text-muted-foreground">Không tìm thấy thông tin cửa hàng.</p>
        <Button asChild className="mt-4">
          <Link to="/store-director/manage/shops">Quay lại danh sách</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">

      {/* Cover Image */}
      <div className="relative h-64 w-full rounded-lg overflow-hidden bg-gray-200">
        <img
          src={shop.coverUrl || "https://via.placeholder.com/1200x300"}
          alt="Cover"
          className="w-full h-full object-cover"
        />
        <div className="absolute bottom-4 left-4 flex items-end gap-4">
          <img
            src={shop.logoUrl || "https://via.placeholder.com/100"}
            alt="Logo"
            className="w-24 h-24 rounded-full border-4 border-white bg-gray-100"
          />
          <div>
            <h1 className="text-3xl font-bold text-white drop-shadow-md">{shop.name}</h1>
            <p className="text-white drop-shadow-md">{shop.type === "Food" ? "Đồ ăn" : "Đồ uống"}</p>
          </div>
        </div>
      </div>
      {/* Action Buttons */}
      <div className="flex gap-4 mt-6 mb-6">
        <Button asChild>
          <Link to="/store-director/manage/approval">Quay lại danh sách</Link>
        </Button>
      </div>
      {/* Main Content */}
      <div className="space-y-6">
        {/* Shop Info */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Store className="h-5 w-5 text-muted-foreground" />
              <CardTitle>Thông tin cửa hàng</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h3 className="font-medium">Mô tả</h3>
                <p className="text-muted-foreground">{shop.description || "Chưa có mô tả"}</p>
              </div>
              <div>
                <h3 className="font-medium flex items-center gap-1.5">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  Địa chỉ
                </h3>
                <p className="text-muted-foreground">
                  {`${shop.address.street}, ${shop.address.ward}, ${shop.address.district}, ${shop.address.city}, ${shop.address.province}`}
                </p>
                <div className="mt-2 h-48 bg-gray-100 rounded-lg">
                  <MapContainer
                    center={[shop.gps.coordinates[1], shop.gps.coordinates[0]]}
                    zoom={15}
                    style={{ height: "100%", width: "100%" }}
                  >
                    <TileLayer
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    />
                    <Marker position={[shop.gps.coordinates[1], shop.gps.coordinates[0]]}>
                      <Popup>{shop.name}</Popup>
                    </Marker>
                  </MapContainer>
                </div>
              </div>
              <div>
                <h3 className="font-medium flex items-center gap-1.5">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  Số điện thoại
                </h3>
                <p className="text-muted-foreground">{shop.phone || "Chưa có số điện thoại"}</p>
              </div>
              <div>
                <h3 className="font-medium flex items-center gap-1.5">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  Ngày tạo
                </h3>
                <p className="text-muted-foreground">
                  {new Date(shop.createdAt).toLocaleDateString("vi-VN")}
                </p>
              </div>
              <div>
                <h3 className="font-medium">Trạng thái</h3>
                <span
                  className={`inline-block whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-medium ${shop.status === "PENDING_APPROVAL"
                      ? "bg-yellow-100 text-yellow-800"
                      : shop.status === "ACTIVE"
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}
                >
                  {shop.status === "PENDING_APPROVAL"
                    ? "Đang chờ duyệt"
                    : shop.status === "ACTIVE"
                      ? "Đang hoạt động"
                      : "Bị cấm/Ngừng hoạt động"}
                </span>
              </div>
              <div>
                <h3 className="font-medium">Đánh giá</h3>
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 text-yellow-400" />
                  <p className="text-muted-foreground">{shop.rating || 0} / 5</p>
                  <p className="text-muted-foreground ml-2">
                    ({shop.reviews.length} đánh giá)
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Personnel Info */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <User className="h-5 w-5 text-muted-foreground" />
              <CardTitle>Thông tin nhân sự</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h3 className="font-medium">Chủ sở hữu</h3>
                <p className="text-muted-foreground">
                  {shop.owner.full_name} {shop.owner.phone ? `(${shop.owner.phone})` : ""}
                </p>
              </div>
              <div>
                <h3 className="font-medium">Quản lý</h3>
                {shop.managers && shop.managers.length > 0 ? (
                  <ul className="list-disc pl-5 text-muted-foreground">
                    {shop.managers.map((manager) => (
                      <li key={manager.id}>
                        {manager.full_name} {manager.phone ? `(${manager.phone})` : ""}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-muted-foreground">Chưa có quản lý</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Reviews Section */}
        <Card>
          <CardHeader>
            <CardTitle>Đánh giá</CardTitle>
          </CardHeader>
          <CardContent>
            {shop.reviews.length > 0 ? (
              <ul className="space-y-4">
                {shop.reviews.map((review, index) => (
                  <li key={index} className="border-b pb-2">
                    <p className="font-medium">{review.user_name || "Ẩn danh"}</p>
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`h-4 w-4 ${i < review.rating ? "text-yellow-400" : "text-gray-300"
                            }`}
                        />
                      ))}
                    </div>
                    <p className="text-muted-foreground">{review.comment}</p>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-muted-foreground">Chưa có đánh giá nào.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};