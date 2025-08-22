"use client"

import { useEffect, useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { LeadHeader } from "@/components/history/lead-header"
import { FollowupSection } from "@/components/history/followup-section"
import { ActivitiesSection } from "@/components/history/activities-section"
import { DetailsSection } from "@/components/history/details-section"
import { ModernDashboardLayout } from "@/components/navbar/modern-dashboard-navbar"
import { RawLeadData } from "@/types/lead-import"
import { FollowupData, LeadResponse } from "@/types/lead-type"
import { getLeadDataById } from "@/service/leadHistoryService"
import { useParams } from "next/navigation"



const historyData = [
  {
    _id: "68a46c2b70a3411f4ac9310e",
    leadId: "68a46a093c44ff4f1f308a8e",
    historyType: 2,
    updatedStatus: 3,
    createdAt: "2025-08-19T12:20:59.365Z",
    description: "Status updated to 3 by MARK International",
    updatedBy: "MARK International",
  },
  {
    _id: "68a46c0570a3411f4ac930fe",
    leadId: "68a46a093c44ff4f1f308a8e",
    historyType: 4,
    createdAt: "2025-08-19T12:20:21.916Z",
    description: "Transferred from N/A to ATHIRA OMANAKUTTAN by MARK International",
    to: "ATHIRA OMANAKUTTAN",
    updatedBy: "MARK International",
  },
  {
    _id: "68a46a093c44ff4f1f308a90",
    leadId: "68a46a093c44ff4f1f308a8e",
    historyType: 1,
    createdAt: "2025-08-19T12:11:53.120Z",
    description: "Created by MARK International",
    createdBy: "MARK International",
  },
]



export default function LeadHistoryPage() {
  const [activeTab, setActiveTab] = useState("followup")
  const [showAllActivities, setShowAllActivities] = useState(false)
  const [isAddFollowupOpen, setIsAddFollowupOpen] = useState(false)
  const [leadData, setLeadData] = useState<LeadResponse | null>(null)
  const [followupData, setFollowupData] = useState<FollowupData | null>(null)
  const leadId = useParams().leadId

  const getLeadData = async () => {
    try {
      const response = await getLeadDataById(String(leadId))
      const data = response.data
      console.log("response", data)
      setLeadData(data)
      setFollowupData({id: data.id, date: data?.updatedAt, time: "", user: data?.assignedAgent_name , createdDate: data?.createdAt, remarks:data?.remarks, assignedAgentId: data?.assignedAgent_id})
    } catch (error) {
      console.log(error)
    }
  }
  useEffect(() => { getLeadData() },[isAddFollowupOpen])
  return (
    <ModernDashboardLayout>
    <div className="min-h-screen bg-slate-50 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-slate-600 mb-4">
          <span>Lead Management</span>
          <span>›</span>
          <span>Leads</span>
          <span>›</span>
          <span className="text-slate-900 font-medium">Details</span>
        </div>

        <LeadHeader leadData={leadData} />

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 lg:w-auto lg:grid-cols-3 bg-slate-100 border border-slate-200">
            <TabsTrigger
              value="followup"
              className="data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-sm"
            >
              Followup
            </TabsTrigger>
            <TabsTrigger
              value="activities"
              className="data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-sm"
            >
              Activities
            </TabsTrigger>
            <TabsTrigger
              value="details"
              className="data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-sm"
            >
              Details
            </TabsTrigger>
          </TabsList>

          <TabsContent value="followup" className="mt-6">
            <FollowupSection
              followup={followupData}
              isAddFollowupOpen={isAddFollowupOpen}
              setIsAddFollowupOpen={setIsAddFollowupOpen}
            />
          </TabsContent>

          <TabsContent value="activities" className="mt-6">
            <ActivitiesSection
              historyData={historyData}
              showAllActivities={showAllActivities}
              setShowAllActivities={setShowAllActivities}
            />
          </TabsContent>

          <TabsContent value="details" className="mt-6">
            <DetailsSection leadData={leadData} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
    </ModernDashboardLayout>
  )
}
