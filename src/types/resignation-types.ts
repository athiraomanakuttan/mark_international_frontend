// Resignation Types for Frontend
export interface Resignation {
  id: string;
  employeeId: string;
  employeeName: string;
  employeeEmail?: string;
  designation?: string;
  reason: string;
  document?: string;
  status: ResignationStatus;
  statusText?: string;
  reviewedAt?: string;
  comments?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateResignationRequest {
  reason: string;
  document?: File;
}

export interface UpdateResignationRequest {
  reason?: string;
  document?: File;
}

export interface ReviewResignationRequest {
  status: ResignationStatus;
  comments?: string;
}

// Status enum
export enum ResignationStatus {
  PENDING = 0,
  APPROVED = 1,
  REJECTED = 2
}

export const RESIGNATION_STATUS_LABELS = {
  [ResignationStatus.PENDING]: 'Pending',
  [ResignationStatus.APPROVED]: 'Approved',
  [ResignationStatus.REJECTED]: 'Rejected'
} as const;

export const RESIGNATION_STATUS_COLORS = {
  [ResignationStatus.PENDING]: 'bg-yellow-100 text-yellow-800',
  [ResignationStatus.APPROVED]: 'bg-green-100 text-green-800',
  [ResignationStatus.REJECTED]: 'bg-red-100 text-red-800'
} as const;

// API Response Types
export interface ResignationResponse {
  status: boolean;
  message: string;
  data: Resignation;
}

export interface ResignationsResponse {
  status: boolean;
  message: string;
  data: {
    resignations: Resignation[];
    totalRecords: number;
  };
}

export interface DeleteResignationResponse {
  status: boolean;
  message: string;
}

// Form Types
export interface ResignationFormData {
  reason: string;
  document?: File;
}

export interface ResignationFormErrors {
  reason?: string;
  document?: string;
}

// Validation Types
export interface ResignationValidationResult {
  isValid: boolean;
  errors: ResignationFormErrors;
}

// API service types
export interface GetResignationsParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: ResignationStatus;
}

// Modal state types
export interface ResignationModalState {
  isFormModalOpen: boolean;
  isViewModalOpen: boolean;
  isDeleteModalOpen: boolean;
  selectedResignation: Resignation | null;
}

export type ResignationStatusType = typeof ResignationStatus[keyof typeof ResignationStatus];