"use client"

import { CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export function HomeAutomationWidget() {
  const homeDevices = [
    { name: "Ar Condicionado", status: "off", room: "Sala" },
    { name: "Luzes Principais", status: "on", room: "Casa" },
    { name: "Computador", status: "on", room: "Escritório" },
  ]

  return (
    <>
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-montserrat">Controle da Casa</CardTitle>
        <CardDescription className="text-xs">Status dos dispositivos conectados</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {homeDevices.map((device, index) => (
          <div key={index} className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${device.status === "on" ? "bg-green-500" : "bg-gray-400"}`} />
              <div>
                <p className="text-sm font-medium">{device.name}</p>
                <p className="text-xs text-muted-foreground">{device.room}</p>
              </div>
            </div>
            <Button variant={device.status === "on" ? "default" : "outline"} size="sm" className="h-7 text-xs">
              {device.status === "on" ? "Desligar" : "Ligar"}
            </Button>
          </div>
        ))}
      </CardContent>
    </>
  )
}
