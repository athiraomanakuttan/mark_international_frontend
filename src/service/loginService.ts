import type { LoginType, LoginResponse } from "@/types/form-types"
import axios from "axios"

const BACKEND_URI = process.env.NEXT_PUBLIC_BACKEND_URI 
export async function loginUser(credentials: LoginType): Promise<LoginResponse> {
  try {
   const response  = await axios.post<LoginResponse>(`${BACKEND_URI}/auth/login`, credentials)
   console.log("response",response.data)
    if (response.data.status) {
        //set the access token in local storage
        localStorage.setItem("accessToken", response.data.token || "")
        return response.data as LoginResponse
    }else {
      return {
        status: false,
        message: response.data.message || "Login failed",
      } }
  } catch (error: any) {
    return {
      status: false,
      message: error?.response?.data?.message || "Network error. Please try again later.",
    }
  }
}
