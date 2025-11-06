import axiosInstance from './axiosInstance';

export interface UploadResponse {
  success: boolean;
  message: string;
  data: {
    url: string;
    public_id: string;
    original_name: string;
    size: number;
    mimetype: string;
  };
}

export interface MultipleUploadResponse {
  success: boolean;
  message: string;
  data: Array<{
    url: string;
    public_id: string;
    original_name: string;
    size: number;
    mimetype: string;
  }>;
}

export class FileUploadService {
  /**
   * Upload a single file to Cloudinary
   * @param file - The file to upload
   * @param folder - Optional folder name for organization
   * @returns Promise with upload response
   */
  static async uploadSingleFile(file: File, folder?: string): Promise<UploadResponse> {
    const formData = new FormData();
    formData.append('file', file);
    
    if (folder) {
      formData.append('folder', folder);
    }

    const response = await axiosInstance.post('/upload/single', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });

    return response.data;
  }

  /**
   * Upload multiple files to Cloudinary
   * @param files - Array of files to upload
   * @param folder - Optional folder name for organization
   * @returns Promise with upload response
   */
  static async uploadMultipleFiles(files: File[], folder?: string): Promise<MultipleUploadResponse> {
    const formData = new FormData();
    
    files.forEach((file) => {
      formData.append('files', file);
    });
    
    if (folder) {
      formData.append('folder', folder);
    }

    const response = await axiosInstance.post('/upload/multiple', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });

    return response.data;
  }

  /**
   * Upload employee profile picture
   * @param file - The profile picture file
   * @returns Promise with upload response
   */
  static async uploadEmployeeProfile(file: File): Promise<UploadResponse> {
    return this.uploadSingleFile(file, 'employees/profile-pictures');
  }

  /**
   * Upload document files
   * @param files - Array of document files
   * @returns Promise with upload response
   */
  static async uploadDocuments(files: File[]): Promise<MultipleUploadResponse> {
    return this.uploadMultipleFiles(files, 'documents');
  }

  /**
   * Validate file type for images
   * @param file - File to validate
   * @returns boolean indicating if file is a valid image
   */
  static isValidImage(file: File): boolean {
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
    return validTypes.includes(file.type);
  }

  /**
   * Validate file size
   * @param file - File to validate
   * @param maxSizeMB - Maximum file size in MB
   * @returns boolean indicating if file size is valid
   */
  static isValidFileSize(file: File, maxSizeMB: number = 5): boolean {
    const maxSizeBytes = maxSizeMB * 1024 * 1024;
    return file.size <= maxSizeBytes;
  }

  /**
   * Validate file for employee profile
   * @param file - File to validate
   * @returns object with validation result and error message
   */
  static validateEmployeeProfile(file: File): { isValid: boolean; error?: string } {
    if (!this.isValidImage(file)) {
      return { isValid: false, error: 'Please select a valid image file (JPG, PNG, GIF)' };
    }

    if (!this.isValidFileSize(file, 5)) {
      return { isValid: false, error: 'File size must be less than 5MB' };
    }

    return { isValid: true };
  }
}