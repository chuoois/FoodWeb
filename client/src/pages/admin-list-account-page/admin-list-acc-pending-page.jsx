import { useState, useEffect } from "react";
import { Search, Loader2, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import toast from "react-hot-toast";
import { listPendingAccounts, updateAccountStatus } from "@/services/admin.service";

export const AccPendingManagement = () => {
  const [accounts, setAccounts] = useState([]);
  const [roles, setRoles] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [roleFilter, setRoleFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);

  const itemsPerPage = 10;

  // Gọi API lấy danh sách tài khoản (chỉ PENDING + các trạng thái khác nếu cần)
  const fetchAccounts = async () => {
    try {
      setLoading(true);
      const params = {
        search: searchQuery || undefined,
        role: roleFilter !== "all" ? roleFilter : undefined,
        status: statusFilter !== "all" ? statusFilter : undefined,
        page: currentPage,
        limit: itemsPerPage,
      };
      const res = await listPendingAccounts(params);
      setAccounts(res.data.accounts || []);
      setRoles(res.data.roles || []);
      setTotalPages(res.data.totalPages || 1);
    } catch (error) {
      toast.error("Không thể tải danh sách tài khoản!");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAccounts();
  }, [currentPage, searchQuery, statusFilter, roleFilter]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, statusFilter, roleFilter]);

  // Xử lý đổi trạng thái (dùng chung API)
  const handleStatusChange = async () => {
    setIsUpdating(true);
    try {
      await updateAccountStatus(selectedAccount._id);
      toast.success(
        `Đã ${selectedAccount.status === "PENDING" ? "kích hoạt" : selectedAccount.status === "ACTIVE" ? "vô hiệu hóa" : "kích hoạt"} tài khoản ${selectedAccount.email}`
      );
      setDialogOpen(false);
      fetchAccounts();
    } catch (error) {
      toast.error("Không thể cập nhật trạng thái. Vui lòng thử lại.");
    } finally {
      setIsUpdating(false);
    }
  };

  const getRoleName = (role) => {
    if (typeof role === "object" && role?.name) return role.name;
    const found = roles.find((r) => r._id === role);
    return found ? found.name : "Unknown";
  };

  const getStatusBadge = (status) => {
    const styles = {
      ACTIVE: "bg-green-100 text-green-700 border border-green-200 shadow-sm",
      INACTIVE: "bg-gray-100 text-gray-600 border border-gray-200 shadow-sm",
      PENDING: "bg-yellow-100 text-yellow-700 border border-yellow-200 shadow-sm",
      BANNED: "bg-red-100 text-red-700 border border-red-200 shadow-sm",
    };
    return styles[status] || styles.INACTIVE;
  };

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  return (
    <div className="min-h-screen bg-white p-6">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg">
              <Users className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-orange-500 to-orange-600 bg-clip-text text-transparent">
              Quản Lý Tài Khoản Chờ Duyệt
            </h1>
          </div>
          <p className="text-gray-600 ml-11">Duyệt và kích hoạt các tài khoản mới đăng ký</p>
        </div>

        {/* Filters */}
        <div className="mb-6 rounded-xl border border-gray-200 bg-gray-50 p-4 shadow-sm">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
              <Input
                placeholder="Tìm kiếm theo email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-white border-gray-300 text-gray-900 placeholder:text-gray-500 focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:border-transparent transition-all"
                disabled={loading}
              />
            </div>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <Select value={statusFilter} onValueChange={setStatusFilter} disabled={loading}>
                <SelectTrigger className="w-full sm:w-[180px] bg-white border-gray-300 text-gray-900 focus:ring-2 focus:ring-orange-500">
                  <SelectValue placeholder="Trạng thái" />
                </SelectTrigger>
                <SelectContent className="bg-white border-gray-300">
                  <SelectItem value="all">Tất cả trạng thái</SelectItem>
                  <SelectItem value="PENDING">Pending</SelectItem>
                  <SelectItem value="ACTIVE">Active</SelectItem>
                  <SelectItem value="INACTIVE">Inactive</SelectItem>
                  <SelectItem value="BANNED">Banned</SelectItem>
                </SelectContent>
              </Select>
              <Select value={roleFilter} onValueChange={setRoleFilter} disabled={loading}>
                <SelectTrigger className="w-full sm:w-[180px] bg-white border-gray-300 text-gray-900 focus:ring-2 focus:ring-orange-500">
                  <SelectValue placeholder="Vai trò" />
                </SelectTrigger>
                <SelectContent className="bg-white border-gray-300">
                  <SelectItem value="all">Tất cả vai trò</SelectItem>
                  {roles.map((role) => (
                    <SelectItem key={role._id} value={role._id} className="text-gray-900">
                      {role.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="rounded-xl border border-gray-200 bg-white overflow-hidden shadow-sm">
          <Table>
            <TableHeader>
              <TableRow className="border-gray-200 hover:bg-transparent bg-gray-50">
                <TableHead className="text-gray-700 font-semibold">Email</TableHead>
                <TableHead className="text-gray-700 font-semibold">Provider</TableHead>
                <TableHead className="text-gray-700 font-semibold">Trạng thái</TableHead>
                <TableHead className="text-gray-700 font-semibold">Vai trò</TableHead>
                <TableHead className="text-gray-700 font-semibold">Ngày tạo</TableHead>
                <TableHead className="text-gray-700 font-semibold text-right">Hành động</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow className="hover:bg-transparent border-gray-200">
                  <TableCell colSpan={6} className="h-32 text-center">
                    <Loader2 className="mx-auto h-6 w-6 animate-spin text-orange-500" />
                  </TableCell>
                </TableRow>
              ) : accounts.length === 0 ? (
                <TableRow className="hover:bg-transparent border-gray-200">
                  <TableCell colSpan={6} className="h-32 text-center text-gray-500">
                    Không tìm thấy tài khoản nào
                  </TableCell>
                </TableRow>
              ) : (
                accounts.map((account) => (
                  <TableRow key={account._id} className="border-gray-200 hover:bg-gray-50 transition-all duration-200">
                    <TableCell className="font-semibold text-gray-900">{account.email}</TableCell>
                    <TableCell className="text-gray-600 capitalize">{account.provider}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium ${getStatusBadge(
                            account.status
                          )}`}
                        >
                          <span className="h-1.5 w-1.5 rounded-full bg-current" />
                          {account.status}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-gray-600">{getRoleName(account.role_id)}</TableCell>
                    <TableCell className="text-gray-600">
                      {new Date(account.createdAt).toLocaleDateString("vi-VN")}
                    </TableCell>

                    {/* HÀNH ĐỘNG: Chỉ hiện nút phù hợp với trạng thái */}
                    <TableCell className="text-right">
                      {/* PENDING → Nút Kích hoạt */}
                      {account.status === "PENDING" && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedAccount(account);
                            setDialogOpen(true);
                          }}
                          className="h-8 text-xs text-emerald-700 hover:bg-emerald-500/10 hover:text-emerald-600 transition-all"
                          disabled={isUpdating}
                        >
                          Kích hoạt
                        </Button>
                      )}

                      {/* ACTIVE → Nút Vô hiệu hóa */}
                      {account.status === "ACTIVE" && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedAccount(account);
                            setDialogOpen(true);
                          }}
                          className="h-8 text-xs text-red-700 hover:bg-red-500/10 hover:text-red-600 transition-all"
                          disabled={isUpdating}
                        >
                          Vô hiệu hóa
                        </Button>
                      )}

                      {/* INACTIVE → Nút Kích hoạt */}
                      {account.status === "INACTIVE" && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedAccount(account);
                            setDialogOpen(true);
                          }}
                          className="h-8 text-xs text-emerald-700 hover:bg-emerald-500/10 hover:text-emerald-600 transition-all"
                          disabled={isUpdating}
                        >
                          Kích hoạt
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-6 flex justify-center">
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    onClick={() => handlePageChange(currentPage - 1)}
                    className={
                      currentPage === 1
                        ? "pointer-events-none opacity-50 text-gray-500"
                        : "cursor-pointer hover:bg-gray-100 text-gray-700 hover:text-gray-900 transition-all"
                    }
                  />
                </PaginationItem>
                {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                  let page;
                  if (totalPages <= 5) {
                    page = i + 1;
                  } else if (currentPage <= 3) {
                    page = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    page = totalPages - 4 + i;
                  } else {
                    page = currentPage - 2 + i;
                  }
                  return (
                    <PaginationItem key={page}>
                      <PaginationLink
                        isActive={currentPage === page}
                        onClick={() => handlePageChange(page)}
                        className={`cursor-pointer transition-all ${
                          currentPage === page
                            ? "bg-orange-500 text-white"
                            : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                        }`}
                      >
                        {page}
                      </PaginationLink>
                    </PaginationItem>
                  );
                })}
                <PaginationItem>
                  <PaginationNext
                    onClick={() => handlePageChange(currentPage + 1)}
                    className={
                      currentPage === totalPages
                        ? "pointer-events-none opacity-50 text-gray-500"
                        : "cursor-pointer hover:bg-gray-100 text-gray-700 hover:text-gray-900 transition-all"
                    }
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        )}

        {/* Dialog xác nhận */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="bg-white border-gray-200 shadow-xl">
            <DialogHeader>
              <DialogTitle className="text-gray-900 text-xl">Xác nhận hành động</DialogTitle>
              <DialogDescription className="text-gray-600 mt-2">
                Bạn có chắc muốn{" "}
                <span className="font-semibold text-orange-600">
                  {selectedAccount?.status === "PENDING"
                    ? "kích hoạt"
                    : selectedAccount?.status === "ACTIVE"
                    ? "vô hiệu hóa"
                    : "kích hoạt"}
                </span>{" "}
                tài khoản{" "}
                <span className="font-semibold text-gray-900">{selectedAccount?.email}</span>?
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="gap-3">
              <Button
                variant="ghost"
                onClick={() => setDialogOpen(false)}
                className="text-gray-700 hover:bg-gray-100 hover:text-gray-900 transition-all"
              >
                Hủy
              </Button>
              <Button
                onClick={handleStatusChange}
                disabled={isUpdating}
                className="bg-gradient-to-r from-orange-500 to-orange-600 text-white hover:from-orange-600 hover:to-orange-700 transition-all shadow-lg"
              >
                {isUpdating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {selectedAccount?.status === "PENDING"
                  ? "Kích hoạt"
                  : selectedAccount?.status === " ACTIVE"
                  ? "Vô hiệu hóa"
                  : "Kích hoạt"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};