"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Edit, Trash2, Calendar, MapPin, Users } from "lucide-react"
import type { EventType } from "@/types/event-types"
import { StaffBasicType } from "@/types/staff-type"

interface EventCardProps {
  event: EventType
  staff: StaffBasicType[]
  onEdit: (event: EventType) => void
  onDelete: (eventId: string) => void
}

export function EventCard({ event, staff, onEdit, onDelete }: EventCardProps) {
  const [isHovered, setIsHovered] = useState(false)

  const getStaffNames = () => {
    return staff
      .filter((s) => event.staffIds?.includes(s.id!))
      .map((s) => s.name)
      .join(", ")
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const formatDateRange = () => {
    const start = formatDate(event.startDate);
    const end = formatDate(event.endDate);
    return `${start} - ${end}`;
  }

  return (
    <Card
      className="relative transition-all duration-200 hover:shadow-lg cursor-pointer bg-white border-slate-200 hover:border-slate-300"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {isHovered && (
        <div className="absolute top-2 right-2 flex space-x-1 z-10">
          <Button
            size="sm"
            variant="outline"
            onClick={(e) => {
              e.stopPropagation()
              onEdit(event)
            }}
            className="h-8 w-8 p-0 border-blue-200 text-blue-600 hover:bg-blue-50 hover:border-blue-300"
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={(e) => {
              e.stopPropagation()
              if(event._id)
              onDelete(event._id)
            }}
            className="h-8 w-8 p-0 border-red-200 text-red-500 hover:bg-red-50 hover:border-red-300"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      )}

      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-semibold pr-20 text-slate-900">{event.name}</CardTitle>
      </CardHeader>

      <CardContent className="space-y-3">
        <div className="flex items-center text-sm text-slate-600">
          <Calendar className="h-4 w-4 mr-2 text-blue-500" />
          {formatDateRange()}
        </div>

        <div className="flex items-start text-sm text-slate-600">
          <MapPin className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0 text-green-500" />
          <span className="line-clamp-2">{event.location}</span>
        </div>

        <div className="flex items-start text-sm text-slate-600">
          <Users className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0 text-purple-500" />
          <div className="flex flex-wrap gap-1">
            {event?.staffIds && event?.staffIds?.length > 0 ? (
              <Badge variant="secondary" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
                {event?.staffIds?.length} staff assigned
              </Badge>
            ) : (
              <span className="text-slate-500">No staff assigned</span>
            )}
          </div>
        </div>

        {getStaffNames() && <div className="text-xs text-slate-500 mt-2 line-clamp-2">Staff: {getStaffNames()}</div>}
      </CardContent>
    </Card>
  )
}
