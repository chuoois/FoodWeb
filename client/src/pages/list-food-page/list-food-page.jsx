import React, { useState, useEffect } from "react";
import {
  Trash2,
  Edit2,
  Eye,
  EyeOff,
  X,
  Loader2,
  Utensils,
  Plus,
  Image as ImageIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
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

import useDebounce from "@/hooks/useDebounce";
import { useNavigate } from "react-router-dom";

import { getFoodsByShop, updateFood, deleteFood, toggleFoodStatus } from "@/services/food.service"; // 🔹 import API

export function FoodListPage() {
  const [selectedFood, setSelectedFood] = useState(null);
  const navigate = useNavigate();
  const [foods, setFoods] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  // ✨ Thêm mới: Dialog chi tiết món ăn
  const [openDetailDialog, setOpenDetailDialog] = useState(false);
  const [formData, setFormData] = useState({});
  const debouncedSearch = useDebounce(search, 500);


  const handleOpenDetail = (food) => {
    setSelectedFood(food);
    setFormData({
      name: food.name,
      description: food.description || "",
      price: food.price,
      discount: food.discount || 0,
      is_available: food.is_available,
      category_id: food.category_id?._id || "",
      options: food.options || [],
    });
    setOpenDetailDialog(true);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };
  // 🟢 Thêm option mới
  const handleAddOption = () => {
    setFormData((prev) => ({
      ...prev,
      options: [...prev.options, { name: "", type: "", price: 0 }],
    }));
  };

  // 🟡 Sửa option
  const handleOptionChange = (index, field, value) => {
    const newOptions = [...formData.options];
    newOptions[index][field] = value;
    setFormData((prev) => ({ ...prev, options: newOptions }));
  };

  // 🔴 Xóa option
  const handleRemoveOption = (index) => {
    setFormData((prev) => ({
      ...prev,
      options: prev.options.filter((_, i) => i !== index),
    }));
  };


  // 🧭 Gọi API khi search hoặc page thay đổi
  useEffect(() => {
    const fetchFoods = async () => {
      try {
        setLoading(true);
        const params = {
          page,
          limit: 10,
          search: debouncedSearch,
          sort_by: "created_at",
          sort_order: "desc",
        };

        const res = await getFoodsByShop(params);

        // API trả về { foods, pagination }
        setFoods(res.data.foods || []);
        setTotalPages(res.data.pagination?.total_pages || 1);
      } catch (error) {
        console.error("Error fetching foods:", error);
        toast.error("Không thể tải danh sách món ăn");
      } finally {
        setLoading(false);
      }
    };

    fetchFoods();
  }, [debouncedSearch, page]);

  const handleClearSearch = () => setSearch("");


  const handleSaveUpdate = async () => {
    if (!selectedFood?._id) return;

    try {
      toast.loading("Đang cập nhật món ăn...", { id: "update-food" });

      const res = await updateFood(selectedFood._id, formData);

      // Giả sử API trả về { data: {...food} }
      const updatedFood = res.data?.data || res.data;

      // Cập nhật danh sách món trong state
      setFoods((prev) =>
        prev.map((f) => (f._id === selectedFood._id ? updatedFood : f))
      );

      toast.success("Cập nhật món ăn thành công!", { id: "update-food" });
      setOpenDetailDialog(false);
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Lỗi khi cập nhật món ăn", {
        id: "update-food",
      });
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Bạn có chắc muốn xóa món này không?")) return;

    try {
      toast.loading("Đang xóa món...", { id: "delete-food" });

      await deleteFood(id);

      setFoods((prev) => prev.filter((f) => f._id !== id));
      toast.success("Xóa món thành công!", { id: "delete-food" });
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Không thể xóa món", {
        id: "delete-food",
      });
    }
  };

  const handleToggleAvailability = async (id, newStatus) => {
    try {
      toast.loading("Đang cập nhật trạng thái...", { id: "toggle-food" });

      await toggleFoodStatus(id);

      setFoods((prev) =>
        prev.map((f) =>
          f._id === id ? { ...f, is_available: newStatus } : f
        )
      );

      toast.success(
        newStatus ? "Món đã được bật bán" : "Món đã được tạm ngưng bán",
        { id: "toggle-food" }
      );
    } catch (err) {
      console.error(err);
      toast.error("Lỗi khi thay đổi trạng thái món", { id: "toggle-food" });
    }
  };

  return (
    <div className="container mx-auto py-8">
      <Toaster position="top-right" />

      <div className="mb-8">
        <h1 className="text-3xl font-semibold">Quản lý món ăn</h1>
        <p className="text-muted-foreground">
          Danh sách tất cả món ăn trong cửa hàng
        </p>
      </div>

      {/* 🔍 Thanh tìm kiếm + nút thêm món */}
      <div className="flex justify-between items-center gap-4 mb-4">
        <div className="relative flex-1 max-w-sm">
          <input
            type="text"
            placeholder="Tìm kiếm món ăn..."
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
          onClick={() => navigate("/manager-staff/manage/create-food")}
          className="flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Thêm món ăn
        </Button>
      </div>

      {/* 🧾 Bảng món ăn */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Utensils className="h-5 w-5 text-muted-foreground" />
            <CardTitle>Danh sách món ăn</CardTitle>
          </div>
        </CardHeader>

        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Ảnh</TableHead>
                  <TableHead>Tên món</TableHead>
                  <TableHead>Danh mục</TableHead>
                  <TableHead>Mô tả</TableHead>
                  <TableHead>Giá gốc</TableHead>
                  <TableHead>Giảm giá</TableHead>
                  <TableHead>Giá sau giảm</TableHead>
                  <TableHead>Tùy chọn</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead>Thao tác</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {foods.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={10} className="text-center py-4">
                      Không có món ăn nào phù hợp.
                    </TableCell>
                  </TableRow>
                ) : (
                  foods.map((food) => {
                    const finalPrice =
                      food.price - (food.price * (food.discount || 0)) / 100;

                    return (
                      <TableRow key={food._id}>
                        <TableCell>
                          {food.image_url ? (
                            <img
                              src={food.image_url}
                              alt={food.name}
                              className="w-14 h-14 rounded-md object-cover"
                            />
                          ) : (
                            <div className="w-14 h-14 flex items-center justify-center bg-gray-100 rounded-md">
                              <ImageIcon className="w-5 h-5 text-gray-400" />
                            </div>
                          )}
                        </TableCell>

                        <TableCell className="font-medium">{food.name}</TableCell>

                        <TableCell>{food.category_id?.name || "-"}</TableCell>

                        <TableCell className="max-w-xs truncate text-sm text-muted-foreground">
                          {food.description || "Không có"}
                        </TableCell>

                        <TableCell>{food.price?.toLocaleString()}đ</TableCell>

                        <TableCell>
                          {food.discount > 0 ? (
                            <span className="text-orange-600 font-medium">
                              {food.discount}%
                            </span>
                          ) : (
                            <span className="text-muted-foreground">0%</span>
                          )}
                        </TableCell>

                        <TableCell className="font-semibold text-green-700">
                          {finalPrice.toLocaleString()}đ
                        </TableCell>

                        {/* 🧩 Cột tùy chọn */}
                        <TableCell>
                          {food.options && food.options.length > 0 ? (
                            <div className="text-sm text-muted-foreground">
                              {food.options.slice(0, 2).map((opt) => opt.name).join(", ")}
                              {food.options.length > 2 && "…"}

                              <Dialog>
                                <DialogTrigger asChild>
                                  <button
                                    onClick={() => setSelectedFood(food)}
                                    className="text-blue-600 hover:underline ml-1 text-xs"
                                  >
                                    Xem
                                  </button>
                                </DialogTrigger>

                                <DialogContent className="max-w-md">
                                  <DialogHeader>
                                    <DialogTitle>
                                      Tùy chọn của {selectedFood?.name}
                                    </DialogTitle>
                                    <DialogDescription>
                                      Danh sách các tùy chọn có sẵn cho món ăn này
                                    </DialogDescription>
                                  </DialogHeader>

                                  <div className="mt-3 space-y-2">
                                    {selectedFood?.options?.map((opt, index) => (
                                      <div
                                        key={index}
                                        className="border p-2 rounded-md flex justify-between items-center"
                                      >
                                        <span>
                                          <span className="font-medium">{opt.type}</span>: {opt.name}
                                        </span>
                                        <span className="text-sm text-green-700 font-semibold">
                                          +{opt.price.toLocaleString()}đ
                                        </span>
                                      </div>
                                    ))}
                                  </div>
                                </DialogContent>
                              </Dialog>
                            </div>
                          ) : (
                            <span className="text-muted-foreground text-xs">Không có</span>
                          )}
                        </TableCell>


                        <TableCell>
                          <span
                            className={`inline-block rounded-full px-2.5 py-1 text-xs font-medium ${food.is_available
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                              }`}
                          >
                            {food.is_available ? "Đang bán" : "Ngừng bán"}
                          </span>
                        </TableCell>

                        <TableCell className="flex gap-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() =>
                              handleToggleAvailability(food._id, !food.is_available)
                            }
                          >
                            {food.is_available ? (
                              <Eye className="h-4 w-4" />
                            ) : (
                              <EyeOff className="h-4 w-4" />
                            )}
                          </Button>

                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleOpenDetail(food)}
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>

                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDelete(food._id)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>

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
      <Dialog open={openDetailDialog} onOpenChange={setOpenDetailDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Chi tiết món ăn</DialogTitle>
            <DialogDescription>
              Xem và chỉnh sửa thông tin món ăn
            </DialogDescription>
          </DialogHeader>

          {selectedFood && (
            <div className="space-y-4 mt-4">
              <div>
                <label className="text-sm font-medium">Tên món</label>
                <input
                  name="name"
                  value={formData.name}
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
                  rows={3}
                />
              </div>

              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="text-sm font-medium">Giá gốc (đ)</label>
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleChange}
                    className="w-full border p-2 rounded-md"
                  />
                </div>

                <div className="flex-1">
                  <label className="text-sm font-medium">Giảm giá (%)</label>
                  <input
                    type="number"
                    name="discount"
                    value={formData.discount}
                    onChange={handleChange}
                    className="w-full border p-2 rounded-md"
                  />
                </div>
              </div>
              <div>

                <div>
                  <div>
                    <label className="text-sm font-medium">Tùy chọn món ăn</label>
                    <div className="mt-2 space-y-3">
                      {formData.options.map((opt, index) => (
                        <div key={index} className="border p-3 rounded-md space-y-2 relative">
                          <button
                            type="button"
                            onClick={() => handleRemoveOption(index)}
                            className="absolute top-2 right-2 text-destructive hover:underline text-xs"
                          >
                            Xóa
                          </button>

                          <div className="flex gap-2">
                            <div className="flex-1">
                              <label className="text-xs font-medium">Tên tùy chọn</label>
                              <input
                                type="text"
                                value={opt.name}
                                onChange={(e) =>
                                  handleOptionChange(index, "name", e.target.value)
                                }
                                className="w-full border p-2 rounded-md"
                              />
                            </div>
                            <div className="flex-1">
                              <label className="text-xs font-medium">Loại</label>
                              <select
                                value={opt.type}
                                onChange={(e) => handleOptionChange(index, "type", e.target.value)}
                                className="w-full border p-2 rounded-md bg-white"
                              >
                                <option value="">-- Chọn loại --</option>
                                <option value="SIZE">SIZE</option>
                                <option value="TOPPING">TOPPING</option>
                                <option value="EXTRA">EXTRA</option>
                                <option value="SPICY">SPICY</option>
                              </select>
                            </div>
                          </div>

                          <div>
                            <label className="text-xs font-medium">Giá thêm (đ)</label>
                            <input
                              type="number"
                              value={opt.price}
                              onChange={(e) =>
                                handleOptionChange(index, "price", Number(e.target.value))
                              }
                              className="w-full border p-2 rounded-md"
                              step={5000}  // 👈 Thêm dòng này
                            />
                          </div>
                        </div>
                      ))}

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleAddOption}
                        className="mt-2"
                      >
                        + Thêm tùy chọn
                      </Button>
                    </div>
                  </div>
                </div>
              </div>


              <div className="flex justify-end gap-2 pt-4">
                <Button
                  variant="outline"
                  onClick={() => setOpenDetailDialog(false)}
                >
                  Hủy
                </Button>
                <Button onClick={handleSaveUpdate} >Lưu thay đổi</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

    </div>
  );
}
