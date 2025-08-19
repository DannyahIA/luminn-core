"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import type { Widget } from "./customizable-dashboard"

interface WidgetSelectorProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  widgets: Widget[]
  onToggleWidget: (widgetId: string) => void
}

export function WidgetSelector({ open, onOpenChange, widgets, onToggleWidget }: WidgetSelectorProps) {
  const widgetDescriptions = {
    "quick-stats": "Visão geral das suas finanças com estatísticas importantes",
    "upcoming-bills": "Próximas contas a vencer e pagamentos pendentes",
    "home-automation": "Controle rápido dos dispositivos da sua casa",
    "ai-suggestions": "Insights inteligentes baseados nos seus dados",
    weather: "Previsão do tempo atual e dos próximos dias",
    calendar: "Eventos próximos e compromissos importantes",
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Gerenciar Widgets</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {widgets.map((widget) => (
            <Card key={widget.id} className={widget.enabled ? "ring-2 ring-cyan-200" : ""}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-base">{widget.title}</CardTitle>
                    <CardDescription className="text-sm">
                      {widgetDescriptions[widget.type as keyof typeof widgetDescriptions]}
                    </CardDescription>
                  </div>
                  <Switch checked={widget.enabled} onCheckedChange={() => onToggleWidget(widget.id)} />
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">
                    {widget.size === "small" && "Pequeno"}
                    {widget.size === "medium" && "Médio"}
                    {widget.size === "large" && "Grande"}
                  </Badge>
                  <Badge variant={widget.enabled ? "default" : "secondary"} className="text-xs">
                    {widget.enabled ? "Ativo" : "Inativo"}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="flex justify-end">
          <Button onClick={() => onOpenChange(false)}>Fechar</Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
