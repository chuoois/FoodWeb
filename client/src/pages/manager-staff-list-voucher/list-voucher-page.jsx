import React, { useState, useEffect } from "react";
import {
  TicketPercent,
  Plus,
  Edit2,
  Trash2,
  Eye,
  EyeOff,
  X,
  Loader2,
  Tag,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { Toaster, toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import useDebounce from "@/hooks/useDebounce";
import {
  getVouchersByShop,
  updateVoucher,
  deleteVoucher,
  toggleVoucherStatus,
} from "@/services/voucher.service";

export function VoucherListPage() {
  const navigate = useNavigate();
  const [vouchers, setVouchers] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const debouncedSearch = useDebounce(search, 500);
  const [selectedVoucher, setSelectedVoucher] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [formData, setFormData] = useState({});

  // ✅ Lấy danh sách voucher
  useEffect(() => {
    const fetchVouchers = async () => {
      try {
        setLoading(true);
        const params = {
          page,
          limit: 10,
          search: debouncedSearch,
        };
        const res = await getVouchersByShop(params);
        console.log(res.data.data.vouchers)
        setVouchers(res.data.data.vouchers || []);
        setTotalPages(res.data.data.pagination?.total || 1);
      } catch (err) {
        console.error(err);
        toast.error("Không thể tải danh sách voucher");
      } finally {
        setLoading(false);
      }
    };
    fetchVouchers();
  }, [debouncedSearch, page]);

  const handleClearSearch = () => setSearch("");

  // ✳️ Mở dialog chỉnh sửa
  const handleOpenDetail = (voucher) => {
    setSelectedVoucher(voucher);
    setFormData({
      code: voucher.code,
      description: voucher.description || "",
      discount_type: voucher.discount_type || "PERCENT",
      discount_value: voucher.discount_value || 0,
      min_order_amount: voucher.min_order_amount || 0,
      max_discount: voucher.max_discount || 0,
      start_date: voucher.start_date?.split("T")[0],
      end_date: voucher.end_date?.split("T")[0],
      is_active: voucher.is_active,
    });
    setOpenDialog(true);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // 💾 Lưu chỉnh sửa voucher
  const handleSaveUpdate = async () => {
    if (!selectedVoucher?._id) return;
    try {
      toast.loading("Đang cập nhật voucher...", { id: "update-voucher" });
      const res = await updateVoucher(selectedVoucher._id, formData);
      const updated = res.data?.data || res.data;
      setVouchers((prev) =>
        prev.map((v) => (v._id === selectedVoucher._id ? updated : v))
      );
      toast.success("Cập nhật voucher thành công!", { id: "update-voucher" });
      setOpenDialog(false);
    } catch (err) {
      console.error(err);
      toast.error("Lỗi khi cập nhật voucher", { id: "update-voucher" });
    }
  };

  // 🗑️ Xóa voucher
  const handleDelete = async (id) => {
    if (!window.confirm("Bạn có chắc muốn xóa voucher này không?")) return;
    try {
      toast.loading("Đang xóa voucher...", { id: "delete-voucher" });
      await deleteVoucher(id);
      setVouchers((prev) => prev.filter((v) => v._id !== id));
      toast.success("Xóa voucher thành công!", { id: "delete-voucher" });
    } catch (err) {
      console.error(err);
      toast.error("Không thể xóa voucher", { id: "delete-voucher" });
    }
  };

  // 👁️ Bật/tắt trạng thái voucher
  const handleToggleStatus = async (id, newStatus) => {
    try {
      toast.loading("Đang cập nhật trạng thái...", { id: "toggle-voucher" });
      await toggleVoucherStatus(id);
      setVouchers((prev) =>
        prev.map((v) => (v._id === id ? { ...v, is_active: newStatus } : v))
      );
      toast.success(
        newStatus ? "Đã kích hoạt voucher" : "Đã vô hiệu hóa voucher",
        { id: "toggle-voucher" }
      );
    } catch (err) {
      console.error(err);
      toast.error("Lỗi khi thay đổi trạng thái", { id: "toggle-voucher" });
    }
  };

  return (
    <div className="container mx-auto py-8">
      <Toaster position="top-right" />

      <div className="mb-8">
        <h1 className="text-3xl font-semibold flex items-center gap-2">
          <TicketPercent className="h-7 w-7 text-muted-foreground" />
          Quản lý voucher
        </h1>
        <p className="text-muted-foreground">
          Danh sách tất cả voucher khuyến mãi của cửa hàng
        </p>
      </div>

      {/* 🔍 Thanh tìm kiếm + thêm mới */}
      <div className="flex justify-between items-center gap-4 mb-4">
        <div className="relative flex-1 max-w-sm">
          <input
            type="text"
            placeholder="Tìm voucher..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border p-2 rounded-md w-full pr-10"
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

        <Button
          onClick={() => navigate("/manager-staff/manage/create-voucher")}
          className="flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Tạo voucher
        </Button>
      </div>

      {/* 📋 Bảng danh sách */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Tag className="h-5 w-5 text-muted-foreground" />
            <CardTitle>Danh sách voucher</CardTitle>
          </div>
        </CardHeader>

        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="animate-spin h-6 w-6" />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Mã</TableHead>
                    <TableHead>Mô tả</TableHead>
                    <TableHead>Loại giảm</TableHead>
                    <TableHead>Giá trị</TableHead>
                    <TableHead>Đơn tối thiểu</TableHead>
                    <TableHead>Giảm tối đa</TableHead>
                    <TableHead>Hiệu lực</TableHead>
                    <TableHead>Trạng thái</TableHead>
                    <TableHead>Thao tác</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {vouchers.length === 0 && page === 1 ? (
                    <TableRow>
                      <TableCell colSpan={9} className="text-center py-4">
                        Hiện không có voucher được tạo.
                      </TableCell>
                    </TableRow>
                  ) : (
                    vouchers.map((v) => (
                      <TableRow key={v._id}>
                        <TableCell className="font-medium">{v.code}</TableCell>
                        <TableCell className="max-w-xs truncate text-sm text-muted-foreground">
                          {v.description || "Không có"}
                        </TableCell>
                        <TableCell>
                          {v.discount_type === "PERCENT"
                            ? "Phần trăm"
                            : "Giá trị cố định"}
                        </TableCell>
                        <TableCell>
                          {v.discount_type === "PERCENT"
                            ? `${v.discount_value}%`
                            : `${v.discount_value.toLocaleString()}đ`}
                        </TableCell>
                        <TableCell>
                          {v.min_order_amount
                            ?.toLocaleString() || 0}đ
                        </TableCell>
                        <TableCell>
                          {v.max_discount?.toLocaleString() || 0}đ
                        </TableCell>
                        <TableCell>
                          {v.start_date && v.end_date
                            ? `${new Date(v.start_date).toLocaleDateString()} - ${new Date(
                              v.end_date
                            ).toLocaleDateString()}`
                            : "-"}
                        </TableCell>
                        <TableCell>
                          <span
                            className={`inline-block rounded-full px-2.5 py-1 text-xs font-medium ${v.is_active
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                              }`}
                          >
                            {v.is_active ? "Đang hoạt động" : "Ngừng"}
                          </span>
                        </TableCell>
                        <TableCell className="flex gap-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() =>
                              handleToggleStatus(v._id, !v.is_active)
                            }
                          >
                            {v.is_active ? (
                              <Eye className="h-4 w-4" />
                            ) : (
                              <EyeOff className="h-4 w-4" />
                            )}
                          </Button>

                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleOpenDetail(v)}
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>

                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDelete(v._id)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          )}

          {/* 🔄 Phân trang */}
          <div className="flex justify-center mt-4 gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page === 1}
              onClick={() => setPage((p) => p - 1)}
            >
              Trang trước
            </Button>
            <span className="text-sm mt-2">
              Trang {page} / {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={page === totalPages}
              onClick={() => setPage((p) => p + 1)}
            >
              Trang sau
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* 🧾 Dialog chi tiết voucher */}
      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Chi tiết voucher</DialogTitle>
            <DialogDescription>Xem và chỉnh sửa thông tin voucher</DialogDescription>
          </DialogHeader>

          {selectedVoucher && (
            <div className="space-y-4 mt-4">
              <div>
                <label className="text-sm font-medium">Mã voucher</label>
                <input
                  name="code"
                  value={formData.code}
                  onChange={handleChange}
                  className="w-full border p-2 rounded-md"
                />
              </div>

              <div>
                <label className="text-sm font-medium">Mô tả</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  className="w-full border p-2 rounded-md"
                  rows={2}
                />
              </div>

              <div className="flex gap-3">
                <div className="flex-1">
                  <label className="text-sm font-medium">Loại giảm</label>
                  <select
                    name="discount_type"
                    value={formData.discount_type}
                    onChange={handleChange}
                    className="w-full border p-2 rounded-md"
                  >
                    <option value="PERCENT">Phần trăm</option>
                    <option value="FIXED">Giá trị cố định</option>
                  </select>
                </div>
                <div className="flex-1">
                  <label className="text-sm font-medium">Giá trị giảm</label>
                  <input
                    type="number"
                    name="discount_value"
                    value={formData.discount_value}
                    onChange={handleChange}
                    className="w-full border p-2 rounded-md"
                  />
                </div>
              </div>

              <div className="flex gap-3">
                <div className="flex-1">
                  <label className="text-sm font-medium">Đơn tối thiểu</label>
                  <input
                    type="number"
                    name="min_order_amount"
                    value={formData.min_order_amount}
                    onChange={handleChange}
                    className="w-full border p-2 rounded-md"
                  />
                </div>
                <div className="flex-1">
                  <label className="text-sm font-medium">Giảm tối đa</label>
                  <input
                    type="number"
                    name="max_discount"
                    value={formData.max_discount}
                    onChange={handleChange}
                    className="w-full border p-2 rounded-md"
                  />
                </div>
              </div>

              <div className="flex gap-3">
                <div className="flex-1">
                  <label className="text-sm font-medium">Ngày bắt đầu</label>
                  <input
                    type="date"
                    name="start_date"
                    value={formData.start_date}
                    onChange={handleChange}
                    className="w-full border p-2 rounded-md"
                  />
                </div>
                <div className="flex-1">
                  <label className="text-sm font-medium">Ngày kết thúc</label>
                  <input
                    type="date"
                    name="end_date"
                    value={formData.end_date}
                    onChange={handleChange}
                    className="w-full border p-2 rounded-md"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => setOpenDialog(false)}>
                  Hủy
                </Button>
                <Button onClick={handleSaveUpdate}>Lưu thay đổi</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
