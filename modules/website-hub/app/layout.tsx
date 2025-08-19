import type React from "react"
import type { Metadata } from "next"
import { Montserrat, Open_Sans } from "next/font/google"
import { AuthProvider } from "@/contexts/auth-context"
import { LayoutProvider } from "@/contexts/layout-context"
import { MainLayout } from "@/components/layout/main-layout"
import "./globals.css"

const montserrat = Montserrat({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-montserrat",
  weight: ["400", "600", "700", "900"],
})

const openSans = Open_Sans({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-open-sans",
  weight: ["400", "500", "600"],
})

export const metadata: Metadata = {
  title: "Hub de Automação Pessoal",
  description: "Sistema completo de automação financeira e residencial",
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="pt-BR" className={`${montserrat.variable} ${openSans.variable} antialiased`}>
      <body className="font-sans">
        <AuthProvider>
          <LayoutProvider>
            <MainLayout>
              {children}
            </MainLayout>
          </LayoutProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
