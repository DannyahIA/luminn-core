"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Settings, Zap, Clock, AlertCircle } from "lucide-react"

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

interface DeviceCardProps {
  device: Device
  icon: any
  onToggle: () => void
  onUpdate: (updates: Partial<Device>) => void
}

export function DeviceCard({ device, icon: Icon, onToggle, onUpdate }: DeviceCardProps) {
  const [showSettings, setShowSettings] = useState(false)

  const formatLastUpdated = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))

    if (diffInMinutes < 1) return "Agora"
    if (diffInMinutes < 60) return `${diffInMinutes}m atrás`
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h atrás`
    return `${Math.floor(diffInMinutes / 1440)}d atrás`
  }

  const getStatusColor = (status: Device["status"]) => {
    switch (status) {
      case "on":
        return "bg-green-500"
      case "off":
        return "bg-gray-400"
      case "unavailable":
        return "bg-red-500"
    }
  }

  const getStatusText = (status: Device["status"]) => {
    switch (status) {
      case "on":
        return "Ligado"
      case "off":
        return "Desligado"
      case "unavailable":
        return "Indisponível"
    }
  }

  const handlePropertyUpdate = (property: string, value: any) => {
    onUpdate({
      properties: {
        ...device.properties,
        [property]: value,
      },
      lastUpdated: new Date().toISOString(),
    })
  }

  return (
    <Card className={`transition-all duration-200 ${device.status === "on" ? "ring-2 ring-primary/20" : ""}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                device.status === "on" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
              }`}
            >
              <Icon className="h-5 w-5" />
            </div>
            <div>
              <CardTitle className="text-base font-montserrat">{device.name}</CardTitle>
              <CardDescription className="flex items-center gap-2">
                <span>{device.room}</span>
                <div className={`w-2 h-2 rounded-full ${getStatusColor(device.status)}`} />
                <span>{getStatusText(device.status)}</span>
              </CardDescription>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={() => setShowSettings(!showSettings)}>
            <Settings className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Main Controls */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {device.powerConsumption !== undefined && (
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <Zap className="h-3 w-3" />
                <span>{device.powerConsumption}W</span>
              </div>
            )}
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <Clock className="h-3 w-3" />
              <span>{formatLastUpdated(device.lastUpdated)}</span>
            </div>
          </div>

          {device.controllable ? (
            <Switch
              checked={device.status === "on"}
              onCheckedChange={onToggle}
              disabled={device.status === "unavailable"}
            />
          ) : (
            <Badge variant="secondary">Somente Leitura</Badge>
          )}
        </div>

        {/* Device-specific Properties */}
        {device.status === "on" && device.properties && (
          <div className="space-y-3">
            {/* Light Controls */}
            {device.type === "light" && device.properties.brightness !== undefined && (
              <div className="space-y-2">
                <Label className="text-sm">Brilho: {device.properties.brightness}%</Label>
                <Slider
                  value={[device.properties.brightness]}
                  onValueChange={([value]) => handlePropertyUpdate("brightness", value)}
                  max={100}
                  step={1}
                  className="w-full"
                />
              </div>
            )}

            {/* AC Controls */}
            {device.type === "ac" && device.properties.temperature !== undefined && (
              <div className="space-y-2">
                <Label className="text-sm">Temperatura: {device.properties.temperature}°C</Label>
                <Slider
                  value={[device.properties.temperature]}
                  onValueChange={([value]) => handlePropertyUpdate("temperature", value)}
                  min={16}
                  max={30}
                  step={1}
                  className="w-full"
                />
              </div>
            )}

            {/* TV Controls */}
            {device.type === "tv" && device.properties.volume !== undefined && (
              <div className="space-y-2">
                <Label className="text-sm">Volume: {device.properties.volume}%</Label>
                <Slider
                  value={[device.properties.volume]}
                  onValueChange={([value]) => handlePropertyUpdate("volume", value)}
                  max={100}
                  step={1}
                  className="w-full"
                />
              </div>
            )}
          </div>
        )}

        {/* Status Information */}
        {device.status === "unavailable" && (
          <div className="flex items-center gap-2 p-2 bg-red-50 text-red-700 rounded-md text-sm">
            <AlertCircle className="h-4 w-4" />
            <span>Dispositivo não está respondendo</span>
          </div>
        )}

        {/* Additional Info */}
        {showSettings && device.properties && (
          <div className="pt-3 border-t space-y-2">
            <h4 className="font-semibold text-sm">Informações Adicionais</h4>
            <div className="grid grid-cols-2 gap-2 text-sm">
              {Object.entries(device.properties).map(([key, value]) => (
                <div key={key} className="flex justify-between">
                  <span className="text-muted-foreground capitalize">{key}:</span>
                  <span>{String(value)}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
