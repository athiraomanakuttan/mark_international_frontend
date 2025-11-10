'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { 
  FileText, 
  Calendar, 
  User, 
  CheckCircle, 
  XCircle,
  Download
} from 'lucide-react';
import { 
  Resignation, 
  ResignationStatus, 
  RESIGNATION_STATUS_LABELS, 
  RESIGNATION_STATUS_COLORS 
} from '@/types/resignation-types';
import ResignationService from '@/service/resignationService';
import { toast } from 'react-toastify';

interface ResignationReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  resignation: Resignation;
  onReview: (status: ResignationStatus, comments?: string) => void;
}

const ResignationReviewModal: React.FC<ResignationReviewModalProps> = ({
  isOpen,
  onClose,
  resignation,
  onReview,
}) => {
  const [comments, setComments] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

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



  const handleDownload = async () => {
    if (!resignation.document) return;

    setIsDownloading(true);
    try {
      // Download directly from Cloudinary URL
      const response = await fetch(resignation.document);
      const blob = await response.blob();
      
      // Get file extension from the document URL
      const extension = resignation.document.split('.').pop()?.split('?')[0] || 'pdf';
      
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
      setIsDownloading(false);
    }
  };

  const handleApprove = async () => {
    setIsSubmitting(true);
    try {
      await onReview(ResignationStatus.APPROVED, comments.trim() || undefined);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReject = async () => {
    if (!comments.trim()) {
      toast.error('Please provide comments when rejecting a resignation');
      return;
    }

    setIsSubmitting(true);
    try {
      await onReview(ResignationStatus.REJECTED, comments.trim());
    } finally {
      setIsSubmitting(false);
    }
  };

  const isPending = resignation.status === ResignationStatus.PENDING;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Resignation Review - {resignation.employeeName}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Status Badge */}
          <div className="flex justify-center">
            <Badge className={`${RESIGNATION_STATUS_COLORS[resignation.status]} px-4 py-2 text-base`}>
              {RESIGNATION_STATUS_LABELS[resignation.status]}
            </Badge>
          </div>

          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-500">Employee</p>
                  <p className="font-medium">{resignation.employeeName}</p>
                  <p className="text-sm text-gray-500">ID: {resignation.employeeId}</p>
                </div>
              </div>

              

            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-500">Submitted On</p>
                  <p className="font-medium">{formatDateTime(resignation.createdAt)}</p>
                </div>
              </div>

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

          {/* Previous Comments */}
          {resignation.comments && (
            <div className="space-y-2">
              <h3 className="font-medium text-gray-900">Previous Admin Comments</h3>
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
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDownload}
                  disabled={isDownloading}
                >
                  {isDownloading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600 mr-2"></div>
                      Downloading...
                    </>
                  ) : (
                    <>
                      <Download className="w-4 h-4 mr-2" />
                      Download
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}

          {/* Review Section */}
          {isPending && (
            <div className="space-y-4 border-t pt-6">
              <h3 className="font-medium text-gray-900">Review Resignation</h3>
              
              <div className="space-y-2">
                <Label htmlFor="comments">
                  Comments {!isPending ? '' : '(Required for rejection)'}
                </Label>
                <Textarea
                  id="comments"
                  placeholder="Add your comments about the resignation review..."
                  value={comments}
                  onChange={(e) => setComments(e.target.value)}
                  rows={4}
                  maxLength={500}
                  disabled={isSubmitting}
                />
                <p className="text-sm text-gray-500">
                  {comments.length}/500 characters
                </p>
              </div>

              <div className="flex gap-3">
                <Button
                  onClick={handleApprove}
                  disabled={isSubmitting}
                  className="flex-1 bg-green-500 hover:bg-green-600 text-white"
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Processing...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Approve Resignation
                    </>
                  )}
                </Button>
                <Button
                  onClick={handleReject}
                  disabled={isSubmitting}
                  variant="outline"
                  className="flex-1 text-red-600 border-red-600 hover:bg-red-50"
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600 mr-2"></div>
                      Processing...
                    </>
                  ) : (
                    <>
                      <XCircle className="w-4 h-4 mr-2" />
                      Reject Resignation
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end pt-4 border-t">
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ResignationReviewModal;