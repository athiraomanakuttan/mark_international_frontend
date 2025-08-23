"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { getHistoryTypeIcon, getHistoryTypeColor } from "@/data/history-page-data"
import { LEAD_SOURCES, LEAD_STATUS } from "@/data/Lead-data"
import { getLeadHistory } from "@/service/leadHistoryService"
import { HistoryData  } from "@/types/history-type"
import { useEffect, useState } from "react"


interface ActivitiesSectionProps {
  leadId: string,
  showAllActivities: boolean
  setShowAllActivities: (show: boolean) => void
}





export function ActivitiesSection({ leadId, showAllActivities, setShowAllActivities }: ActivitiesSectionProps) {

  const [ historyData, setHistoryData] = useState<HistoryData[]>([])
  const displayedActivities = showAllActivities ? historyData : historyData.slice(0, 10)
  const getLeadData = async () => {
    try {
      const response = await getLeadHistory(leadId)
      if(response.status)
      setHistoryData(response.data)
    } catch (error) {
      console.error("Error fetching lead history:", error)
    }
  }

  useEffect(() => { getLeadData() },[])

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
                <div className="text-sm text-slate-600 mb-1">{activity.historyType!==2 ? activity.description : `Lead Status updated to ${LEAD_STATUS.find((data)=> data.value === activity.updatedStatus)?.name} by ${activity.updatedBy}` }</div>
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
