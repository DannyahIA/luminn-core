"use client"

import { Button } from "@/components/ui/button"
import { Menu, Bell, Cloud } from "lucide-react"

interface HeaderProps {
  sidebarOpen: boolean
  setSidebarOpen: (open: boolean) => void
  title: string
  subtitle?: string
}

export function Header({ sidebarOpen, setSidebarOpen, title, subtitle }: HeaderProps) {
  return (
    <header className="bg-background border-b border-border p-3 lg:p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" className="lg:hidden" onClick={() => setSidebarOpen(true)}>
            <Menu className="h-4 w-4" />
          </Button>
          <div>
            <h2 className="text-2xl font-black font-montserrat text-foreground">{title}</h2>
            {subtitle && <p className="text-muted-foreground">{subtitle}</p>}
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-sm">
            <Cloud className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium">22°C</span>
            <span className="text-muted-foreground">Ensolarado</span>
          </div>
          <Button variant="outline" size="sm">
            <Bell className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </header>
  )
}
