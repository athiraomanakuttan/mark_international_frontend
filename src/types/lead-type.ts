export interface LeadBasicType {
  _id?: string;
  name?: string;
  phoneCode?: string;
  phoneNumber?: string;
  leadType?: number;
  assignedAgent?: string;
  cost?: number;
  priority?: number;
  address?: string;
  remarks?: string;
  leadSource?: number;
  category?: string;
  status: number;
  referredBy: string;
  createdAt?: string;
  updatedAt?: string;
  createdBy?: string;
}

export interface LeadResponse {
  id: string;
  name: string;
  phoneNumber: string;
  leadType?: number;
  assignedAgent?: string;
  assignedAgent_id?: string;
  assignedAgent_name?: string;
  cost?: number;
  priority?: number;
  address?: string;
  remarks?: string;
  leadSource?: number;
  category?: string;
  status: number;
  referredBy?: string;
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
  createdById: string;
  createdByName: string;
}

export interface LeadFilterType {
  fromDate?: Date;
  toDate?: Date;
  leadCategory?: (string | number)[];
  leadStatus?: (string | number)[];
  priority ?: (string | number)[];
  leadSource ?: (string | number)[];
  staff ?: (string | number)[];
  createBy ?: (string | number)[];
}

export interface FollowupData{
  id: string;
    date?: string;
    time?: string;
    user?: string;
    createdDate?: string;
    remarks?: string;
}