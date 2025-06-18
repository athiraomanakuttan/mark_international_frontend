export interface LoginType{
    userName : string,
    password : string
}

export interface StaffType {
  name: string;
  phoneNumber: string;
  password: string;
  designation: string;
  email ?: string;
  accessibleUsers ?: string;
  staffImage ?: File | null;
  openingBalance ?: string;
  accessOfficialWhatsapp ?: boolean;
  accessPhoneCallLog ?: boolean; 
}