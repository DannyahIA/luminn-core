"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { FinancialFilters } from "@/components/financial/financial-filters"
import { SpendingChart } from "@/components/financial/spending-chart"
import { CategoryBreakdown } from "@/components/financial/category-breakdown"
import { MonthlyComparison } from "@/components/financial/monthly-comparison"
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Calendar,
  Target,
  AlertTriangle,
  Filter,
  BarChart3,
  PieChart,
  LineChart,
} from "lucide-react"
import { usePageConfig } from "@/hooks/use-page-config"

interface MonthlyData {
  month: string
  year: number
  totalSpent: number
  totalIncome: number
  categories: Record<string, number>
  merchants: Record<string, number>
}

const mockMonthlyData: MonthlyData[] = [
  {
    month: "Janeiro",
    year: 2024,
    totalSpent: 4280.5,
    totalIncome: 6700.0,
    categories: {
      Alimentação: 890.5,
      Transporte: 650.0,
      Supermercado: 580.75,
      Utilidades: 445.0,
      Entretenimento: 320.9,
      Combustível: 240.0,
      Transferência: 250.0,
      Outros: 903.35,
    },
    merchants: {
      Uber: 420.5,
      iFood: 380.0,
      "Pão de Açúcar": 290.75,
      Netflix: 89.7,
      Starbucks: 156.9,
      "Posto Shell": 240.0,
      ENEL: 245.0,
      Outros: 2457.65,
    },
  },
  {
    month: "Dezembro",
    year: 2023,
    totalSpent: 5120.8,
    totalIncome: 6700.0,
    categories: {
      Alimentação: 1200.5,
      Transporte: 780.0,
      Supermercado: 690.75,
      Utilidades: 445.0,
      Entretenimento: 520.9,
      Combustível: 320.0,
      Transferência: 180.0,
      Outros: 983.65,
    },
    merchants: {
      Uber: 520.0,
      iFood: 580.5,
      "Pão de Açúcar": 390.75,
      Netflix: 89.7,
      Starbucks: 200.0,
      "Posto Shell": 320.0,
      ENEL: 245.0,
      Outros: 2774.85,
    },
  },
  {
    month: "Novembro",
    year: 2023,
    totalSpent: 3890.2,
    totalIncome: 6700.0,
    categories: {
      Alimentação: 720.5,
      Transporte: 580.0,
      Supermercado: 480.75,
      Utilidades: 445.0,
      Entretenimento: 280.9,
      Combustível: 200.0,
      Transferência: 320.0,
      Outros: 863.05,
    },
    merchants: {
      Uber: 380.0,
      iFood: 280.5,
      "Pão de Açúcar": 240.75,
      Netflix: 89.7,
      Starbucks: 120.0,
      "Posto Shell": 200.0,
      ENEL: 245.0,
      Outros: 2334.25,
    },
  },
]

const banks = [
  { id: "1", name: "Nubank" },
  { id: "2", name: "Itaú" },
  { id: "3", name: "Banco do Brasil" },
]

