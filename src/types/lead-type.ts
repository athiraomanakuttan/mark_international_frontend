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

  called_date?: Date | string;
  call_result?: number;
  remarks?: string;
  leadSource?: number;
  category?: string;
  status ?: number;
  referredBy?: string;
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
  called_date?: Date | string;
  call_result?: number;
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
  called_date ?: (string | number)[];
  call_result ?: (string | number)[];

}

export interface FollowupData{
  id: string;
    date?: string;
    time?: string;
    user?: string;
    createdDate?: string;
    remarks?: string;
    assignedAgentId?:string;
}

export interface FollowUpType{
  leadId ?: string;
  followup_date: string
  assignedAgentId?: string;
  isDeleted ?: boolean;
  remarks?: string;
}
 