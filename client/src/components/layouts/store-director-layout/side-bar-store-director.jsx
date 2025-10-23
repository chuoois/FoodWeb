import { useState, useContext } from "react"
import { useLocation, useNavigate } from "react-router-dom"
import { AuthContext } from "@/context/AuthContext"
import { Button } from "@/components/ui/button"
import {
  LayoutDashboard,
  Store,
  Menu,
  X,
  ChevronRight,
  LogOut,
  HelpCircle,
  UserCircle,
  CheckSquare,
  UserPlus,
  BarChart3,
  Home,
  Settings,
  UsersRound,
  Building2,
  UtensilsCrossed
} from "lucide-react"

export function SidebarStoreDirectorLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { logout } = useContext(AuthContext)
  const navigate = useNavigate()
  const location = useLocation()

  const navigation = [
    { name: "Trang chủ", href: "/store-director/manage/home", icon: Home },
    { name: "Dashboard", href: "/store-director/manage/dashboard", icon: LayoutDashboard },
    { name: "Doanh thu", href: "/store-director/manage/revenue", icon: BarChart3 },
    { name: "Tạo quản lý", href: "/store-director/manage/create-staff", icon: UserPlus },
    { name: "Quản lý tài khoản", href: "/store-director/manage/account-staff", icon: UsersRound },
    { name: "Tạo cửa hàng", href: "/store-director/manage/create-shop", icon: Store },
    { name: "Quản lý cửa hàng", href: "/store-director/manage/approval", icon: Building2 },
  ]

  const handleLogout = () => {
    logout()
    navigate("/store-director/login")
  }

  const handleProfile = () => navigate("/profile")
  const handleSupport = () => navigate("/support")

  return (
    <div className="flex h-screen bg-background">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-72 transform border-r border-border bg-card transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"
          }`}
      >
        <div className="flex h-full flex-col">
          {/* Logo & Brand */}
          <div className="flex h-16 items-center justify-between border-b border-border px-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
                <Store className="h-5 w-5 text-primary-foreground" />
              </div>
              <div>
                <span className="text-lg font-semibold text-foreground">YummyGo</span>
                <p className="text-xs text-muted-foreground">Store Director</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
            {navigation.map((item) => {
              const Icon = item.icon
              const isActive = location.pathname === item.href
              return (
                <a
                  key={item.name}
                  href={item.href}
                  className={`group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${isActive
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-accent hover:text-foreground"
                    }`}
                >
                  <Icon className="h-5 w-5 shrink-0" />
                  <span className="flex-1">{item.name}</span>
                  {isActive && <ChevronRight className="h-4 w-4" />}
                </a>
              )
            })}
          </nav>

          {/* Bottom Actions */}
          <div className="border-t border-border p-3 space-y-1">
            <Button
              variant="ghost"
              className="w-full justify-start gap-3 text-muted-foreground hover:bg-accent hover:text-foreground"
              onClick={handleProfile}
            >
              <Settings className="h-5 w-5" />
              <span className="text-sm font-medium">Cài đặt</span>
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start gap-3 text-muted-foreground hover:bg-accent hover:text-foreground"
              onClick={handleSupport}
            >
              <HelpCircle className="h-5 w-5" />
              <span className="text-sm font-medium">Hỗ trợ</span>
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start gap-3 text-destructive hover:bg-destructive/10 hover:text-destructive"
              onClick={handleLogout}
            >
              <LogOut className="h-5 w-5" />
              <span className="text-sm font-medium">Đăng xuất</span>
            </Button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <Button
          variant="ghost"
          size="icon"
          className="fixed left-4 top-4 z-30 lg:hidden"
          onClick={() => setSidebarOpen(true)}
        >
          <Menu className="h-5 w-5" />
        </Button>

        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  )
}