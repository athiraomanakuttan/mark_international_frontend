import type { LoginType, LoginResponse } from "@/types/form-types"
import axios from "axios"

const BACKEND_URI = process.env.NEXT_PUBLIC_BACKEND_URI 
export async function loginUser(credentials: LoginType): Promise<LoginResponse> {
  try {
   const response  = await axios.post<LoginResponse>(`${BACKEND_URI}/auth/login`, credentials)

    if (response.data.status) {
        // set the access token in local storage (only on client)
        try {
          if (typeof window !== 'undefined' && typeof localStorage?.setItem === 'function') {
            localStorage.setItem("accessToken", response.data.token || "")
          }
        } catch (e) {
          // ignore server/runtime environments where localStorage isn't available
        }
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
