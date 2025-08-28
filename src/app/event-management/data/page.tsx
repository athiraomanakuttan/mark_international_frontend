"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ArrowLeft, Users, Calendar, MapPin, Download, ChevronLeft, ChevronRight } from "lucide-react"
import { useRouter } from "next/navigation"
import { getRecentEvents, getStudentData } from "@/service/eventService"
import { IEventWithStaff, IStudentData } from "@/types/event-types"
import { ModernDashboardLayout } from "@/components/navbar/modern-dashboard-navbar"
import { toast } from "react-toastify"
import * as XLSX from 'xlsx'

export default function DataViewPage() {
  const router = useRouter()
  const [selectedEvent, setSelectedEvent] = useState<string>("")
  const [selectedStaff, setSelectedStaff] = useState<string>("")
  const [sampleEvents, setSampleEvents] = useState<IEventWithStaff[]>([])
  const [availableStaff, setAvailableStaff] = useState<Array<{ _id: string; name: string }>>([])
  const [filteredStudents, setFilteredStudents] = useState<IStudentData[]>([])
  const [sampleStudentData, setSampleStudentData] = useState<IStudentData[]>([])
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(10)
  
  // Calculate pagination
  const totalItems = filteredStudents.length
  const totalPages = Math.ceil(totalItems / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentStudents = filteredStudents.slice(startIndex, endIndex)

  // Update available staff when event is selected
  useEffect(() => {
    if (selectedEvent) {
      const event = sampleEvents.find((e) => e._id === selectedEvent)
      setAvailableStaff(event?.staffIds || [])
      setSelectedStaff("") // Reset staff selection
    } else {
      setAvailableStaff([])
      setSelectedStaff("")
    }
  }, [selectedEvent])

  // Filter students based on selected event and staff
  useEffect(() => {
    let filtered = sampleStudentData

    if (selectedEvent) {
      filtered = filtered.filter((student) => student.eventId === selectedEvent)
    }

    if (selectedStaff) {
      filtered = filtered.filter((student) => student.staffId._id === selectedStaff)
    }

    setFilteredStudents(filtered)
    setCurrentPage(1) // Reset to first page when filters change
  }, [selectedEvent, selectedStaff, sampleStudentData])

  const selectedEventData = sampleEvents.find((e: any) => e._id === selectedEvent)
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await getRecentEvents();
        if (response.status) {
          // Convert date fields into real Date objects
          const eventsWithDate = response.data.map((event: any) => ({
            ...event,
            date: new Date(event.date),
          }));
          setSampleEvents(eventsWithDate);
        }
      } catch (error) {
        console.error("Error fetching recent events:", error);
      }
    };

    fetchData();
  }, []);

  const getStudentDetails = async () => {
    try {
      const response = await getStudentData(selectedEvent, selectedStaff);
      if (response.status) {
        setSampleStudentData(response.data)
        setFilteredStudents(response.data)
      }
    } catch (err) {
      toast.error("Error fetching data. Try again");
    }
  };

  useEffect(() => {
    if (selectedEvent) {
      getStudentDetails();
    }
  }, [selectedEvent, selectedStaff]);

  // Export to Excel function
  const exportToExcel = () => {
    if (filteredStudents.length === 0) {
      toast.error("No data to export");
      return;
    }

    // Prepare data for Excel
    const exportData = filteredStudents.map((student) => ({
      Name: student.name,
      Phone: student.phoneNumber,
      Email: student.email || 'N/A',
      Address: student.address || 'N/A',
      'Preferred Countries': student?.preferredCountry?.join(', ') || 'N/A',
      'Created Staff': student?.staffId?.name || 'N/A',
      Date: new Date(student?.createdAt || "").toLocaleDateString()
    }));

    // Create workbook and worksheet
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(exportData);

    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(wb, ws, "Student Data");

    // Generate filename with event name and current date
    const eventName = selectedEventData?.name || "All Events";
    const currentDate = new Date().toISOString().split('T')[0];
    const filename = `Student_Data_${eventName}_${currentDate}.xlsx`;

    // Save file
    XLSX.writeFile(wb, filename);
    toast.success("Data exported successfully!");
  };

  // Pagination handlers
  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const goToPreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  return (
    <ModernDashboardLayout>
      <div className="min-h-screen bg-slate-50">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-slate-900 mb-2">Student Data Overview</h1>
              <p className="text-slate-600">View and filter collected student registration data</p>
            </div>

            {/* Filter Controls */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-blue-600" />
                    Select Event
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Select value={selectedEvent} onValueChange={setSelectedEvent}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose an event..." />
                    </SelectTrigger>
                    <SelectContent>
                      {sampleEvents.map((event) => (
                        <SelectItem key={event._id} value={event._id}>
                          {event.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Users className="w-5 h-5 text-green-600" />
                    Select Staff
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Select value={selectedStaff} onValueChange={setSelectedStaff} disabled={!selectedEvent}>
                    <SelectTrigger>
                      <SelectValue placeholder={selectedEvent ? "Choose staff member..." : "Select event first"} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">
                        all
                      </SelectItem>
                      {availableStaff.map((staff) => (
                        <SelectItem key={staff._id} value={staff._id}>
                          {staff.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </CardContent>
              </Card>
            </div>

            {/* Event Details */}
            {selectedEventData && (
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle className="text-xl text-slate-900">Event Details</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-blue-600" />
                      <span className="text-sm text-slate-600">Date:</span>
                      <span className="font-medium">{selectedEventData.date.toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-red-600" />
                      <span className="text-sm text-slate-600">Location:</span>
                      <span className="font-medium">{selectedEventData.location}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-green-600" />
                      <span className="text-sm text-slate-600">Staff Count:</span>
                      <span className="font-medium">{selectedEventData.staffIds.length}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Student Data Table */}
            <Card>
              <CardHeader>
                <CardTitle className="text-xl text-slate-900 flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    Student Registration Data
                    <span className="text-sm font-normal text-slate-600">
                      {filteredStudents.length} student{filteredStudents.length !== 1 ? "s" : ""}
                    </span>
                  </span>
                  <Button 
                    onClick={exportToExcel}
                    disabled={filteredStudents.length === 0}
                    className="flex items-center gap-2"
                    variant="outline"
                  >
                    <Download className="w-4 h-4" />
                    Export Excel
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Phone</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Address</TableHead>
                        <TableHead>Preferred Countries</TableHead>
                        <TableHead>Created staff</TableHead>
                        <TableHead>Date</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {currentStudents.length > 0 ? (
                        currentStudents.map((student) => (
                          <TableRow key={student._id}>
                            <TableCell className="font-medium">{student.name}</TableCell>
                            <TableCell>{student.phoneNumber}</TableCell>
                            <TableCell>{student.email || <span className="text-slate-400">N/A</span>}</TableCell>
                            <TableCell>
                              {student.address || <span className="text-slate-400">N/A</span>}
                            </TableCell>
                            <TableCell>
                              <div className="flex flex-wrap gap-1">
                                {student?.preferredCountry?.map((country, index) => (
                                  <span
                                    key={index}
                                    className="inline-block px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full"
                                  >
                                    {country}
                                  </span>
                                ))}
                              </div>
                            </TableCell>
                            <TableCell>{student?.staffId?.name || <span className="text-slate-400">N/A</span>}</TableCell>
                            <TableCell>{new Date(student?.createdAt || "").toLocaleDateString()}</TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center py-8 text-slate-500">
                            No student data found for the selected filters
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>

                {/* Pagination */}
                {filteredStudents.length > 0 && (
                  <div className="flex items-center justify-between mt-6">
                    <div className="text-sm text-slate-600">
                      Showing {startIndex + 1} to {Math.min(endIndex, totalItems)} of {totalItems} students
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={goToPreviousPage}
                        disabled={currentPage === 1}
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </Button>
                      
                      {/* Page numbers */}
                      <div className="flex items-center gap-1">
                        {Array.from({ length: totalPages }, (_, i) => i + 1)
                          .filter(page => {
                            // Show first page, last page, current page, and pages around current
                            return page === 1 || 
                                   page === totalPages || 
                                   (page >= currentPage - 1 && page <= currentPage + 1)
                          })
                          .map((page, index, array) => {
                            // Add ellipsis if there's a gap
                            const showEllipsisBefore = index > 0 && array[index - 1] < page - 1
                            return (
                              <div key={page} className="flex items-center">
                                {showEllipsisBefore && <span className="px-2 text-slate-400">...</span>}
                                <Button
                                  variant={currentPage === page ? "default" : "outline"}
                                  size="sm"
                                  onClick={() => goToPage(page)}
                                  className="min-w-[2.5rem]"
                                >
                                  {page}
                                </Button>
                              </div>
                            )
                          })}
                      </div>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={goToNextPage}
                        disabled={currentPage === totalPages}
                      >
                        <ChevronRight className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </ModernDashboardLayout>
  )
}