"use client"

import { CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export function UpcomingBillsWidget() {
  const upcomingBills = [
    { name: "Energia Elétrica", amount: "R$ 245,00", date: "15/01", status: "pending" },
    { name: "Internet", amount: "R$ 89,90", date: "18/01", status: "pending" },
    { name: "Cartão de Crédito", amount: "R$ 1.250,00", date: "20/01", status: "pending" },
  ]

  return (
    <>
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-montserrat">Próximas Contas</CardTitle>
        <CardDescription className="text-xs">Contas a vencer nos próximos dias</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {upcomingBills.map((bill, index) => (
          <div key={index} className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
            <div>
              <p className="text-sm font-medium">{bill.name}</p>
              <p className="text-xs text-muted-foreground">Vence em {bill.date}</p>
            </div>
            <div className="text-right">
              <p className="text-sm font-semibold">{bill.amount}</p>
              <Badge variant="destructive" className="text-xs">
                Pendente
              </Badge>
            </div>
          </div>
        ))}
      </CardContent>
    </>
  )
}
