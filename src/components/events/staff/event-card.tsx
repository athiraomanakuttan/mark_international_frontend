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
  
}

export function EventCard({ event, staff }: EventCardProps) {
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
