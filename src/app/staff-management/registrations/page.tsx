"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table"
import { Eye, Search, Calendar, User, Phone, MapPin, FileText, ChevronLeft, ChevronRight, Download } from "lucide-react"
import { toast } from "react-toastify"
import { getRegistrations, getRegistrationById } from "@/service/registrationService"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { ModernDashboardLayout } from "@/components/navbar/modern-dashboard-navbar"

interface Registration {
  _id: string
  name: string
  dateOfBirth: string
  contactNumber: string
  maritalStatus: string
  address: {
    street: string
    city: string
    state: string
    pincode: string
    country: string
  }
  documents: Array<{
    title: string
    url: string
    uploadedAt: string
  }>
  status: number
  createdAt: string
  updatedAt: string
}

interface RegistrationListResponse {
  success: boolean
  message: string
  data: Registration[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export default function RegistrationsPage() {
  const [registrations, setRegistrations] = useState<Registration[]>([])
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [pageLimit, setPageLimit] = useState(10)
  const [totalPages, setTotalPages] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const [hasNextPage, setHasNextPage] = useState(false)
  const [hasPrevPage, setHasPrevPage] = useState(false)
  
  // Modal state
  const [selectedRegistration, setSelectedRegistration] = useState<Registration | null>(null)
  const [modalLoading, setModalLoading] = useState(false)
  const [showModal, setShowModal] = useState(false)

  // Fetch registrations
  const fetchRegistrations = async (page: number, limit: number) => {
    try {
      setLoading(true)
      const response = await getRegistrations(page, limit) as RegistrationListResponse
      
      if (response.success) {
        setRegistrations(response.data)
        setTotalPages(response.pagination.totalPages)
        setTotalCount(response.pagination.total)
        setCurrentPage(response.pagination.page)
        setHasNextPage(response.pagination.page < response.pagination.totalPages)
        setHasPrevPage(response.pagination.page > 1)
      } else {
        toast.error("Failed to fetch registrations")
      }
    } catch (error) {
      console.error("Error fetching registrations:", error)
      toast.error("Failed to fetch registrations")
    } finally {
      setLoading(false)
    }
  }

  // View registration details
  const viewRegistration = async (registrationId: string) => {
    try {
      setModalLoading(true)
      setShowModal(true)
      const response = await getRegistrationById(registrationId)
      
      if ((response as any).success || (response as any).status) {
        setSelectedRegistration((response as any).data)
      } else {
        toast.error("Failed to fetch registration details")
        setShowModal(false)
      }
    } catch (error) {
      console.error("Error fetching registration details:", error)
      toast.error("Failed to fetch registration details")
      setShowModal(false)
    } finally {
      setModalLoading(false)
    }
  }

  // Handle page change
  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page)
      fetchRegistrations(page, pageLimit)
    }
  }

  // Handle page limit change
  const handlePageLimitChange = (limit: string) => {
    const newLimit = parseInt(limit)
    setPageLimit(newLimit)
    setCurrentPage(1)
    fetchRegistrations(1, newLimit)
  }

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  // Download document
  const downloadDocument = async (url: string, filename: string) => {
    try {
      const response = await fetch(url)
      const blob = await response.blob()
      const downloadUrl = window.URL.createObjectURL(blob)
      
      const link = document.createElement('a')
      link.href = downloadUrl
      link.download = filename
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      
      window.URL.revokeObjectURL(downloadUrl)
      toast.success('Document downloaded successfully!')
    } catch (error) {
      console.error('Error downloading document:', error)
      toast.error('Failed to download document')
    }
  }

  // Get status badge
  const getStatusBadge = (status: number) => {
    switch (status) {
      case 1:
        return <Badge variant="default" className="bg-green-500">Active</Badge>
      case 0:
        return <Badge variant="secondary">Inactive</Badge>
      default:
        return <Badge variant="outline">Unknown</Badge>
    }
  }

  useEffect(() => {
    fetchRegistrations(currentPage, pageLimit)
  }, [])

  return (
    <ModernDashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-slate-900">
            View Registrations
          </h1>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200 flex flex-col md:flex-row items-center justify-between gap-4">
          
          <div className="flex flex-wrap items-center gap-4 w-full md:w-auto">
            <div className="flex items-center space-x-2">
              <span className="text-slate-700 font-medium">Show</span>
              <Select value={pageLimit.toString()} onValueChange={handlePageLimitChange}>
                <SelectTrigger className="w-[70px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="25">25</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                  <SelectItem value="100">100</SelectItem>
                </SelectContent>
              </Select>
              <span className="text-slate-700 font-medium">entries</span>
            </div>
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                type="search"
                placeholder="Search..."
                className="pl-10 w-full"
              />
            </div>
          </div>
        </div>

        {/* Registration Table */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-x-auto">
          <Table>
            <TableHeader className="bg-slate-50">
              <TableRow>
                <TableHead className="w-[50px]">#</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Contact Number</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Registered</TableHead>
                <TableHead className="text-center">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-4">
                    Loading...
                  </TableCell>
                </TableRow>
              ) : registrations.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-4">
                    No registrations found.
                  </TableCell>
                </TableRow>
              ) : (
                registrations.map((registration, index) => (
                  <TableRow key={registration._id}>
                    <TableCell className="font-medium">{((currentPage - 1) * pageLimit) + index + 1}</TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                          <User className="h-4 w-4 text-white" />
                        </div>
                        <div>
                          <span className="font-medium">{registration.name}</span>
                          <div className="text-sm text-slate-600">DOB: {formatDate(registration.dateOfBirth)}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{registration.contactNumber}</TableCell>
                    <TableCell>
                      <div>
                        {registration.address.city}, {registration.address.state}
                      </div>
                      <div className="text-sm text-slate-600">{registration.address.pincode}</div>
                    </TableCell>
                    <TableCell>{getStatusBadge(registration.status)}</TableCell>
                    <TableCell>{formatDate(registration.createdAt)}</TableCell>
                    <TableCell className="flex justify-center space-x-2">
                      <Button
                        variant="outline"
                        size="icon"
                        className="bg-blue-100 hover:bg-blue-200 text-blue-600"
                        onClick={() => viewRegistration(registration._id)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
          
          {/* Pagination */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 border-t border-slate-200">
            <span className="text-sm text-slate-600">
              Showing page <strong>{currentPage}</strong> of <strong>{totalPages}</strong>
            </span>
            
            <div className="flex items-center gap-2">
              <Button
                className="bg-blue-600 hover:bg-blue-700 text-white"
                variant="outline"
                disabled={!hasPrevPage || loading}
                onClick={() => handlePageChange(currentPage - 1)}
              >
                Previous
              </Button>

              <span className="text-sm text-slate-600">
                Page {currentPage} of {totalPages}
              </span>

              <Button
                className="bg-blue-600 hover:bg-blue-700 text-white"
                variant="outline"
                disabled={!hasNextPage || loading}
                onClick={() => handlePageChange(currentPage + 1)}
              >
                Next
              </Button>
            </div>
          </div>
        </div>

      {/* View Registration Modal */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent 
          className="!w-[90vw] !h-[90vh] !max-w-none !max-h-none flex flex-col !p-0"
          style={{ 
            width: '90vw', 
            height: '90vh', 
            maxWidth: 'none', 
            maxHeight: 'none',
            margin: '5vh auto'
          }}
        >
          <DialogHeader className="pb-4 border-b flex-shrink-0 px-6 pt-6">
            <DialogTitle className="text-2xl font-bold text-slate-900">Registration Details</DialogTitle>
          </DialogHeader>
          
          {modalLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : selectedRegistration ? (
            <div className="flex-1 overflow-hidden px-6 pb-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full">
                
                {/* Left Section - Registration Details */}
                <div className="flex flex-col overflow-hidden">
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-1 mb-4">
                    <h2 className="text-xl font-bold text-slate-900 p-4 bg-white rounded-lg shadow-sm">
                      📋 Registration Details
                    </h2>
                  </div>
                  
                  <div className="flex-1 overflow-y-auto space-y-6 pr-2">
                    {/* Personal Information */}
                    <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-sm">
                      <h3 className="flex items-center text-lg font-semibold text-slate-900 mb-4 pb-2 border-b border-slate-200">
                        <User className="w-5 h-5 mr-2 text-blue-600" />
                        Personal Information
                      </h3>
                      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm font-medium text-slate-600">Full Name</label>
                          <p className="text-slate-900 font-medium mt-1 p-2 bg-slate-50 rounded">{selectedRegistration.name}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-slate-600">Date of Birth</label>
                          <p className="text-slate-900 font-medium mt-1 p-2 bg-slate-50 rounded">{formatDate(selectedRegistration.dateOfBirth)}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-slate-600">Contact Number</label>
                          <p className="text-slate-900 font-medium mt-1 p-2 bg-slate-50 rounded">{selectedRegistration.contactNumber}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-slate-600">Marital Status</label>
                          <p className="text-slate-900 font-medium mt-1 p-2 bg-slate-50 rounded capitalize">{selectedRegistration.maritalStatus}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-slate-600">Status</label>
                          <div className="mt-1 p-2 bg-slate-50 rounded">
                            {getStatusBadge(selectedRegistration.status)}
                          </div>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-slate-600">Registration Date</label>
                          <p className="text-slate-900 font-medium mt-1 p-2 bg-slate-50 rounded">{formatDate(selectedRegistration.createdAt)}</p>
                        </div>
                      </div>
                    </div>

                    {/* Address Information */}
                    <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-sm">
                      <h3 className="flex items-center text-lg font-semibold text-slate-900 mb-4 pb-2 border-b border-slate-200">
                        <MapPin className="w-5 h-5 mr-2 text-blue-600" />
                        Address Information
                      </h3>
                      <div className="space-y-4">
                        <div>
                          <label className="text-sm font-medium text-slate-600">Street Address</label>
                          <p className="text-slate-900 font-medium mt-1 p-2 bg-slate-50 rounded">{selectedRegistration.address.street}</p>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label className="text-sm font-medium text-slate-600">City</label>
                            <p className="text-slate-900 font-medium mt-1 p-2 bg-slate-50 rounded">{selectedRegistration.address.city}</p>
                          </div>
                          <div>
                            <label className="text-sm font-medium text-slate-600">State</label>
                            <p className="text-slate-900 font-medium mt-1 p-2 bg-slate-50 rounded">{selectedRegistration.address.state}</p>
                          </div>
                          <div>
                            <label className="text-sm font-medium text-slate-600">Pincode</label>
                            <p className="text-slate-900 font-medium mt-1 p-2 bg-slate-50 rounded">{selectedRegistration.address.pincode}</p>
                          </div>
                          <div>
                            <label className="text-sm font-medium text-slate-600">Country</label>
                            <p className="text-slate-900 font-medium mt-1 p-2 bg-slate-50 rounded">{selectedRegistration.address.country}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Section - Documents */}
                <div className="flex flex-col overflow-hidden">
                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-1 mb-4">
                    <h2 className="text-xl font-bold text-slate-900 p-4 bg-white rounded-lg shadow-sm">
                      📁 Uploaded Documents ({selectedRegistration.documents.length})
                    </h2>
                  </div>
                  
                  <div className="flex-1 overflow-y-auto pr-2">
                    {selectedRegistration.documents.length === 0 ? (
                      <div className="bg-white border border-slate-200 rounded-lg p-12 text-center shadow-sm">
                        <FileText className="w-16 h-16 mx-auto mb-4 text-slate-300" />
                        <p className="text-slate-500 text-lg">No documents uploaded</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {selectedRegistration.documents.map((document, index) => {
                          const isImage = document.url.match(/\.(jpg|jpeg|png|gif|webp)$/i);
                          return (
                            <div key={index} className="bg-white border border-slate-200 rounded-lg p-4 hover:shadow-md transition-all duration-200 hover:border-blue-300">
                              <div className="flex flex-col sm:flex-row gap-4">
                                {/* Document Preview */}
                                <div className="flex-shrink-0">
                                  {isImage ? (
                                    <div className="relative">
                                      <img
                                        src={document.url}
                                        alt={document.title}
                                        className="w-full sm:w-24 h-24 object-cover rounded-lg border"
                                        onError={(e) => {
                                          e.currentTarget.style.display = 'none';
                                        }}
                                      />
                                      <div className="absolute -top-1 -right-1">
                                        <Badge variant="secondary" className="text-xs bg-green-500 text-white border-0">
                                          Image
                                        </Badge>
                                      </div>
                                    </div>
                                  ) : (
                                    <div className="w-full sm:w-24 h-24 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg border border-blue-200 flex items-center justify-center">
                                      <div className="text-center">
                                        <FileText className="w-6 h-6 mx-auto mb-1 text-blue-600" />
                                        <Badge variant="secondary" className="text-xs bg-blue-500 text-white border-0">
                                          Doc
                                        </Badge>
                                      </div>
                                    </div>
                                  )}
                                </div>
                                
                                {/* Document Info */}
                                <div className="flex-1 min-w-0">
                                  <div className="space-y-2">
                                    <div>
                                      <label className="text-xs font-medium text-slate-600 uppercase tracking-wide">Document Name</label>
                                      <h4 className="font-semibold text-slate-900 truncate text-lg" title={document.title}>
                                        {document.title}
                                      </h4>
                                    </div>
                                    
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                      <div>
                                        <label className="text-xs font-medium text-slate-600 uppercase tracking-wide">Upload Date</label>
                                        <p className="text-sm text-slate-700 font-medium">{formatDate(document.uploadedAt)}</p>
                                      </div>
                                      <div className="flex gap-2">
                                        <Button
                                          size="sm"
                                          onClick={() => window.open(document.url, '_blank')}
                                          className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
                                        >
                                          <Eye className="w-4 h-4 mr-2" />
                                          View
                                        </Button>
                                        <Button
                                          size="sm"
                                          variant="outline"
                                          onClick={() => downloadDocument(document.url, document.title)}
                                          className="border-green-200 hover:bg-green-50 text-green-700 hover:text-green-800 shadow-sm"
                                        >
                                          <Download className="w-4 h-4 mr-2" />
                                          Download
                                        </Button>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              Failed to load registration details
            </div>
          )}
        </DialogContent>
      </Dialog>
      </div>
    </ModernDashboardLayout>
  )
}