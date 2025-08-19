"use client"

import { useAuth } from "@/contexts/auth-context"
import { BanksPage } from "@/components/banks/banks-page"
import { LoginPage } from "@/components/auth/login-page"

export default function BancosPage() {
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

  return <BanksPage />
}
