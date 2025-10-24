import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Plus, X, ImageIcon, UtensilsCrossed, CircleDollarSign } from "lucide-react";

export function CreateFoodPage({ onSubmit, isLoading = false }) {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: 0,
    discount: 0,
    image_logo: "",
    image_cover: "",
    is_available: true,
    category_id: "",
    options: [],
  });

  const [newOption, setNewOption] = useState({
    type: "SIZE",
    name: "",
    price: 0,
  });

  const handleImageChange = (e, field) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setFormData((prev) => ({ ...prev, [field]: reader.result }));
    };
    reader.readAsDataURL(file);
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleAddOption = () => {
    if (newOption.name.trim()) {
      setFormData((prev) => ({
        ...prev,
        options: [...prev.options, newOption],
      }));
      setNewOption({ type: "SIZE", name: "", price: 0 });
    }
  };

  const handleRemoveOption = (index) => {
    setFormData((prev) => ({
      ...prev,
      options: prev.options.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
          Tạo món ăn mới
        </h1>
        <p className="mt-2 text-muted-foreground">
          Điền thông tin chi tiết về món ăn của bạn bên dưới.
        </p>
      </div>

      {/* Thông tin cơ bản */}
      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-center gap-2">
            <UtensilsCrossed className="h-5 w-5 text-muted-foreground" />
            <CardTitle>Thông tin cơ bản</CardTitle>
          </div>
          <CardDescription>Nhập tên, mô tả và danh mục của món ăn</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Tên món *</Label>
            <Input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="Nhập tên món"
              required
            />
          </div>
          <div>
            <Label>Mô tả</Label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Nhập mô tả món ăn"
              className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
              rows={4}
            />
          </div>
          <div>
            <Label>Category ID *</Label>
            <Input
              type="text"
              name="category_id"
              value={formData.category_id}
              onChange={handleInputChange}
              placeholder="Nhập ID danh mục"
              required
            />
          </div>
        </CardContent>
      </Card>

      {/* Hình ảnh */}
      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-center gap-2">
            <ImageIcon className="h-5 w-5 text-muted-foreground" />
            <CardTitle>Hình ảnh món ăn</CardTitle>
          </div>
          <CardDescription>Tải lên hình ảnh minh họa cho món ăn</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">

          <div className="space-y-2">
            <Label>Ảnh minh họa</Label>
            <Input
              type="file"
              accept="image/*"
              onChange={(e) => handleImageChange(e, "image_cover")}
            />
            {formData.image_cover && (
              <img
                src={formData.image_cover}
                alt="Cover Preview"
                className="h-32 w-full mt-2 rounded-md border object-cover"
              />
            )}
          </div>
        </CardContent>
      </Card>

      {/* Giá */}
      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-center gap-2">
            <CircleDollarSign className="h-5 w-5 text-muted-foreground" />
            <CardTitle>Giá món ăn</CardTitle>
          </div>
          <CardDescription>Thiết lập giá bán và mức giảm giá (nếu có)</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Giá (VND) *</Label>
              <Input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleInputChange}
                placeholder="0"
                min="10000"
                step="10000"     // 👈 thêm dòng này
                required
              />
            </div>
            <div>
              <Label>Giảm giá (%)</Label>
              <Input
                type="number"
                name="discount"
                value={formData.discount}
                onChange={handleInputChange}
                placeholder="0"
                min="0"
                max="100"
              />
            </div>
          </div>
        </CardContent>
      </Card>



      {/* Tuỳ chọn */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Tuỳ chọn món ăn</CardTitle>
          <CardDescription>
            Thêm các tuỳ chọn như Size, Topping, Extra, hoặc Spicy
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-6 p-4 border border-border rounded-lg bg-card shadow-sm space-y-3">
            <div className="grid grid-cols-3 gap-3">
              <div>
                <Label>Loại</Label>
                <select
                  value={newOption.type}
                  onChange={(e) =>
                    setNewOption((prev) => ({ ...prev, type: e.target.value }))
                  }
                  className="w-full border border-input rounded-md px-3 py-2 text-sm bg-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  <option value="SIZE">Size</option>
                  <option value="TOPPING">Topping</option>
                  <option value="EXTRA">Extra</option>
                  <option value="SPICY">Spicy</option>
                </select>
              </div>
              <div>
                <Label>Tên</Label>
                <Input
                  type="text"
                  value={newOption.name}
                  onChange={(e) =>
                    setNewOption((prev) => ({ ...prev, name: e.target.value }))
                  }
                  placeholder="e.g., Large, Cheese"
                />
              </div>
              <div>
                <Label>Giá (VND)</Label>
                <Input
                  type="number"
                  value={newOption.price}
                  onChange={(e) =>
                    setNewOption((prev) => ({
                      ...prev,
                      price: Number(e.target.value),
                    }))
                  }
                  placeholder="0"
                  min="0"
                  step="10000"
                />
              </div>
            </div>
            <Button
              type="button"
              onClick={handleAddOption}
              variant="outline"
              className="w-full bg-transparent"
            >
              <Plus className="w-4 h-4 mr-2" />
              Thêm tuỳ chọn
            </Button>
          </div>

          {formData.options.length > 0 && (
            <div className="space-y-3">
  {formData.options.map((option, index) => (
    <div
      key={index}
      className="flex items-center justify-between p-4 border border-border rounded-xl bg-card shadow-sm hover:shadow-md transition-shadow"
    >
      <div className="flex flex-col">
        <span className="font-semibold text-foreground">{option.name}</span>
        <span className="text-sm text-muted-foreground">
          {option.type} •{" "}
          <span className="text-primary font-medium">
            {option.price.toLocaleString()} VND
          </span>
        </span>
      </div>

      <button
        type="button"
        onClick={() => handleRemoveOption(index)}
        className="p-2 hover:bg-destructive/10 rounded-lg transition-colors"
      >
        <X className="w-4 h-4 text-destructive" />
      </button>
    </div>
  ))}
</div>

          )}
        </CardContent>
      </Card>

      {/* Nút hành động */}
      <div className="flex gap-3">
        <Button type="submit" disabled={isLoading} className="flex-1">
          {isLoading ? "Đang tạo..." : "Tạo món ăn"}
        </Button>
        <Button type="button" variant="outline" className="flex-1 bg-transparent">
          Huỷ
        </Button>
      </div>
    </form>
  );
}
