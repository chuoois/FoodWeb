import { useState, useMemo, useEffect } from "react"
import { Search, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import toast from "react-hot-toast"

// Dữ liệu mẫu (giả lập từ schema MongoDB)
const mockAccounts = [
  {
    _id: "1",
    email: "user1@example.com",
    provider: "local",
    status: "ACTIVE",
    role_id: "admin",
    createdAt: "2025-10-01T10:00:00Z",
  },
  {
    _id: "2",
    email: "user2@example.com",
    provider: "google",
    status: "INACTIVE",
    role_id: "user",
    createdAt: "2025-10-02T12:00:00Z",
  },
  {
    _id: "3",
    email: "editor@example.com",
    provider: "local",
    status: "PENDING",
    role_id: "editor",
    createdAt: "2025-10-03T15:00:00Z",
  },
  {
    _id: "4",
    email: "banned@example.com",
    provider: "local",
    status: "BANNED",
    role_id: "user",
    createdAt: "2025-10-04T09:00:00Z",
  },
  {
    _id: "5",
    email: "admin@example.com",
    provider: "google",
    status: "ACTIVE",
    role_id: "admin",
    createdAt: "2025-10-04T11:00:00Z",
  },
  ...Array.from({ length: 10 }, (_, i) => ({
    _id: `${i + 6}`,
    email: `user${i + 6}@example.com`,
    provider: i % 2 === 0 ? "local" : "google",
    status: ["ACTIVE", "INACTIVE", "PENDING", "BANNED"][i % 4],
    role_id: ["user", "editor", "admin"][i % 3],
    createdAt: `2025-10-04T${(i + 10).toString().padStart(2, "0")}:00:00Z`,
  })),
]

// Dữ liệu vai trò mẫu
const roles = [
  { _id: "admin", name: "Admin" },
  { _id: "user", name: "User" },
  { _id: "editor", name: "Editor" },
]

export const AccountManagement = () => {
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [roleFilter, setRoleFilter] = useState("all")
  const [currentPage, setCurrentPage] = useState(1)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [selectedAccount, setSelectedAccount] = useState(null)
  const [isUpdating, setIsUpdating] = useState(false)

  const itemsPerPage = 10

  // Lọc tài khoản
  const filteredAccounts = useMemo(() => {
    return mockAccounts.filter((account) => {
      const matchesSearch = account.email.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesStatus = statusFilter === "all" || account.status === statusFilter
      const matchesRole = roleFilter === "all" || account.role_id === roleFilter
      return matchesSearch && matchesStatus && matchesRole
    })
  }, [searchQuery, statusFilter, roleFilter])

  // Phân trang
  const paginatedAccounts = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage
    return filteredAccounts.slice(startIndex, startIndex + itemsPerPage)
  }, [filteredAccounts, currentPage])

  const totalPages = Math.ceil(filteredAccounts.length / itemsPerPage)

  // Reset trang khi thay đổi bộ lọc
  useEffect(() => {
    setCurrentPage(1)
  }, [searchQuery, statusFilter, roleFilter])

  // Xử lý đổi trạng thái
  const handleStatusChange = async () => {
    setIsUpdating(true)
    try {
      const newStatus = selectedAccount.status === "ACTIVE" ? "INACTIVE" : "ACTIVE"
      const account = mockAccounts.find((acc) => acc._id === selectedAccount._id)
      if (account) {
        account.status = newStatus
      }
      toast.success(`Đã cập nhật trạng thái tài khoản ${selectedAccount.email} thành ${newStatus}`)
      setDialogOpen(false)
    } catch (error) {
      toast.error("Không thể cập nhật trạng thái. Vui lòng thử lại.")
    } finally {
      setIsUpdating(false)
    }
  }

  // Xử lý thay đổi trang
  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page)
    }
  }

  // Lấy tên vai trò từ role_id
  const getRoleName = (roleId) => {
    const role = roles.find((r) => r._id === roleId)
    return role ? role.name : "Unknown"
  }

  // Get status badge styling
  const getStatusBadge = (status) => {
    const styles = {
      ACTIVE: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
      INACTIVE: "bg-zinc-500/10 text-zinc-400 border-zinc-500/20",
      PENDING: "bg-amber-500/10 text-amber-400 border-amber-500/20",
      BANNED: "bg-rose-500/10 text-rose-400 border-rose-500/20",
    }
    return styles[status] || styles.INACTIVE

  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        {/* <div className="mb-8">
          <h1 className="text-3xl font-semibold text-foreground mb-2">Quản lý tài khoản</h1>
          <p className="text-sm text-muted-foreground">
            Quản lý và theo dõi tất cả tài khoản người dùng trong hệ thống
          </p>
        </div> */}

        {/* Filters Card */}
        <div className="mb-6 rounded-lg border border-border bg-card p-4">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Tìm kiếm theo email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-background border-border focus-visible:ring-1 focus-visible:ring-ring"
              />
            </div>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-[180px] bg-background border-border">
                  <SelectValue placeholder="Trạng thái" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả trạng thái</SelectItem>
                  <SelectItem value="ACTIVE">Active</SelectItem>
                  <SelectItem value="INACTIVE">Inactive</SelectItem>
                  <SelectItem value="PENDING">Pending</SelectItem>
                  <SelectItem value="BANNED">Banned</SelectItem>
                </SelectContent>
              </Select>
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger className="w-full sm:w-[180px] bg-background border-border">
                  <SelectValue placeholder="Vai trò" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả vai trò</SelectItem>
                  {roles.map((role) => (
                    <SelectItem key={role._id} value={role._id}>
                      {role.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Table Card */}
        <div className="rounded-lg border border-border bg-card overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="border-border hover:bg-transparent">
                <TableHead className="text-muted-foreground font-medium">Email</TableHead>
                <TableHead className="text-muted-foreground font-medium">Provider</TableHead>
                <TableHead className="text-muted-foreground font-medium">Trạng thái</TableHead>
                <TableHead className="text-muted-foreground font-medium">Vai trò</TableHead>
                <TableHead className="text-muted-foreground font-medium">Ngày tạo</TableHead>
                <TableHead className="text-muted-foreground font-medium text-right">Hành động</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedAccounts.length === 0 ? (
                <TableRow className="hover:bg-transparent">
                  <TableCell colSpan={6} className="h-32 text-center text-muted-foreground">
                    Không tìm thấy tài khoản nào
                  </TableCell>
                </TableRow>
              ) : (
                paginatedAccounts.map((account) => (
                  <TableRow key={account._id} className="border-border hover:bg-accent/50 transition-colors">
                    <TableCell className="font-medium text-foreground">{account.email}</TableCell>
                    <TableCell className="text-muted-foreground capitalize">{account.provider}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium ${getStatusBadge(
                            account.status,
                          )}`}
                        >
                          <span className="h-1.5 w-1.5 rounded-full bg-current" />
                          {account.status}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{getRoleName(account.role_id)}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {new Date(account.createdAt).toLocaleDateString("vi-VN")}
                    </TableCell>
                    <TableCell className="text-right">
                      {(account.status === "ACTIVE" || account.status === "INACTIVE") && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedAccount(account)
                            setDialogOpen(true)
                          }}
                          className="h-8 text-xs hover:bg-accent hover:text-accent-foreground"
                        >
                          {account.status === "ACTIVE" ? "Vô hiệu hóa" : "Kích hoạt"}
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
                    className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer hover:bg-accent"}
                  />
                </PaginationItem>
                {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                  let page
                  if (totalPages <= 5) {
                    page = i + 1
                  } else if (currentPage <= 3) {
                    page = i + 1
                  } else if (currentPage >= totalPages - 2) {
                    page = totalPages - 4 + i
                  } else {
                    page = currentPage - 2 + i
                  }
                  return (
                    <PaginationItem key={page}>
                      <PaginationLink
                        isActive={currentPage === page}
                        onClick={() => handlePageChange(page)}
                        className="cursor-pointer hover:bg-accent"
                      >
                        {page}
                      </PaginationLink>
                    </PaginationItem>
                  )
                })}
                <PaginationItem>
                  <PaginationNext
                    onClick={() => handlePageChange(currentPage + 1)}
                    className={
                      currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer hover:bg-accent"
                    }
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        )}

        {/* Dialog xác nhận đổi trạng thái */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="bg-card border-border">
            <DialogHeader>
              <DialogTitle className="text-foreground">Xác nhận đổi trạng thái</DialogTitle>
              <DialogDescription className="text-muted-foreground">
                Bạn có chắc muốn đổi trạng thái tài khoản{" "}
                <span className="font-semibold text-foreground">{selectedAccount?.email}</span> từ{" "}
                <span className="font-semibold text-foreground">{selectedAccount?.status}</span> sang{" "}
                <span className="font-semibold text-foreground">
                  {selectedAccount?.status === "ACTIVE" ? "INACTIVE" : "ACTIVE"}
                </span>
                ?
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="ghost" onClick={() => setDialogOpen(false)} className="hover:bg-accent">
                Hủy
              </Button>
              <Button
                onClick={handleStatusChange}
                disabled={isUpdating}
                className="bg-primary text-primary-foreground hover:bg-primary/90"
              >
                {isUpdating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Xác nhận
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}