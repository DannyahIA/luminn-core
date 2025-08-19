"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, TrendingDown, Minus } from "lucide-react"

interface MonthlyData {
  month: string
  year: number
  totalSpent: number
  totalIncome: number
  categories: Record<string, number>
  merchants: Record<string, number>
}

interface MonthlyComparisonProps {
  currentMonth: MonthlyData
  previousMonth: MonthlyData
}

export function MonthlyComparison({ currentMonth, previousMonth }: MonthlyComparisonProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value)
  }

  const getChangeIcon = (change: number) => {
    if (change > 0) return <TrendingUp className="h-3 w-3" />
    if (change < 0) return <TrendingDown className="h-3 w-3" />
    return <Minus className="h-3 w-3" />
  }

  const getChangeColor = (change: number, isExpense = true) => {
    if (change === 0) return "text-muted-foreground"
    if (isExpense) {
      return change > 0 ? "text-red-600" : "text-green-600"
    } else {
      return change > 0 ? "text-green-600" : "text-red-600"
    }
  }

  const categoryComparisons = Object.entries(currentMonth.categories).map(([category, currentAmount]) => {
    const previousAmount = previousMonth.categories[category] || 0
    const change = previousAmount > 0 ? ((currentAmount - previousAmount) / previousAmount) * 100 : 0
    const absoluteChange = currentAmount - previousAmount

    return {
      category,
      currentAmount,
      previousAmount,
      change,
      absoluteChange,
    }
  })

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-montserrat">Comparação Mensal</CardTitle>
        <CardDescription>
          {currentMonth.month} vs {previousMonth.month} {previousMonth.year}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Overall Comparison */}
        <div className="grid grid-cols-2 gap-4 p-4 bg-muted/30 rounded-lg">
          <div>
            <p className="text-sm text-muted-foreground mb-1">Gastos Totais</p>
            <p className="font-semibold">{formatCurrency(currentMonth.totalSpent)}</p>
            <div
              className={`flex items-center gap-1 text-xs ${getChangeColor(
                currentMonth.totalSpent - previousMonth.totalSpent,
              )}`}
            >
              {getChangeIcon(currentMonth.totalSpent - previousMonth.totalSpent)}
              {formatCurrency(Math.abs(currentMonth.totalSpent - previousMonth.totalSpent))}
            </div>
          </div>
          <div>
            <p className="text-sm text-muted-foreground mb-1">Receitas Totais</p>
            <p className="font-semibold">{formatCurrency(currentMonth.totalIncome)}</p>
            <div
              className={`flex items-center gap-1 text-xs ${getChangeColor(
                currentMonth.totalIncome - previousMonth.totalIncome,
                false,
              )}`}
            >
              {getChangeIcon(currentMonth.totalIncome - previousMonth.totalIncome)}
              {formatCurrency(Math.abs(currentMonth.totalIncome - previousMonth.totalIncome))}
            </div>
          </div>
        </div>

        {/* Category Comparisons */}
        <div className="space-y-2">
          <h4 className="font-semibold text-sm">Mudanças por Categoria</h4>
          {categoryComparisons
            .sort((a, b) => Math.abs(b.absoluteChange) - Math.abs(a.absoluteChange))
            .slice(0, 5)
            .map((item) => (
              <div key={item.category} className="flex items-center justify-between p-2 rounded bg-muted/20">
                <div>
                  <p className="font-medium text-sm">{item.category}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatCurrency(item.previousAmount)} → {formatCurrency(item.currentAmount)}
                  </p>
                </div>
                <div className="text-right">
                  <Badge
                    variant={item.change > 0 ? "destructive" : item.change < 0 ? "default" : "secondary"}
                    className="text-xs"
                  >
                    {item.change > 0 ? "+" : ""}
                    {item.change.toFixed(1)}%
                  </Badge>
                  <p className={`text-xs ${getChangeColor(item.absoluteChange)}`}>
                    {item.absoluteChange > 0 ? "+" : ""}
                    {formatCurrency(item.absoluteChange)}
                  </p>
                </div>
              </div>
            ))}
        </div>
      </CardContent>
    </Card>
  )
}
