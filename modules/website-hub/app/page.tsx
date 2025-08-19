"use client"

import { useAuth } from "@/contexts/auth-context"
import { CustomizableDashboard } from "@/components/dashboard/customizable-dashboard"
import { LoginPage } from "@/components/auth/login-page"

export default function HomePage() {
  const { user, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!user) {
    return <LoginPage />
  }

  return <CustomizableDashboard />
}
