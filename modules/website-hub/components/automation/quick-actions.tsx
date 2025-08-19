"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Lightbulb, Monitor, Tv, Shield, Zap } from "lucide-react"

interface Device {
  id: string
  name: string
  type: "light" | "computer" | "tv" | "ac" | "security" | "router" | "other"
  room: string
  status: "on" | "off" | "unavailable"
  powerConsumption?: number
  lastUpdated: string
  controllable: boolean
  properties?: Record<string, any>
}

interface QuickActionsProps {
  devices: Device[]
  onDeviceToggle: (deviceId: string) => void
}

export function QuickActions({ devices, onDeviceToggle }: QuickActionsProps) {
  const quickActions = [
    {
      id: "lights-all",
      name: "Todas as Luzes",
      icon: Lightbulb,
      action: () => {
        const lights = devices.filter((d) => d.type === "light" && d.controllable)
        lights.forEach((light) => {
          if (light.status === "off") onDeviceToggle(light.id)
        })
      },
      status: devices.filter((d) => d.type === "light" && d.status === "on").length > 0 ? "on" : "off",
      count: devices.filter((d) => d.type === "light").length,
    },
    {
      id: "computers-all",
      name: "Computadores",
      icon: Monitor,
      action: () => {
        const computers = devices.filter((d) => d.type === "computer" && d.controllable)
        computers.forEach((computer) => {
          if (computer.status === "off") onDeviceToggle(computer.id)
        })
      },
      status: devices.filter((d) => d.type === "computer" && d.status === "on").length > 0 ? "on" : "off",
      count: devices.filter((d) => d.type === "computer").length,
    },
    {
      id: "tvs-all",
      name: "Televisões",
      icon: Tv,
      action: () => {
        const tvs = devices.filter((d) => d.type === "tv" && d.controllable)
        tvs.forEach((tv) => {
          if (tv.status === "off") onDeviceToggle(tv.id)
        })
      },
      status: devices.filter((d) => d.type === "tv" && d.status === "on").length > 0 ? "on" : "off",
      count: devices.filter((d) => d.type === "tv").length,
    },
    {
      id: "security",
      name: "Segurança",
      icon: Shield,
      action: () => {
        const security = devices.find((d) => d.type === "security" && d.controllable)
        if (security) onDeviceToggle(security.id)
      },
      status: devices.find((d) => d.type === "security")?.status || "off",
      count: 1,
    },
  ]

  const handleTurnOffAll = () => {
    const controllableDevices = devices.filter((d) => d.controllable && d.status === "on")
    controllableDevices.forEach((device) => onDeviceToggle(device.id))
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-montserrat">Ações Rápidas</CardTitle>
        <CardDescription>Controle múltiplos dispositivos de uma vez</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
          {quickActions.map((action) => (
            <Button
              key={action.id}
              variant={action.status === "on" ? "default" : "outline"}
              className="h-auto p-4 flex flex-col items-center gap-2"
              onClick={action.action}
            >
              <action.icon className="h-6 w-6" />
              <div className="text-center">
                <div className="font-medium text-sm">{action.name}</div>
                <div className="text-xs opacity-70">{action.count} dispositivo(s)</div>
              </div>
            </Button>
          ))}

          <Button
            variant="destructive"
            className="h-auto p-4 flex flex-col items-center gap-2"
            onClick={handleTurnOffAll}
          >
            <Zap className="h-6 w-6" />
            <div className="text-center">
              <div className="font-medium text-sm">Desligar Tudo</div>
              <div className="text-xs opacity-70">Emergência</div>
            </div>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
