import { useState, useMemo, useEffect, useCallback } from "react"
import { Search, Loader2, Image, Store, Users, TrendingUp, CheckCircle, Clock, Ban } from "lucide-react"
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
import { listShops, updateShopStatus } from "@/services/admin.service"

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
      const res = await updateShopStatus(selectedShop._id)
      toast.success(res.data.message || "Cập nhật trạng thái thành công")
      setConfirmDialogOpen(false)
      fetchShops()
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

  const getStatusConfig = (status) => {
    const config = {
      ACTIVE: { icon: CheckCircle, color: "text-green-600 bg-green-50 border-green-200", label: "Hoạt động" },
      INACTIVE: { icon: Ban, color: "text-gray-600 bg-gray-50 border-gray-200", label: "Vô hiệu" },
      PENDING_APPROVAL: { icon: Clock, color: "text-yellow-600 bg-yellow-50 border-yellow-200", label: "Chờ duyệt" },
    }
    return config[status] || config.INACTIVE
  }

  const truncateDescription = (desc, maxLength = 50) => {
    return desc?.length > maxLength ? `${desc.slice(0, maxLength)}...` : desc
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-orange-50 p-6">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg shadow-md">
              <Store className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-orange-500 to-orange-600 bg-clip-text text-transparent">
              Quản Lý Cửa Hàng
            </h1>
          </div>
          <p className="text-gray-600 ml-11">Quản lý và theo dõi tất cả cửa hàng trong hệ thống</p>
        </div>

        {/* Filters */}
        <div className="mb-6 rounded-xl border border-gray-200 bg-white/80 backdrop-blur-sm p-5 shadow-sm">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
              <Input
                placeholder="Tìm kiếm theo tên cửa hàng..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-white border-gray-300 text-gray-900 placeholder:text-gray-500 focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:border-transparent"
                disabled={loading}
              />
            </div>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <Select value={statusFilter} onValueChange={setStatusFilter} disabled={loading}>
                <SelectTrigger className="w-full sm:w-[200px] bg-white border-gray-300 text-gray-900 focus:ring-2 focus:ring-orange-500">
                  <SelectValue placeholder="Trạng thái" />
                </SelectTrigger>
                <SelectContent className="bg-white border-gray-300">
                  <SelectItem value="all">Tất cả trạng thái</SelectItem>
                  <SelectItem value="ACTIVE">Hoạt động</SelectItem>
                  <SelectItem value="INACTIVE">Vô hiệu</SelectItem>
                  <SelectItem value="PENDING_APPROVAL">Chờ duyệt</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="rounded-xl border border-gray-200 bg-white/90 backdrop-blur-sm overflow-hidden shadow-lg">
          <Table>
            <TableHeader>
              <TableRow className="bg-gradient-to-r from-orange-50 to-pink-50 border-b border-white/50">
                <TableHead className="text-orange-700 font-bold text-sm uppercase tracking-wider">Tên cửa hàng</TableHead>
                <TableHead className="text-orange-700 font-bold text-sm uppercase tracking-wider">Chủ sở hữu</TableHead>
                <TableHead className="text-orange-700 font-bold text-sm uppercase tracking-wider">Trạng thái</TableHead>
                <TableHead className="text-orange-700 font-bold text-sm uppercase tracking-wider">Mô tả</TableHead>
                <TableHead className="text-orange-700 font-bold text-sm uppercase tracking-wider text-right">Hành động</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-32 text-center">
                    <Loader2 className="mx-auto h-6 w-6 animate-spin text-orange-500" />
                  </TableCell>
                </TableRow>
              ) : shops.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-32 text-center text-gray-500">
                    Không tìm thấy cửa hàng nào
                  </TableCell>
                </TableRow>
              ) : (
                shops.map((shop) => {
                  const statusConfig = getStatusConfig(shop.status)
                  const Icon = statusConfig.icon
                  return (
                    <TableRow
                      key={shop._id}
                      className="border-b border-gray-100 hover:bg-gradient-to-r hover:from-orange-50/50 hover:to-pink-50/50 cursor-pointer group"
                      onDoubleClick={() => handleViewDetail(shop)}
                    >
                      <TableCell className="font-semibold text-gray-900 group-hover:text-orange-600">
                        {shop.name}
                      </TableCell>
                      <TableCell className="text-gray-600">{shop.ownerEmail}</TableCell>
                      <TableCell>
                        <span className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold ${statusConfig.color} shadow-sm`}>
                          <Icon className="h-3.5 w-3.5" />
                          {statusConfig.label}
                        </span>
                      </TableCell>
                      <TableCell className="text-gray-600 max-w-xs" title={shop.description}>
                        {truncateDescription(shop.description)}
                      </TableCell>
                      <TableCell className="text-right">
                        {shop.status === "PENDING_APPROVAL" ? (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation()
                              setSelectedShop(shop)
                              setConfirmDialogOpen(true)
                            }}
                            className="h-9 px-4 text-sm font-medium rounded-full bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm"
                            disabled={isUpdating}
                          >
                            Phê duyệt
                          </Button>
                        ) : (shop.status === "ACTIVE" || shop.status === "INACTIVE") && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation()
                              setSelectedShop(shop)
                              setConfirmDialogOpen(true)
                            }}
                            className={`h-9 px-4 text-sm font-medium rounded-full transition-all ${
                              shop.status === "ACTIVE"
                                ? "bg-red-50 text-red-600 hover:bg-red-100"
                                : "bg-emerald-50 text-emerald-600 hover:bg-emerald-100"
                            }`}
                            disabled={isUpdating}
                          >
                            {shop.status === "ACTIVE" ? "Vô hiệu hóa" : "Kích hoạt"}
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  )
                })
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-6 flex justify-center">
            <Pagination className="backdrop-blur-xl bg-white/70 rounded-full px-4 py-2 shadow-lg border border-white/50">
              <PaginationContent className="flex gap-1">
                <PaginationItem>
                  <PaginationPrevious
                    onClick={() => handlePageChange(currentPage - 1)}
                    className={`rounded-full ${currentPage === 1 ? "opacity-50 cursor-not-allowed" : "hover:bg-orange-100"}`}
                  />
                </PaginationItem>
                {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                  let page
                  if (totalPages <= 5) page = i + 1
                  else if (currentPage <= 3) page = i + 1
                  else if (currentPage >= totalPages - 2) page = totalPages - 4 + i
                  else page = currentPage - 2 + i

                  return (
                    <PaginationItem key={page}>
                      <PaginationLink
                        isActive={currentPage === page}
                        onClick={() => handlePageChange(page)}
                        className={`rounded-full w-10 h-10 flex items-center justify-center font-medium ${
                          currentPage === page
                            ? "bg-gradient-to-r from-orange-500 to-pink-600 text-white shadow-md"
                            : "hover:bg-orange-100 text-gray-700"
                        }`}
                      >
                        {page}
                      </PaginationLink>
                    </PaginationItem>
                  )
                })}
                <PaginationItem>
                  <PaginationNext
                    onClick={() => handlePageChange(currentPage + 1)}
                    className={`rounded-full ${currentPage === totalPages ? "opacity-50 cursor-not-allowed" : "hover:bg-orange-100"}`}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        )}

        {/* DIALOG XÁC NHẬN – ĐÃ ĐẸP LUNG LINH */}
        <Dialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
          <DialogContent className="max-w-md backdrop-blur-xl bg-white/95 border border-white/50 rounded-2xl shadow-2xl p-0 overflow-hidden">
            <div className="bg-gradient-to-r from-orange-500 to-pink-600 p-5 text-white">
              <DialogTitle className="text-2xl font-bold flex items-center gap-3">
                {selectedShop?.status === "PENDING_APPROVAL" ? (
                  <>
                    <Clock className="h-6 w-6" />
                    Phê duyệt cửa hàng
                  </>
                ) : (
                  <>
                    <TrendingUp className="h-6 w-6" />
                    Đổi trạng thái
                  </>
                )}
              </DialogTitle>
            </div>
            <div className="p-6 space-y-4">
              <DialogDescription className="text-gray-700 text-base leading-relaxed">
                {selectedShop?.status === "PENDING_APPROVAL" ? (
                  <>
                    Bạn có chắc muốn <span className="font-bold text-emerald-600">phê duyệt</span> cửa hàng:
                    <div className="mt-2 p-3 bg-emerald-50 border border-emerald-200 rounded-lg">
                      <p className="font-mono text-emerald-800">{selectedShop?.name}</p>
                    </div>
                    Cửa hàng sẽ được <span className="font-bold text-emerald-600">kích hoạt ngay lập tức</span>.
                  </>
                ) : (
                  <>
                    Bạn có chắc muốn thay đổi trạng thái cửa hàng:
                    <div className="mt-2 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                      <p className="font-mono text-orange-800">{selectedShop?.name}</p>
                    </div>
                    Từ <span className="font-bold text-gray-700">{selectedShop?.status}</span> →{" "}
                    <span className="font-bold text-orange-600">
                      {selectedShop?.status === "ACTIVE" ? "VÔ HIỆU" : "HOẠT ĐỘNG"}
                    </span>
                  </>
                )}
              </DialogDescription>
            </div>
            <DialogFooter className="p-6 pt-0 flex gap-3">
              <Button
                variant="ghost"
                onClick={() => setConfirmDialogOpen(false)}
                className="flex-1 h-11 rounded-full text-gray-700 hover:bg-gray-100"
              >
                Hủy bỏ
              </Button>
              <Button
                onClick={handleStatusChange}
                disabled={isUpdating}
                className="flex-1 h-11 rounded-full bg-gradient-to-r from-orange-500 to-pink-600 text-white hover:from-orange-600 hover:to-pink-700 shadow-lg flex items-center justify-center gap-2"
              >
                {isUpdating && <Loader2 className="h-4 w-4 animate-spin" />}
                {selectedShop?.status === "PENDING_APPROVAL"
                  ? "Phê duyệt"
                  : selectedShop?.status === "ACTIVE"
                  ? "Vô hiệu hóa"
                  : "Kích hoạt"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* DIALOG CHI TIẾT – SIÊU ĐẸP */}
        <Dialog open={detailDialogOpen} onOpenChange={setDetailDialogOpen}>
          <DialogContent className="max-w-3xl max-h-[85vh] backdrop-blur-xl bg-white/95 border border-white/50 rounded-2xl shadow-2xl p-0 overflow-hidden">
            <div className="bg-gradient-to-r from-orange-500 to-pink-600 p-6 text-white">
              <DialogTitle className="text-3xl font-bold flex items-center gap-3">
                <Store className="h-8 w-8" />
                {selectedShop?.name}
              </DialogTitle>
            </div>

            <div className="p-6 space-y-6 overflow-y-auto max-h-[60vh]">
              {/* Logo + Cover */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {selectedShop?.logoUrl && (
                  <div className="flex flex-col items-center">
                    <p className="text-sm font-medium text-gray-600 mb-2">Logo</p>
                    <div className="w-32 h-32 rounded-xl overflow-hidden border-4 border-white shadow-lg">
                      <img
                        src={selectedShop.logoUrl}
                        alt="Logo"
                        className="w-full h-full object-cover"
                        onError={(e) => (e.target.src = "/placeholder.svg")}
                      />
                    </div>
                  </div>
                )}
                {selectedShop?.coverUrl && (
                  <div className="flex flex-col">
                    <p className="text-sm font-medium text-gray-600 mb-2">Ảnh bìa</p>
                    <div className="rounded-xl overflow-hidden border-4 border-white shadow-lg">
                      <img
                        src={selectedShop.coverUrl}
                        alt="Cover"
                        className="w-full h-40 object-cover"
                        onError={(e) => (e.target.src = "/placeholder.svg")}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Mô tả */}
              {selectedShop?.description && (
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-2">Mô tả</p>
                  <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                    <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{selectedShop.description}</p>
                  </div>
                </div>
              )}

              {/* Thông tin */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-xl border border-blue-200">
                  <Users className="h-5 w-5 text-blue-600" />
                  <div>
                    <p className="text-sm text-gray-600">Chủ sở hữu</p>
                    <p className="font-mono text-blue-800">{selectedShop?.ownerEmail}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-emerald-50 to-green-50 rounded-xl border border-emerald-200">
                  {(() => {
                    const cfg = getStatusConfig(selectedShop?.status)
                    const Icon = cfg.icon
                    return (
                      <>
                        <Icon className="h-5 w-5 text-emerald-600" />
                        <div>
                          <p className="text-sm text-gray-600">Trạng thái</p>
                          <p className={`font-semibold ${cfg.color.split(" ")[0]}`}>{cfg.label}</p>
                        </div>
                      </>
                    )
                  })()}
                </div>
              </div>
            </div>

            <DialogFooter className="p-6 pt-0">
              <Button
                onClick={() => setDetailDialogOpen(false)}
                className="w-full h-12 rounded-full bg-gradient-to-r from-orange-500 to-pink-600 text-white hover:from-orange-600 hover:to-pink-700 shadow-lg text-lg font-medium"
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