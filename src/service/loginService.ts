import type { LoginType, LoginResponse } from "@/types/form-types"
import axiosInstance from "./axiosInstance"
import { logger } from '@/lib/logger'

export async function loginUser(credentials: LoginType): Promise<LoginResponse> {
  try {
    logger.info('🔐 Login attempt started', {
      component: 'LoginService',
      phoneNumber: credentials.phoneNumber, // Don't log password for security
    });

    const response = await axiosInstance.post<LoginResponse>(`/auth/login`, credentials)

    if (response.data.status) {
        // set the access token in local storage (only on client)
        try {
          if (typeof window !== 'undefined' && typeof localStorage?.setItem === 'function') {
            localStorage.setItem("accessToken", response.data.data?.accessToken || response.data.token || "")
          }
        } catch (e) {
          // ignore server/runtime environments where localStorage isn't available
        }
        
        logger.info('✅ Login successful', {
          component: 'LoginService',
          hasData: !!response.data.data,
          hasToken: !!response.data.token,
        });
        
        return response.data as LoginResponse
    } else {
      logger.warn('⚠️ Login failed - Invalid credentials', {
        component: 'LoginService',
        message: response.data.message,
      });
      
      return {
        status: false,
        message: response.data.message || "Login failed",
      }
    }
  } catch (error: any) {
    logger.error('❌ Login error', {
      component: 'LoginService',
      error: error.message,
      status: error?.response?.status,
      isNetworkError: !error?.response,
    });
    
    return {
      status: false,
      message: error?.response?.data?.message || "Network error. Please try again later.",
    }
  }
}
