"use client"

import { Label } from "@/components/ui/label"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Checkbox } from "@/components/ui/checkbox"
import { DatePicker } from "@/components/ui/date-picker"
import { Plus, Download, Trash2, Pencil } from "lucide-react"
import { LeadBasicType } from "@/types/lead-type"
import { ModernDashboardLayout } from  '@/components/navbar/modern-dashboard-navbar';
import AddLeadsModal from '@/components/admin/add-leads-modal'
import { useDispatch, useSelector } from "react-redux"
import { AppDispatch, RootState } from "@/lib/redux/store"
import { fetchAllStaffs } from "@/lib/redux/thunk/staffThunk"
export default function LeadsReportPage() {
  const [fromDate, setFromDate] = useState<Date | undefined>(new Date("2025-04-08"))
  const [toDate, setToDate] = useState<Date | undefined>(new Date("2025-04-08"))
  const [leadCategory, setLeadCategory] = useState("All")
  const [leadStatus, setLeadStatus] = useState("All")
  const [priority, setPriority] = useState("All")
  const [leadSource, setLeadSource] = useState("All")
  const [staff, setStaff] = useState("All")
  const [createBy, setCreateBy] = useState("All")
  const [searchQuery, setSearchQuery] = useState("")
  const [entriesPerPage, setEntriesPerPage] = useState("10")
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)

  // Dummy data for demonstration
  const leadData: LeadBasicType[] = [] // Currently no data, matching the image
  const dispatch = useDispatch<AppDispatch>();
  
    const { staffList } = useSelector((state: RootState) => state.staff);
  
  
    useEffect(() => {
      dispatch(fetchAllStaffs());
    }, [dispatch]);
    
  return (
    <ModernDashboardLayout>
      <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900">
      <main className="flex-1 p-6 md:p-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 max-w-5xl">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-50">Leads Report</h1>
            <div className="flex gap-2">
              <Button variant="outline" className="flex items-center gap-2 bg-transparent">
                <Download className="h-4 w-4" />
                Export
              </Button>
              <Button className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white" onClick={()=>setIsAddModalOpen(true)}>
                <Plus className="h-4 w-4" />
                Add Lead
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
              <Select value={leadCategory} onValueChange={setLeadCategory} >
                <SelectTrigger id="lead-category" className="w-full">
                  <SelectValue placeholder="All" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">All</SelectItem>
                  <SelectItem value="Category A">Category A</SelectItem>
                  <SelectItem value="Category B">Category B</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="lead-status">Lead Status</Label>
              <Select value={leadStatus} onValueChange={setLeadStatus}>
                <SelectTrigger id="lead-status" className="w-full">
                  <SelectValue placeholder="All" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">All</SelectItem>
                  <SelectItem value="New">New</SelectItem>
                  <SelectItem value="Contacted">Contacted</SelectItem>
                  <SelectItem value="Qualified">Qualified</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="priority">Priority</Label>
              <Select value={priority} onValueChange={setPriority}>
                <SelectTrigger id="priority" className="w-full">
                  <SelectValue placeholder="All" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">All</SelectItem>
                  <SelectItem value="High">High</SelectItem>
                  <SelectItem value="Medium">Medium</SelectItem>
                  <SelectItem value="Low">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="lead-source">Lead Source</Label>
              <Select value={leadSource} onValueChange={setLeadSource}>
                <SelectTrigger id="lead-source" className="w-full">
                  <SelectValue placeholder="All" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">All</SelectItem>
                  <SelectItem value="Website">Website</SelectItem>
                  <SelectItem value="Referral">Referral</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="staff">Staff</Label>
              <Select value={staff} onValueChange={setStaff}>
                <SelectTrigger id="staff" className="w-full">
                  <SelectValue placeholder="All" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">All</SelectItem>
                  <SelectItem value="John Doe">John Doe</SelectItem>
                  <SelectItem value="Jane Smith">Jane Smith</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="create-by">Create By</Label>
              <Select value={createBy} onValueChange={setCreateBy}>
                <SelectTrigger id="create-by" className="w-full">
                  <SelectValue placeholder="All" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">All</SelectItem>
                  <SelectItem value="Admin">Admin</SelectItem>
                  <SelectItem value="User">User</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <Button className="bg-emerald-500 hover:bg-emerald-600 text-white mb-6">View</Button>

          {/* Table Controls */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-700 dark:text-gray-300">Show</span>
              <Select value={entriesPerPage} onValueChange={setEntriesPerPage}>
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
                    <Checkbox id="select-all" />
                  </TableHead>
                  <TableHead className="w-[50px]">#</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Phone No</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Last Updated</TableHead>
                  <TableHead>Staff</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created Date</TableHead>
                  <TableHead>Created By</TableHead>
                  <TableHead>Cost</TableHead>
                  <TableHead>Lead Source</TableHead>
                  <TableHead className="text-center">Action</TableHead>
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
                        <Checkbox id={`select-lead-${index}`} />
                      </TableCell>
                      <TableCell>{index + 1}</TableCell>
                      <TableCell>{lead.name}</TableCell>
                      <TableCell>{lead.phoneNumber || <span className="text-gray-500">N/A</span>}</TableCell>
                      <TableCell>{lead.category || <span className="text-gray-500">N/A</span>}</TableCell>
                      <TableCell>{lead.updatedAt}</TableCell>
                      <TableCell>{lead.assignedAgent || <span className="text-gray-500">N/A</span>}</TableCell>
                      <TableCell>{lead.status}</TableCell>
                      <TableCell>{lead.createdAt || <span className="text-gray-500">N/A</span>}</TableCell>
                      <TableCell>{lead.createdBy || <span className="text-gray-500">N/A</span>}</TableCell>
                      <TableCell>{lead.cost || <span className="text-gray-500">N/A</span>}</TableCell>
                      <TableCell>{lead.leadSource || <span className="text-gray-500">N/A</span>}</TableCell>
                      <TableCell className="flex justify-center gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-red-500 hover:bg-red-50 dark:hover:bg-red-900"
                        >
                          <Trash2 className="h-4 w-4" />
                          <span className="sr-only">Delete</span>
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900"
                        >
                          <Pencil className="h-4 w-4" />
                          <span className="sr-only">Edit</span>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Bottom Pagination */}
          <div className="flex items-center justify-between mt-4 text-sm text-gray-700 dark:text-gray-300">
            <span>Showing 0 to 0 of 0 entries</span>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" disabled>
                Previous
              </Button>
              <Button variant="outline" size="sm" disabled>
                Next
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
    {isAddModalOpen && (
  <AddLeadsModal open={isAddModalOpen} setOpen={setIsAddModalOpen} />
)}
      </ModernDashboardLayout>
  )
}
