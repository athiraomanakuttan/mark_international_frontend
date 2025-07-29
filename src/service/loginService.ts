import type { LoginType, LoginResponse } from "@/types/form-types"
import axios from "./axiosInstance"
export async function loginUser(credentials: LoginType): Promise<LoginResponse> {
  try {
   const response  = await axios.post<LoginResponse>("/auth/login", credentials)
   console.log(response.data)
    if (response.data.status) {
        //set the access token in local storage
        localStorage.setItem("accessToken", response.data.token || "")
        return {
          status: true,
          message: "Login successful",
          data: response.data.data,
          token: response.data.token,
        } as LoginResponse
    }else {
      return {
        status: false,
        message: response.data.message || "Login failed",
      } }

  } catch (error) {
    return {
      status: false,
      message: "Network error. Please try again later.",
    }
  }
}
