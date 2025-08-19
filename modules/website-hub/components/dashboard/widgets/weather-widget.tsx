"use client"

import { CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Cloud, Sun, Droplets } from "lucide-react"

export function WeatherWidget() {
  return (
    <>
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-montserrat">Clima</CardTitle>
        <CardDescription className="text-xs">São Paulo, SP</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sun className="h-6 w-6 text-yellow-500" />
            <div>
              <p className="text-2xl font-bold">28°C</p>
              <p className="text-xs text-muted-foreground">Ensolarado</p>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="flex items-center gap-1">
            <Droplets className="h-3 w-3 text-blue-500" />
            <span>Umidade: 65%</span>
          </div>
          <div className="flex items-center gap-1">
            <Cloud className="h-3 w-3 text-gray-500" />
            <span>Vento: 12 km/h</span>
          </div>
        </div>
      </CardContent>
    </>
  )
}
