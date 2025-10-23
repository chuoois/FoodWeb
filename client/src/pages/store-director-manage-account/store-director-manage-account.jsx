import React, { useEffect, useState } from "react";
import {
  listStaffByCreator,
  deleteStaff,
} from "@/services/shop.service";
import { Loader2, X, Trash2, UserCircle, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
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
import useDebounce from "@/hooks/useDebounce";

export const ManageAccount = () => {
  const [staffs, setStaffs] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const debouncedSearch = useDebounce(search, 500);

  // 🟢 Gọi API lấy danh sách nhân viên
  const fetchStaffs = async () => {
    try {
      setLoading(true);
      const res = await listStaffByCreator({
        search: debouncedSearch,
        status: statusFilter,
        page,
      });
      setStaffs(res.data.data);
      setTotalPages(res.data.totalPages);
    } catch (err) {
      console.error("Lỗi khi lấy danh sách nhân viên:", err);
      toast.error("Không thể tải danh sách nhân viên");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStaffs();
  }, [debouncedSearch, statusFilter, page]);

  const handleClearSearch = () => {
    setSearch("");
  };

  // 🗑️ Xử lý xóa nhân viên
  const handleDelete = async (staffId) => {
    const confirm = window.confirm("Bạn có chắc muốn xóa nhân viên này?");
    if (!confirm) return;

    try {
      await deleteStaff(staffId);
      toast.success("Đã xóa nhân viên thành công");
      fetchStaffs(); // reload danh sách
    } catch (err) {
      console.error("Lỗi khi xóa nhân viên:", err);
      toast.error("Không thể xóa nhân viên");
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
      <Toaster position="top-right" />

      <div className="mb-8">
        <h1 className="text-3xl font-semibold">Quản lý nhân viên</h1>
        <p className="text-muted-foreground">Danh sách nhân viên bạn đã tạo</p>
      </div>

      {/* 🔍 Bộ lọc / tìm kiếm */}
      <div className="flex gap-4 mb-4">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Tìm kiếm nhân viên..."
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

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="border p-2 rounded-md"
        >
          <option value="">Tất cả trạng thái</option>
          <option value="ACTIVE">Đang hoạt động</option>
          <option value="INACTIVE">Ngừng hoạt động</option>
          <option value="BANNED">Bị cấm</option>
        </select>
      </div>

      {/* 🧾 Bảng nhân viên */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <UserCircle className="h-5 w-5 text-muted-foreground" />
            <CardTitle>Danh sách nhân viên</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Họ và tên</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead>Ngày tạo</TableHead>
                  <TableHead>Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {staffs.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-4">
                      Không có nhân viên nào phù hợp.
                    </TableCell>
                  </TableRow>
                ) : (
                  staffs.map((s) => (
                    <TableRow key={s._id}>
                      <TableCell>{s.full_name}</TableCell>
                      <TableCell>{s.account_id?.email}</TableCell>

                      <TableCell>
                        <span
                          className={`inline-block rounded-full px-2.5 py-1 text-xs font-medium ${
                            s.status === "ACTIVE"
                              ? "bg-green-100 text-green-800"
                              : s.status === "INACTIVE"
                              ? "bg-gray-100 text-gray-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {s.status === "ACTIVE"
                            ? "Đang hoạt động"
                            : s.status === "INACTIVE"
                            ? "Ngừng hoạt động"
                            : "Bị cấm"}
                        </span>
                      </TableCell>

                      <TableCell>
                        {new Date(s.createdAt).toLocaleDateString("vi-VN")}
                      </TableCell>

                      <TableCell className="flex gap-2">
                      
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDelete(s._id)}
                        >
                          <Trash2 className="h-4 w-4 mr-1" />
                          Xóa
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* 🔄 Phân trang đơn giản */}
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
    </div>
  );
};
