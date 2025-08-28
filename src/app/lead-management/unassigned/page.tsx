"use client"

import { Label } from "@/components/ui/label"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Checkbox } from "@/components/ui/checkbox"
import { DatePicker } from "@/components/ui/date-picker"
import { Plus, Download } from "lucide-react"
import { ModernDashboardLayout } from "@/components/navbar/modern-dashboard-navbar"
import { useDispatch, useSelector } from "react-redux"
import type { AppDispatch, RootState } from "@/lib/redux/store"
import type { LeadFilterType, LeadResponse } from "@/types/lead-type"
import { fetchAllStaffs } from "@/lib/redux/thunk/staffThunk"
import { deletelead, getUnassignedLeads } from "@/service/admin/leadService"
import { LEAD_TYPES, LEAD_PRIORITIES, LEAD_SOURCES, LEAD_STATUS } from "@/data/Lead-data"
import { MultiSelect } from "@/components/ui/multi-select" 
import { toast } from "react-toastify"
import AssignLeadModal from "@/components/admin/assign-staff-modal"

export default function LeadsReportPage() {
  const from = new Date();
from.setDate(from.getDate() - 10);
  const [fromDate, setFromDate] = useState<Date | undefined>(from)
  const [toDate, setToDate] = useState<Date | undefined>(new Date())

  const [leadCategory, setLeadCategory] = useState<(string | number)[]>([])
  const [leadStatus, setLeadStatus] = useState<(string | number)[]>([])
  const [staff, setStaff] = useState<(string | number)[]>([])
  const [createBy, setCreateBy] = useState<(string | number)[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [entriesPerPage, setEntriesPerPage] = useState("10")
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false)
  const [isUpdateModelOpen, setIsUpdateModelOpen] = useState(false)
  const [selectedLead, setSelectedLead]= useState<LeadResponse>()
  const [selectedLeadList, setSelectedLeadList] = useState<string[]>([])
  const [leadData, setLeadData] = useState<LeadResponse[]>([])
  const [paginationData, setPaginationData] = useState({
    currentPage: 1,
    totalPages: 1,
    limit: 10,
    totalItems: 0,
  })
  
  useEffect(()=>{console.log("selectedLeadList", selectedLeadList)},[selectedLeadList]) // come
  

  const handleSelectLead = (leadId: string) => {
  if (leadId === "all") {
    // If all leads are currently selected, deselect all
    if (selectedLeadList.length === leadData.length && leadData.length > 0) {
      setSelectedLeadList([])
    } else {
      // Otherwise, select all leads
      const allLeadIds = leadData.map(lead => lead.id)
      setSelectedLeadList(allLeadIds)
    }
  } else {
    // Handle individual lead selection
    if (selectedLeadList.includes(leadId)) {
      // If lead is already selected, remove it
      setSelectedLeadList(prev => prev.filter(id => id !== leadId))
    } else {
      // If lead is not selected, add it
      setSelectedLeadList(prev => [...prev, leadId])
    }
  }
}

  const  handleDelete = async (leadId: string)=>{
    
    try{
      const response = await deletelead(0,[leadId])
      if(response.status){
        toast.success("lead deleted successfull")
        getLeadList()
      }
    }catch(err){
      toast.error("Lead deleted successfull")
    }
  }
  
  const dispatch = useDispatch<AppDispatch>()
  const { staffList } = useSelector((state: RootState) => state.staff)
  
 
  useEffect(()=>{
    if(selectedLead)
      setIsUpdateModelOpen(true)
  },[selectedLead])

  useEffect(() => {
    dispatch(fetchAllStaffs())
  }, [dispatch])

  const getLeadList = async () => {
    try {
      const statusParam = leadStatus.length > 0 ? leadStatus.join(",") : "7" // '7' for All, or empty string if backend expects that
      const response = await getUnassignedLeads(statusParam, paginationData.currentPage, paginationData.limit,{fromDate, createBy,leadCategory, leadStatus, staff, toDate} as LeadFilterType, searchQuery)
      if (response.status) {
        console.log("lead response", response.data)
        setLeadData(response?.data?.lead)
        setPaginationData((prev) => ({
          ...prev,
          totalPages: Math.ceil(response.data?.totalRecords / paginationData.limit),
        }))
      }
    } catch (error) {
      console.log("Error fetching leads:", error)
    }
  }

  useEffect(() => {
    getLeadList()
  }, [leadStatus, paginationData.currentPage, paginationData.limit,fromDate,toDate,leadCategory,leadStatus,staff,createBy,searchQuery, isAssignModalOpen,isUpdateModelOpen]) // Add other filter states here when they are used in getLeads

  useEffect(()=>{
    setPaginationData((prev)=>({...prev,currentPage:1}))
  },[fromDate,toDate,leadCategory,leadStatus,staff,createBy,searchQuery])

  // Prepare options for MultiSelect components
  const leadCategoryOptions = LEAD_TYPES.map((item) => ({ value: item.value, label: item.name }))
  const leadStatusOptions = LEAD_STATUS.map((item) => ({ value: item.value, label: item.name }))

const leadAssinedSuccess = ()=>{
    getLeadList()
    setSelectedLeadList([])
}
const handleAssignBtn = ()=>{
    if(selectedLeadList.length<=0){
        toast.error("please select at least one lead")
        return
    }
    setIsAssignModalOpen(true)
}
  return (
    <ModernDashboardLayout>
      <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900">
        <main className="flex-1 p-6 md:p-2">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 max-w-6xl">
            <div className="flex items-center justify-between mb-2">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-50">Unassigned Leads</h1>
              <div className="flex gap-2">
                <Button variant="outline" className="flex items-center gap-2 bg-transparent">
                  <Download className="h-4 w-4" />
                  Export
                </Button>
                <Button
                  className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white"
                  onClick={handleAssignBtn}
                >
                  <Plus className="h-4 w-4" />
                  Assign Staff
                </Button>
              </div>
            </div>
            {/* Filter Section */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <div className="grid gap-2">
                <Label htmlFor="from-date">From Date (Created Date)</Label>
                <DatePicker date={fromDate} setDate={setFromDate} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="to-date">To Date (Created Date)</Label>
                <DatePicker date={toDate} setDate={setToDate} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="lead-category">Lead Category</Label>
                <MultiSelect
                  options={leadCategoryOptions}
                  selected={leadCategory}
                  onChange={setLeadCategory}
                  placeholder="Select categories"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="lead-status">Lead Status</Label>
                <MultiSelect
                  options={leadStatusOptions}
                  selected={leadStatus}
                  onChange={setLeadStatus}
                  placeholder="Select statuses"
                />
              </div>
              
              
            </div>
            <Button className="bg-emerald-500 hover:bg-emerald-600 text-white mb-6" onClick={getLeadList}>
              View
            </Button>
            {/* Table Controls */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-700 dark:text-gray-300">Show</span>
                <Select
                  value={entriesPerPage}
                  onValueChange={(value) => setPaginationData((prev) => ({ ...prev, limit: Number(value) }))}
                >
                  <SelectTrigger className="w-[70px]">
                    <SelectValue placeholder="10" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="10">10</SelectItem>
                    <SelectItem value="25">25</SelectItem>
                    <SelectItem value="50">50</SelectItem>
                  </SelectContent>
                </Select>
                <span className="text-sm text-gray-700 dark:text-gray-300">entries</span>
              </div>
              <div className="flex items-center gap-2">
                <Label htmlFor="search" className="sr-only">
                  Search
                </Label>
                <Input
                  id="search"
                  placeholder="Search:"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-[200px]"
                />
              </div>
            </div>
            {/* Leads Table */}
            <div className="overflow-x-auto border rounded-md">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[40px]">
                      <Checkbox id="select-all"  onCheckedChange={()=>handleSelectLead("all")}/>
                    </TableHead>
                    <TableHead className="w-[50px]">#</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Phone No</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {leadData.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={13} className="h-24 text-center text-gray-500 dark:text-gray-400">
                        No data available in table
                      </TableCell>
                    </TableRow>
                  ) : (
                    leadData.map((lead, index) => (
                      <TableRow key={index}>
                        <TableCell>
                          <Checkbox 
        id={`select-lead-${index}`} 
        checked={selectedLeadList.includes(lead.id)}
        onCheckedChange={() => handleSelectLead(lead.id)}
      />
                        </TableCell>
                        <TableCell>{index + 1}</TableCell>
                        <TableCell>{lead.name}</TableCell>
                        <TableCell>{lead.phoneNumber || <span className="text-gray-500">N/A</span>}</TableCell>
                        <TableCell>
                          {LEAD_TYPES.find((data) => data.value === Number(lead.category))?.name || (
                            <span className="text-gray-500">{lead.category}</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {LEAD_STATUS.find((data) => data.value === Number(lead.status))?.name || "N/A"}
                        </TableCell>
                        <TableCell>{lead.createdAt || <span className="text-gray-500">N/A</span>}</TableCell>
                        
        
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
            {/* Bottom Pagination */}
            <div className="flex items-center justify-between mt-4 text-sm text-gray-700 dark:text-gray-300">
              <span>Showing page {paginationData.currentPage}  of {paginationData.totalPages} pages</span>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={paginationData.currentPage === 1}
                  onClick={() => setPaginationData((prev) => ({ ...prev, currentPage: prev.currentPage - 1 }))}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={paginationData.currentPage >= paginationData.totalPages}
                  onClick={() => setPaginationData((prev) => ({ ...prev, currentPage: prev.currentPage + 1 }))}
                >
                  Next
                </Button>
              </div>
            </div>
          </div>
        </main>
      </div>
      {isAssignModalOpen && <AssignLeadModal leadList={selectedLeadList} open={isAssignModalOpen} setOpen={setIsAssignModalOpen} leadAssinedSuccess={leadAssinedSuccess}  />}
      </ModernDashboardLayout>
  )
}
