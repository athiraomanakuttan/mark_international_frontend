export interface StaffBasicType {
  name: string;
  phoneCode: string;
  phoneNumber: string;
  password: string;
  designation: string;
  email?: string;
  profilePic?: File;
  accessibleUsers?: number[];
  openingBalance?: number;
}


export interface StaffDataType {
    id :string,
    name: string,
    phoneNumber: string,
    designation : string,
    profilePic ?: string,
    createdAt ?: string,
    status ?: number
}


