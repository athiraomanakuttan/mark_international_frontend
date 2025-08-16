export interface DashboardLeadType{
	    "totalLeads": number,
        "new": number,
        "followUp": number,
        "closed": number,
        "missed": number,
        "transferred": number,
}

type LeadStatusCounts = {
  "new lead": number;
  "pending lead": number;
  "followup lead": number;
  "rejected lead": number;
  "closed lead": number;
};

export type StaffLeadData = {
  name: string;
  data: LeadStatusCounts;
};