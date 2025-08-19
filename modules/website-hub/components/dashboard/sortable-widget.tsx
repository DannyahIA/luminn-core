"use client"

import type React from "react"

import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { GripVertical, X } from "lucide-react"
import type { Widget } from "./customizable-dashboard"

interface SortableWidgetProps {
  id: string
  widget: Widget
  editMode: boolean
  onRemove: () => void
  children: React.ReactNode
}

export function SortableWidget({ id, widget, editMode, onRemove, children }: SortableWidgetProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  const getGridSpan = (size: string) => {
    switch (size) {
      case "small":
        return "md:col-span-1"
      case "medium":
        return "md:col-span-2 lg:col-span-2"
      case "large":
        return "md:col-span-2 lg:col-span-3 xl:col-span-4"
      default:
        return "md:col-span-1"
    }
  }

  return (
    <div ref={setNodeRef} style={style} className={`${getGridSpan(widget.size)} relative group`}>
      <Card className={`h-full ${editMode ? "ring-2 ring-cyan-200 ring-offset-2" : ""}`}>
        {editMode && (
          <div className="absolute top-2 right-2 z-10 flex gap-1">
            <Button
              variant="outline"
              size="sm"
              className="h-8 w-8 p-0 bg-white/90 hover:bg-white"
              {...attributes}
              {...listeners}
            >
              <GripVertical className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="h-8 w-8 p-0 bg-white/90 hover:bg-red-50 hover:text-red-600"
              onClick={onRemove}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        )}
        {children}
      </Card>
    </div>
  )
}
