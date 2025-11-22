
export interface branchData  {
  branchId: string
  branchName: string
}
export interface StaffBasicType {
  id?: string;
  name: string;
  phoneCode: string;
  phoneNumber: string;
  password: string;
  designation: string;
  branchId?: string;
  branchName?: string; // Only branchId for create/update
  email?: string;
  profilePic?: File;
  file?: File; // For compatibility with backend multer config
  accessibleUsers?: string[];
  openingBalance?: number;
}
export interface StaffUpdateType {
  name?: string;
  phoneCode?: string;
  phoneNumber?: string;
  password?: string;
  designation?: string;
  branchId?: string; // Only branchId for update
  branchName?: string;
  email?: string;
  profilePic?: File;
  accessibleUsers?: string[];
  openingBalance?: number;
}


export interface StaffDataType {
  id: string;
  name: string;
  phoneNumber: string;
  designation: string;
  branchId?: string;
  branchName?: string;
  email?: string;
  profilePic?: string;
  createdAt?: string;
  status?: number;
  accessibleUsers?: string[];
  openingBalance?: number;
}

export interface EditStaffModalProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  user: StaffDataType;
  onSubmit: (updatedData: StaffDataType) => void;
}

export interface StaffDataResponse {
  _id: string,
name :  string,
phoneNumber : string,
designation : string,
branch?:branchData,
email ?: string,
accessibleUsers ?: string[],
openingBalance : number,
role : string,
profilePic?: string,
isActive : number,
createdAt : string,
updatedAt : string,
}

