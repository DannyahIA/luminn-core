"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Sidebar } from "@/components/layout/sidebar"
import { Header } from "@/components/layout/header"
import { TrendingUp, TrendingDown, DollarSign, Lightbulb, Bell } from "lucide-react"

export function Dashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false)

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

  const upcomingBills = [
    { name: "Energia Elétrica", amount: "R$ 245,00", date: "15/01", status: "pending" },
    { name: "Internet", amount: "R$ 89,90", date: "18/01", status: "pending" },
    { name: "Cartão de Crédito", amount: "R$ 1.250,00", date: "20/01", status: "pending" },
    { name: "Aluguel", amount: "R$ 1.800,00", date: "25/01", status: "scheduled" },
  ]

  const homeDevices = [
    { name: "Ar Condicionado", status: "off", room: "Sala" },
    { name: "Luzes Principais", status: "on", room: "Casa" },
    { name: "Computador", status: "on", room: "Escritório" },
    { name: "TV", status: "off", room: "Quarto" },
  ]

  return (
    <div className="min-h-screen bg-background">
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} currentPage="dashboard" />

      <div className="lg:ml-64">
        <Header
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
          title="Dashboard"
          subtitle="Bem-vindo ao seu hub de automação pessoal"
        />

        {/* Dashboard Content */}
        <main className="p-4 lg:p-6 space-y-6">
          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {quickStats.map((stat) => (
              <Card key={stat.title}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">{stat.title}</CardTitle>
                  <stat.icon className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold font-montserrat">{stat.value}</div>
                  <p
                    className={`text-xs flex items-center gap-1 ${
                      stat.trend === "up"
                        ? "text-green-600"
                        : stat.trend === "down"
                          ? "text-red-600"
                          : "text-muted-foreground"
                    }`}
                  >
                    {stat.trend === "up" && <TrendingUp className="h-3 w-3" />}
                    {stat.trend === "down" && <TrendingDown className="h-3 w-3" />}
                    {stat.change}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Upcoming Bills */}
            <Card>
              <CardHeader>
                <CardTitle className="font-montserrat">Próximas Contas</CardTitle>
                <CardDescription>Contas a vencer nos próximos dias</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {upcomingBills.map((bill, index) => (
                  <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                    <div>
                      <p className="font-medium">{bill.name}</p>
                      <p className="text-sm text-muted-foreground">Vence em {bill.date}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">{bill.amount}</p>
                      <Badge variant={bill.status === "pending" ? "destructive" : "secondary"}>
                        {bill.status === "pending" ? "Pendente" : "Agendado"}
                      </Badge>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Home Automation */}
            <Card>
              <CardHeader>
                <CardTitle className="font-montserrat">Controle da Casa</CardTitle>
                <CardDescription>Status dos dispositivos conectados</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {homeDevices.map((device, index) => (
                  <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-3 h-3 rounded-full ${device.status === "on" ? "bg-green-500" : "bg-gray-400"}`}
                      />
                      <div>
                        <p className="font-medium">{device.name}</p>
                        <p className="text-sm text-muted-foreground">{device.room}</p>
                      </div>
                    </div>
                    <Button variant={device.status === "on" ? "default" : "outline"} size="sm">
                      {device.status === "on" ? "Desligar" : "Ligar"}
                    </Button>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* AI Suggestions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 font-montserrat">
                <Lightbulb className="h-5 w-5 text-accent" />
                Sugestões Inteligentes
              </CardTitle>
              <CardDescription>Insights personalizados baseados nos seus dados</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-lg bg-accent/10 border border-accent/20">
                  <h4 className="font-semibold text-accent mb-2">💰 Economia Detectada</h4>
                  <p className="text-sm text-muted-foreground">
                    Você gastou 15% menos com delivery este mês. Continue assim para economizar R$ 200 até o final do
                    ano!
                  </p>
                </div>
                <div className="p-4 rounded-lg bg-primary/10 border border-primary/20">
                  <h4 className="font-semibold text-primary mb-2">📊 Análise de Gastos</h4>
                  <p className="text-sm text-muted-foreground">
                    Seus gastos com transporte aumentaram 20%. Considere usar mais o transporte público.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  )
}
