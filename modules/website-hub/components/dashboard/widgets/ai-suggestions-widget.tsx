"use client"

import { CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Lightbulb } from "lucide-react"

export function AISuggestionsWidget() {
  return (
    <>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base font-montserrat">
          <Lightbulb className="h-4 w-4 text-accent" />
          Sugestões IA
        </CardTitle>
        <CardDescription className="text-xs">Insights personalizados baseados nos seus dados</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="p-3 rounded-lg bg-accent/10 border border-accent/20">
            <h4 className="text-sm font-semibold text-accent mb-1">💰 Economia Detectada</h4>
            <p className="text-xs text-muted-foreground">
              Você gastou 15% menos com delivery este mês. Continue assim para economizar R$ 200!
            </p>
          </div>
          <div className="p-3 rounded-lg bg-primary/10 border border-primary/20">
            <h4 className="text-sm font-semibold text-primary mb-1">📊 Análise de Gastos</h4>
            <p className="text-xs text-muted-foreground">
              Seus gastos com transporte aumentaram 20%. Considere usar mais o transporte público.
            </p>
          </div>
        </div>
      </CardContent>
    </>
  )
}
