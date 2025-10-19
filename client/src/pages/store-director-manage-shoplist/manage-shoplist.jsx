import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Store, MapPin, Loader2, X, Trash2, Users } from "lucide-react";
import {
  getShopByOwnerID,
  deleteShop,
  updateShopManagers,
  getAllManagerStaffNames,
} from "@/services/shop.service";
import useDebounce from "@/hooks/useDebounce";
import { Dialog } from "@/components/ui/dialog";
import { toast, Toaster } from "react-hot-toast";

export const ShopListPage = () => {
  const [shops, setShops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [hasSearched, setHasSearched] = useState(false);

  // Cho modal cập nhật manager
  const [isManagerDialogOpen, setIsManagerDialogOpen] = useState(false);
  const [selectedShopId, setSelectedShopId] = useState(null);
  const [managerOptions, setManagerOptions] = useState([]);
  const [selectedManagers, setSelectedManagers] = useState([]);

  const debouncedSearch = useDebounce(search, 500);

  // 🟢 Fetch shop list
  const fetchShops = async () => {
    try {
      setLoading(true);
      const response = await getShopByOwnerID({
        search: debouncedSearch,
        status: statusFilter,
      });
      setShops(response.data);
      setHasSearched(!!debouncedSearch || !!statusFilter);
    } catch (err) {
      console.error("Error fetching shops:", err);
    } finally {
      setLoading(false);
    }
  };

  // 🟢 Fetch all manager options (MANAGER_STAFF)
  const fetchManagers = async () => {
    try {
      const res = await getAllManagerStaffNames();
      setManagerOptions(res.data.data);
    } catch (err) {
      console.error("Error fetching managers:", err);
    }
  };

  useEffect(() => {
    fetchShops();
  }, [debouncedSearch, statusFilter]);

  const handleClearSearch = () => {
    setSearch("");
  };

  // 🟡 Xóa cửa hàng
  const handleDeleteShop = async (shopId) => {
    if (!window.confirm("Bạn có chắc muốn xóa cửa hàng này không?")) return;
    try {
      await deleteShop(shopId);
      toast.success("Đã xóa cửa hàng thành công");
      fetchShops();
    } catch (err) {
      console.error("Error deleting shop:", err);
      toast.error("Xóa cửa hàng thất bại");
    }
  };

  // 🟢 Mở modal cập nhật managers
  const handleOpenUpdateManagers = async (shop) => {
    setSelectedShopId(shop._id);
    setSelectedManagers(shop.managers?.map((m) => m._id) || []);
    setIsManagerDialogOpen(true);
    await fetchManagers();
  };

  // 🟢 Xác nhận cập nhật managers
  const handleUpdateManagers = async () => {
    try {
      await updateShopManagers(selectedShopId, { managers: selectedManagers });
      toast.success("Cập nhật quản lý thành công");
      setIsManagerDialogOpen(false);
      fetchShops();
    } catch (err) {
      console.error("Error updating managers:", err);
      toast.error("Cập nhật quản lý thất bại");
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <Toaster position="top-right" toastOptions={{ duration: 3000 }} />

      <div className="mb-8">
        <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
          Quản lý cửa hàng
        </h1>
        <p className="mt-2 text-muted-foreground">
          Xem chi tiết và quản lý thông tin cửa hàng của bạn.
        </p>
      </div>

      {/* Filter/Search */}
      <div className="flex gap-4 mb-4">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Tìm kiếm theo tên..."
            className="border p-2 rounded-md w-full pr-10"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {search && (
            <button
              onClick={handleClearSearch}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="border p-2 rounded-md"
        >
          <option value="">Tất cả trạng thái</option>
          <option value="PENDING_APPROVAL">Đang chờ duyệt</option>
          <option value="ACTIVE">Đang hoạt động</option>
          <option value="INACTIVE">Ngừng hoạt động</option>
          <option value="BANNED">Bị cấm</option>
        </select>
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
                  <TableHead>Quản lý</TableHead>
                  <TableHead>Số điện thoại</TableHead>
                  <TableHead>Địa chỉ</TableHead>
                  <TableHead>Ngày tạo</TableHead>
                  <TableHead>Hành động</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {shops.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-4">
                      {hasSearched ? (
                        <span className="text-muted-foreground">
                          Không có kết quả phù hợp với tiêu chí tìm kiếm hoặc bộ lọc.
                        </span>
                      ) : (
                        <div className="flex flex-col items-center gap-2">
                          <span className="text-muted-foreground">Chưa có cửa hàng.</span>
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                ) : (
                  shops.map((s) => (
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
                      <TableCell>
                        {s.managers && s.managers.length > 0
                          ? s.managers.map((m) => m.full_name).join(", ")
                          : "Chưa có quản lý"}
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
                      <TableCell className="flex gap-2">
                        {s.status === "ACTIVE" ? (
                          <>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleOpenUpdateManagers(s)}
                            >
                              <Users className="h-4 w-4 mr-1" /> Quản lý
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleDeleteShop(s._id)}
                            >
                              <Trash2 className="h-4 w-4 mr-1" /> Xóa
                            </Button>
                          </>
                        ) : (
                          <span className="text-muted-foreground text-sm">
                            Chỉ có thể quản lý/xóa khi đang hoạt động
                          </span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* 🟢 Modal cập nhật manager */}
      {isManagerDialogOpen && (
        <Dialog open={isManagerDialogOpen} onOpenChange={setIsManagerDialogOpen}>
          <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg w-[400px] shadow-lg">
              <h2 className="text-lg font-semibold mb-4">Cập nhật quản lý cửa hàng</h2>

              <select
                multiple
                className="border p-2 w-full rounded-md h-40"
                value={selectedManagers}
                onChange={(e) =>
                  setSelectedManagers(Array.from(e.target.selectedOptions, (opt) => opt.value))
                }
              >
                {managerOptions.map((m) => (
                  <option key={m._id} value={m._id}>
                    {m.full_name}
                  </option>
                ))}
              </select>

              <div className="mt-4 flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsManagerDialogOpen(false)}>
                  Hủy
                </Button>
                <Button onClick={handleUpdateManagers}>Lưu thay đổi</Button>
              </div>
            </div>
          </div>
        </Dialog>
      )}
    </div>
  );
};