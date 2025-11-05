export interface DesignationBasicType {
  _id?: string;
  name: string;
  description?: string;
  status?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface DesignationResponse {
  id: string;
  name: string;
  description?: string;
  status: number;
  createdAt: string;
  updatedAt: string;
  createdById: string;
  createdByName: string;
}

export interface DesignationFilterType {
  status?: number[];
  fromDate?: Date;
  toDate?: Date;
  createdBy?: string[];
}

export interface DesignationFormData {
  name: string;
  description?: string;
  status: number;
}

export interface DesignationTableData {
  designations: DesignationResponse[];
  totalRecords: number;
}