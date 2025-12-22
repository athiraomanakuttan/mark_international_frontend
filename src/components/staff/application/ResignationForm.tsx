import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Upload, FileText, X } from 'lucide-react';
import { 
  ResignationFormData, 
  ResignationFormErrors, 
  CreateResignationRequest,
  Resignation 
} from '@/types/resignation-types';
import ResignationService from '@/service/resignationService';
import { handleSafeFormSubmit } from '@/lib/formHelpers';

interface ResignationFormProps {
  onSuccess: () => void;
  onCancel?: () => void;
  initialData?: Resignation; // For edit mode
  isEditMode?: boolean;
}

const ResignationForm: React.FC<ResignationFormProps> = ({ onSuccess, onCancel, initialData, isEditMode = false }) => {
  const [formData, setFormData] = useState<ResignationFormData>({
    reason: '',
    document: undefined
  });

  const [errors, setErrors] = useState<ResignationFormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [existingDocument, setExistingDocument] = useState<string | undefined>(undefined);

  // Populate form with initial data in edit mode
  useEffect(() => {
    if (isEditMode && initialData) {
      setFormData({
        reason: initialData.reason || '',
        document: undefined
      });
      setExistingDocument(initialData.document);
    }
  }, [isEditMode, initialData]);

  const validateForm = (): boolean => {
    const newErrors: ResignationFormErrors = {};

    // Validate reason
    if (!formData.reason.trim()) {
      newErrors.reason = 'Reason for resignation is required';
    } else if (formData.reason.trim().length < 10) {
      newErrors.reason = 'Reason must be at least 10 characters long';
    } else if (formData.reason.trim().length > 500) {
      newErrors.reason = 'Reason cannot exceed 500 characters';
    }

    // Validate document (optional but check file type if provided)
    if (selectedFile) {
      const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
      const maxSize = 5 * 1024 * 1024; // 5MB

      if (!allowedTypes.includes(selectedFile.type)) {
        newErrors.document = 'Only PDF, JPG, JPEG, and PNG files are allowed';
      } else if (selectedFile.size > maxSize) {
        newErrors.document = 'File size cannot exceed 5MB';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: keyof ResignationFormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Clear error for this field
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: undefined
      }));
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setFormData(prev => ({
        ...prev,
        document: file
      }));
      
      // Clear file error
      if (errors.document) {
        setErrors(prev => ({
          ...prev,
          document: undefined
        }));
      }
    }
  };

  const removeFile = () => {
    setSelectedFile(null);
    setFormData(prev => ({
      ...prev,
      document: undefined
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    await handleSafeFormSubmit(
      e,
      async () => {
        if (!validateForm()) {
          toast.error('Please fix the errors in the form');
          return;
        }

        if (isEditMode && initialData) {
          // Update existing resignation
          const updateData: any = {
            reason: formData.reason.trim(),
          };

          // Only include document if a new file was selected
          if (selectedFile) {
            updateData.document = selectedFile;
          }

          await ResignationService.updateResignation(initialData.id, updateData);
        } else {
          // Create new resignation
          const requestData: CreateResignationRequest = {
            reason: formData.reason.trim(),
            document: selectedFile || undefined
          };

          await ResignationService.createResignation(requestData);
        }
        
        onSuccess();
      },
      {
        onStart: () => setIsSubmitting(true),
        onError: (error: any) => {
          console.error('Error submitting resignation:', error);
          const errorMessage = error?.response?.data?.message || error?.message || 'Failed to submit resignation';
          toast.error(errorMessage);
        },
        onSuccess: () => {
          // Success handling is done in the main handler
        },
        preventRedirectHeaders: true
      }
    );

    setIsSubmitting(false);
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="w-5 h-5" />
          {isEditMode ? 'Edit Resignation' : 'Submit Resignation'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Reason */}
          <div className="space-y-2">
            <Label htmlFor="reason">
              Reason for Resignation *
            </Label>
            <Textarea
              id="reason"
              placeholder="Please provide your reason for resignation (minimum 10 characters)"
              value={formData.reason}
              onChange={(e) => handleInputChange('reason', e.target.value)}
              className={errors.reason ? 'border-red-500' : ''}
              rows={4}
              maxLength={500}
              disabled={isSubmitting}
            />
            <div className="flex justify-between items-center">
              {errors.reason && (
                <p className="text-sm text-red-500">{errors.reason}</p>
              )}
              <p className="text-sm text-gray-500 ml-auto">
                {formData.reason.length}/500 characters
              </p>
            </div>
          </div>

          {/* Document Upload */}
          <div className="space-y-2">
            <Label>
              Supporting Document (Optional)
            </Label>
            
            {/* Show existing document if in edit mode and no new file selected */}
            {isEditMode && existingDocument && !selectedFile && (
              <div className="mb-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-blue-500" />
                    <span className="text-sm text-blue-700">Current document attached</span>
                  </div>
                  <a 
                    href={existingDocument} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-sm text-blue-600 hover:underline"
                  >
                    View
                  </a>
                </div>
              </div>
            )}
            
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
              {selectedFile ? (
                <div className="flex items-center justify-between bg-gray-50 p-3 rounded">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-blue-500" />
                    <span className="text-sm text-gray-700">{selectedFile.name}</span>
                    <span className="text-xs text-gray-500">
                      ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
                    </span>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={removeFile}
                    disabled={isSubmitting}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ) : (
                <div className="text-center">
                  <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-600 mb-2">
                    {isEditMode && existingDocument 
                      ? 'Upload new document to replace existing one' 
                      : 'Upload supporting document (PDF, JPG, PNG)'}
                  </p>
                  <p className="text-xs text-gray-500 mb-4">
                    Maximum file size: 5MB
                  </p>
                  <Input
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={handleFileSelect}
                    className="hidden"
                    id="document-upload"
                    disabled={isSubmitting}
                  />
                  <Label htmlFor="document-upload" className="cursor-pointer">
                    <Button type="button" variant="outline" asChild>
                      <span>Choose File</span>
                    </Button>
                  </Label>
                </div>
              )}
            </div>
            {errors.document && (
              <p className="text-sm text-red-500">{errors.document}</p>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 pt-4">
            <Button
              type="submit"
              className="flex-1 bg-red-500 hover:bg-red-600 text-white"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  {isEditMode ? 'Updating...' : 'Submitting...'}
                </>
              ) : (
                <>{isEditMode ? 'Update Resignation' : 'Submit Resignation'}</>
              )}
            </Button>
            {onCancel && (
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={isSubmitting}
                className="flex-1"
              >
                Cancel
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default ResignationForm;