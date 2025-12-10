"use client"

import { Label } from "@/components/ui/label"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Checkbox } from "@/components/ui/checkbox"
import { DatePicker } from "@/components/ui/date-picker"
import {  Download, Trash, Redo, RefreshCcw, Eye } from "lucide-react"
import type { LeadFilterType, LeadResponse } from "@/types/lead-type"
import { ModernDashboardLayout } from "@/components/navbar/modern-dashboard-navbar"
import { useDispatch, useSelector } from "react-redux"
import type { AppDispatch, RootState } from "@/lib/redux/store"
import { fetchAllStaffs } from "@/lib/redux/thunk/staffThunk"
import { deletelead, getExportLeads, getLeads, updateLead } from "@/service/admin/leadService"
import { LEAD_TYPES, LEAD_PRIORITIES, LEAD_SOURCES, LEAD_STATUS } from "@/data/Lead-data"
import { MultiSelect } from "@/components/ui/multi-select" // Import the new MultiSelect component
import { toast } from "react-toastify"
import Link from "next/link"
import { DATA_LIMIT } from "@/data/limitData"

export default function LeadsReportPage() {
  const yesterday = new Date();
yesterday.setDate(yesterday.getDate() - 1);
  const [fromDate, setFromDate] = useState<Date | undefined>()
  const [toDate, setToDate] = useState<Date | undefined>()

  const [leadCategory, setLeadCategory] = useState<(string | number)[]>([])
  const [leadStatus, setLeadStatus] = useState<(string | number)[]>([0])
  const [priority, setPriority] = useState<(string | number)[]>([])
  const [leadSource, setLeadSource] = useState<(string | number)[]>([])
  const [staff, setStaff] = useState<(string | number)[]>([])
  const [createBy, setCreateBy] = useState<(string | number)[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [entriesPerPage, setEntriesPerPage] = useState(DATA_LIMIT[0].toString())
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isUpdateModelOpen, setIsUpdateModelOpen] = useState(false)
  const [selectedLead, setSelectedLead]= useState<LeadResponse>()
   const [selectedLeadList, setSelectedLeadList] = useState<string[]>([]);
  const [leadData, setLeadData] = useState<LeadResponse[]>([])
  const [paginationData, setPaginationData] = useState({
    currentPage: 1,
    totalPages: 1,
    limit: DATA_LIMIT[0],
    totalItems: 0,
  })
  const handleLeadUpdate =async  (lead: string)=>{
    try {
      const response = await updateLead(lead,{status: 1})
      if(response.status){
        toast.success("Lead Re stored");
        getLeadList()
      }
    } catch (error) {
      toast.error("Some error occured Try again")
    }
  }
  

  
  const handleSelectLead = (leadId: string) => {
    if (leadId === "all") {
      if (selectedLeadList.length === leadData.length && leadData.length > 0) {
        setSelectedLeadList([]);
      } else {
        const allLeadIds = leadData.map((data) => data.id);
        setSelectedLeadList(allLeadIds);
      }
    } else {
      if (selectedLeadList.indexOf(leadId) === -1) {
        setSelectedLeadList((prev) => [...prev, leadId]);
      } else {
        const filteredData = selectedLeadList.filter((id) => id !== leadId);
        setSelectedLeadList(filteredData);
      }
    }
  };

  const handleSelectAllSimple = () => {
    if (selectedLeadList.length === leadData.length) {
      setSelectedLeadList([]);
    } else {
      const allLeadIds = leadData.map((data) => data.id);
      setSelectedLeadList(allLeadIds);
    }
  };
  const dispatch = useDispatch<AppDispatch>()
  const { staffList } = useSelector((state: RootState) => state.staff)

  useEffect(()=>{
    if(selectedLead)
      setIsUpdateModelOpen(true)
  },[selectedLead])

  useEffect(() => {
    dispatch(fetchAllStaffs())
  }, [dispatch])

  const handleDelete = async ()=>{
    if(selectedLeadList.length === 0){
        toast.error("select atleast one lead")
        return
    }
    try {
        const response = await deletelead(-1,selectedLeadList)
        if(response.status){
            toast.success("Lead Deleted successfully")
            getLeadList()
        }
    } catch (error) {
        toast.error("unable to delete lead. try again !")
    }
  }

  const getLeadList = async () => {
    try {
      const statusParam = leadStatus.length > 0 ? leadStatus.join(",") : "7" // '7' for All, or empty string if backend expects that
      const response = await getLeads(statusParam, paginationData.currentPage, paginationData.limit,{fromDate, createBy,leadCategory, leadSource, leadStatus, priority, staff, toDate} as LeadFilterType, searchQuery)
      if (response.status) {
        setLeadData(response?.data?.lead)
        setPaginationData((prev) => ({
          ...prev,
          totalPages: Math.ceil(response.data?.totalRecords / paginationData.limit),
        }))
      }
    } catch (error) {
    }
  }

  const handleExport = async () => {
  try {
    const response = await getExportLeads({fromDate, createBy,leadCategory, leadSource, leadStatus, priority, staff, toDate} as LeadFilterType, searchQuery);

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
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-50">Deleted Leads Report</h1>
              <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                <Button variant="outline" className="flex items-center gap-2 bg-transparent w-full sm:w-auto" onClick={handleExport}>
                  <Download className="h-4 w-4" />
                  Export
                </Button>
                <Button className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white w-full sm:w-auto" onClick={handleDelete}>
                  <Trash className="h-4 w-4" />
                  Delete Lead
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
                <Label htmlFor="staff">Staff</Label>
                <MultiSelect options={staffOptions} selected={staff} onChange={setStaff} placeholder="Select staff" />
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
                    <SelectValue placeholder={DATA_LIMIT[0].toString()} />
                  </SelectTrigger>
                  <SelectContent>
                    {DATA_LIMIT.map((limit) => (
                      <SelectItem key={limit} value={limit.toString()}>{limit}</SelectItem>
                    ))}
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
                      <TableHead className="w-[40px]">
                        <Checkbox
                          id="select-all"
                          checked={
                            selectedLeadList.length === leadData.length &&
                            leadData.length > 0
                          }
                          onCheckedChange={handleSelectAllSimple}
                        />
                      </TableHead>
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
                      <TableHead className="min-w-[120px]">Action</TableHead>
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
                          <TableCell>
                            <span className="truncate block">{lead.name}</span>
                          </TableCell>
                          <TableCell>
                            <span className="truncate block">
                              {lead.phoneNumber || <span className="text-gray-500">N/A</span>}
                            </span>
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
                            <span className="truncate block">
                              {lead.assignedAgent_name || <span className="text-gray-500">N/A</span>}
                            </span>
                          </TableCell>
                          <TableCell>
                            <span className="truncate block">
                              <label className="text-red-500">{LEAD_STATUS.find((data) => data.value === Number(lead.status))?.name || "N/A"}</label>
                            </span>
                          </TableCell>
                          <TableCell>
                            <span className="truncate block">
                              {lead.createdAt || <span className="text-gray-500">N/A</span>}
                            </span>
                          </TableCell>
                          <TableCell>
                            <span className="truncate block">
                              {lead.createdByName || <span className="text-gray-500">N/A</span>}
                            </span>
                          </TableCell>
                          <TableCell>
                            <span className="truncate block">
                              {lead.cost || <span className="text-gray-500">0</span>}
                            </span>
                          </TableCell>
                          <TableCell>
                            <span className="truncate block">
                              {LEAD_SOURCES.find((data) => data.value == Number(lead.leadSource))?.name || (
                                <span className="text-gray-500">N/A</span>
                              )}
                            </span>
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-1 sm:gap-2">
                              <Button 
                                className="h-8 w-8 sm:h-10 sm:w-10" 
                                size="icon" 
                                onClick={()=>handleLeadUpdate(lead.id)}
                              >
                                <RefreshCcw className="h-3 w-3 sm:h-4 sm:w-4"/>
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
                            </div>
                          </TableCell>
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
    </ModernDashboardLayout>
  )
}