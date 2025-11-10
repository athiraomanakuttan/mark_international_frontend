import { 
  ResignationFormData, 
  ResignationFormErrors, 
  ResignationValidationResult 
} from '@/types/resignation-types';

export class ResignationValidation {
  /**
   * Validate resignation form data
   */
  static validateResignationForm(data: ResignationFormData): ResignationValidationResult {
    const errors: ResignationFormErrors = {};

    // Validate start date
    if (!data.startDate) {
      errors.startDate = 'Start date is required';
    } else {
      const startDate = new Date(data.startDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (startDate < today) {
        errors.startDate = 'Start date cannot be in the past';
      }
    }

    // Validate end date
    if (!data.endDate) {
      errors.endDate = 'End date is required';
    } else if (data.startDate) {
      const startDate = new Date(data.startDate);
      const endDate = new Date(data.endDate);
      
      if (endDate <= startDate) {
        errors.endDate = 'End date must be after start date';
      }
      
      // Check if notice period is reasonable (at least 1 day, max 365 days)
      const diffTime = endDate.getTime() - startDate.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays > 365) {
        errors.endDate = 'Notice period cannot exceed 365 days';
      }
    }

    // Validate reason
    if (!data.reason || !data.reason.trim()) {
      errors.reason = 'Reason for resignation is required';
    } else {
      const trimmedReason = data.reason.trim();
      
      if (trimmedReason.length < 10) {
        errors.reason = 'Reason must be at least 10 characters long';
      } else if (trimmedReason.length > 500) {
        errors.reason = 'Reason cannot exceed 500 characters';
      }
    }

    // Validate document (if provided)
    if (data.document) {
      const file = data.document;
      const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
      const maxSize = 5 * 1024 * 1024; // 5MB

      if (!allowedTypes.includes(file.type)) {
        errors.document = 'Only PDF, JPG, JPEG, and PNG files are allowed';
      } else if (file.size > maxSize) {
        errors.document = 'File size cannot exceed 5MB';
      } else if (file.size === 0) {
        errors.document = 'File appears to be empty';
      }
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  }

  /**
   * Validate individual field
   */
  static validateField(field: keyof ResignationFormData, value: any, formData?: Partial<ResignationFormData>): string | undefined {
    switch (field) {
      case 'startDate':
        if (!value) {
          return 'Start date is required';
        }
        const startDate = new Date(value);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        if (startDate < today) {
          return 'Start date cannot be in the past';
        }
        break;

      case 'endDate':
        if (!value) {
          return 'End date is required';
        }
        if (formData?.startDate) {
          const startDate = new Date(formData.startDate);
          const endDate = new Date(value);
          
          if (endDate <= startDate) {
            return 'End date must be after start date';
          }
          
          const diffTime = endDate.getTime() - startDate.getTime();
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          
          if (diffDays > 365) {
            return 'Notice period cannot exceed 365 days';
          }
        }
        break;

      case 'reason':
        if (!value || !value.trim()) {
          return 'Reason for resignation is required';
        }
        const trimmedReason = value.trim();
        
        if (trimmedReason.length < 10) {
          return 'Reason must be at least 10 characters long';
        } else if (trimmedReason.length > 500) {
          return 'Reason cannot exceed 500 characters';
        }
        break;

      case 'document':
        if (value) {
          const file = value as File;
          const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
          const maxSize = 5 * 1024 * 1024; // 5MB

          if (!allowedTypes.includes(file.type)) {
            return 'Only PDF, JPG, JPEG, and PNG files are allowed';
          } else if (file.size > maxSize) {
            return 'File size cannot exceed 5MB';
          } else if (file.size === 0) {
            return 'File appears to be empty';
          }
        }
        break;
    }

    return undefined;
  }

  /**
   * Get validation messages for UI
   */
  static getValidationMessages() {
    return {
      startDate: {
        required: 'Please select a start date for your resignation',
        pastDate: 'Start date cannot be in the past',
      },
      endDate: {
        required: 'Please select your last working day',
        beforeStart: 'Last working day must be after the start date',
        tooLong: 'Notice period cannot exceed 365 days',
      },
      reason: {
        required: 'Please provide a reason for your resignation',
        tooShort: 'Please provide a more detailed reason (at least 10 characters)',
        tooLong: 'Reason is too long (maximum 500 characters)',
      },
      document: {
        invalidType: 'Please upload a PDF, JPG, JPEG, or PNG file',
        tooLarge: 'File size must be less than 5MB',
        empty: 'The selected file appears to be empty',
      }
    };
  }

  /**
   * Calculate notice period in days
   */
  static calculateNoticePeriod(startDate: string, endDate: string): number {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  /**
   * Check if dates are valid for resignation
   */
  static isValidDateRange(startDate: string, endDate: string): boolean {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Start date should not be in the past
    if (start < today) return false;
    
    // End date should be after start date
    if (end <= start) return false;
    
    // Notice period should be reasonable
    const noticePeriod = this.calculateNoticePeriod(startDate, endDate);
    if (noticePeriod > 365) return false;

    return true;
  }
}