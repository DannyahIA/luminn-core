"use client"

import { Button } from "@/components/ui/button"
import { Filter } from "lucide-react"

interface EventFiltersProps {
  filters: {
    work: boolean
    personal: boolean
    bills: boolean
    expenses: boolean
  }
  onFiltersChange: (filters: any) => void
}

export function EventFilters({ filters, onFiltersChange }: EventFiltersProps) {
  const toggleFilter = (key: string) => {
    onFiltersChange({
      ...filters,
      [key]: !filters[key as keyof typeof filters],
    })
  }

  return (
    <div className="flex items-center gap-2">
      <Filter className="h-4 w-4 text-gray-500" />
      <div className="flex gap-2">
        <Button
          variant={filters.work ? "default" : "outline"}
          size="sm"
          onClick={() => toggleFilter("work")}
          className={filters.work ? "bg-blue-500 hover:bg-blue-600" : ""}
        >
          Trabalho
        </Button>
        <Button
          variant={filters.personal ? "default" : "outline"}
          size="sm"
          onClick={() => toggleFilter("personal")}
          className={filters.personal ? "bg-green-500 hover:bg-green-600" : ""}
        >
          Pessoal
        </Button>
        <Button
          variant={filters.bills ? "default" : "outline"}
          size="sm"
          onClick={() => toggleFilter("bills")}
          className={filters.bills ? "bg-red-500 hover:bg-red-600" : ""}
        >
          Contas
        </Button>
        <Button
          variant={filters.expenses ? "default" : "outline"}
          size="sm"
          onClick={() => toggleFilter("expenses")}
          className={filters.expenses ? "bg-orange-500 hover:bg-orange-600" : ""}
        >
          Gastos
        </Button>
      </div>
    </div>
  )
}
