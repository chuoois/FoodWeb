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

// Dữ liệu mẫu (giả lập từ schema MongoDB cho cửa hàng bán đồ ăn)
const mockShops = [
  {
    _id: "1",
    name: "Quán Ăn Ngon",
    ownerEmail: "owner1@example.com",
    status: "ACTIVE",
    category: "nha-hang",
    createdAt: "2025-10-01T10:00:00Z",
  },
  {
    _id: "2",
    name: "Cửa Hàng Bánh Mì",
    ownerEmail: "owner2@example.com",
    status: "INACTIVE",
    category: "quan-an",
    createdAt: "2025-10-02T12:00:00Z",
  },
  {
    _id: "3",
    name: "Nhà Hàng Hải Sản",
    ownerEmail: "owner3@example.com",
    status: "PENDING",
    category: "hai-san",
    createdAt: "2025-10-03T15:00:00Z",
  },
  {
    _id: "4",
    name: "Quán Cà Phê Đồ Ăn Nhẹ",
    ownerEmail: "owner4@example.com",
    status: "BANNED",
    category: "ca-phe",
    createdAt: "2025-10-04T09:00:00Z",
  },
  {
    _id: "5",
    name: "Siêu Thị Mini Ăn Uống",
    ownerEmail: "owner5@example.com",
    status: "ACTIVE",
    category: "sieu-thi",
    createdAt: "2025-10-04T11:00:00Z",
  },
  ...Array.from({ length: 10 }, (_, i) => ({
    _id: `${i + 6}`,
    name: `Cửa Hàng Đồ Ăn ${i + 6}`,
    ownerEmail: `owner${i + 6}@example.com`,
    status: ["ACTIVE", "INACTIVE", "PENDING", "BANNED"][i % 4],
    category: ["nha-hang", "quan-an", "hai-san", "ca-phe", "sieu-thi"][i % 5],
    createdAt: `2025-10-04T${(i + 10).toString().padStart(2, "0")}:00:00Z`,
  })),
]

// Dữ liệu loại hình mẫu
const categories = [
  { _id: "nha-hang", name: "Nhà hàng" },
  { _id: "quan-an", name: "Quán ăn" },
  { _id: "hai-san", name: "Hải sản" },
  { _id: "ca-phe", name: "Cà phê" },
  { _id: "sieu-thi", name: "Siêu thị" },
]

export const ShopManagement = () => {
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [currentPage, setCurrentPage] = useState(1)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [selectedShop, setSelectedShop] = useState(null)
  const [isUpdating, setIsUpdating] = useState(false)

  const itemsPerPage = 10

  // Lọc cửa hàng
  const filteredShops = useMemo(() => {
    return mockShops.filter((shop) => {
      const matchesSearch = shop.name.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesStatus = statusFilter === "all" || shop.status === statusFilter
      const matchesCategory = categoryFilter === "all" || shop.category === categoryFilter
      return matchesSearch && matchesStatus && matchesCategory
    })
  }, [searchQuery, statusFilter, categoryFilter])

  // Phân trang
  const paginatedShops = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage
    return filteredShops.slice(startIndex, startIndex + itemsPerPage)
  }, [filteredShops, currentPage])

  const totalPages = Math.ceil(filteredShops.length / itemsPerPage)

  // Reset trang khi thay đổi bộ lọc
  useEffect(() => {
    setCurrentPage(1)
  }, [searchQuery, statusFilter, categoryFilter])

  // Xử lý đổi trạng thái
  const handleStatusChange = async () => {
    setIsUpdating(true)
    try {
      const newStatus = selectedShop.status === "ACTIVE" ? "INACTIVE" : "ACTIVE"
      const shop = mockShops.find((s) => s._id === selectedShop._id)
      if (shop) {
        shop.status = newStatus
      }
      toast.success(`Đã cập nhật trạng thái cửa hàng ${selectedShop.name} thành ${newStatus}`)
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

  // Lấy tên loại hình từ category
  const getCategoryName = (categoryId) => {
    const category = categories.find((c) => c._id === categoryId)
    return category ? category.name : "Unknown"
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
          <h1 className="text-3xl font-semibold text-foreground mb-2">Quản lý cửa hàng bán đồ ăn</h1>
          <p className="text-sm text-muted-foreground">
            Quản lý và theo dõi tất cả cửa hàng bán đồ ăn trong hệ thống
          </p>
        </div> */}

        {/* Filters Card */}
        <div className="mb-6 rounded-lg border border-border bg-card p-4">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Tìm kiếm theo tên cửa hàng..."
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
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-full sm:w-[180px] bg-background border-border">
                  <SelectValue placeholder="Loại hình" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả loại hình</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category._id} value={category._id}>
                      {category.name}
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
                <TableHead className="text-muted-foreground font-medium">Tên cửa hàng</TableHead>
                <TableHead className="text-muted-foreground font-medium">Chủ sở hữu</TableHead>
                <TableHead className="text-muted-foreground font-medium">Trạng thái</TableHead>
                <TableHead className="text-muted-foreground font-medium">Loại hình</TableHead>
                <TableHead className="text-muted-foreground font-medium">Ngày tạo</TableHead>
                <TableHead className="text-muted-foreground font-medium text-right">Hành động</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedShops.length === 0 ? (
                <TableRow className="hover:bg-transparent">
                  <TableCell colSpan={6} className="h-32 text-center text-muted-foreground">
                    Không tìm thấy cửa hàng nào
                  </TableCell>
                </TableRow>
              ) : (
                paginatedShops.map((shop) => (
                  <TableRow key={shop._id} className="border-border hover:bg-accent/50 transition-colors">
                    <TableCell className="font-medium text-foreground">{shop.name}</TableCell>
                    <TableCell className="text-muted-foreground">{shop.ownerEmail}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium ${getStatusBadge(
                            shop.status,
                          )}`}
                        >
                          <span className="h-1.5 w-1.5 rounded-full bg-current" />
                          {shop.status}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{getCategoryName(shop.category)}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {new Date(shop.createdAt).toLocaleDateString("vi-VN")}
                    </TableCell>
                    <TableCell className="text-right">
                      {(shop.status === "ACTIVE" || shop.status === "INACTIVE") && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedShop(shop)
                            setDialogOpen(true)
                          }}
                          className="h-8 text-xs hover:bg-accent hover:text-accent-foreground"
                        >
                          {shop.status === "ACTIVE" ? "Vô hiệu hóa" : "Kích hoạt"}
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
                Bạn có chắc muốn đổi trạng thái cửa hàng{" "}
                <span className="font-semibold text-foreground">{selectedShop?.name}</span> từ{" "}
                <span className="font-semibold text-foreground">{selectedShop?.status}</span> sang{" "}
                <span className="font-semibold text-foreground">
                  {selectedShop?.status === "ACTIVE" ? "INACTIVE" : "ACTIVE"}
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