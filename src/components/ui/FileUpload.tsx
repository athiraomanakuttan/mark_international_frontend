'use client';

import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Upload, X, File, Image } from 'lucide-react';
import { toast } from 'react-toastify';
import { FileUploadService } from '@/service/fileUploadService';

interface FileUploadProps {
  onUploadSuccess: (url: string) => void;
  onUploadError?: (error: string) => void;
  acceptedFileTypes?: string;
  maxFileSize?: number; // in MB
  folder?: string;
  multiple?: boolean;
  className?: string;
  buttonText?: string;
  showPreview?: boolean;
}

export const FileUpload: React.FC<FileUploadProps> = ({
  onUploadSuccess,
  onUploadError,
  acceptedFileTypes = 'image/*',
  maxFileSize = 5,
  folder,
  multiple = false,
  className = '',
  buttonText = 'Upload File',
  showPreview = true
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    
    if (files.length === 0) return;

    // Validate files
    const validFiles: File[] = [];
    const errors: string[] = [];

    files.forEach((file) => {
      // Check file size
      if (!FileUploadService.isValidFileSize(file, maxFileSize)) {
        errors.push(`${file.name}: File size must be less than ${maxFileSize}MB`);
        return;
      }

      // Check file type for images
      if (acceptedFileTypes.includes('image') && !FileUploadService.isValidImage(file)) {
        errors.push(`${file.name}: Please select a valid image file`);
        return;
      }

      validFiles.push(file);
    });

    if (errors.length > 0) {
      errors.forEach(error => toast.error(error));
      return;
    }

    setSelectedFiles(validFiles);

    // Create preview URLs for images
    if (showPreview && acceptedFileTypes.includes('image')) {
      const urls = validFiles.map(file => URL.createObjectURL(file));
      setPreviewUrls(urls);
    }
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) {
      toast.error('Please select files to upload');
      return;
    }

    setIsUploading(true);

    try {
      if (multiple) {
        const response = await FileUploadService.uploadMultipleFiles(selectedFiles, folder);
        
        if (response.success) {
          const urls = response.data.map(file => file.url);
          urls.forEach(url => onUploadSuccess(url));
          toast.success(response.message);
          handleClear();
        }
      } else {
        const response = await FileUploadService.uploadSingleFile(selectedFiles[0], folder);
        
        if (response.success) {
          onUploadSuccess(response.data.url);
          toast.success(response.message);
          handleClear();
        }
      }
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || error?.message || 'Upload failed';
      toast.error(errorMessage);
      onUploadError?.(errorMessage);
    } finally {
      setIsUploading(false);
    }
  };

  const handleClear = () => {
    setSelectedFiles([]);
    setPreviewUrls([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeFile = (index: number) => {
    const newFiles = selectedFiles.filter((_, i) => i !== index);
    const newUrls = previewUrls.filter((_, i) => i !== index);
    
    setSelectedFiles(newFiles);
    setPreviewUrls(newUrls);
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <div>
        <Label htmlFor="file-upload" className="text-gray-700 dark:text-gray-300">
          Select Files
        </Label>
        <Input
          ref={fileInputRef}
          id="file-upload"
          type="file"
          accept={acceptedFileTypes}
          multiple={multiple}
          onChange={handleFileSelect}
          className="mt-1"
        />
      </div>

      {/* File Preview */}
      {selectedFiles.length > 0 && (
        <div className="space-y-2">
          <Label className="text-gray-700 dark:text-gray-300">Selected Files:</Label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {selectedFiles.map((file, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded-lg"
              >
                <div className="flex items-center gap-2">
                  {previewUrls[index] ? (
                    <img
                      src={previewUrls[index]}
                      alt={file.name}
                      className="w-8 h-8 object-cover rounded"
                    />
                  ) : acceptedFileTypes.includes('image') ? (
                    <Image className="w-5 h-5 text-gray-500" />
                  ) : (
                    <File className="w-5 h-5 text-gray-500" />
                  )}
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate max-w-32">
                      {file.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeFile(index)}
                  className="h-8 w-8 p-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Upload Actions */}
      <div className="flex gap-2">
        <Button
          onClick={handleUpload}
          disabled={selectedFiles.length === 0 || isUploading}
          className="bg-emerald-500 hover:bg-emerald-600 text-white"
        >
          {isUploading ? (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
          ) : (
            <Upload className="h-4 w-4 mr-2" />
          )}
          {isUploading ? 'Uploading...' : buttonText}
        </Button>
        
        {selectedFiles.length > 0 && (
          <Button
            type="button"
            variant="outline"
            onClick={handleClear}
            disabled={isUploading}
          >
            Clear
          </Button>
        )}
      </div>
    </div>
  );
};