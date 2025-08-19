"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/contexts/auth-context"
import {
  LayoutDashboard,
  CreditCard,
  Building2,
  Calendar,
  Home,
  User,
  Settings,
  X,
  LogOut,
  Receipt,
} from "lucide-react"

interface SidebarProps {
  sidebarOpen: boolean
  setSidebarOpen: (open: boolean) => void
  currentPage?: string
}

export function Sidebar({ sidebarOpen, setSidebarOpen, currentPage }: SidebarProps) {
  const { user, logout } = useAuth()
  const pathname = usePathname()

  const navigationItems = [
    { icon: LayoutDashboard, label: "Dashboard", href: "/", key: "dashboard" },
    { icon: Receipt, label: "Transações", href: "/transacoes", key: "transacoes" },
    { icon: CreditCard, label: "Finanças", href: "/financas", key: "financas" },
    { icon: Building2, label: "Bancos", href: "/bancos", key: "bancos" },
    { icon: Calendar, label: "Calendário", href: "/calendario", key: "calendario" },
    { icon: Home, label: "Automação", href: "/automacao", key: "automacao" },
    { icon: User, label: "Perfil", href: "/perfil", key: "perfil" },
    { icon: Settings, label: "Configurações", href: "/configuracoes", key: "configuracoes" },
  ]

  const isActive = (href: string) => {
    if (href === "/") {
      return pathname === "/"
    }
    return pathname.startsWith(href)
  }

  return (
    <aside
      className={`
        fixed top-0 left-0 z-50 h-full w-64 bg-sidebar border-r border-sidebar-border transform transition-transform duration-300 ease-in-out
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
        lg:translate-x-0 lg:static lg:z-auto
      `}
    >
      <div className="flex flex-col h-full">
        <div className="flex items-center justify-between p-6 border-b border-sidebar-border">
          <h1 className="text-xl font-black font-montserrat text-sidebar-foreground">AutoHub</h1>
          <Button variant="ghost" size="sm" className="lg:hidden" onClick={() => setSidebarOpen(false)}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {navigationItems.map((item) => (
            <Link key={item.key} href={item.href}>
              <Button
                variant={isActive(item.href) ? "default" : "ghost"}
                className="w-full justify-start gap-3 font-medium"
                onClick={() => setSidebarOpen(false)}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Button>
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-sidebar-border">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
              <User className="h-4 w-4 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-sidebar-foreground truncate">{user?.name}</p>
              <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
            </div>
          </div>
          <Button variant="ghost" size="sm" className="w-full justify-start gap-2" onClick={logout}>
            <LogOut className="h-4 w-4" />
            Sair
          </Button>
        </div>
      </div>
    </aside>
  )
}
