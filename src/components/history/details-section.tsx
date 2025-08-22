import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { LEAD_SOURCES, LEAD_STATUS, LEAD_TYPES } from "@/data/Lead-data"
import { LeadResponse } from "@/types/lead-type"



interface DetailsSectionProps {
  leadData: LeadResponse | null
}

export function DetailsSection({ leadData }: DetailsSectionProps) {
  return (
    <Card className="shadow-lg border-slate-200">
      <CardHeader className="bg-gradient-to-r from-slate-50 to-white border-b border-slate-200">
        <h2 className="text-xl font-semibold text-slate-900">Details</h2>
      </CardHeader>
      <CardContent className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="flex justify-between">
              <span className="font-medium text-slate-700">Phone:</span>
              <span className="text-blue-600 font-medium">{leadData?.phoneNumber}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium text-slate-700">Address:</span>
              <span className="text-slate-600">{leadData?.address || "N/A"}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium text-slate-700">Created Date:</span>
              <span className="text-slate-600">{leadData?.createdAt}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium text-slate-700">Created By:</span>
              <span className="text-blue-600 font-medium">{leadData?.createdByName}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium text-slate-700">Lead Category:</span>
              <span className="text-slate-600">{LEAD_TYPES.find((data) => data.value === Number(leadData?.category))?.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium text-slate-700">Assigned Staff:</span>
              <span className="text-slate-600">{leadData?.assignedAgent_name}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium text-slate-700">Cost:</span>
              <span className="text-slate-600">{leadData?.cost || 0}</span>
            </div>
            
            <div className="flex justify-between">
              <span className="font-medium text-slate-700">Lead Method:</span>
              <span className="text-slate-600">{LEAD_SOURCES.find((data) => data.value === leadData?.leadType)?.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium text-slate-700">Current status:</span>
              <span className="text-slate-600">{LEAD_STATUS.find((data) => data.value === leadData?.status)?.name}</span>
            </div>

          </div>
          <div>
            <div className="font-medium mb-2 text-slate-700">Remarks:</div>
            <p className="text-sm text-slate-600 leading-relaxed bg-slate-50 p-4 rounded-lg border border-slate-200">
              {leadData?.remarks}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