export function FinancialAnalysisPage() {
  const [selectedBanks, setSelectedBanks] = useState<string[]>(["1", "2", "3"])
  const [comparisonMonths, setComparisonMonths] = useState(3)
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [viewType, setViewType] = useState<"overview" | "categories" | "trends">("overview")
  const [showFilters, setShowFilters] = useState(false)

  // Configurar as informações da página
  usePageConfig({
    page: "financas",
    title: "Análise Financeira",
    subtitle: "Visualize e analise seus dados financeiros"
  })

  const currentMonth = mockMonthlyData[0]
  const previousMonth = mockMonthlyData[1]

  const filteredData = useMemo(() => {
    return mockMonthlyData.slice(0, comparisonMonths)
  }, [comparisonMonths])

  const spendingChange = ((currentMonth.totalSpent - previousMonth.totalSpent) / previousMonth.totalSpent) * 100
  const incomeChange = ((currentMonth.totalIncome - previousMonth.totalIncome) / previousMonth.totalIncome) * 100
  const savingsRate = ((currentMonth.totalIncome - currentMonth.totalSpent) / currentMonth.totalIncome) * 100

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value)
  }

  const getInsights = () => {
    const insights = []

    if (spendingChange > 10) {
      insights.push({
        type: "warning",
        title: "Gastos Aumentaram",
        description: `Seus gastos aumentaram ${spendingChange.toFixed(1)}% comparado ao mês anterior`,
        icon: AlertTriangle,
      })
    } else if (spendingChange < -10) {
      insights.push({
        type: "success",
        title: "Economia Detectada",
        description: `Você economizou ${Math.abs(spendingChange).toFixed(1)}% comparado ao mês anterior`,
        icon: TrendingDown,
      })
    }

    const topCategory = Object.entries(currentMonth.categories).sort(([, a], [, b]) => b - a)[0]
    if (topCategory) {
      insights.push({
        type: "info",
        title: "Maior Categoria de Gasto",
        description: `${topCategory[0]} representa ${formatCurrency(topCategory[1])} dos seus gastos`,
        icon: PieChart,
      })
    }

    const topMerchant = Object.entries(currentMonth.merchants).sort(([, a], [, b]) => b - a)[0]
    if (topMerchant && topMerchant[0] !== "Outros") {
      insights.push({
        type: "info",
        title: "Maior Gasto Individual",
        description: `Você gastou ${formatCurrency(topMerchant[1])} com ${topMerchant[0]} este mês`,
        icon: Target,
      })
    }

    if (savingsRate > 30) {
      insights.push({
        type: "success",
        title: "Excelente Taxa de Poupança",
        description: `Você está poupando ${savingsRate.toFixed(1)}% da sua renda`,
        icon: TrendingUp,
      })
    } else if (savingsRate < 10) {
      insights.push({
        type: "warning",
        title: "Taxa de Poupança Baixa",
        description: `Considere reduzir gastos. Taxa atual: ${savingsRate.toFixed(1)}%`,
        icon: AlertTriangle,
      })
    }

    return insights
  }

  const insights = getInsights()

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Gastos do Mês</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold font-montserrat">{formatCurrency(currentMonth.totalSpent)}</div>
                <p
                  className={`text-xs flex items-center gap-1 ${
                    spendingChange > 0 ? "text-red-600" : "text-green-600"
                  }`}
                >
                  {spendingChange > 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                  {Math.abs(spendingChange).toFixed(1)}% vs mês anterior
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Receita do Mês</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold font-montserrat">{formatCurrency(currentMonth.totalIncome)}</div>
                <p
                  className={`text-xs flex items-center gap-1 ${incomeChange >= 0 ? "text-green-600" : "text-red-600"}`}
                >
                  {incomeChange >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                  {Math.abs(incomeChange).toFixed(1)}% vs mês anterior
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Taxa de Poupança</CardTitle>
                <Target className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold font-montserrat">{savingsRate.toFixed(1)}%</div>
                <p className="text-xs text-muted-foreground">
                  {formatCurrency(currentMonth.totalIncome - currentMonth.totalSpent)} poupados
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Média Diária</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold font-montserrat">{formatCurrency(currentMonth.totalSpent / 31)}</div>
                <p className="text-xs text-muted-foreground">Gasto médio por dia</p>
              </CardContent>
            </Card>
          </div>

          {/* Filters and View Controls */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="font-montserrat">Controles de Análise</CardTitle>
                  <CardDescription>Personalize sua visualização financeira</CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant={viewType === "overview" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setViewType("overview")}
                  >
                    <BarChart3 className="h-4 w-4 mr-2" />
                    Visão Geral
                  </Button>
                  <Button
                    variant={viewType === "categories" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setViewType("categories")}
                  >
                    <PieChart className="h-4 w-4 mr-2" />
                    Categorias
                  </Button>
                  <Button
                    variant={viewType === "trends" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setViewType("trends")}
                  >
                    <LineChart className="h-4 w-4 mr-2" />
                    Tendências
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => setShowFilters(!showFilters)}>
                    <Filter className="h-4 w-4 mr-2" />
                    {showFilters ? "Ocultar" : "Mostrar"} Filtros
                  </Button>
                </div>
              </div>
            </CardHeader>
            {showFilters && (
              <CardContent>
                <FinancialFilters
                  selectedBanks={selectedBanks}
                  setSelectedBanks={setSelectedBanks}
                  comparisonMonths={comparisonMonths}
                  setComparisonMonths={setComparisonMonths}
                  selectedCategory={selectedCategory}
                  setSelectedCategory={setSelectedCategory}
                  banks={banks}
                  categories={Object.keys(currentMonth.categories)}
                />
              </CardContent>
            )}
          </Card>

          {/* Insights */}
          {insights.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="font-montserrat">Insights Inteligentes</CardTitle>
                <CardDescription>Análises automáticas dos seus padrões financeiros</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {insights.map((insight, index) => (
                    <div
                      key={index}
                      className={`p-4 rounded-lg border ${
                        insight.type === "success"
                          ? "bg-green-50 border-green-200"
                          : insight.type === "warning"
                            ? "bg-yellow-50 border-yellow-200"
                            : "bg-blue-50 border-blue-200"
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <insight.icon
                          className={`h-5 w-5 mt-0.5 ${
                            insight.type === "success"
                              ? "text-green-600"
                              : insight.type === "warning"
                                ? "text-yellow-600"
                                : "text-blue-600"
                          }`}
                        />
                        <div>
                          <h4
                            className={`font-semibold mb-1 ${
                              insight.type === "success"
                                ? "text-green-800"
                                : insight.type === "warning"
                                  ? "text-yellow-800"
                                  : "text-blue-800"
                            }`}
                          >
                            {insight.title}
                          </h4>
                          <p className="text-sm text-muted-foreground">{insight.description}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Charts and Analysis */}
          {viewType === "overview" && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <SpendingChart data={filteredData} />
              <MonthlyComparison currentMonth={currentMonth} previousMonth={previousMonth} />
            </div>
          )}

          {viewType === "categories" && <CategoryBreakdown data={currentMonth} />}

          {viewType === "trends" && (
            <div className="grid grid-cols-1 gap-6">
              <SpendingChart data={filteredData} />
              <Card>
                <CardHeader>
                  <CardTitle className="font-montserrat">Análise de Tendências</CardTitle>
                  <CardDescription>Padrões de gastos ao longo do tempo</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {Object.entries(currentMonth.categories).map(([category, amount]) => {
                      const previousAmount = previousMonth.categories[category] || 0
                      const change = previousAmount > 0 ? ((amount - previousAmount) / previousAmount) * 100 : 0

                      return (
                        <div key={category} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                          <div>
                            <p className="font-medium">{category}</p>
                            <p className="text-sm text-muted-foreground">{formatCurrency(amount)} este mês</p>
                          </div>
                          <div className="text-right">
                            <Badge
                              variant={change > 0 ? "destructive" : change < 0 ? "default" : "secondary"}
                              className="mb-1"
                            >
                              {change > 0 ? "+" : ""}
                              {change.toFixed(1)}%
                            </Badge>
                            <p className="text-xs text-muted-foreground">vs mês anterior</p>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
    </div>
  )
}
