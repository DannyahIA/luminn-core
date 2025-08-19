"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Sidebar } from "@/components/layout/sidebar"
import { Header } from "@/components/layout/header"
import { DeviceCard } from "@/components/automation/device-card"
import { QuickActions } from "@/components/automation/quick-actions"
import { AutomationSchedule } from "@/components/automation/automation-schedule"
import { Home, Lightbulb, Monitor, Tv, Thermometer, Wifi, Shield, Zap, Plus, Activity } from "lucide-react"

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

interface Room {
  id: string
  name: string
  icon: any
  devices: Device[]
}

export function HomeAutomationPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [selectedRoom, setSelectedRoom] = useState<string>("all")
  const [devices, setDevices] = useState<Device[]>([
    {
      id: "1",
      name: "Luzes Principais",
      type: "light",
      room: "Sala",
      status: "on",
      powerConsumption: 45,
      lastUpdated: "2024-01-15T14:30:00Z",
      controllable: true,
      properties: { brightness: 80, color: "warm" },
    },
    {
      id: "2",
      name: "Computador Principal",
      type: "computer",
      room: "Escritório",
      status: "on",
      powerConsumption: 250,
      lastUpdated: "2024-01-15T14:25:00Z",
      controllable: true,
      properties: { temperature: 45 },
    },
    {
      id: "3",
      name: "TV Samsung",
      type: "tv",
      room: "Sala",
      status: "off",
      powerConsumption: 0,
      lastUpdated: "2024-01-15T12:00:00Z",
      controllable: true,
      properties: { volume: 25, channel: "Netflix" },
    },
    {
      id: "4",
      name: "Ar Condicionado",
      type: "ac",
      room: "Quarto",
      status: "off",
      powerConsumption: 0,
      lastUpdated: "2024-01-15T08:00:00Z",
      controllable: true,
      properties: { temperature: 22, mode: "cool" },
    },
    {
      id: "5",
      name: "Luzes do Quarto",
      type: "light",
      room: "Quarto",
      status: "off",
      powerConsumption: 0,
      lastUpdated: "2024-01-15T23:00:00Z",
      controllable: true,
      properties: { brightness: 60, color: "cool" },
    },
    {
      id: "6",
      name: "Roteador Wi-Fi",
      type: "router",
      room: "Escritório",
      status: "on",
      powerConsumption: 15,
      lastUpdated: "2024-01-15T14:30:00Z",
      controllable: false,
      properties: { connectedDevices: 12, speed: "300 Mbps" },
    },
    {
      id: "7",
      name: "Sistema de Segurança",
      type: "security",
      room: "Casa",
      status: "on",
      powerConsumption: 25,
      lastUpdated: "2024-01-15T14:30:00Z",
      controllable: true,
      properties: { armed: true, cameras: 4 },
    },
    {
      id: "8",
      name: "TV do Quarto",
      type: "tv",
      room: "Quarto",
      status: "off",
      powerConsumption: 0,
      lastUpdated: "2024-01-15T22:30:00Z",
      controllable: true,
      properties: { volume: 15, channel: "YouTube" },
    },
  ])

  const rooms: Room[] = [
    {
      id: "sala",
      name: "Sala",
      icon: Home,
      devices: devices.filter((d) => d.room === "Sala"),
    },
    {
      id: "quarto",
      name: "Quarto",
      icon: Home,
      devices: devices.filter((d) => d.room === "Quarto"),
    },
    {
      id: "escritorio",
      name: "Escritório",
      icon: Monitor,
      devices: devices.filter((d) => d.room === "Escritório"),
    },
    {
      id: "casa",
      name: "Casa Toda",
      icon: Shield,
      devices: devices.filter((d) => d.room === "Casa"),
    },
  ]

  const handleDeviceToggle = (deviceId: string) => {
    setDevices(
      devices.map((device) =>
        device.id === deviceId
          ? {
              ...device,
              status: device.status === "on" ? "off" : "on",
              powerConsumption: device.status === "on" ? 0 : device.powerConsumption || 50,
              lastUpdated: new Date().toISOString(),
            }
          : device,
      ),
    )
  }

  const handleDeviceUpdate = (deviceId: string, updates: Partial<Device>) => {
    setDevices(devices.map((device) => (device.id === deviceId ? { ...device, ...updates } : device)))
  }

  const getDeviceIcon = (type: Device["type"]) => {
    switch (type) {
      case "light":
        return Lightbulb
      case "computer":
        return Monitor
      case "tv":
        return Tv
      case "ac":
        return Thermometer
      case "router":
        return Wifi
      case "security":
        return Shield
      default:
        return Zap
    }
  }

  const filteredDevices = selectedRoom === "all" ? devices : devices.filter((d) => d.room === selectedRoom)

  const totalPowerConsumption = devices.reduce((total, device) => total + (device.powerConsumption || 0), 0)
  const activeDevices = devices.filter((d) => d.status === "on").length
  const totalDevices = devices.length
  const unavailableDevices = devices.filter((d) => d.status === "unavailable").length

  return (
    <div className="min-h-screen bg-background">
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} currentPage="automacao" />

      <div className="lg:ml-64">
        <Header
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
          title="Automação Residencial"
          subtitle="Controle e monitore todos os dispositivos da sua casa"
        />

        <main className="p-4 lg:p-6 space-y-6">
          {/* Status Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Dispositivos Ativos</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold font-montserrat">
                  {activeDevices}/{totalDevices}
                </div>
                <p className="text-xs text-muted-foreground">
                  {Math.round((activeDevices / totalDevices) * 100)}% ligados
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Consumo Total</CardTitle>
                <Zap className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold font-montserrat">{totalPowerConsumption}W</div>
                <p className="text-xs text-muted-foreground">Consumo atual estimado</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Ambientes</CardTitle>
                <Home className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold font-montserrat">{rooms.length}</div>
                <p className="text-xs text-muted-foreground">Cômodos monitorados</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Status da Rede</CardTitle>
                <Wifi className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold font-montserrat text-green-600">Online</div>
                <p className="text-xs text-muted-foreground">
                  {unavailableDevices > 0 ? `${unavailableDevices} offline` : "Todos conectados"}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <QuickActions devices={devices} onDeviceToggle={handleDeviceToggle} />

          {/* Room Filter */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="font-montserrat">Controle por Ambiente</CardTitle>
                  <CardDescription>Selecione um ambiente para visualizar seus dispositivos</CardDescription>
                </div>
                <Button variant="outline" size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar Dispositivo
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2 mb-4">
                <Button
                  variant={selectedRoom === "all" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedRoom("all")}
                >
                  Todos os Ambientes
                </Button>
                {rooms.map((room) => (
                  <Button
                    key={room.id}
                    variant={selectedRoom === room.name ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedRoom(room.name)}
                    className="flex items-center gap-2"
                  >
                    <room.icon className="h-4 w-4" />
                    {room.name}
                    <Badge variant="secondary" className="ml-1">
                      {room.devices.length}
                    </Badge>
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Devices Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredDevices.map((device) => (
              <DeviceCard
                key={device.id}
                device={device}
                icon={getDeviceIcon(device.type)}
                onToggle={() => handleDeviceToggle(device.id)}
                onUpdate={(updates) => handleDeviceUpdate(device.id, updates)}
              />
            ))}
          </div>

          {filteredDevices.length === 0 && (
            <Card>
              <CardContent className="text-center py-12">
                <Home className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                <h3 className="font-semibold mb-2">Nenhum dispositivo encontrado</h3>
                <p className="text-muted-foreground mb-4">
                  {selectedRoom === "all"
                    ? "Adicione dispositivos para começar a controlar sua casa"
                    : `Nenhum dispositivo encontrado em ${selectedRoom}`}
                </p>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar Primeiro Dispositivo
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Automation Schedule */}
          <AutomationSchedule />
        </main>
      </div>
    </div>
  )
}
