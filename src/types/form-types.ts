export interface LoginType {
  phoneNumber: string
  password: string
}

export interface LoginResponse {
  status: boolean
  message: string
  data?: any
  token?: string
}
