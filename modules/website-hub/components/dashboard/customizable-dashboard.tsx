"use client"

import { useState, useEffect } from "react"
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core"
import { arrayMove, SortableContext, sortableKeyboardCoordinates, rectSortingStrategy } from "@dnd-kit/sortable"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Settings, Plus, RotateCcw } from "lucide-react"
import { SortableWidget } from "./sortable-widget"
import { WidgetSelector } from "./widget-selector"
import { QuickStatsWidget } from "./widgets/quick-stats-widget"
import { UpcomingBillsWidget } from "./widgets/upcoming-bills-widget"
import { HomeAutomationWidget } from "./widgets/home-automation-widget"
import { AISuggestionsWidget } from "./widgets/ai-suggestions-widget"
import { WeatherWidget } from "./widgets/weather-widget"
import { CalendarWidget } from "./widgets/calendar-widget"
import { usePageConfig } from "@/hooks/use-page-config"

export interface Widget {
  id: string
  type: string
  title: string
  size: "small" | "medium" | "large"
  enabled: boolean
}

const defaultWidgets: Widget[] = [
  { id: "quick-stats", type: "quick-stats", title: "Estatísticas Rápidas", size: "large", enabled: true },
  { id: "upcoming-bills", type: "upcoming-bills", title: "Próximas Contas", size: "medium", enabled: true },
  { id: "home-automation", type: "home-automation", title: "Controle da Casa", size: "medium", enabled: true },
  { id: "ai-suggestions", type: "ai-suggestions", title: "Sugestões IA", size: "large", enabled: true },
  { id: "weather", type: "weather", title: "Clima", size: "small", enabled: false },
  { id: "calendar", type: "calendar", title: "Calendário", size: "medium", enabled: false },
]

export function CustomizableDashboard() {
  const [widgets, setWidgets] = useState<Widget[]>(defaultWidgets)
  const [editMode, setEditMode] = useState(false)
  const [showWidgetSelector, setShowWidgetSelector] = useState(false)

  // Configurar as informações da página
  usePageConfig({
    page: "dashboard",
    title: "Dashboard Customizável",
    subtitle: "Organize seu workspace do jeito que preferir"
  })

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  )

  // Load saved layout from localStorage
  useEffect(() => {
    const savedLayout = localStorage.getItem("dashboard-layout")
    if (savedLayout) {
      try {
        const parsedLayout = JSON.parse(savedLayout)
        setWidgets(parsedLayout)
      } catch (error) {
        console.error("Error loading saved layout:", error)
      }
    }
  }, [])

  // Save layout to localStorage
  const saveLayout = (newWidgets: Widget[]) => {
    localStorage.setItem("dashboard-layout", JSON.stringify(newWidgets))
    setWidgets(newWidgets)
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    if (active.id !== over?.id) {
      const oldIndex = widgets.findIndex((widget) => widget.id === active.id)
      const newIndex = widgets.findIndex((widget) => widget.id === over?.id)

      const newWidgets = arrayMove(widgets, oldIndex, newIndex)
      saveLayout(newWidgets)
    }
  }

  const toggleWidget = (widgetId: string) => {
    const newWidgets = widgets.map((widget) =>
      widget.id === widgetId ? { ...widget, enabled: !widget.enabled } : widget,
    )
    saveLayout(newWidgets)
  }

  const resetLayout = () => {
    saveLayout(defaultWidgets)
    setEditMode(false)
  }

  const renderWidget = (widget: Widget) => {
    switch (widget.type) {
      case "quick-stats":
        return <QuickStatsWidget />
      case "upcoming-bills":
        return <UpcomingBillsWidget />
      case "home-automation":
        return <HomeAutomationWidget />
      case "ai-suggestions":
        return <AISuggestionsWidget />
      case "weather":
        return <WeatherWidget />
      case "calendar":
        return <CalendarWidget />
      default:
        return <div>Widget não encontrado</div>
    }
  }

  const enabledWidgets = widgets.filter((widget) => widget.enabled)

  return (
    <div className="space-y-6">
      {/* Dashboard Controls */}
      <div className="border-b bg-muted/30 -m-4 lg:-m-6 p-4 lg:p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button
              variant={editMode ? "default" : "outline"}
              onClick={() => setEditMode(!editMode)}
              className={editMode ? "bg-cyan-500 hover:bg-cyan-600" : ""}
            >
              <Settings className="h-4 w-4 mr-2" />
              {editMode ? "Finalizar Edição" : "Editar Layout"}
            </Button>
            {editMode && (
              <>
                <Button variant="outline" onClick={() => setShowWidgetSelector(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar Widget
                </Button>
                <Button variant="outline" onClick={resetLayout}>
                    <RotateCcw className="h-4 w-4 mr-2" />
                    Resetar Layout
                  </Button>
                </>
              )}
            </div>
            {editMode && (
              <div className="text-sm text-muted-foreground">
                Arraste os widgets para reorganizar • Clique no X para remover
              </div>
            )}
          </div>
        </div>

        {/* Dashboard Content */}
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={enabledWidgets.map((w) => w.id)} strategy={rectSortingStrategy}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 auto-rows-min">
              {enabledWidgets.map((widget) => (
                <SortableWidget
                  key={widget.id}
                  id={widget.id}
                  widget={widget}
                  editMode={editMode}
                  onRemove={() => toggleWidget(widget.id)}
                >
                  {renderWidget(widget)}
                </SortableWidget>
              ))}
            </div>
          </SortableContext>
        </DndContext>

        {enabledWidgets.length === 0 && (
          <Card className="p-8 text-center">
            <CardContent>
              <p className="text-muted-foreground mb-4">Nenhum widget ativo</p>
              <Button onClick={() => setShowWidgetSelector(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Adicionar Primeiro Widget
              </Button>
            </CardContent>
          </Card>
        )}

      <WidgetSelector
        open={showWidgetSelector}
        onOpenChange={setShowWidgetSelector}
        widgets={widgets}
        onToggleWidget={toggleWidget}
      />
    </div>
  )
}
