export interface StaffBasicType {
  id?: string,
  name: string;
  phoneCode: string;
  phoneNumber: string;
  password: string;
  designation: string;
  email?: string;
  profilePic?: File ;
  accessibleUsers?: number[];
  openingBalance?: number;
}
export interface StaffUpdateType{
  name ?: string;
  phoneCode ?: string;
  phoneNumber ?: string;
  password ?: string;
  designation ?: string;
  email ?: string;
  profilePic ?: File;
  accessibleUsers ?: number[];
  openingBalance ?: number;
}


export interface StaffDataType {
    id :string,
    name: string,
    email?: string,
    phoneNumber: string,
    designation : string,
    profilePic ?: string,
    createdAt ?: string,
    status ?: number
    accessibleUsers: number[];
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
email ?: string,
accessibleUsers ?: string[],
openingBalance : number,
role : string,
profilePic?: string,
isActive : number,
createdAt : string,
updatedAt : string,
}

