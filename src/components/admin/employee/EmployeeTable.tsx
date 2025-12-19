'use client';

import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { 
  Search, 
  Plus, 
  MoreHorizontal, 
  Edit, 
  Trash2, 
  Eye,
  Filter,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { 
  Employee, 
  EmployeeFilter, 
  EMPLOYEE_STATUS_LABELS,
  EMPLOYEE_STATUS 
} from '@/types/employee-types';
import { DesignationBasicType, DesignationResponse } from '@/types/designation-types';
import EmployeeService from '@/service/employeeService';
import { getDesignations } from '@/service/admin/designationService';
import EmployeeFormModal from './EmployeeFormModal';
import EmployeeViewModal from './EmployeeViewModal';
import DeleteConfirmationModal from '@/components/ui/DeleteConfirmationModal';

const EmployeeTable: React.FC = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [designations, setDesignations] = useState<DesignationResponse[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [pageSize] = useState(10);
  
  // Filters
  const [filters, setFilters] = useState<EmployeeFilter>({});
  
  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);

  // Debug effect to track filter changes
  useEffect(() => {
    console.log('🔍 Filters state changed:', filters);
  }, [filters]);

  useEffect(() => {
    console.log('📊 Loading employees due to change in:', { currentPage, searchTerm, filters });
    loadEmployees();
  }, [currentPage, searchTerm, filters]);

  useEffect(() => {
    loadDesignations();
  }, []);

  const loadEmployees = async () => {
    setIsLoading(true);
    try {
      // Clean filters to remove undefined/null/empty values
      const cleanedFilters = Object.entries(filters).reduce((acc, [key, value]) => {
        if (value !== undefined && value !== null && value !== '' && value !== 'all') {
          (acc as any)[key] = value;
        }
        return acc;
      }, {} as EmployeeFilter);

      console.log('Loading employees with params:', {
        page: currentPage,
        limit: pageSize,
        search: searchTerm.trim(),
        filter: cleanedFilters,
      });

      const response = await EmployeeService.getEmployees({
        page: currentPage,
        limit: pageSize,
        search: searchTerm.trim(),
        filter: cleanedFilters,
      });

      if (response.status) {
        setEmployees(response.data.employees);
        setTotalCount(response.data.totalRecords);
        setTotalPages(Math.ceil(response.data.totalRecords / pageSize));
      } else {
        toast.error('Failed to load employees');
      }
    } catch (error) {
      console.error('Error loading employees:', error);
      toast.error('Failed to load employees. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const loadDesignations = async () => {
    try {
      const response = await getDesignations(1, 100);
      if (response.status) {
        setDesignations(response.data.designations);
      } else {
        toast.error('Failed to load designations');
      }
    } catch (error) {
      console.error('Error loading designations:', error);
      toast.error('Failed to load designations for filtering');
    }
  };

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  const handleFilterChange = (key: keyof EmployeeFilter, value: string) => {
    setFilters(prev => {
      const newFilters = { ...prev };
      
      if (value === 'all' || value === '' || value === undefined) {
        // Remove the filter key entirely when 'all' is selected or value is empty
        delete newFilters[key];
      } else {
        // Set the filter value, converting to number for status
        if (key === 'status') {
          newFilters[key] = parseInt(value) as 0 | 1;
        } else {
          newFilters[key] = value;
        }
      }
      
      console.log(`Filter changed - ${key}:`, value, 'New filters:', newFilters);
      return newFilters;
    });
    setCurrentPage(1);
  };

  const clearFilters = () => {
    console.log('🧹 Clearing all filters');
    setFilters({});
    setCurrentPage(1);
  };

  const handleView = (employee: Employee) => {
    setSelectedEmployee(employee);
    setIsViewModalOpen(true);
  };

  const handleEdit = (employee: Employee) => {
    setSelectedEmployee(employee);
    setIsEditModalOpen(true);
  };

  const handleDelete = (employee: Employee) => {
    setSelectedEmployee(employee);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!selectedEmployee) return;

    try {
      await EmployeeService.deleteEmployee(selectedEmployee.id);
      toast.success(`Employee "${selectedEmployee.name}" deleted successfully!`);
      loadEmployees();
      setIsDeleteModalOpen(false);
      setSelectedEmployee(null);
    } catch (error: any) {
      console.error('Error deleting employee:', error);
      const errorMessage = error?.response?.data?.message || error?.message || 'Failed to delete employee';
      toast.error(errorMessage);
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };



  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-50">Employee Management</h2>
          <p className="text-gray-600 dark:text-gray-300 mt-1">
            Manage your organization's employees
          </p>
        </div>
        <Button 
          onClick={() => setIsAddModalOpen(true)}
          className="bg-emerald-500 hover:bg-emerald-600 text-white w-full sm:w-auto"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Employee
        </Button>
      </div>

      {/* Search and Filters */}
      <Card className="bg-white dark:bg-gray-800 shadow-md">
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search by name, employee ID, email..."
                  value={searchTerm}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-2">
              <Select
                value={filters.designation || 'all'}
                onValueChange={(value) => {
                  console.log('Designation filter changed to:', value);
                  handleFilterChange('designation', value);
                }}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by designation" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Designations</SelectItem>
                  {designations.map((designation) => (
                    <SelectItem key={designation.id} value={designation.id}>
                      {designation.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                value={filters.status !== undefined ? filters.status.toString() : 'all'}
                onValueChange={(value) => {
                  console.log('Status filter changed to:', value);
                  handleFilterChange('status', value);
                }}
              >
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value={EMPLOYEE_STATUS.ACTIVE.toString()}>
                    {EMPLOYEE_STATUS_LABELS[EMPLOYEE_STATUS.ACTIVE]}
                  </SelectItem>
                  <SelectItem value={EMPLOYEE_STATUS.INACTIVE.toString()}>
                    {EMPLOYEE_STATUS_LABELS[EMPLOYEE_STATUS.INACTIVE]}
                  </SelectItem>
                </SelectContent>
              </Select>

              {Object.keys(filters).length > 0 && (
                <Button
                  variant="outline"
                  onClick={clearFilters}
                  className="px-3"
                >
                  Clear Filters
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card className="bg-white dark:bg-gray-800 shadow-md">
        <CardHeader>
          <CardTitle className="text-gray-900 dark:text-gray-50">
            Employees
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
            </div>
          ) : employees.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500 dark:text-gray-400">No employees found</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12"></TableHead>
                      <TableHead>Employee</TableHead>
                      <TableHead>Contact</TableHead>
                      <TableHead>Designation</TableHead>
                      <TableHead>Join Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="w-12"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {employees.map((employee) => (
                      <TableRow key={employee.id}>
                        <TableCell>
                          <Avatar className="h-10 w-10">
                            <AvatarImage 
                              src={employee.profilePicture || undefined}
                              alt={employee.name}
                            />
                            <AvatarFallback>
                              {getInitials(employee.name)}
                            </AvatarFallback>
                          </Avatar>
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">{employee.name}</div>
                            <div className="text-sm text-gray-500">{employee.email}</div>
                          </div>
                        </TableCell>
                        
                        <TableCell>
                          <div className="text-sm">
                            <div>{employee.email}</div>
                            <div className="text-gray-500">{employee.phoneNumber}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          {employee.designation}
                        </TableCell>
                        <TableCell>
                          {formatDate(employee.dateOfJoining)}
                        </TableCell>
                        <TableCell>
                          <Badge 
                            variant={employee.status === EMPLOYEE_STATUS.ACTIVE ? 'default' : 'secondary'}
                          >
                            {EMPLOYEE_STATUS_LABELS[employee.status as keyof typeof EMPLOYEE_STATUS_LABELS]}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleView(employee)}>
                                <Eye className="mr-2 h-4 w-4" />
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleEdit(employee)}>
                                <Edit className="mr-2 h-4 w-4" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                onClick={() => handleDelete(employee)}
                                className="text-red-600"
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-6">
                  <div className="text-sm text-gray-700 dark:text-gray-300">
                    Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, totalCount)} of {totalCount} results
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage <= 1}
                    >
                      <ChevronLeft className="h-4 w-4" />
                      Previous
                    </Button>
                    
                    <div className="flex items-center space-x-1">
                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        const pageNum = i + 1;
                        return (
                          <Button
                            key={pageNum}
                            variant={currentPage === pageNum ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => handlePageChange(pageNum)}
                            className="w-8 h-8 p-0"
                          >
                            {pageNum}
                          </Button>
                        );
                      })}
                    </div>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage >= totalPages}
                    >
                      Next
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Modals */}
      <EmployeeFormModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={() => {
          loadEmployees();
          setIsAddModalOpen(false);
        }}
        mode="add"
      />

      <EmployeeFormModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedEmployee(null);
        }}
        onSuccess={() => {
          loadEmployees();
          setIsEditModalOpen(false);
          setSelectedEmployee(null);
        }}
        employee={selectedEmployee ?? undefined}
        mode="edit"
      />

      <EmployeeViewModal
        isOpen={isViewModalOpen}
        onClose={() => {
          setIsViewModalOpen(false);
          setSelectedEmployee(null);
        }}
        employee={selectedEmployee}
      />

      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setSelectedEmployee(null);
        }}
        onConfirm={confirmDelete}
        title="Delete Employee"
        description={`Are you sure you want to delete ${selectedEmployee?.name}? This action cannot be undone.`}
      />
    </div>
  );
};

export default EmployeeTable;