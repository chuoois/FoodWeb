import { useState } from 'react';
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Upload, Store, MapPin, CreditCard, ImageIcon } from "lucide-react"

export function CreateShopPage() {
    const [formData, setFormData] = useState({
        name: "",
        description: "",
        phone: "",
        address: {
            street: "",
            ward: "",
            district: "",
            city: "",
            province: "",
        },
        gps: {
            latitude: "",
            longitude: "",
        },
        logoUrl: "",
        coverUrl: "",
        bankAccount: {
            bankName: "",
            accountNumber: "",
            accountHolder: "",
        },
    })

    const [isSubmitting, setIsSubmitting] = useState(false)

    const handleSubmit = async (e) => {
        e.preventDefault()
        setIsSubmitting(true)

        // TODO: Implement API call to create shop
        console.log("[v0] Shop registration data:", formData)

        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 2000))

        setIsSubmitting(false)
        alert("Shop registration submitted successfully! Your application is pending approval.")
    }

    const updateAddress = (field, value) => {
        setFormData((prev) => ({
            ...prev,
            address: { ...prev.address, [field]: value },
        }))
    }

    const updateGPS = (field, value) => {
        setFormData((prev) => ({
            ...prev,
            gps: { ...prev.gps, [field]: value },
        }))
    }

    const updateBankAccount = (field, value) => {
        setFormData((prev) => ({
            ...prev,
            bankAccount: { ...prev.bankAccount, [field]: value },
        }))
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
                    Tạo cửa hàng của bạn
                </h1>
                <p className="mt-2 text-muted-foreground">
                    Vui lòng điền vào mẫu dưới đây để đăng ký cửa hàng của bạn trên nền tảng của chúng tôi. Đơn đăng ký của bạn sẽ được đội ngũ của chúng tôi xem xét.
                </p>
            </div>
            {/* Basic Information */}
            <Card className="border-border bg-card">
                <CardHeader>
                    <div className="flex items-center gap-2">
                        <Store className="h-5 w-5 text-muted-foreground" />
                        <CardTitle>Thông tin cơ bản</CardTitle>
                    </div>
                    <CardDescription>Cung cấp các thông tin chi tiết cần thiết về cửa hàng của bạn</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="name">Tên cửa hàng *</Label>
                        <Input
                            id="name"
                            placeholder="Nhập tên cửa hàng của bạn"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            required
                            className="bg-background"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="description">Mô tả ngắn</Label>
                        <Textarea
                            id="description"
                            placeholder="Mô tả cửa hàng của bạn và điều gì làm cho nó đặc biệt"
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            rows={4}
                            className="bg-background resize-none"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="phone">Số điện thoại *</Label>
                        <Input
                            id="phone"
                            type="tel"
                            placeholder="+84 123 456 789"
                            value={formData.phone}
                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                            required
                            className="bg-background"
                        />
                    </div>
                </CardContent>
            </Card>

            {/* Location Information */}
            <Card className="border-border bg-card">
                <CardHeader>
                    <div className="flex items-center gap-2">
                        <MapPin className="h-5 w-5 text-muted-foreground" />
                        <CardTitle>Vị trí</CardTitle>
                    </div>
                    <CardDescription>Cửa hàng của bạn ở đâu?</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="street">Địa chỉ cụ thể *</Label>
                        <Input
                            id="street"
                            placeholder="123 Main Street"
                            value={formData.address.street}
                            onChange={(e) => updateAddress("street", e.target.value)}
                            required
                            className="bg-background"
                        />
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                            <Label htmlFor="ward">Phường/Xã *</Label>
                            <Input
                                id="ward"
                                placeholder="Xã Hòa Lạc"
                                value={formData.address.ward}
                                onChange={(e) => updateAddress("ward", e.target.value)}
                                required
                                className="bg-background"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="district">Quận/Huyện *</Label>
                            <Input
                                id="district"
                                placeholder="Huyện Thạch Thất"
                                value={formData.address.district}
                                onChange={(e) => updateAddress("district", e.target.value)}
                                required
                                className="bg-background"
                            />
                        </div>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                            <Label htmlFor="city">Thành phố *</Label>
                            <Input
                                id="city"
                                placeholder="Hà Nội"
                                value={formData.address.city}
                                onChange={(e) => updateAddress("city", e.target.value)}
                                required
                                className="bg-background"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="province">Tỉnh/Thành phố *</Label>
                            <Input
                                id="province"
                                placeholder="Hà Nội"
                                value={formData.address.province}
                                onChange={(e) => updateAddress("province", e.target.value)}
                                required
                                className="bg-background"
                            />
                        </div>
                    </div>

                    {/* <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                            <Label htmlFor="latitude">Latitude (GPS)</Label>
                            <Input
                                id="latitude"
                                type="number"
                                step="any"
                                placeholder="10.762622"
                                value={formData.gps.latitude}
                                onChange={(e) => updateGPS("latitude", e.target.value)}
                                className="bg-background"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="longitude">Longitude (GPS)</Label>
                            <Input
                                id="longitude"
                                type="number"
                                step="any"
                                placeholder="106.660172"
                                value={formData.gps.longitude}
                                onChange={(e) => updateGPS("longitude", e.target.value)}
                                className="bg-background"
                            />
                        </div>
                    </div> */}
                </CardContent>
            </Card>

            {/* Branding */}
            <Card className="border-border bg-card">
                <CardHeader>
                    <div className="flex items-center gap-2">
                        <ImageIcon className="h-5 w-5 text-muted-foreground" />
                        <CardTitle>Thương hiệu</CardTitle>
                    </div>
                    <CardDescription>Tải lên logo và ảnh bìa của cửa hàng bạn</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="logoUrl">Đường dẫn logo (Logo URL)</Label>
                        <div className="flex gap-2">
                            <Input
                                id="logoUrl"
                                type="url"
                                placeholder="https://example.com/logo.png"
                                value={formData.logoUrl}
                                onChange={(e) => setFormData({ ...formData, logoUrl: e.target.value })}
                                className="bg-background"
                            />
                            <Button type="button" variant="outline" size="icon">
                                <Upload className="h-4 w-4" />
                            </Button>
                        </div>
                        <p className="text-xs text-muted-foreground">
                           Khuyến nghị ảnh vuông ≥ 200×200px
                        </p>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="coverUrl">Đường dẫn ảnh bìa (Cover Image URL)</Label>
                        <div className="flex gap-2">
                            <Input
                                id="coverUrl"
                                type="url"
                                placeholder="https://example.com/cover.png"
                                value={formData.coverUrl}
                                onChange={(e) => setFormData({ ...formData, coverUrl: e.target.value })}
                                className="bg-background"
                            />
                            <Button type="button" variant="outline" size="icon">
                                <Upload className="h-4 w-4" />
                            </Button>
                        </div>
                        <p className="text-xs text-muted-foreground">Khuyến nghị kích thước ≥ 1200×400px</p>
                    </div>
                </CardContent>
            </Card>

            {/* Bank Account */}
            <Card className="border-border bg-card">
                <CardHeader>
                    <div className="flex items-center gap-2">
                        <CreditCard className="h-5 w-5 text-muted-foreground" />
                        <CardTitle>Tài khoản ngân hàng</CardTitle>
                    </div>
                    <CardDescription>Thêm thông tin tài khoản ngân hàng để nhận thanh toán</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="bankName">Tên ngân hàng *</Label>
                        <Input
                            id="bankName"
                            placeholder="Vietcombank"
                            value={formData.bankAccount.bankName}
                            onChange={(e) => updateBankAccount("bankName", e.target.value)}
                            required
                            className="bg-background"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="accountNumber">Số tài khoản *</Label>
                        <Input
                            id="accountNumber"
                            placeholder="1234567890"
                            value={formData.bankAccount.accountNumber}
                            onChange={(e) => updateBankAccount("accountNumber", e.target.value)}
                            required
                            className="bg-background"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="accountHolder">Chủ tài khoản *</Label>
                        <Input
                            id="accountHolder"
                            placeholder="NGUYEN VAN A"
                            value={formData.bankAccount.accountHolder}
                            onChange={(e) => updateBankAccount("accountHolder", e.target.value)}
                            required
                            className="bg-background"
                        />
                    </div>
                </CardContent>
            </Card>

            {/* Submit Button */}
            <div className="flex items-center justify-between rounded-lg border border-border bg-card p-6">
                <div>
                    <p className="text-sm font-medium text-foreground">Bạn đã sẵn sàng gửi đăng ký cửa hàng chưa?</p>
                    <p className="text-sm text-muted-foreground">
                     Chúng tôi sẽ xem xét và phê duyệt cửa hàng của bạn trong thời gian sớm nhất.
                    </p>
                </div>
                <Button type="submit" size="lg" disabled={isSubmitting}>
                    {isSubmitting ? "Đang gửi..." : "Gửi đăng ký"}
                </Button>
            </div>
        </form>
    )
}
