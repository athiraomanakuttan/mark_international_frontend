"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Edit, Trash2, MapPin, Building, FileText, Plus } from "lucide-react"
import { toast } from "react-toastify"
import { ModernDashboardLayout } from "@/components/navbar/modern-dashboard-navbar"
import { getBranchesWithPagination, deleteBranch } from "@/service/branchService"
import { BranchType } from "@/types/branch-types"
import AddBranchModal from "@/components/admin/add-branch-modal"
import EditBranchModal from "@/components/admin/edit-branch-modal"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { DATA_LIMIT } from "@/data/limitData"

export default function BranchManagementPage() {
  const [branches, setBranches] = useState<BranchType[]>([])
  const [loading, setLoading] = useState(true)
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [entriesPerPage, setEntriesPerPage] = useState(DATA_LIMIT[0].toString())
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [selectedBranch, setSelectedBranch] = useState<BranchType | null>(null)
  const [paginationData, setPaginationData] = useState({
    currentPage: 1,
    totalPages: 1,
    limit: DATA_LIMIT[0],
    totalItems: 0,
  })

  const fetchBranches = async () => {
    try {
      setLoading(true)
      const response = await getBranchesWithPagination(
        paginationData.currentPage,
        paginationData.limit,
        searchQuery || undefined
      )
      if (response.status && response.data) {
        setBranches(response.data.branches)
        setPaginationData((prev) => ({
          ...prev,
          totalPages: response.data?.totalPages || 1,
          totalItems: response.data?.totalRecords || 0,
        }))
      } else {
        toast.error("Failed to fetch branches")
      }
    } catch (error) {
      console.error("Error fetching branches:", error)
      toast.error("Failed to fetch branches")
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteBranch = async (branchId: string) => {
    try {
      setDeleteLoading(branchId)
      const response = await deleteBranch(branchId)
      if (response.status) {
        toast.success("Branch deleted successfully")
        fetchBranches()
      } else {
        toast.error(response.message || "Failed to delete branch")
      }
    } catch (error) {
      console.error("Error deleting branch:", error)
      toast.error("Failed to delete branch")
    } finally {
      setDeleteLoading(null)
    }
  }

  const handleEditBranch = (branchId: string) => {
    const branch = branches.find(b => b._id === branchId)
    if (branch) {
      setSelectedBranch(branch)
      setEditModalOpen(true)
    }
  }

  const handleBranchAdded = (newBranch: BranchType) => {
    fetchBranches() // Refetch data to include new branch
  }

  const handleBranchUpdated = () => {
    fetchBranches() // Refetch data to reflect updates
  }

  // Update pagination when search or limit changes
  useEffect(() => {
    setPaginationData((prev) => ({ ...prev, currentPage: 1 }))
  }, [searchQuery])

  useEffect(() => {
    fetchBranches()
  }, [paginationData.currentPage, paginationData.limit, searchQuery])

  return (
    <ModernDashboardLayout>
      <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900">
        <main className="flex-1 p-3 sm:p-4 md:p-6 lg:p-2">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-3 sm:p-4 md:p-6 w-full max-w-none overflow-hidden">
            {/* Header Section */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 sm:mb-2 gap-3 sm:gap-2">
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-50 order-1">Branch Management</h1>
              <div className="flex flex-col xs:flex-row gap-2 order-2 sm:order-2">
                <AddBranchModal onBranchAdded={handleBranchAdded} />
              </div>
            </div>

            {/* Table Controls */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-3 sm:gap-2">
              <div className="flex items-center gap-2 text-sm">
                <span className="text-gray-700 dark:text-gray-300 whitespace-nowrap">Show</span>
                <Select
                  value={entriesPerPage}
                  onValueChange={(value) => {
                    setEntriesPerPage(value)
                    setPaginationData((prev) => ({ ...prev, limit: Number(value) }))
                  }}
                >
                  <SelectTrigger className="w-16 sm:w-[70px]">
                    <SelectValue placeholder={DATA_LIMIT[0].toString()} />
                  </SelectTrigger>
                  <SelectContent>
                    {DATA_LIMIT.map((limit) => (
                      <SelectItem key={limit} value={limit.toString()}>{limit}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <span className="text-gray-700 dark:text-gray-300 whitespace-nowrap">entries</span>
              </div>
              <div className="flex items-center gap-2">
                <Label htmlFor="search" className="sr-only">
                  Search
                </Label>
                <Input
                  id="search"
                  placeholder="Search branches..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full sm:w-[200px] text-sm"
                />
              </div>
            </div>

            {/* Branches Table */}
            <div className="w-full overflow-x-auto border rounded-md">
              <Table className="min-w-[800px]">
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12 sm:w-[50px] px-2 sm:px-4">#</TableHead>
                    <TableHead className="min-w-[150px] px-2 sm:px-4">Branch Name</TableHead>
                    <TableHead className="min-w-[150px] px-2 sm:px-4">Location</TableHead>
                    <TableHead className="min-w-[200px] px-2 sm:px-4">Description</TableHead>
                    <TableHead className="min-w-[120px] px-2 sm:px-4">Created Date</TableHead>
                    <TableHead className="w-[100px] px-2 sm:px-4">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={6} className="h-24 text-center">
                        <div className="flex items-center justify-center space-x-2">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900"></div>
                          <span>Loading branches...</span>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : branches.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="h-24 text-center text-gray-500 dark:text-gray-400 px-2 sm:px-4">
                        No branches found
                      </TableCell>
                    </TableRow>
                  ) : (
                    branches.map((branch, index) => (
                      <TableRow key={branch._id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                        <TableCell className="px-2 sm:px-4 py-2 sm:py-3 text-sm">
                          {(paginationData.currentPage - 1) * paginationData.limit + index + 1}
                        </TableCell>
                        <TableCell className="px-2 sm:px-4 py-2 sm:py-3 text-sm font-medium">
                          <div className="flex items-center">
                            <Building className="w-4 h-4 mr-2 text-teal-600" />
                            <div className="truncate max-w-[150px] sm:max-w-none" title={branch.branchName}>
                              {branch.branchName}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="px-2 sm:px-4 py-2 sm:py-3 text-sm">
                          <div className="flex items-center">
                            <MapPin className="w-4 h-4 mr-2 text-gray-500" />
                            <div className="truncate max-w-[150px] sm:max-w-none" title={branch.location}>
                              {branch.location}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="px-2 sm:px-4 py-2 sm:py-3 text-sm">
                          <div className="truncate max-w-[200px] sm:max-w-none" title={branch.description || "No description"}>
                            {branch.description || <span className="text-gray-500">No description</span>}
                          </div>
                        </TableCell>
                        <TableCell className="px-2 sm:px-4 py-2 sm:py-3 text-sm">
                          <div className="truncate max-w-[120px] sm:max-w-none" title={branch.createdAt || "N/A"}>
                            {branch.createdAt ? new Date(branch.createdAt).toLocaleDateString() : (
                              <span className="text-gray-500">N/A</span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="px-2 sm:px-4 py-2 sm:py-3">
                          <div className="flex items-center gap-1">
                            <Button
                              size="sm"
                              variant="outline"
                              className="p-1 h-8 w-8"
                              onClick={() => handleEditBranch(branch._id!)}
                              title="Edit Branch"
                            >
                              <Edit className="w-3 h-3" />
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="p-1 h-8 w-8 text-red-600 border-red-200 hover:bg-red-50"
                                  disabled={deleteLoading === branch._id}
                                  title="Delete Branch"
                                >
                                  {deleteLoading === branch._id ? (
                                    <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-red-600" />
                                  ) : (
                                    <Trash2 className="w-3 h-3" />
                                  )}
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Delete Branch</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Are you sure you want to delete &ldquo;{branch.branchName}&rdquo;? 
                                    This action cannot be undone and will permanently remove all associated data.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => handleDeleteBranch(branch._id!)}
                                    className="bg-red-600 hover:bg-red-700"
                                  >
                                    Delete Branch
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Bottom Pagination */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mt-4 gap-3 sm:gap-2 text-sm text-gray-700 dark:text-gray-300">
              <span className="text-center sm:text-left">
                Showing page {paginationData.currentPage} of {paginationData.totalPages} pages
                {paginationData.totalItems > 0 && (
                  <span className="ml-2">({paginationData.totalItems} total branches)</span>
                )}
              </span>
              <div className="flex justify-center sm:justify-end gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={paginationData.currentPage === 1}
                  onClick={() => setPaginationData((prev) => ({ ...prev, currentPage: prev.currentPage - 1 }))}
                  className="text-xs sm:text-sm"
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={paginationData.currentPage >= paginationData.totalPages}
                  onClick={() => setPaginationData((prev) => ({ ...prev, currentPage: prev.currentPage + 1 }))}
                  className="text-xs sm:text-sm"
                >
                  Next
                </Button>
              </div>
            </div>
          </div>
        </main>
      </div>
      
      {/* Edit Branch Modal */}
      <EditBranchModal
        open={editModalOpen}
        onOpenChange={setEditModalOpen}
        branch={selectedBranch}
        onBranchUpdated={handleBranchUpdated}
      />
    </ModernDashboardLayout>
  )
}