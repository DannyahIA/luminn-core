import { useEffect } from "react"
import { useLayout } from "@/contexts/layout-context"

interface UsePageConfigParams {
  page: string
  title: string
  subtitle: string
}

export function usePageConfig({ page, title, subtitle }: UsePageConfigParams) {
  const { setCurrentPage, setPageTitle, setPageSubtitle } = useLayout()

  useEffect(() => {
    setCurrentPage(page)
    setPageTitle(title)
    setPageSubtitle(subtitle)
  }, [page, title, subtitle, setCurrentPage, setPageTitle, setPageSubtitle])
}
