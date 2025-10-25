import { useState, useMemo, useEffect, useCallback } from "react"
import { Search, Loader2, ImageIcon, Store, Users, TrendingUp } from "lucide-react"
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
import { listShops,updateShopStatus  } from "@/services/admin.service"

export const ShopManagement = () => {
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [currentPage, setCurrentPage] = useState(1)
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false)
  const [detailDialogOpen, setDetailDialogOpen] = useState(false)
  const [selectedShop, setSelectedShop] = useState(null)
  const [isUpdating, setIsUpdating] = useState(false)
  const [shops, setShops] = useState([])
  const [totalPages, setTotalPages] = useState(1)
  const [loading, setLoading] = useState(false)

  const itemsPerPage = 10
  const params = useMemo(
    () => ({
      page: currentPage,
      limit: itemsPerPage,
      search: searchQuery || undefined,
      status: statusFilter === "all" ? undefined : statusFilter,
    }),
    [currentPage, searchQuery, statusFilter],
  )

  const fetchShops = useCallback(
    async (fetchParams = params) => {
      setLoading(true)
      try {
        const response = await listShops(fetchParams)
        setShops(response.data.shops || [])
        setTotalPages(response.data.totalPages || 1)
      } catch (error) {
        console.error("Error fetching shops:", error)
        toast.error("Không thể tải danh sách cửa hàng. Vui lòng thử lại.")
        setShops([])
        setTotalPages(1)
      } finally {
        setLoading(false)
      }
    },
    [params],
  )

  useEffect(() => {
    fetchShops()
  }, [fetchShops])

  useEffect(() => {
    setCurrentPage(1)
    fetchShops({ ...params, page: 1 })
  }, [searchQuery, statusFilter, fetchShops])

  const handleStatusChange = async () => {
  setIsUpdating(true)
  try {
    const res = await updateShopStatus(selectedShop._id) // 🟢 gọi API thật
    toast.success(res.data.message || "Cập nhật trạng thái thành công")
    setConfirmDialogOpen(false)
    fetchShops() // load lại danh sách
  } catch (error) {
    toast.error(error.response?.data?.message || "Không thể cập nhật trạng thái. Vui lòng thử lại.")
  } finally {
    setIsUpdating(false)
  }
}

  const handleViewDetail = (shop) => {
    setSelectedShop(shop)
    setDetailDialogOpen(true)
  }

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page)
    }
  }

  const getStatusBadge = (status) => {
    const styles = {
      ACTIVE: "bg-green-100 text-green-700 border border-green-200 shadow-sm",
      INACTIVE: "bg-gray-100 text-gray-600 border border-gray-200 shadow-sm",
    }
    return styles[status] || styles.INACTIVE
  }

  const truncateDescription = (desc, maxLength = 50) => {
    return desc?.length > maxLength ? `${desc.slice(0, maxLength)}...` : desc
  }

  return (
    <div className="min-h-screen bg-white p-6">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg">
              <Store className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-orange-500 to-orange-600 bg-clip-text text-transparent">
              Quản Lý Cửa Hàng
            </h1>
          </div>
          <p className="text-gray-600 ml-11">Quản lý và theo dõi tất cả cửa hàng trong hệ thống</p>
        </div>

        <div className="mb-6 rounded-xl border border-gray-200 bg-gray-50 backdrop-blur-sm p-5 shadow-sm">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
              <Input
                placeholder="Tìm kiếm theo tên cửa hàng..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-white border-gray-300 text-gray-900 placeholder:text-gray-500 focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:border-transparent transition-all"
                disabled={loading}
              />
            </div>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <Select value={statusFilter} onValueChange={setStatusFilter} disabled={loading}>
                <SelectTrigger className="w-full sm:w-[200px] bg-white border-gray-300 text-gray-900 focus:ring-2 focus:ring-orange-500">
                  <SelectValue placeholder="Trạng thái" />
                </SelectTrigger>
                <SelectContent className="bg-white border-gray-300">
                  <SelectItem value="all" className="text-gray-900">
                    Tất cả trạng thái
                  </SelectItem>
                  <SelectItem value="ACTIVE" className="text-gray-900">
                    Active
                  </SelectItem>
                  <SelectItem value="INACTIVE" className="text-gray-900">
                    Inactive
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white backdrop-blur-sm overflow-hidden shadow-sm">
          <Table>
            <TableHeader>
              <TableRow className="border-gray-200 hover:bg-transparent bg-gray-50">
                <TableHead className="text-gray-700 font-semibold">Tên cửa hàng</TableHead>
                <TableHead className="text-gray-700 font-semibold">Chủ sở hữu</TableHead>
                <TableHead className="text-gray-700 font-semibold">Trạng thái</TableHead>
                <TableHead className="text-gray-700 font-semibold">Mô tả</TableHead>
                <TableHead className="text-gray-700 font-semibold text-right">Hành động</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow className="hover:bg-transparent border-gray-200">
                  <TableCell colSpan={5} className="h-32 text-center">
                    <Loader2 className="mx-auto h-6 w-6 animate-spin text-orange-500" />
                  </TableCell>
                </TableRow>
              ) : shops.length === 0 ? (
                <TableRow className="hover:bg-transparent border-gray-200">
                  <TableCell colSpan={5} className="h-32 text-center text-gray-500">
                    Không tìm thấy cửa hàng nào
                  </TableCell>
                </TableRow>
              ) : (
                shops.map((shop) => (
                  <TableRow
                    key={shop._id}
                    className="border-gray-200 hover:bg-gray-50 transition-all duration-200 cursor-pointer group"
                    onDoubleClick={() => handleViewDetail(shop)}
                  >
                    <TableCell className="font-semibold text-gray-900 group-hover:text-orange-600 transition-colors">
                      {shop.name}
                    </TableCell>
                    <TableCell className="text-gray-600">{shop.ownerEmail}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${getStatusBadge(
                            shop.status,
                          )}`}
                        >
                          <span className="h-2 w-2 rounded-full bg-current animate-pulse" />
                          {shop.status}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-gray-600" title={shop.description}>
                      {truncateDescription(shop.description)}
                    </TableCell>
                    <TableCell className="text-right">
                      {(shop.status === "ACTIVE" || shop.status === "INACTIVE") && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation()
                            setSelectedShop(shop)
                            setConfirmDialogOpen(true)
                          }}
                          className="h-8 text-xs text-gray-700 hover:bg-orange-500/10 hover:text-orange-600 transition-all"
                          disabled={isUpdating}
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
                    className={
                      currentPage === 1
                        ? "pointer-events-none opacity-50 text-gray-500"
                        : "cursor-pointer hover:bg-gray-100 text-gray-700 hover:text-gray-900 transition-all"
                    }
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
                        className={`cursor-pointer transition-all ${currentPage === page ? "bg-orange-500 text-white" : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"}`}
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

        <Dialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
          <DialogContent className="bg-white border-gray-200 shadow-xl">
            <DialogHeader>
              <DialogTitle className="text-gray-900 text-xl">Xác nhận đổi trạng thái</DialogTitle>
              <DialogDescription className="text-gray-600 mt-2">
                Bạn có chắc muốn đổi trạng thái cửa hàng{" "}
                <span className="font-semibold text-gray-900">{selectedShop?.name}</span> từ{" "}
                <span className="font-semibold text-gray-900">{selectedShop?.status}</span> sang{" "}
                <span className="font-semibold text-orange-600">
                  {selectedShop?.status === "ACTIVE" ? "INACTIVE" : "ACTIVE"}
                </span>
                ?
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="gap-3">
              <Button
                variant="ghost"
                onClick={() => setConfirmDialogOpen(false)}
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
                Xác nhận
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={detailDialogOpen} onOpenChange={setDetailDialogOpen}>
          <DialogContent className="bg-white border-gray-200 max-w-2xl max-h-[80vh] overflow-y-auto shadow-xl">
            <DialogHeader>
              <DialogTitle className="text-gray-900 text-2xl">{selectedShop?.name}</DialogTitle>
            </DialogHeader>
            <div className="space-y-6">
              {selectedShop?.logoUrl && (
                <div className="flex justify-center">
                  <img
                    src={selectedShop.logoUrl || "/placeholder.svg"}
                    alt={`${selectedShop.name} logo`}
                    className="w-32 h-32 object-cover rounded-lg border border-gray-200 shadow-sm"
                    onError={(e) => {
                      e.target.style.display = "none"
                      e.target.nextSibling.style.display = "flex"
                    }}
                  />
                  <ImageIcon className="w-32 h-32 text-gray-400 hidden" />
                </div>
              )}
              {selectedShop?.coverUrl && (
                <img
                  src={selectedShop.coverUrl || "/placeholder.svg"}
                  alt={`${selectedShop.name} cover`}
                  className="w-full h-48 object-cover rounded-lg border border-gray-200 shadow-sm"
                  onError={(e) => {
                    e.target.style.display = "none"
                  }}
                />
              )}
              <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">{selectedShop?.description}</p>
              <div className="space-y-3 bg-gray-50 rounded-lg p-4 border border-gray-200">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-orange-600" />
                  <p className="text-sm text-gray-700">
                    <span className="font-semibold text-gray-900">Chủ sở hữu:</span> {selectedShop?.ownerEmail}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-green-600" />
                  <p className="text-sm text-gray-700">
                    <span className="font-semibold text-gray-900">Trạng thái:</span>
                    <span
                      className={`ml-2 font-semibold ${selectedShop?.status === "ACTIVE" ? "text-green-600" : "text-gray-600"}`}
                    >
                      {selectedShop?.status}
                    </span>
                  </p>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button
                onClick={() => setDetailDialogOpen(false)}
                className="bg-gradient-to-r from-orange-500 to-orange-600 text-white hover:from-orange-600 hover:to-orange-700 transition-all shadow-lg w-full"
              >
                Đóng
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}