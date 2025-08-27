export interface EventType {
  _id?: string
  name: string
  date: string
  location?: string
  staffIds?: string[]
}

export interface IEventWithStaff {
  _id: string;
  name: string;
  date: Date;
  location?: string;
  staffIds: {
    _id: string;
    name: string;
  }[];
  isFinished: boolean;
}

export interface IStudentData{
  _id: string,
name: string,
phoneNumber:string
address?:string,
eventId:string,
email?:string,
preferredCountry?:string[],
createdAt?: string,
staffId: {
_id: string,
name:string,
}}

