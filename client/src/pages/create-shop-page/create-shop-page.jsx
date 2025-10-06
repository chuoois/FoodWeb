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
                        <CardTitle>Basic Information</CardTitle>
                    </div>
                    <CardDescription>Provide the essential details about your shop</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="name">Shop Name *</Label>
                        <Input
                            id="name"
                            placeholder="Enter your shop name"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            required
                            className="bg-background"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                            id="description"
                            placeholder="Describe your shop and what makes it special"
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            rows={4}
                            className="bg-background resize-none"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="phone">Phone Number *</Label>
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
                        <CardTitle>Location</CardTitle>
                    </div>
                    <CardDescription>Where is your shop located?</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="street">Street Address *</Label>
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
                            <Label htmlFor="ward">Ward *</Label>
                            <Input
                                id="ward"
                                placeholder="Ward 1"
                                value={formData.address.ward}
                                onChange={(e) => updateAddress("ward", e.target.value)}
                                required
                                className="bg-background"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="district">District *</Label>
                            <Input
                                id="district"
                                placeholder="District 1"
                                value={formData.address.district}
                                onChange={(e) => updateAddress("district", e.target.value)}
                                required
                                className="bg-background"
                            />
                        </div>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                            <Label htmlFor="city">City *</Label>
                            <Input
                                id="city"
                                placeholder="Ho Chi Minh City"
                                value={formData.address.city}
                                onChange={(e) => updateAddress("city", e.target.value)}
                                required
                                className="bg-background"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="province">Province *</Label>
                            <Input
                                id="province"
                                placeholder="Ho Chi Minh"
                                value={formData.address.province}
                                onChange={(e) => updateAddress("province", e.target.value)}
                                required
                                className="bg-background"
                            />
                        </div>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
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
                    </div>
                </CardContent>
            </Card>

            {/* Branding */}
            <Card className="border-border bg-card">
                <CardHeader>
                    <div className="flex items-center gap-2">
                        <ImageIcon className="h-5 w-5 text-muted-foreground" />
                        <CardTitle>Branding</CardTitle>
                    </div>
                    <CardDescription>Upload your shop logo and cover image</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="logoUrl">Logo URL</Label>
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
                            Recommended: Square image, at least 200x200px
                        </p>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="coverUrl">Cover Image URL</Label>
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
                        <p className="text-xs text-muted-foreground">Recommended: 1200x400px or wider</p>
                    </div>
                </CardContent>
            </Card>

            {/* Bank Account */}
            <Card className="border-border bg-card">
                <CardHeader>
                    <div className="flex items-center gap-2">
                        <CreditCard className="h-5 w-5 text-muted-foreground" />
                        <CardTitle>Bank Account</CardTitle>
                    </div>
                    <CardDescription>Add your bank account for receiving payments</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="bankName">Bank Name *</Label>
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
                        <Label htmlFor="accountNumber">Account Number *</Label>
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
                        <Label htmlFor="accountHolder">Account Holder Name *</Label>
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
                    <p className="text-sm font-medium text-foreground">Ready to submit?</p>
                    <p className="text-sm text-muted-foreground">
                        Your shop will be reviewed and approved by our team
                    </p>
                </div>
                <Button type="submit" size="lg" disabled={isSubmitting}>
                    {isSubmitting ? "Submitting..." : "Submit Application"}
                </Button>
            </div>
        </form>
    )
}
