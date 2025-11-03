import axiosInstance from "./axiosInstance"
import { RegistrationResponse } from "@/types/registration-types"

// Submit registration form
export const submitRegistration = async (formData: FormData): Promise<RegistrationResponse> => {
  try {
    const response = await axiosInstance.post('/registration', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    return response.data
  } catch (error) {
    throw error
  }
}

// Get registration by ID
export const getRegistrationById = async (registrationId: string): Promise<RegistrationResponse> => {
  try {
    const response = await axiosInstance.get(`/registration/${registrationId}`)
    return response.data
  } catch (error) {
    throw error
  }
}
