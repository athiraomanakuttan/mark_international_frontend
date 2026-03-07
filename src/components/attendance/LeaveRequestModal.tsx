"use client";

import React, { useState, useRef } from 'react';
import { X, Calendar, FileText, Upload, Trash2, AlertCircle } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';  
import { cn } from '@/lib/utils';
import styles from './LeaveRequestModal.module.css';
import { 
  LeaveRequestModalProps, 
  CreateLeaveRequestDto,
  LeaveRequestFormData, 
  LeaveRequest,
  LeaveType,
} from '@/types/attendance-types';
import { AttendanceService } from '@/service/attendanceService';
import { handleSafeFormSubmit } from '@/lib/formHelpers';

export function LeaveRequestModal({
  isOpen,
  onClose,
  onSubmit,
  selectedDate,
  userId,
  isLoading = false,
  editingLeave = null,
  monthlyConfig,
  monthlyUsage,
}: LeaveRequestModalProps & { editingLeave?: LeaveRequest | null }) {
  const [formData, setFormData] = useState<LeaveRequestFormData>({
    leaveDate: selectedDate || (editingLeave ? editingLeave.leaveDate : ''),
    reason: editingLeave ? editingLeave.reason : '',
    documents: [],
    leaveType: '',
  });
  const [errors, setErrors] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle form field changes
  const handleInputChange = (field: keyof LeaveRequestFormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    // Clear errors when user starts typing
    if (errors.length > 0) {
      setErrors([]);
    }
  };

  // Handle file selection
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    const validFiles = files.filter(file => {
      // Check file size (max 5MB per file)
      if (file.size > 5 * 1024 * 1024) {
        setErrors(prev => [...prev, `File "${file.name}" is too large. Maximum size is 5MB.`]);
        return false;
      }
      
      // Check file type (allow images and PDFs)
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'application/pdf'];
      if (!allowedTypes.includes(file.type)) {
        setErrors(prev => [...prev, `File "${file.name}" is not supported. Please upload images or PDF files.`]);
        return false;
      }
      
      return true;
    });

    if (formData.documents.length + validFiles.length > 5) {
      setErrors(['Maximum 5 files allowed']);
      return;
    }

    setFormData(prev => ({
      ...prev,
      documents: [...prev.documents, ...validFiles]
    }));

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Remove file
  const removeFile = (index: number) => {
    setFormData(prev => ({
      ...prev,
      documents: prev.documents.filter((_, i) => i !== index)
    }));
  };

  // Format file size
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Validate form
  const validateForm = (): boolean => {
    // Check if we have a valid user ID
    if (!userId) {
      setErrors(['User not authenticated. Please log in again.']);
      return false;
    }

    const userJoiningDate = '2020-01-01'; // Default fallback - this should come from user context in production
    const validationErrors = AttendanceService.validateLeaveRequest(
      {
        userId,
        leaveDate: formData.leaveDate,
        reason: formData.reason,
        documents: formData.documents,
        // Cast is safe because we enforce selection below
        leaveType: formData.leaveType as LeaveType,
      },
      userJoiningDate
    );

    if (!formData.leaveType) {
      validationErrors.push('Leave type is required');
    }

    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      return false;
    }

    return true;
  };

  // Handle form submission
  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setErrors([]);

    try {
      const leaveRequestData: CreateLeaveRequestDto = {
        userId,
        leaveDate: formData.leaveDate,
        reason: formData.reason.trim(),
        leaveType: formData.leaveType as LeaveType,
        documents: formData.documents
      };
      await onSubmit(leaveRequestData);
      
      // Reset form on success
      setFormData({
        leaveDate: '',
        reason: '',
        documents: [],
        leaveType: '',
      });
      
      onClose();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to submit leave request. Please try again.';
      setErrors([errorMessage]);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle modal close
  const handleClose = () => {
    if (!isSubmitting && !isLoading) {
      setFormData({
        leaveDate: selectedDate || '',
        reason: '',
        documents: [],
        leaveType: '',
      });
      setErrors([]);
      onClose();
    }
  };

  // Reset form when modal opens with new selected date
  React.useEffect(() => {
    if (isOpen) {
      if (editingLeave) {
        setFormData({
          leaveDate: editingLeave.leaveDate,
          reason: editingLeave.reason,
          documents: [], // Documents are not editable in this modal
          leaveType: (editingLeave as any).leaveType || '',
        });
      } else if (selectedDate) {
        setFormData(prev => ({
          ...prev,
          leaveDate: selectedDate
        }));
      }
    }
  }, [isOpen, selectedDate, editingLeave]);

  const casualLimit = monthlyConfig?.casualLimit ?? null;
  const sickLimit = monthlyConfig?.sickLimit ?? null;
  const casualApproved = monthlyUsage?.casualApproved ?? 0;
  const sickApproved = monthlyUsage?.sickApproved ?? 0;

  const canUseCasual =
    casualLimit === null || casualLimit === undefined || casualApproved < casualLimit;
  const canUseSick =
    sickLimit === null || sickLimit === undefined || sickApproved < sickLimit;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className={`sm:max-w-[500px] max-h-[90vh] overflow-y-auto ${styles.modalBoxCustom}`}>  
        <div className={styles.modalHeaderCustom}>
          <DialogHeader>
            <DialogTitle className={`flex items-center space-x-2 ${styles.modalTitleCustom}`}>
              <Calendar className="w-5 h-5" />
              <span>Request Leave</span>
            </DialogTitle>
          </DialogHeader>
        </div>

        <form onSubmit={handleSubmit} className={`space-y-6 ${styles.modalFormCustom}`}>
          {editingLeave && (
            <Alert variant="default">
              <AlertDescription>
                <div className="mb-2">
                  <strong>Viewing Applied Leave</strong>
                </div>
                <div><strong>Date:</strong> {editingLeave.leaveDate}</div>
                <div><strong>Reason:</strong> {editingLeave.reason}</div>
                <div><strong>Status:</strong> {editingLeave.status}</div>
                {editingLeave.status === 'rejected' && editingLeave.adminComments && (
                  <div className="mt-2 p-2 rounded bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
                    <strong className="text-red-800 dark:text-red-200">Rejection reason:</strong>
                    <p className="text-sm text-red-700 dark:text-red-300 mt-1">{editingLeave.adminComments}</p>
                  </div>
                )}
                {editingLeave.documents && editingLeave.documents.length > 0 && (
                  <div className="mt-2">
                    <strong>Documents:</strong>
                    <ul>
                      {editingLeave.documents.map((doc, idx) => (
                        <li key={idx}>
                          <a href={doc.url} target="_blank" rel="noopener noreferrer">{doc.title}</a>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </AlertDescription>
            </Alert>
          )}
          {/* Error Messages */}
          {errors.length > 0 && (
            <Alert variant="destructive">
              <AlertCircle className="w-4 h-4" />
              <AlertDescription>
                <ul className="list-disc list-inside space-y-1">
                  {errors.map((error, index) => (
                    <li key={index}>{error}</li>
                  ))}
                </ul>
              </AlertDescription>
            </Alert>
          )}

          {/* Leave Date */}
          <div className="space-y-2">
            <Label htmlFor="leaveDate">Leave Date</Label>
            <Input
              id="leaveDate"
              type="date"
              value={formData.leaveDate}
              onChange={(e) => handleInputChange('leaveDate', e.target.value)}
              min={new Date().toISOString().split('T')[0]}
              required
              disabled={isSubmitting || isLoading}
              className={styles.inputCustom}
            />
          </div>

          {/* Leave Type */}
          <div className="space-y-2">
            <Label htmlFor="leaveType">Leave Type</Label>
            <select
              id="leaveType"
              value={formData.leaveType}
              onChange={(e) => handleInputChange('leaveType', e.target.value as LeaveType | '')}
              disabled={isSubmitting || isLoading}
              className={cn(
                'w-full rounded-md border px-3 py-2 text-sm',
                'border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500',
                styles.inputCustom
              )}
            >
              <option value="">Select leave type</option>
              <option value={LeaveType.CASUAL} disabled={!canUseCasual}>
                Casual Leave
                {casualLimit != null
                  ? ` (${Math.max(casualLimit - casualApproved, 0)} remaining this month)`
                  : ''}
              </option>
              <option value={LeaveType.SICK} disabled={!canUseSick}>
                Sick Leave
                {sickLimit != null
                  ? ` (${Math.max(sickLimit - sickApproved, 0)} remaining this month)`
                  : ''}
              </option>
              <option value={LeaveType.LOP}>LOP</option>
            </select>
          </div>

          {/* Reason */}
          <div className="space-y-2">
            <Label htmlFor="reason">Reason for Leave</Label>
            <Textarea
              id="reason"
              value={formData.reason}
              onChange={(e) => handleInputChange('reason', e.target.value)}
              rows={4}
              minLength={10}
              maxLength={500}
              required
              disabled={isSubmitting || isLoading}
              className={`resize-none ${styles.textareaCustom}`}
            />
            <div className="flex justify-between text-sm text-gray-500">
              <span>{formData.reason.length}/500 characters</span>
              <span>Minimum 10 characters required</span>
            </div>
          </div>

          {/* Supporting Documents */}
          <div className="space-y-2">
            <Label>Supporting Documents (Optional)</Label>
            <div className="space-y-3">
              {/* File Upload Button */}
              <div className="flex items-center space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isSubmitting || isLoading || formData.documents.length >= 5}
                  className={`flex items-center space-x-2 ${styles.buttonOutlineCustom}`}
                >
                  <Upload className="w-4 h-4" />
                  <span>Upload Files</span>
                </Button>
                <span className="text-sm text-gray-500">
                  Max 5 files, 5MB each (Images, PDF)
                </span>
              </div>

              {/* Hidden File Input */}
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*,.pdf"
                onChange={handleFileSelect}
                className="hidden"
              />

              {/* Uploaded Files List */}
              {formData.documents.length > 0 && (
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Uploaded Files:</Label>
                  {formData.documents.map((file, index) => (
                    <div key={index} className={`flex items-center justify-between p-2 rounded-md ${styles.uploadedFileCustom}`}>
                      <div className="flex items-center space-x-2 flex-1 min-w-0">
                        <FileText className="w-4 h-4 text-gray-500 flex-shrink-0" />
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium truncate">{file.name}</p>
                          <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
                        </div>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFile(index)}
                        disabled={isSubmitting || isLoading}
                        className={`flex-shrink-0 ${styles.buttonDestructiveCustom}`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end space-x-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isSubmitting || isLoading}
              className={styles.buttonOutlineCustom}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={
                isSubmitting ||
                isLoading ||
                !formData.leaveDate ||
                !formData.reason.trim() ||
                !formData.leaveType
              }
              className={`min-w-[120px] ${styles.buttonPrimaryCustom}`}
            >
              {isSubmitting || isLoading ? (
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Submitting...</span>
                </div>
              ) : (
                'Submit Request'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}