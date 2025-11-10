'use client';

import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  FileText, 
  Calendar, 
  User, 
  Download, 
  Edit, 
  Trash2,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react';
import { 
  Resignation, 
  ResignationStatus, 
  RESIGNATION_STATUS_LABELS, 
  RESIGNATION_STATUS_COLORS 
} from '@/types/resignation-types';
import ResignationService from '@/service/resignationService';
import DeleteConfirmationModal from '@/components/ui/DeleteConfirmationModal';

interface ResignationDetailsProps {
  resignation: Resignation;
  onEdit?: () => void;
  onDelete?: () => void;
  showActions?: boolean;
}

const ResignationDetails: React.FC<ResignationDetailsProps> = ({ 
  resignation, 
  onEdit, 
  onDelete,
  showActions = true 
}) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusIcon = (status: ResignationStatus) => {
    switch (status) {
      case ResignationStatus.PENDING:
        return <AlertCircle className="w-4 h-4" />;
      case ResignationStatus.APPROVED:
        return <CheckCircle className="w-4 h-4" />;
      case ResignationStatus.REJECTED:
        return <XCircle className="w-4 h-4" />;
      default:
        return <AlertCircle className="w-4 h-4" />;
    }
  };

  // No longer needed since we removed notice period calculation

  const handleDownload = async () => {
    if (!resignation.document) return;

    setIsDownloading(true);
    try {
      // Download directly from Cloudinary URL
      const response = await fetch(resignation.document);
      const blob = await response.blob();
      
      // Get file extension from the document URL
      const extension = resignation.document.split('.').pop()?.split('?')[0] || 'pdf';
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `resignation-document-${resignation.id}.${extension}`;
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
      setIsDownloading(false);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await ResignationService.deleteResignation(resignation.id);
      toast.success('Resignation deleted successfully');
      onDelete?.();
    } catch (error: any) {
      console.error('Error deleting resignation:', error);
      const errorMessage = error?.response?.data?.message || error?.message || 'Failed to delete resignation';
      toast.error(errorMessage);
    } finally {
      setIsDeleting(false);
      setIsDeleteModalOpen(false);
    }
  };

  const canEdit = resignation.status === ResignationStatus.PENDING;
  const canDelete = resignation.status === ResignationStatus.PENDING;

  return (
    <>
      <Card className="w-full max-w-4xl mx-auto">
        <CardHeader>
          <div className="flex justify-between items-start">
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Resignation Details
            </CardTitle>
            <Badge className={RESIGNATION_STATUS_COLORS[resignation.status]}>
              <div className="flex items-center gap-1">
                {getStatusIcon(resignation.status)}
                {RESIGNATION_STATUS_LABELS[resignation.status]}
              </div>
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-500">Submitted On</p>
                  <p className="font-medium">{formatDateTime(resignation.createdAt)}</p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              {resignation.reviewedAt && (
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-500">Reviewed On</p>
                    <p className="font-medium">{formatDateTime(resignation.reviewedAt)}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Reason */}
          <div className="space-y-2">
            <h3 className="font-medium text-gray-900">Reason for Resignation</h3>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-gray-700 whitespace-pre-wrap">{resignation.reason}</p>
            </div>
          </div>

          {/* Admin Comments */}
          {resignation.comments && (
            <div className="space-y-2">
              <h3 className="font-medium text-gray-900">Admin Comments</h3>
              <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-400">
                <p className="text-gray-700 whitespace-pre-wrap">{resignation.comments}</p>
              </div>
            </div>
          )}

          {/* Document */}
          {resignation.document && (
            <div className="space-y-2">
              <h3 className="font-medium text-gray-900">Supporting Document</h3>
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <FileText className="w-5 h-5 text-blue-500" />
                <span className="flex-1 text-sm text-gray-700">Resignation Document</span>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open(resignation.document, '_blank')}
                  >
                    <FileText className="w-4 h-4 mr-2" />
                    View
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleDownload}
                    disabled={isDownloading}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    {isDownloading ? 'Downloading...' : 'Download'}
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Actions */}
          {showActions && (canEdit || canDelete) && (
            <div className="flex gap-3 pt-4 border-t">
              {canEdit && onEdit && (
                <Button
                  variant="outline"
                  onClick={onEdit}
                  className="flex items-center gap-2"
                >
                  <Edit className="w-4 h-4" />
                  Edit Resignation
                </Button>
              )}
              {canDelete && onDelete && (
                <Button
                  variant="outline"
                  onClick={() => setIsDeleteModalOpen(true)}
                  className="flex items-center gap-2 text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete Resignation
                </Button>
              )}
            </div>
          )}

          {/* Status Information */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-medium text-gray-900 mb-2">Status Information</h4>
            <div className="text-sm text-gray-600">
              {resignation.status === ResignationStatus.PENDING && (
                <p>Your resignation is pending review by the administration.</p>
              )}
              {resignation.status === ResignationStatus.APPROVED && (
                <p className="text-green-700">
                  Your resignation has been approved. Please coordinate with HR for the exit process.
                </p>
              )}
              {resignation.status === ResignationStatus.REJECTED && (
                <p className="text-red-700">
                  Your resignation has been rejected. Please contact HR for further discussion.
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDelete}
        title="Delete Resignation"
        description="Are you sure you want to delete your resignation? This action cannot be undone."
        isLoading={isDeleting}
      />
    </>
  );
};

export default ResignationDetails;