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
import { 
  LeaveRequestModalProps, 
  CreateLeaveRequestDto,
  LeaveRequestFormData 
} from '@/types/attendance-types';
import { AttendanceService } from '@/service/attendanceService';

export function LeaveRequestModal({
  isOpen,
  onClose,
  onSubmit,
  selectedDate,
  userId,
  isLoading = false
}: LeaveRequestModalProps) {
  const [formData, setFormData] = useState<LeaveRequestFormData>({
    leaveDate: selectedDate || '',
    reason: '',
    documents: []
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
        documents: formData.documents
      },
      userJoiningDate
    );

    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      return false;
    }

    return true;
  };

  // Handle form submission
  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    
    console.log('Submitting leave request with data:', {
      userId,
      leaveDate: formData.leaveDate,
      reason: formData.reason.trim(),
      documentsCount: formData.documents.length
    });
    
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
        documents: formData.documents
      };

      console.log('Calling onSubmit with:', leaveRequestData);
      await onSubmit(leaveRequestData);
      
      // Reset form on success
      setFormData({
        leaveDate: '',
        reason: '',
        documents: []
      });
      
      onClose();
    } catch (error) {
      console.error('Error submitting leave request:', error);
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
        documents: []
      });
      setErrors([]);
      onClose();
    }
  };

  // Reset form when modal opens with new selected date
  React.useEffect(() => {
    if (isOpen && selectedDate) {
      setFormData(prev => ({
        ...prev,
        leaveDate: selectedDate
      }));
    }
  }, [isOpen, selectedDate]);

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Calendar className="w-5 h-5" />
            <span>Request Leave</span>
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
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
            />
          </div>

          {/* Reason */}
          <div className="space-y-2">
            <Label htmlFor="reason">Reason for Leave</Label>
            <Textarea
              id="reason"
              placeholder="Please provide a detailed reason for your leave request (minimum 10 characters)"
              value={formData.reason}
              onChange={(e) => handleInputChange('reason', e.target.value)}
              rows={4}
              minLength={10}
              maxLength={500}
              required
              disabled={isSubmitting || isLoading}
              className="resize-none"
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
                  className="flex items-center space-x-2"
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
                    <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded-md">
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
                        className="flex-shrink-0 text-red-600 hover:text-red-700"
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
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || isLoading || !formData.leaveDate || !formData.reason.trim()}
              className="min-w-[120px]"
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