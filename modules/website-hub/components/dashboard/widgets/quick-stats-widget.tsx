"use client"
import { TrendingUp, TrendingDown, DollarSign, Bell } from "lucide-react"

export function QuickStatsWidget() {
  const quickStats = [
    {
      title: "Saldo Total",
      value: "R$ 12.450,00",
      change: "+2.5%",
      trend: "up",
      icon: DollarSign,
    },
    {
      title: "Gastos do Mês",
      value: "R$ 3.280,00",
      change: "-5.2%",
      trend: "down",
      icon: TrendingDown,
    },
    {
      title: "Contas Pendentes",
      value: "4",
      change: "Próximas 7 dias",
      trend: "neutral",
      icon: Bell,
    },
    {
      title: "Economia",
      value: "R$ 890,00",
      change: "+12.3%",
      trend: "up",
      icon: TrendingUp,
    },
  ]

  return (
    <div className="grid grid-cols-2 gap-3 p-4">
      {quickStats.map((stat) => (
        <div key={stat.title} className="space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium text-muted-foreground">{stat.title}</p>
            <stat.icon className="h-3 w-3 text-muted-foreground" />
          </div>
          <div className="space-y-1">
            <p className="text-lg font-bold font-montserrat">{stat.value}</p>
            <p
              className={`text-xs flex items-center gap-1 ${
                stat.trend === "up"
                  ? "text-green-600"
                  : stat.trend === "down"
                    ? "text-red-600"
                    : "text-muted-foreground"
              }`}
            >
              {stat.trend === "up" && <TrendingUp className="h-2 w-2" />}
              {stat.trend === "down" && <TrendingDown className="h-2 w-2" />}
              {stat.change}
            </p>
          </div>
        </div>
      ))}
    </div>
  )
}
