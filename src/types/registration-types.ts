// Registration form types
export interface RegistrationFormData {
  // Personal Information
  name: string
  dateOfBirth: string
  contactNumber: string
  maritalStatus: 'single' | 'married' | 'divorced' | 'widowed' | ''
  
  // Address Information
  address: {
    street: string
    city: string
    state: string
    pincode: string
    country: string
  }
  
  // Documents
  documents: DocumentUpload[]
}

export interface DocumentUpload {
  id: string
  title: string
  file: File | null
  fileName: string
}

export interface RegistrationFormErrors {
  name?: string
  dateOfBirth?: string
  contactNumber?: string
  maritalStatus?: string
  address?: {
    street?: string
    city?: string
    state?: string
    pincode?: string
    country?: string
  }
  documents?: { [key: string]: string | undefined }
}

// API Response types
export interface RegistrationResponse {
  // Some APIs return { status: boolean } while others return { success: boolean }
  // Accept either to be tolerant of backend shape differences
  status?: boolean
  success?: boolean
  message?: string
  data?: any
}