// Employee Types for Frontend
export interface Employee {
  id: string;
  name: string;
  email: string;
  phoneNumber: string;
  designation: string; // Changed to string (designation name)
  designationId: string; // Added designation ID
  dateOfJoining: string;
  profilePicture?: string;
  address?: string;
  status: number;
  createdById: string; // Changed from createdBy
  createdByName: string; // Added created by name
  createdAt: string;
  updatedAt: string;
}

export interface CreateEmployeeRequest {
  name: string;
  email: string;
  phoneNumber: string;
  designation: string;
  dateOfJoining?: string;
  address?: string;
  status?: number;
  profilePicture?: File;
}

export interface UpdateEmployeeRequest {
  employeeId?: string;
  name?: string;
  email?: string;
  phoneNumber?: string;
  designation?: string;
  dateOfJoining?: string;
  address?: string;
  status?: number;
  profilePicture?: File;
}

export interface EmployeeFilter {
  designation?: string;
  status?: number;
  dateOfJoiningFrom?: string;
  dateOfJoiningTo?: string;
}

export interface EmployeeTableData {
  _id: string;
  employeeId: string;
  name: string;
  email: string;
  phoneNumber: string;
  designation: string;
  dateOfJoining: string;
  profilePicture?: string;
  status: number;
}

export interface EmployeesResponse {
  status: boolean;
  message: string;
  data: {
    employees: Employee[];
    totalRecords: number; // Changed from totalCount to match backend
  };
}

export interface EmployeeResponse {
  status: boolean;
  message: string;
  data: Employee;
}

export interface DeleteEmployeeResponse {
  status: boolean;
  message: string;
}

// Form state types
export interface EmployeeFormData {
  name: string;
  email: string;
  phoneNumber: string;
  designation: string;
  dateOfJoining: string;
  address: string;
  status: number;
  profilePicture?: File;
}

export interface EmployeeFormErrors {
  name?: string;
  email?: string;
  phoneNumber?: string;
  designation?: string;
  dateOfJoining?: string;
  address?: string;
  profilePicture?: string;
}

// Modal state types
export interface EmployeeModalState {
  isAddModalOpen: boolean;
  isEditModalOpen: boolean;
  isDeleteModalOpen: boolean;
  selectedEmployee: Employee | null;
}

// API service types
export interface GetEmployeesParams {
  page?: number;
  limit?: number;
  search?: string;
  filter?: EmployeeFilter;
}

// Validation types
export interface EmployeeValidationResult {
  isValid: boolean;
  errors: EmployeeFormErrors;
}

// Table configuration types
export interface EmployeeTableColumn {
  key: keyof EmployeeTableData;
  label: string;
  sortable?: boolean;
  width?: string;
  className?: string;
  render?: (value: any, row: EmployeeTableData) => React.ReactNode;
}

export interface EmployeeTableConfig {
  columns: EmployeeTableColumn[];
  actions: {
    view?: boolean;
    edit?: boolean;
    delete?: boolean;
  };
}

// Status options
export const EMPLOYEE_STATUS = {
  ACTIVE: 1,
  INACTIVE: 0
} as const;

export const EMPLOYEE_STATUS_LABELS = {
  [EMPLOYEE_STATUS.ACTIVE]: 'Active',
  [EMPLOYEE_STATUS.INACTIVE]: 'Inactive'
} as const;

export type EmployeeStatus = typeof EMPLOYEE_STATUS[keyof typeof EMPLOYEE_STATUS];