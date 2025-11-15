'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Plus, Search, Pencil, Trash2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { ModernDashboardLayout } from '@/components/navbar/modern-dashboard-navbar';
import DesignationForm from '@/components/admin/designation/DesignationForm';
import {
  getDesignations,
  createDesignation,
  updateDesignation,
  deleteDesignation,
} from '@/service/admin/designationService';
import {
  DesignationResponse,
  DesignationFormData,
  DesignationFilterType,
} from '@/types/designation-types';
import { DATA_LIMIT } from '@/data/limitData';

const DesignationPage: React.FC = () => {
  const router = useRouter();
  
  // State management
  const [designations, setDesignations] = useState<DesignationResponse[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [totalRecords, setTotalRecords] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter] = useState<DesignationFilterType>({});
  const [paginationData, setPaginationData] = useState({
    currentPage: 1,
    totalPages: 1,
    limit: DATA_LIMIT[0],
    totalItems: 0,
  });

  // Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedDesignation, setSelectedDesignation] = useState<DesignationResponse | null>(null);
  const [designationToDelete, setDesignationToDelete] = useState<string | null>(null);
  const [isFormLoading, setIsFormLoading] = useState(false);

  // Fetch designations
  const fetchDesignations = async () => {
    setIsLoading(true);
    try {
      const response = await getDesignations(
        paginationData.currentPage, 
        paginationData.limit, 
        filter, 
        searchQuery
      );
      if (response.status) {
        setDesignations(response.data.designations);
        setTotalRecords(response.data.totalRecords);
        setPaginationData(prev => ({
          ...prev,
          totalPages: Math.ceil(response.data.totalRecords / paginationData.limit),
          totalItems: response.data.totalRecords
        }));
      }
    } catch (error) {
      toast.error('Failed to fetch designations');
      console.error('Error fetching designations:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Effects
  useEffect(() => {
    fetchDesignations();
  }, [paginationData.currentPage, paginationData.limit, searchQuery]);

  useEffect(() => {
    setPaginationData(prev => ({ ...prev, currentPage: 1 }));
  }, [searchQuery]);

  // Handle add form submission
  const handleAddFormSubmit = async (formData: DesignationFormData) => {
    setIsFormLoading(true);
    try {
      const response = await createDesignation(formData);
      if (response.status) {
        toast.success('Designation created successfully');
        fetchDesignations();
        handleCloseAddModal();
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'An error occurred';
      toast.error(errorMessage);
    } finally {
      setIsFormLoading(false);
    }
  };

  // Handle edit form submission
  const handleEditFormSubmit = async (formData: DesignationFormData) => {
    setIsFormLoading(true);
    try {
      if (selectedDesignation) {
        const response = await updateDesignation(selectedDesignation.id, formData);
        if (response.status) {
          toast.success('Designation updated successfully');
          fetchDesignations();
          handleCloseEditModal();
        }
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'An error occurred';
      toast.error(errorMessage);
    } finally {
      setIsFormLoading(false);
    }
  };

  // Handle edit
  const handleEdit = (designation: DesignationResponse) => {
    setSelectedDesignation(designation);
    setIsEditModalOpen(true);
  };

  // Handle delete
  const handleDelete = (designationId: string) => {
    setDesignationToDelete(designationId);
    setIsDeleteModalOpen(true);
  };

  // Confirm delete
  const confirmDelete = async () => {
    if (!designationToDelete) return;

    try {
      const response = await deleteDesignation(designationToDelete);
      if (response.status) {
        toast.success('Designation deleted successfully');
        fetchDesignations();
        // Reset to first page if current page becomes empty
        if (designations.length === 1 && paginationData.currentPage > 1) {
          setPaginationData(prev => ({ ...prev, currentPage: 1 }));
        }
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to delete designation';
      toast.error(errorMessage);
    } finally {
      setIsDeleteModalOpen(false);
      setDesignationToDelete(null);
    }
  };

  // Handle modal close
  const handleCloseAddModal = () => {
    setIsAddModalOpen(false);
  };

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    setSelectedDesignation(null);
  };

  // Open add modal
  const handleAddDesignation = () => {
    setIsAddModalOpen(true);
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Get status badge
  const getStatusBadge = (status: number) => {
    return (
      <Badge variant={status === 1 ? 'default' : 'secondary'}>
        {status === 1 ? 'Active' : 'Inactive'}
      </Badge>
    );
  };

  return (
    <ModernDashboardLayout>
      <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900">
        <main className="flex-1 p-4 sm:p-6 md:p-2">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 sm:p-6 w-full max-w-none overflow-hidden">
            {/* Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 sm:mb-2 gap-4 sm:gap-0">
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-50">
                Designations
              </h1>
              <Button
                onClick={handleAddDesignation}
                className="bg-emerald-500 hover:bg-emerald-600 text-white flex items-center gap-2 w-full sm:w-auto"
              >
                <Plus className="h-4 w-4" />
                Add Designation
              </Button>
            </div>

            {/* Table Controls */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 gap-4 sm:gap-0">
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <span className="text-sm text-gray-700 dark:text-gray-300 whitespace-nowrap">Show</span>
                <Select
                  value={paginationData.limit.toString()}
                  onValueChange={(value) => setPaginationData(prev => ({ ...prev, limit: Number(value) }))}
                >
                  <SelectTrigger className="w-[90px]">
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

            {/* Designations Table */}
            <div className="w-full overflow-x-auto border rounded-md">
              <Table className="min-w-[800px]">
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[50px]">#</TableHead>
                    <TableHead className="min-w-[150px]">Name</TableHead>
                    <TableHead className="min-w-[200px]">Description</TableHead>
                    <TableHead className="min-w-[100px]">Status</TableHead>
                    <TableHead className="min-w-[120px]">Created By</TableHead>
                    <TableHead className="min-w-[120px]">Created At</TableHead>
                    <TableHead className="text-center min-w-[120px]">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={7} className="h-24 text-center text-gray-500 dark:text-gray-400">
                        Loading...
                      </TableCell>
                    </TableRow>
                  ) : designations.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="h-24 text-center text-gray-500 dark:text-gray-400">
                        No data available in table
                      </TableCell>
                    </TableRow>
                  ) : (
                    designations.map((designation, index) => (
                      <TableRow key={designation.id}>
                        <TableCell>{(paginationData.currentPage - 1) * paginationData.limit + index + 1}</TableCell>
                        <TableCell className="font-medium">
                          <span className="truncate block">{designation.name}</span>
                        </TableCell>
                        <TableCell>
                          <span className="truncate block">{designation.description || '-'}</span>
                        </TableCell>
                        <TableCell>
                          {getStatusBadge(designation.status)}
                        </TableCell>
                        <TableCell>
                          <span className="truncate block">{designation.createdByName}</span>
                        </TableCell>
                        <TableCell>
                          <span className="truncate block">{formatDate(designation.createdAt)}</span>
                        </TableCell>
                        <TableCell className="flex justify-center gap-1 sm:gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900 h-8 w-8 sm:h-10 sm:w-10"
                            onClick={() => handleEdit(designation)}
                          >
                            <Pencil className="h-3 w-3 sm:h-4 sm:w-4" />
                            <span className="sr-only">Edit</span>
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-red-500 hover:bg-red-50 dark:hover:bg-red-900 h-8 w-8 sm:h-10 sm:w-10"
                            onClick={() => handleDelete(designation.id)}
                          >
                            <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
                            <span className="sr-only">Delete</span>
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Bottom Pagination */}
            <div className="flex flex-col sm:flex-row items-center justify-between mt-4 text-sm text-gray-700 dark:text-gray-300 gap-4 sm:gap-0">
              <span className="text-center sm:text-left">
                Showing page {paginationData.currentPage} of {paginationData.totalPages} pages
              </span>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={paginationData.currentPage === 1}
                  onClick={() => setPaginationData(prev => ({ ...prev, currentPage: prev.currentPage - 1 }))}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={paginationData.currentPage >= paginationData.totalPages}
                  onClick={() => setPaginationData(prev => ({ ...prev, currentPage: prev.currentPage + 1 }))}
                >
                  Next
                </Button>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Add Form Modal */}
      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add New Designation</DialogTitle>
          </DialogHeader>
          <DesignationForm
            onSubmit={handleAddFormSubmit}
            onCancel={handleCloseAddModal}
            initialData={null}
            isLoading={isFormLoading}
          />
        </DialogContent>
      </Dialog>

      {/* Edit Form Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Designation</DialogTitle>
          </DialogHeader>
          <DesignationForm
            onSubmit={handleEditFormSubmit}
            onCancel={handleCloseEditModal}
            initialData={selectedDesignation}
            isLoading={isFormLoading}
          />
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <AlertDialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the designation.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setIsDeleteModalOpen(false)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </ModernDashboardLayout>
  );
};

export default DesignationPage;