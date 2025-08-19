"use client"

interface Event {
  id: string
  title: string
  date: string
  time: string
  type: string
  calendar: string
  color: string
  amount?: number
}

interface CalendarGridProps {
  currentDate: Date
  events: Event[]
}

export function CalendarGrid({ currentDate, events }: CalendarGridProps) {
  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()

  // Get first day of month and number of days
  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)
  const daysInMonth = lastDay.getDate()
  const startingDayOfWeek = firstDay.getDay()

  // Create array of days
  const days = []

  // Add empty cells for days before month starts
  for (let i = 0; i < startingDayOfWeek; i++) {
    days.push(null)
  }

  // Add days of month
  for (let day = 1; day <= daysInMonth; day++) {
    days.push(day)
  }

  const getEventsForDay = (day: number) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`
    return events.filter((event) => event.date === dateStr)
  }

  const weekDays = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"]

  return (
    <div className="grid grid-cols-7 gap-1">
      {/* Week day headers */}
      {weekDays.map((day) => (
        <div key={day} className="p-2 text-center font-medium text-gray-500 text-sm">
          {day}
        </div>
      ))}

      {/* Calendar days */}
      {days.map((day, index) => {
        if (!day) {
          return <div key={index} className="p-2 h-24" />
        }

        const dayEvents = getEventsForDay(day)
        const isToday = new Date().toDateString() === new Date(year, month, day).toDateString()

        return (
          <div
            key={day}
            className={`p-2 h-24 border border-gray-200 rounded-lg ${
              isToday ? "bg-cyan-50 border-cyan-200" : "bg-white hover:bg-gray-50"
            }`}
          >
            <div className={`text-sm font-medium mb-1 ${isToday ? "text-cyan-600" : "text-gray-900"}`}>{day}</div>
            <div className="space-y-1">
              {dayEvents.slice(0, 2).map((event) => (
                <div
                  key={event.id}
                  className={`text-xs p-1 rounded truncate bg-${event.color}-100 text-${event.color}-800`}
                >
                  {event.title}
                  {event.amount && <span className="ml-1 font-medium">R$ {event.amount.toFixed(0)}</span>}
                </div>
              ))}
              {dayEvents.length > 2 && <div className="text-xs text-gray-500">+{dayEvents.length - 2} mais</div>}
            </div>
          </div>
        )
      })}
    </div>
  )
}
