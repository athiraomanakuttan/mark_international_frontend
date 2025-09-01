"use client"

import { Label } from "@/components/ui/label"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DatePicker } from "@/components/ui/date-picker"
import { Plus, Download, Trash2, Pencil, Eye } from "lucide-react"
import type { LeadFilterType, LeadResponse } from "@/types/lead-type"
import { ModernDashboardLayout } from "@/components/navbar/modern-dashboard-navbar"
import AddLeadsModal from "@/components/admin/add-leads-modal"
import { useDispatch, useSelector } from "react-redux"
import type { AppDispatch, RootState } from "@/lib/redux/store"
import { fetchAllStaffs } from "@/lib/redux/thunk/staffThunk"
import { deletelead, getExportLeads, getLeads } from "@/service/admin/leadService"
import { LEAD_TYPES, LEAD_PRIORITIES, LEAD_SOURCES, LEAD_STATUS, statusColors, priorityColors } from "@/data/Lead-data"
import { MultiSelect } from "@/components/ui/multi-select" // Import the new MultiSelect component
import EditLeadsModal from '@/components/admin/edit-leads-modal'
import { toast } from "react-toastify"
import Link from "next/link"

export default function LeadsReportPage() {
  const yesterday = new Date();
  const endOfDay = new Date();
  endOfDay.setHours(23, 59, 59, 999);
yesterday.setDate(yesterday.getDate() - 10);
  const [fromDate, setFromDate] = useState<Date | undefined>(yesterday)
  const [toDate, setToDate] = useState<Date | undefined>(endOfDay)

  const [leadCategory, setLeadCategory] = useState<(string | number)[]>([])
  const [leadStatus, setLeadStatus] = useState<(string | number)[]>([])
  const [priority, setPriority] = useState<(string | number)[]>([])
  const [leadSource, setLeadSource] = useState<(string | number)[]>([])
  const [staff, setStaff] = useState<(string | number)[]>([])
  const [createBy, setCreateBy] = useState<(string | number)[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [entriesPerPage, setEntriesPerPage] = useState("10")
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
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
  const handleLeadUpdate = (lead: LeadResponse)=>{
    setSelectedLead(lead)
  }
  useEffect(()=>{console.log("selectedLeadList", selectedLeadList)},[selectedLeadList]) // come
  


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
  
const handleExport = async () => {
  try {
    const response = await getExportLeads(
      { fromDate, createBy, leadCategory, leadSource, leadStatus, priority, staff, toDate } as LeadFilterType,
      searchQuery
    );

    const blob = new Blob([response.data], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "leads.csv";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  } catch (err) {
    toast.error("Unable to export data. Try again");
  }
};

  const dispatch = useDispatch<AppDispatch>()
  const { staffList } = useSelector((state: RootState) => state.staff)
  
  useEffect(()=>{
    console.log(priority)
  },[priority])
  useEffect(()=>{
    if(selectedLead)
      setIsUpdateModelOpen(true)
  },[selectedLead])

  useEffect(() => {
    dispatch(fetchAllStaffs())
  }, [dispatch])

    const pageRefresh = async ()=>{
       await getLeadList()
    }
  const getLeadList = async () => {
    console.log("ffffffffffffffffffff")
    try {
      const statusParam = leadStatus.length > 0 ? leadStatus.join(",") : "7" // '7' for All, or empty string if backend expects that
      const response = await getLeads(statusParam, paginationData.currentPage, paginationData.limit,{fromDate, createBy,leadCategory, leadSource, leadStatus, priority, staff, toDate} as LeadFilterType, searchQuery)
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
  }, [leadStatus, paginationData.currentPage, paginationData.limit,fromDate,toDate,leadCategory,leadStatus,priority,leadSource,staff,createBy,searchQuery, isAddModalOpen,isUpdateModelOpen]) // Add other filter states here when they are used in getLeads

  useEffect(()=>{
    setPaginationData((prev)=>({...prev,currentPage:1}))
  },[fromDate,toDate,leadCategory,leadStatus,priority,leadSource,staff,createBy,searchQuery])

  // Prepare options for MultiSelect components
  const leadCategoryOptions = LEAD_TYPES.map((item) => ({ value: item.value, label: item.name }))
  const leadStatusOptions = LEAD_STATUS.map((item) => ({ value: item.value, label: item.name }))
  const priorityOptions = LEAD_PRIORITIES.map((item) => ({ value: item.value, label: item.name }))
  const leadSourceOptions = LEAD_SOURCES.map((item) => ({ value: item.value, label: item.name }))
  const staffOptions = staffList.map((item) => ({ value: item.id!, label: item.name }))
  const createByOptions = staffList.map((item) => ({ value: item.id!, label: item.name }))

  return (
    <ModernDashboardLayout>
      <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900">
        <main className="flex-1 p-4 sm:p-6 md:p-2">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 sm:p-6 w-full max-w-none overflow-hidden">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 sm:mb-2 gap-4 sm:gap-0">
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-50">Leads Report</h1>
              <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                <Button variant="outline" className="flex items-center gap-2 bg-transparent w-full sm:w-auto" onClick={handleExport}>
                  <Download className="h-4 w-4" />
                  Export
                </Button>
                <Button
                  className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white w-full sm:w-auto"
                  onClick={() => setIsAddModalOpen(true)}
                >
                  <Plus className="h-4 w-4" />
                  Add Lead
                </Button>
              </div>
            </div>
            {/* Filter Section */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-6">
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
              <div className="grid gap-2">
                <Label htmlFor="priority">Priority</Label>
                <MultiSelect
                  options={priorityOptions}
                  selected={priority}
                  onChange={setPriority}
                  placeholder="Select priorities"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="lead-source">Lead Source</Label>
                <MultiSelect
                  options={leadSourceOptions}
                  selected={leadSource}
                  onChange={setLeadSource}
                  placeholder="Select sources"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="staff">Staff</Label>
                <MultiSelect options={staffOptions} selected={staff} onChange={setStaff} placeholder="Select staff" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="create-by">Create By</Label>
                <MultiSelect
                  options={createByOptions}
                  selected={createBy}
                  onChange={setCreateBy}
                  placeholder="Select creators"
                />
              </div>
            </div>
            <Button className="bg-emerald-500 hover:bg-emerald-600 text-white mb-6 w-full sm:w-auto" onClick={getLeadList}>
              View
            </Button>
            {/* Table Controls */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 gap-4 sm:gap-0">
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <span className="text-sm text-gray-700 dark:text-gray-300 whitespace-nowrap">Show</span>
                <Select
                  value={paginationData.limit.toString()}
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
                <span className="text-sm text-gray-700 dark:text-gray-300 whitespace-nowrap">entries</span>
              </div>
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <Label htmlFor="search" className="sr-only">
                  Search
                </Label>
                <Input
                  id="search"
                  placeholder="Search:"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full sm:w-[200px]"
                />
              </div>
            </div>
            {/* Leads Table */}
            <div className="w-full overflow-x-auto border rounded-md">
            <Table className="min-w-[1200px]">
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[50px]">#</TableHead>
                      <TableHead className="min-w-[120px]">Name</TableHead>
                      <TableHead className="min-w-[120px]">Phone No</TableHead>
                      <TableHead className="min-w-[100px]">Category</TableHead>
                      <TableHead className="min-w-[120px]">Last Updated</TableHead>
                      <TableHead className="min-w-[100px]">Staff</TableHead>
                      <TableHead className="min-w-[100px]">Status</TableHead>
                      <TableHead className="min-w-[120px]">Created Date</TableHead>
                      <TableHead className="min-w-[120px]">Created By</TableHead>
                      <TableHead className="min-w-[80px]">Cost</TableHead>
                      <TableHead className="min-w-[120px]">Lead Source</TableHead>
                      <TableHead className="text-center min-w-[120px]">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {leadData.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={12} className="h-24 text-center text-gray-500 dark:text-gray-400">
                          No data available in table
                        </TableCell>
                      </TableRow>
                    ) : (
                      leadData.map((lead, index) => (
                        <TableRow key={index}>
                          
                          <TableCell>{index + 1}</TableCell>
                           <TableCell>
                            <div className="flex items-center gap-2">
                              {(() => {
                                const priority = LEAD_PRIORITIES.find((data) => data.value === Number(lead.priority));
                                
                                return (
                                  <span
                                    className={`w-3 h-3 rounded-full flex-shrink-0 ${priorityColors[priority?.value ?? -1] || "bg-gray-300"}`}
                                  ></span>
                                );
                              })()}
                              <span className="truncate">{lead.name}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <span className="truncate block">{lead.phoneNumber || <span className="text-gray-500">N/A</span>}</span>
                          </TableCell>
                          <TableCell>
                            <span className="truncate block">
                              {LEAD_TYPES.find((data) => data.value === Number(lead.category))?.name || (
                                <span className="text-gray-500">{lead.category}</span>
                              )}
                            </span>
                          </TableCell>
                          <TableCell>
                            <span className="truncate block">{lead.updatedAt}</span>
                          </TableCell>
                          <TableCell>
                            <span className="truncate block">{lead.assignedAgent_name || <span className="text-gray-500">N/A</span>}</span>
                          </TableCell>
                          <TableCell>
                            {(() => {
                              const status = LEAD_STATUS.find((data) => data.value === Number(lead.status));
                              
                              return (
                                <span className={`truncate block ${statusColors[status?.value ?? -1] || "text-black"}`}>
                                  {status?.name || "N/A"}
                                </span>
                              );
                            })()}
                          </TableCell>
                          <TableCell>
                            <span className="truncate block">{lead.createdAt || <span className="text-gray-500">N/A</span>}</span>
                          </TableCell>
                          <TableCell>
                            <span className="truncate block">{lead.createdByName || <span className="text-gray-500">N/A</span>}</span>
                          </TableCell>
                          <TableCell>
                            <span className="truncate block">{lead.cost || <span className="text-gray-500">0</span>}</span>
                          </TableCell>
                          <TableCell>
                            <span className="truncate block">
                              {LEAD_SOURCES.find((data) => data.value == Number(lead.leadSource))?.name || (
                                <span className="text-gray-500">N/A</span>
                              )}
                            </span>
                          </TableCell>
                          {(lead?.status !==0 && lead.status !== -1) && 
                          <TableCell className="flex justify-center gap-1 sm:gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-red-500 hover:bg-red-50 dark:hover:bg-red-900 h-8 w-8 sm:h-10 sm:w-10"
                              onClick={()=>{handleDelete(lead.id)}}
                            >
                              <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
                              <span className="sr-only">Delete</span>
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900 h-8 w-8 sm:h-10 sm:w-10" 
                              onClick={()=>handleLeadUpdate(lead)}
                            >
                              <Pencil className="h-3 w-3 sm:h-4 sm:w-4" />
                              <span className="sr-only">Edit</span>
                            </Button>
                            <Link href={`/lead-management/lead/${lead.id}`}>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-green-500 hover:bg-green-50 dark:hover:bg-green-900 h-8 w-8 sm:h-10 sm:w-10"
                            >
                              <Eye className="h-3 w-3 sm:h-4 sm:w-4" />
                              <span className="sr-only">View</span>
                            </Button>
                            </Link>
                            
                          </TableCell> }
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              
            </div>
            {/* Bottom Pagination */}
            <div className="flex flex-col sm:flex-row items-center justify-between mt-4 text-sm text-gray-700 dark:text-gray-300 gap-4 sm:gap-0">
              <span className="text-center sm:text-left">Showing page {paginationData.currentPage} of {paginationData.totalPages} pages</span>
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
      {isAddModalOpen && <AddLeadsModal open={isAddModalOpen} setOpen={setIsAddModalOpen} pageRefresh={pageRefresh} />}
      {(isUpdateModelOpen && selectedLead) && <EditLeadsModal leadData={selectedLead} open={isUpdateModelOpen} setOpen={setIsUpdateModelOpen} />}
    </ModernDashboardLayout>
  )
}