export interface UserType {
    id: string
    name:  string
    phoneNumber: string
    designation: string
    isAdmin: boolean
    role: string
    joiningDate?: string
}


export interface UserState {
  user: UserType | null
  token: string | null
  isAuthenticated: boolean
  loading: boolean
} 
