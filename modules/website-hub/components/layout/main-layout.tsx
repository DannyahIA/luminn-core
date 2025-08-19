"use client"

import { useAuth } from "@/contexts/auth-context"
import { useLayout } from "@/contexts/layout-context"
import { Sidebar } from "@/components/layout/sidebar"
import { Header } from "@/components/layout/header"
import type { ReactNode } from "react"

interface MainLayoutProps {
  children: ReactNode
}

export function MainLayout({ children }: MainLayoutProps) {
  const { user } = useAuth()
  const { sidebarOpen, setSidebarOpen, currentPage, pageTitle, pageSubtitle } = useLayout()

  // Se não estiver logado, não renderiza o layout com sidebar
  if (!user) {
    return <>{children}</>
  }

  return (
    <div className="min-h-screen bg-background">
      <div>
        <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} currentPage={currentPage} />
      </div>
      <div className="lg:ml-64">
        <Header
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
          title={pageTitle}
          subtitle={pageSubtitle}
        />
        
        <main className="p-4 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
