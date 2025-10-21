import { useState, useContext } from "react"
import { useLocation, useNavigate } from "react-router-dom"
import { AuthContext } from "@/context/AuthContext"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
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
  Home
} from "lucide-react"

export function SidebarStoreDirectorLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { logout, user } = useContext(AuthContext)
  const navigate = useNavigate()
  const location = useLocation()

  const navigation = [
    { name: "Trang chủ", href: "/store-director/manage/home", icon: Home },
    { name: "Dashboard", href: "/store-director/manage/dashboard", icon: LayoutDashboard },
    { name: "Tạo quản lý", href: "/store-director/manage/create-staff", icon: UserPlus },
    { name: "Quản lý tài khoản", href: "/store-director/manage/account-staff", icon: UserCircle },
    { name: "Tạo cửa hàng", href: "/store-director/manage/create-shop", icon: Store },
    { name: "Đơn xét duyệt", href: "/store-director/manage/approval", icon: CheckSquare },
    { name: "Doanh thu", href: "/store-director/manage/revenue", icon: BarChart3 },
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
        className={`fixed inset-y-0 left-0 z-50 w-64 transform border-r border-border bg-card transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"
          }`}
      >
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="flex h-16 items-center justify-between border-b border-border px-6">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                <Store className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="text-lg font-semibold text-foreground">YummyGo</span>
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
                  className={`group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${isActive
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-accent hover:text-foreground"
                    }`}
                >
                  <Icon className="h-5 w-5 shrink-0" />
                  <span>{item.name}</span>
                  {isActive && <ChevronRight className="ml-auto h-4 w-4" />}
                </a>
              )
            })}
          </nav>

          {/* User info dropdown */}
          <div className="border-t border-border p-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex w-full items-center gap-3 rounded-lg bg-accent/50 p-3 transition-colors hover:bg-accent focus:outline-none focus:ring-2 focus:ring-ring">
                  <Avatar className="h-9 w-9">
                    <AvatarImage src="/placeholder.svg?height=36&width=36" />
                    <AvatarFallback>
                      {user?.roleName?.slice(0, 2)?.toUpperCase() || "SD"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 overflow-hidden text-left">
                    <p className="truncate text-sm font-medium text-foreground">
                      {user?.roleName || "Store Director"}
                    </p>
                  </div>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>Tài khoản của tôi</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleProfile} className="cursor-pointer">
                  <UserCircle className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleSupport} className="cursor-pointer">
                  <HelpCircle className="mr-2 h-4 w-4" />
                  <span>Hỗ trợ</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={handleLogout}
                  className="cursor-pointer text-destructive focus:text-destructive"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Đăng xuất</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
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
