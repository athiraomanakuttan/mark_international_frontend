'use client';

import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import {
  Search,
  ChevronLeft,
  ChevronRight,
  UserX,
  Users,
  HardHat,
  Plus
} from 'lucide-react';
import {
  Termination,
  TerminationType,
  GetTerminationsParams,
  TERMINATION_TYPE_LABELS
} from '@/types/termination-types';
import TerminationService from '@/service/terminationService';
import TerminationModal from './TerminationModal';

const TerminationTable: React.FC = () => {
  const [terminations, setTerminations] = useState<Termination[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<TerminationType | 'all'>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [pageSize] = useState(10);

  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    loadTerminations();
  }, [currentPage, searchTerm, typeFilter]);

  const loadTerminations = async () => {
    setIsLoading(true);
    try {
      const params: GetTerminationsParams = {
        page: currentPage,
        limit: pageSize,
        search: searchTerm,
      };

      if (typeFilter !== 'all') {
        params.type = typeFilter;
      }

      const response = await TerminationService.getTerminations(params);

      if (response.status) {
        setTerminations(response.data.terminations);
        setTotalCount(response.data.totalRecords);
        setTotalPages(Math.ceil(response.data.totalRecords / pageSize));
      } else {
        toast.error(response.message || 'Failed to fetch terminations');
      }
    } catch (error: any) {
      console.error('Error loading terminations:', error);
      const errorMessage = error?.response?.data?.message || error?.message || 'Failed to load terminations';
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  const handleTypeFilter = (value: string) => {
    setTypeFilter(value as TerminationType | 'all');
    setCurrentPage(1);
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTypeIcon = (type: TerminationType) => {
    return type === 'staff' ? (
      <Users className="w-4 h-4" />
    ) : (
      <HardHat className="w-4 h-4" />
    );
  };

  const getTypeBadgeColor = (type: TerminationType) => {
    return type === 'staff'
      ? 'bg-blue-100 text-blue-800'
      : 'bg-purple-100 text-purple-800';
  };

  const handleModalSuccess = () => {
    loadTerminations();
    setCurrentPage(1);
  };

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="flex items-center gap-2">
              <UserX className="w-5 h-5 text-red-600" />
              Terminations
            </CardTitle>
            <Button
              onClick={() => setIsModalOpen(true)}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Termination
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search by name or reason..."
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={typeFilter} onValueChange={handleTypeFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="staff">Office Staff</SelectItem>
                <SelectItem value="employee">Employees</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Stats */}
          <div className="mb-4 text-sm text-gray-600">
            Total: <span className="font-semibold">{totalCount}</span> termination{totalCount !== 1 ? 's' : ''}
          </div>

          {/* Table */}
          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
            </div>
          ) : terminations.length === 0 ? (
            <div className="text-center py-12">
              <UserX className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">No terminations found</p>
              <p className="text-gray-400 text-sm mt-2">
                {searchTerm || typeFilter !== 'all'
                  ? 'Try adjusting your filters'
                  : 'Click "Add Termination" to get started'}
              </p>
            </div>
          ) : (
            <>
              <div className="border rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50">
                      <TableHead>Type</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Reason</TableHead>
                      <TableHead>Terminated At</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {terminations.map((termination) => (
                      <TableRow key={termination.id}>
                        <TableCell>
                          <Badge className={getTypeBadgeColor(termination.type)}>
                            <div className="flex items-center gap-1">
                              {getTypeIcon(termination.type)}
                              {TERMINATION_TYPE_LABELS[termination.type]}
                            </div>
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="font-medium">{termination.personName}</div>
                        </TableCell>
                        <TableCell>
                          <div className="max-w-md truncate" title={termination.reason}>
                            {termination.reason}
                          </div>
                        </TableCell>
                        <TableCell>
                          {formatDate(termination.terminatedAt)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-6">
                  <div className="text-sm text-gray-600">
                    Page {currentPage} of {totalPages}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handlePreviousPage}
                      disabled={currentPage === 1}
                    >
                      <ChevronLeft className="w-4 h-4 mr-1" />
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleNextPage}
                      disabled={currentPage === totalPages}
                    >
                      Next
                      <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Termination Modal */}
      <TerminationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={handleModalSuccess}
      />
    </>
  );
};

export default TerminationTable;
