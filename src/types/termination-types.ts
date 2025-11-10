// Termination Types for Frontend
export type TerminationType = 'staff' | 'employee';

export interface Termination {
  id: string;
  type: TerminationType;
  personId: string;
  personName: string;
  reason: string;
  terminatedBy: string;
  terminatedByName?: string;
  terminatedAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface StaffEmployee {
  _id: string;
  name: string;
  email?: string;
  phoneNumber?: string;
  designation?: string;
  isActive: number;
}

export interface CreateTerminationRequest {
  type: TerminationType;
  personId: string;
  reason: string;
}

export interface TerminationFormData {
  type: TerminationType;
  personId: string;
  reason: string;
}

export interface TerminationFormErrors {
  type?: string;
  personId?: string;
  reason?: string;
}

// API Response Types
export interface TerminationResponse {
  status: boolean;
  message: string;
  data: Termination;
}

export interface TerminationsResponse {
  status: boolean;
  message: string;
  data: {
    terminations: Termination[];
    totalRecords: number;
  };
}

export interface StaffEmployeeListResponse {
  status: boolean;
  message: string;
  data: StaffEmployee[];
}

// API service types
export interface GetTerminationsParams {
  page?: number;
  limit?: number;
  search?: string;
  type?: TerminationType;
}

export const TERMINATION_TYPE_LABELS = {
  staff: 'Office Staff',
  employee: 'Employee'
} as const;
