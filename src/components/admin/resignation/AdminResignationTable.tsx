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
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { 
  Search, 
  MoreHorizontal, 
  Eye,
  CheckCircle,
  XCircle,
  ChevronLeft,
  ChevronRight,
  FileText,
  Download
} from 'lucide-react';
import { 
  Resignation, 
  ResignationStatus, 
  RESIGNATION_STATUS_LABELS,
  RESIGNATION_STATUS_COLORS 
} from '@/types/resignation-types';
import ResignationService from '@/service/resignationService';
import ResignationReviewModal from '@/components/admin/resignation/ResignationReviewModal';

const AdminResignationTable: React.FC = () => {
  const [resignations, setResignations] = useState<Resignation[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<ResignationStatus | 'all'>(ResignationStatus.PENDING);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [pageSize] = useState(10);
  
  // Modals
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [selectedResignation, setSelectedResignation] = useState<Resignation | null>(null);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  useEffect(() => {
    loadResignations();
  }, [currentPage, searchTerm, statusFilter]);

  const loadResignations = async () => {
    setIsLoading(true);
    try {
      const params: any = {
        page: currentPage,
        limit: pageSize,
        search: searchTerm,
      };

      if (statusFilter !== 'all') {
        params.status = statusFilter;
      }

      const response = await ResignationService.getResignations(params);

      if (response.status) {
        console.log('✅ Frontend: Received resignation data:', {
          total: response.data.totalRecords,
          count: response.data.resignations.length,
          sampleEmployee: response.data.resignations[0]?.employeeName,
          sampleData: response.data.resignations[0]
        });

        setResignations(response.data.resignations);
        setTotalCount(response.data.totalRecords);
        setTotalPages(Math.ceil(response.data.totalRecords / pageSize));
      } else {
        toast.error('Failed to load resignations');
      }
    } catch (error) {
      console.error('Error loading resignations:', error);
      toast.error('Failed to load resignations. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  const handleStatusFilter = (value: string) => {
    setStatusFilter(value === 'all' ? 'all' : parseInt(value) as ResignationStatus);
    setCurrentPage(1);
  };

  const handleView = (resignation: Resignation) => {
    setSelectedResignation(resignation);
    setIsReviewModalOpen(true);
  };

  const handleReview = async (status: ResignationStatus, comments?: string) => {
    if (!selectedResignation) return;

    try {
      await ResignationService.reviewResignation(selectedResignation.id, {
        status,
        comments
      });
      
      toast.success(`Resignation ${status === ResignationStatus.APPROVED ? 'approved' : 'rejected'} successfully!`);
      loadResignations();
      setIsReviewModalOpen(false);
      setSelectedResignation(null);
    } catch (error: any) {
      console.error('Error reviewing resignation:', error);
      const errorMessage = error?.response?.data?.message || error?.message || 'Failed to review resignation';
      toast.error(errorMessage);
    }
  };

  const handleDownloadDocument = async (resignation: Resignation) => {
    if (!resignation.document) {
      toast.error('No document available');
      return;
    }

    setDownloadingId(resignation.id);
    try {
      // Since document is a Cloudinary URL, download it directly
      const response = await fetch(resignation.document);
      const blob = await response.blob();
      
      // Extract file extension from URL or default to pdf
      const urlParts = resignation.document.split('.');
      const extension = urlParts[urlParts.length - 1].split('?')[0] || 'pdf';
      
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `resignation-${resignation.employeeName}-${resignation.id}.${extension}`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      toast.success('Document downloaded successfully');
    } catch (error: any) {
      console.error('Error downloading document:', error);
      toast.error('Failed to download document. Opening in new tab instead.');
      // If download fails, open in new tab as fallback
      window.open(resignation.document, '_blank');
    } finally {
      setDownloadingId(null);
    }
  };

  const handleQuickAction = async (resignation: Resignation, status: ResignationStatus) => {
    try {
      await ResignationService.reviewResignation(resignation.id, {
        status,
        comments: `Quick ${status === ResignationStatus.APPROVED ? 'approval' : 'rejection'} by admin`
      });
      
      toast.success(`Resignation ${status === ResignationStatus.APPROVED ? 'approved' : 'rejected'} successfully!`);
      loadResignations();
    } catch (error: any) {
      console.error('Error reviewing resignation:', error);
      const errorMessage = error?.response?.data?.message || error?.message || 'Failed to review resignation';
      toast.error(errorMessage);
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-50">Resignation Management</h2>
          <p className="text-gray-600 dark:text-gray-300 mt-1">
            Review and manage employee resignation applications
          </p>
        </div>
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
                  placeholder="Search by employee name..."
                  value={searchTerm}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Status Filter */}
            <div className="flex gap-2">
              <Select
                value={statusFilter === 'all' ? 'all' : statusFilter.toString()}
                onValueChange={handleStatusFilter}
              >
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={ResignationStatus.PENDING.toString()}>
                    {RESIGNATION_STATUS_LABELS[ResignationStatus.PENDING]} 
                  </SelectItem>
                  <SelectItem value={ResignationStatus.APPROVED.toString()}>
                    {RESIGNATION_STATUS_LABELS[ResignationStatus.APPROVED]}
                  </SelectItem>
                  <SelectItem value={ResignationStatus.REJECTED.toString()}>
                    {RESIGNATION_STATUS_LABELS[ResignationStatus.REJECTED]}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card className="bg-white dark:bg-gray-800 shadow-md">
        <CardHeader>
          <CardTitle className="text-gray-900 dark:text-gray-50">
            Resignation Applications ({totalCount})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : resignations.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400">No resignation applications found</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Employee</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Submitted</TableHead>
                      <TableHead>Document</TableHead>
                      <TableHead className="w-12"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {resignations.map((resignation) => (
                      <TableRow key={resignation.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{resignation.employeeName || 'Unknown'}</div>
                            <div className="text-sm text-gray-500">{resignation.employeeEmail || 'N/A'}</div>
                          </div>
                        </TableCell>
                       
                        <TableCell>
                          <Badge 
                            className={RESIGNATION_STATUS_COLORS[resignation.status]}
                          >
                            {RESIGNATION_STATUS_LABELS[resignation.status]}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {formatDate(resignation.createdAt)}
                        </TableCell>
                        <TableCell>
                          {resignation.document ? (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDownloadDocument(resignation)}
                              disabled={downloadingId === resignation.id}
                              className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                            >
                              <Download className="w-4 h-4 mr-1" />
                              {downloadingId === resignation.id ? 'Downloading...' : 'Download'}
                            </Button>
                          ) : (
                            <span className="text-gray-400 text-sm">No document</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleView(resignation)}>
                                <Eye className="mr-2 h-4 w-4" />
                                View & Review
                              </DropdownMenuItem>
                              {resignation.status === ResignationStatus.PENDING && (
                                <>
                                  <DropdownMenuItem 
                                    onClick={() => handleQuickAction(resignation, ResignationStatus.APPROVED)}
                                    className="text-green-600"
                                  >
                                    <CheckCircle className="mr-2 h-4 w-4" />
                                    Quick Approve
                                  </DropdownMenuItem>
                                  <DropdownMenuItem 
                                    onClick={() => handleQuickAction(resignation, ResignationStatus.REJECTED)}
                                    className="text-red-600"
                                  >
                                    <XCircle className="mr-2 h-4 w-4" />
                                    Quick Reject
                                  </DropdownMenuItem>
                                </>
                              )}
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

      {/* Review Modal */}
      {selectedResignation && (
        <ResignationReviewModal
          isOpen={isReviewModalOpen}
          onClose={() => {
            setIsReviewModalOpen(false);
            setSelectedResignation(null);
          }}
          resignation={selectedResignation}
          onReview={handleReview}
        />
      )}
    </div>
  );
};

export default AdminResignationTable;