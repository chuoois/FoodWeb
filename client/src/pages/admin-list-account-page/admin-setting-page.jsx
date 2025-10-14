import { useState } from "react"
import { Save, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import toast from "react-hot-toast"

// Dữ liệu settings mẫu (giả lập)
const defaultSettings = {
  general: {
    siteName: "Web Shop Đồ Ăn",
    siteDescription: "Nền tảng quản lý cửa hàng bán đồ ăn trực tuyến",
    siteUrl: "https://example.com",
    enableMaintenanceMode: false,
  },
  email: {
    smtpHost: "smtp.gmail.com",
    smtpPort: "587",
    smtpUser: "admin@example.com",
    smtpPassword: "password123",
    fromEmail: "noreply@example.com",
    enableEmailNotifications: true,
  },
  security: {
    maxLoginAttempts: 5,
    lockoutDuration: 15, // minutes
    enableTwoFactor: true,
    sessionTimeout: 30, // minutes
  },
  notifications: {
    enablePushNotifications: true,
    enableSmsNotifications: false,
    smsProvider: "twilio",
    twilioAccountSid: "your_sid",
    twilioAuthToken: "your_token",
  },
}

export const AdminSettings = () => {
  const [settings, setSettings] = useState(defaultSettings)
  const [isSaving, setIsSaving] = useState(false)
  const [activeTab, setActiveTab] = useState("general")

  const handleInputChange = (section, key, value) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [key]: value
      }
    }))
  }

  const handleSwitchChange = (section, key, checked) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [key]: checked
      }
    }))
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      // Giả lập API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      toast.success("Đã cập nhật cài đặt thành công!")
    } catch (error) {
      toast.error("Không thể cập nhật cài đặt. Vui lòng thử lại.")
    } finally {
      setIsSaving(false)
    }
  }

  const renderGeneralTab = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="siteName">Tên trang web</Label>
          <Input
            id="siteName"
            value={settings.general.siteName}
            onChange={(e) => handleInputChange("general", "siteName", e.target.value)}
            placeholder="Nhập tên trang web"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="siteUrl">URL trang web</Label>
          <Input
            id="siteUrl"
            value={settings.general.siteUrl}
            onChange={(e) => handleInputChange("general", "siteUrl", e.target.value)}
            placeholder="https://example.com"
          />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="siteDescription">Mô tả trang web</Label>
        <Textarea
          id="siteDescription"
          value={settings.general.siteDescription}
          onChange={(e) => handleInputChange("general", "siteDescription", e.target.value)}
          placeholder="Nhập mô tả trang web"
          rows={3}
        />
      </div>
      <div className="flex items-center space-x-2">
        <Switch
          id="maintenanceMode"
          checked={settings.general.enableMaintenanceMode}
          onCheckedChange={(checked) => handleSwitchChange("general", "enableMaintenanceMode", checked)}
        />
        <Label htmlFor="maintenanceMode" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
          Bật chế độ bảo trì
        </Label>
      </div>
    </div>
  )

  const renderEmailTab = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="smtpHost">SMTP Host</Label>
          <Input
            id="smtpHost"
            value={settings.email.smtpHost}
            onChange={(e) => handleInputChange("email", "smtpHost", e.target.value)}
            placeholder="smtp.gmail.com"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="smtpPort">SMTP Port</Label>
          <Input
            id="smtpPort"
            value={settings.email.smtpPort}
            onChange={(e) => handleInputChange("email", "smtpPort", e.target.value)}
            placeholder="587"
            type="number"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="smtpUser">SMTP User</Label>
          <Input
            id="smtpUser"
            value={settings.email.smtpUser}
            onChange={(e) => handleInputChange("email", "smtpUser", e.target.value)}
            placeholder="admin@example.com"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="fromEmail">Email gửi từ</Label>
          <Input
            id="fromEmail"
            value={settings.email.fromEmail}
            onChange={(e) => handleInputChange("email", "fromEmail", e.target.value)}
            placeholder="noreply@example.com"
          />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="smtpPassword">SMTP Password</Label>
        <Input
          id="smtpPassword"
          value={settings.email.smtpPassword}
          onChange={(e) => handleInputChange("email", "smtpPassword", e.target.value)}
          placeholder="password123"
          type="password"
        />
      </div>
      <div className="flex items-center space-x-2">
        <Switch
          id="emailNotifications"
          checked={settings.email.enableEmailNotifications}
          onCheckedChange={(checked) => handleSwitchChange("email", "enableEmailNotifications", checked)}
        />
        <Label htmlFor="emailNotifications" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
          Bật thông báo email
        </Label>
      </div>
    </div>
  )

  const renderSecurityTab = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="maxLoginAttempts">Số lần thử đăng nhập tối đa</Label>
          <Input
            id="maxLoginAttempts"
            value={settings.security.maxLoginAttempts}
            onChange={(e) => handleInputChange("security", "maxLoginAttempts", parseInt(e.target.value))}
            placeholder="5"
            type="number"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="lockoutDuration">Thời gian khóa tài khoản (phút)</Label>
          <Input
            id="lockoutDuration"
            value={settings.security.lockoutDuration}
            onChange={(e) => handleInputChange("security", "lockoutDuration", parseInt(e.target.value))}
            placeholder="15"
            type="number"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="sessionTimeout">Thời gian hết hạn phiên (phút)</Label>
          <Input
            id="sessionTimeout"
            value={settings.security.sessionTimeout}
            onChange={(e) => handleInputChange("security", "sessionTimeout", parseInt(e.target.value))}
            placeholder="30"
            type="number"
          />
        </div>
      </div>
      <div className="flex items-center space-x-2">
        <Switch
          id="twoFactor"
          checked={settings.security.enableTwoFactor}
          onCheckedChange={(checked) => handleSwitchChange("security", "enableTwoFactor", checked)}
        />
        <Label htmlFor="twoFactor" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
          Bật xác thực hai yếu tố
        </Label>
      </div>
    </div>
  )

  const renderNotificationsTab = () => (
    <div className="space-y-6">
      <div className="flex items-center space-x-2">
        <Switch
          id="pushNotifications"
          checked={settings.notifications.enablePushNotifications}
          onCheckedChange={(checked) => handleSwitchChange("notifications", "enablePushNotifications", checked)}
        />
        <Label htmlFor="pushNotifications" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
          Bật thông báo đẩy
        </Label>
      </div>
      <div className="flex items-center space-x-2">
        <Switch
          id="smsNotifications"
          checked={settings.notifications.enableSmsNotifications}
          onCheckedChange={(checked) => handleSwitchChange("notifications", "enableSmsNotifications", checked)}
        />
        <Label htmlFor="smsNotifications" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
          Bật thông báo SMS
        </Label>
      </div>
      {settings.notifications.enableSmsNotifications && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
          <div className="space-y-2">
            <Label htmlFor="smsProvider">Nhà cung cấp SMS</Label>
            <Input
              id="smsProvider"
              value={settings.notifications.smsProvider}
              onChange={(e) => handleInputChange("notifications", "smsProvider", e.target.value)}
              placeholder="twilio"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="twilioAccountSid">Twilio Account SID</Label>
            <Input
              id="twilioAccountSid"
              value={settings.notifications.twilioAccountSid}
              onChange={(e) => handleInputChange("notifications", "twilioAccountSid", e.target.value)}
              placeholder="your_sid"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="twilioAuthToken">Twilio Auth Token</Label>
            <Input
              id="twilioAuthToken"
              value={settings.notifications.twilioAuthToken}
              onChange={(e) => handleInputChange("notifications", "twilioAuthToken", e.target.value)}
              placeholder="your_token"
              type="password"
            />
          </div>
        </div>
      )}
    </div>
  )

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="mx-auto max-w-4xl">

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="general">Chung</TabsTrigger>
            <TabsTrigger value="email">Email</TabsTrigger>
            <TabsTrigger value="security">Bảo mật</TabsTrigger>
            <TabsTrigger value="notifications">Thông báo</TabsTrigger>
          </TabsList>
          <TabsContent value="general" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Cài đặt chung</CardTitle>
                <CardDescription>Cấu hình cơ bản cho trang web</CardDescription>
              </CardHeader>
              <CardContent>
                {renderGeneralTab()}
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="email" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Cài đặt email</CardTitle>
                <CardDescription>Cấu hình gửi email</CardDescription>
              </CardHeader>
              <CardContent>
                {renderEmailTab()}
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="security" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Cài đặt bảo mật</CardTitle>
                <CardDescription>Cấu hình bảo mật hệ thống</CardDescription>
              </CardHeader>
              <CardContent>
                {renderSecurityTab()}
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="notifications" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Cài đặt thông báo</CardTitle>
                <CardDescription>Cấu hình các loại thông báo</CardDescription>
              </CardHeader>
              <CardContent>
                {renderNotificationsTab()}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end mt-6">
          <Button
            onClick={handleSave}
            disabled={isSaving}
            className="gap-2"
          >
            {isSaving && <Loader2 className="h-4 w-4 animate-spin" />}
            <Save className="h-4 w-4" />
            Lưu cài đặt
          </Button>
        </div>
      </div>
    </div>
  )
}