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

// Get all registrations with pagination
export const getRegistrations = async (page: number = 1, limit: number = 10) => {
  try {
    const response = await axiosInstance.get(`/registrations?page=${page}&limit=${limit}`)
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
