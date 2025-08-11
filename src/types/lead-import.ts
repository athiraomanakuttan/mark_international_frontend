export interface RawLeadData {
  name: string
  phoneNumber: string
  countryCode?: string // Optional from file
  address?: string // Optional from file
}

export interface CommonLeadFormData {
  defaultCountryCode: string 
  defaultAddress: string 
  leadCategory: string
  staff: string
  leadSource: string
  priority: string
}

export interface FinalProcessedLead {
  name: string
  phoneNumber: string
  countryCode?: string
  address ?: string
  leadCategory ?: string
  staff ?: string
  leadSource ?: string
  priority ?: string
}
