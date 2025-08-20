"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"

interface HistoryData {
  _id: string
  leadId: string
  historyType: number
  updatedStatus?: number
  createdAt: string
  description: string
  updatedBy?: string
  createdBy?: string
  to?: string
}

interface ActivitiesSectionProps {
  historyData: HistoryData[]
  showAllActivities: boolean
  setShowAllActivities: (show: boolean) => void
}

const getHistoryTypeColor = (historyType: number) => {
  switch (historyType) {
    case 1:
      return "bg-gradient-to-r from-green-50 to-green-100 text-green-700 border-green-300"
    case 2:
      return "bg-gradient-to-r from-blue-50 to-blue-100 text-blue-700 border-blue-300"
    case 4:
      return "bg-gradient-to-r from-orange-50 to-orange-100 text-orange-700 border-orange-300"
    default:
      return "bg-gradient-to-r from-slate-50 to-slate-100 text-slate-700 border-slate-300"
  }
}

const getHistoryTypeIcon = (historyType: number) => {
  switch (historyType) {
    case 1:
      return "👤"
    case 2:
      return "📊"
    case 4:
      return "🔄"
    default:
      return "📝"
  }
}

export function ActivitiesSection({ historyData, showAllActivities, setShowAllActivities }: ActivitiesSectionProps) {
  const displayedActivities = showAllActivities ? historyData : historyData.slice(0, 10)

  return (
    <Card className="shadow-lg border-slate-200">
      <CardHeader className="bg-gradient-to-r from-slate-50 to-white border-b border-slate-200">
        <h2 className="text-xl font-semibold text-slate-900">Activities</h2>
      </CardHeader>
      <CardContent className="p-6">
        <div className="space-y-4">
          {displayedActivities.map((activity) => (
            <div key={activity._id} className="flex gap-4">
              <div className="flex flex-col items-center">
                <div
                  className={`rounded-full p-2 text-lg border shadow-sm ${getHistoryTypeColor(activity.historyType)}`}
                >
                  {getHistoryTypeIcon(activity.historyType)}
                </div>
                <div className="w-px bg-slate-300 h-8 mt-2"></div>
              </div>
              <div className="flex-1">
                <div className="text-sm font-medium mb-1 text-slate-800">
                  {activity.updatedBy || activity.createdBy}
                </div>
                <div className="text-sm text-slate-600 mb-1">{activity.description}</div>
                <div className="text-xs text-slate-500">{new Date(activity.createdAt).toLocaleString()}</div>
              </div>
            </div>
          ))}
          {historyData.length > 10 && !showAllActivities && (
            <Button
              variant="outline"
              onClick={() => setShowAllActivities(true)}
              className="w-full mt-4 border-slate-300 text-slate-600 hover:bg-slate-50"
            >
              View More ({historyData.length - 10} more activities)
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
