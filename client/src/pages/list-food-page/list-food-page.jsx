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

export function FoodListPage() {
  const navigate = useNavigate();

  const [foods, setFoods] = useState([
    {
      _id: "1",
      name: "Phở Bò",
      description: "Traditional Vietnamese beef noodle soup",
      image:
        "https://i.ytimg.com/vi/99tOr7JSr0k/sddefault.jpg",
      price: 45000,
      discount: 10,
      is_available: true,
      category: "Món nước",
      options: [
        { type: "Size", name: "Large", price: 5000 },
        { type: "Size", name: "Small", price: 0 },
      ],
    },
    {
      _id: "2",
      name: "Bánh Mì Thịt",
      description: "Vietnamese baguette with pork and veggies",
      image:
        "https://mms.img.susercontent.com/vn-11134513-7r98o-lsvd5u9lp5eh10@resize_ss1242x600!@crop_w1242_h600_cT",
      price: 25000,
      discount: 0,
      is_available: false,
      category: "Ăn sáng",
      options: [{ type: "Spice", name: "Extra chili", price: 2000 }],
    },
    {
      _id: "3",
      name: "Cơm Tấm",
      description: "Broken rice with grilled pork and egg",
      image:
        "https://file.hstatic.net/1000394081/article/com-tam_e03b4325c9914def9d66619930a73432.jpg",
      price: 50000,
      discount: 5,
      is_available: true,
      category: "Cơm",
      options: [
        { type: "Add-on", name: "Extra egg", price: 5000 },
        { type: "Add-on", name: "Extra pork", price: 10000 },
      ],
    },
  ]);

  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const debouncedSearch = useDebounce(search, 400);

  useEffect(() => {
    setLoading(true);
    const timeout = setTimeout(() => {
      const filtered = foods.filter((f) =>
        f.name.toLowerCase().includes(debouncedSearch.toLowerCase())
      );
      setFoods(filtered);
      setLoading(false);
    }, 500);
    return () => clearTimeout(timeout);
  }, [debouncedSearch]);

  const handleClearSearch = () => setSearch("");

  const handleEdit = (food) => toast(`Sửa món: ${food.name}`);

  const handleDelete = (id) => {
    if (window.confirm("Bạn có chắc muốn xóa món này không?")) {
      setFoods(foods.filter((f) => f._id !== id));
      toast.success("Đã xóa món thành công");
    }
  };

  const handleToggleAvailability = (id, available) => {
    setFoods(
      foods.map((f) =>
        f._id === id ? { ...f, is_available: available } : f
      )
    );
    toast.success(
      available ? "Món đã được bật bán" : "Món đã được tạm ngưng bán"
    );
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
        <h1 className="text-3xl font-semibold">Quản lý món ăn</h1>
        <p className="text-muted-foreground">
          Danh sách tất cả món ăn trong hệ thống
        </p>
      </div>

      {/* 🔍 Tìm kiếm + Thêm món */}
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
                      food.price - (food.price * food.discount) / 100;
                    return (
                      <TableRow key={food._id}>
                        <TableCell>
                          {food.image ? (
                            <img
                              src={food.image}
                              alt={food.name}
                              className="w-14 h-14 rounded-md object-cover"
                            />
                          ) : (
                            <div className="w-14 h-14 flex items-center justify-center bg-gray-100 rounded-md">
                              <ImageIcon className="w-5 h-5 text-gray-400" />
                            </div>
                          )}
                        </TableCell>

                        <TableCell className="font-medium">
                          {food.name}
                        </TableCell>

                        <TableCell>{food.category}</TableCell>

                        <TableCell className="max-w-xs truncate text-sm text-muted-foreground">
                          {food.description}
                        </TableCell>

                        <TableCell>{food.price.toLocaleString()}đ</TableCell>

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

                        <TableCell>{food.options.length} tùy chọn</TableCell>

                        <TableCell>
                          <span
                            className={`inline-block rounded-full px-2.5 py-1 text-xs font-medium ${
                              food.is_available
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
                              handleToggleAvailability(
                                food._id,
                                !food.is_available
                              )
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
                            onClick={() => handleEdit(food)}
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
    </div>
  );
}
