"use client"

import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import { X } from "lucide-react"

interface FinancialFiltersProps {
  selectedBanks: string[]
  setSelectedBanks: (banks: string[]) => void
  comparisonMonths: number
  setComparisonMonths: (months: number) => void
  selectedCategory: string
  setSelectedCategory: (category: string) => void
  banks: { id: string; name: string }[]
  categories: string[]
}

export function FinancialFilters({
  selectedBanks,
  setSelectedBanks,
  comparisonMonths,
  setComparisonMonths,
  selectedCategory,
  setSelectedCategory,
  banks,
  categories,
}: FinancialFiltersProps) {
  const handleBankToggle = (bankId: string, checked: boolean) => {
    if (checked) {
      setSelectedBanks([...selectedBanks, bankId])
    } else {
      setSelectedBanks(selectedBanks.filter((id) => id !== bankId))
    }
  }

  const clearAllFilters = () => {
    setSelectedBanks(banks.map((b) => b.id))
    setComparisonMonths(3)
    setSelectedCategory("all")
  }

  const hasActiveFilters = selectedBanks.length !== banks.length || comparisonMonths !== 3 || selectedCategory !== "all"

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-4 bg-muted/30 rounded-lg">
      <div className="space-y-3">
        <Label>Bancos Incluídos</Label>
        <div className="space-y-2">
          {banks.map((bank) => (
            <div key={bank.id} className="flex items-center space-x-2">
              <Checkbox
                id={`bank-${bank.id}`}
                checked={selectedBanks.includes(bank.id)}
                onCheckedChange={(checked) => handleBankToggle(bank.id, checked as boolean)}
              />
              <Label htmlFor={`bank-${bank.id}`} className="text-sm font-normal">
                {bank.name}
              </Label>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="comparison-months">Período de Comparação</Label>
        <Select
          value={comparisonMonths.toString()}
          onValueChange={(value) => setComparisonMonths(Number.parseInt(value))}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="3">Últimos 3 meses</SelectItem>
            <SelectItem value="6">Últimos 6 meses</SelectItem>
            <SelectItem value="12">Último ano</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="category-focus">Foco em Categoria</Label>
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger>
            <SelectValue placeholder="Todas as categorias" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas as categorias</SelectItem>
            {categories.map((category) => (
              <SelectItem key={category} value={category}>
                {category}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {hasActiveFilters && (
        <div className="md:col-span-2 lg:col-span-3 flex justify-center">
          <Button variant="outline" onClick={clearAllFilters} className="w-full md:w-auto bg-transparent">
            <X className="h-4 w-4 mr-2" />
            Resetar Filtros
          </Button>
        </div>
      )}
    </div>
  )
}
