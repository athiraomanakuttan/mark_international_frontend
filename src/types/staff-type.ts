export interface StaffBasicType {
  name: string;
  phoneCode: string;
  phoneNumber: string;
  password: string;
  designation: string;
  email?: string;
  profilePic?: File;
  accessibleUsers?: number[];
  openingBalance: number;
}
