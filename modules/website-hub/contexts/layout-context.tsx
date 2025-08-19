"use client"

import React, { createContext, useContext, useState, type ReactNode } from "react"

interface LayoutContextType {
  sidebarOpen: boolean
  setSidebarOpen: (open: boolean) => void
  currentPage: string
  setCurrentPage: (page: string) => void
  pageTitle: string
  setPageTitle: (title: string) => void
  pageSubtitle: string
  setPageSubtitle: (subtitle: string) => void
}

const LayoutContext = createContext<LayoutContextType | undefined>(undefined)

export function LayoutProvider({ children }: { children: ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [currentPage, setCurrentPage] = useState("dashboard")
  const [pageTitle, setPageTitle] = useState("Dashboard")
  const [pageSubtitle, setPageSubtitle] = useState("Visão geral do seu sistema")

  return (
    <LayoutContext.Provider
      value={{
        sidebarOpen,
        setSidebarOpen,
        currentPage,
        setCurrentPage,
        pageTitle,
        setPageTitle,
        pageSubtitle,
        setPageSubtitle,
      }}
    >
      {children}
    </LayoutContext.Provider>
  )
}

export function useLayout() {
  const context = useContext(LayoutContext)
  if (context === undefined) {
    throw new Error("useLayout must be used within a LayoutProvider")
  }
  return context
}
