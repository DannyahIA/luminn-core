"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

interface MonthlyData {
  month: string
  year: number
  totalSpent: number
  totalIncome: number
  categories: Record<string, number>
  merchants: Record<string, number>
}

interface SpendingChartProps {
  data: MonthlyData[]
}

export function SpendingChart({ data }: SpendingChartProps) {
  const chartData = data.map((item) => ({
    month: item.month,
    gastos: item.totalSpent,
    receitas: item.totalIncome,
    economia: item.totalIncome - item.totalSpent,
  }))

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
      minimumFractionDigits: 0,
    }).format(value)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-montserrat">Evolução Mensal</CardTitle>
        <CardDescription>Comparação de receitas, gastos e economia</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis tickFormatter={formatCurrency} />
            <Tooltip formatter={(value: number) => formatCurrency(value)} />
            <Bar dataKey="receitas" fill="#10b981" name="Receitas" />
            <Bar dataKey="gastos" fill="#ef4444" name="Gastos" />
            <Bar dataKey="economia" fill="#3b82f6" name="Economia" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
