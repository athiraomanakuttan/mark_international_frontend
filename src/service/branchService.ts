import axiosInstance from "./axiosInstance"
import { BranchType, CreateBranchType, UpdateBranchType, BranchResponseType, BranchPaginationResponseType } from "@/types/branch-types"

// Get all branches
export const getAllBranches = async (): Promise<BranchResponseType> => {
  try {
    const response = await axiosInstance.get('/admin/branches')
    return response?.data?.data
  } catch (error) {
    throw error
  }
}

// Get branches with pagination and search
export const getBranchesWithPagination = async (
  page: number = 1,
  limit: number = 10,
  search?: string
): Promise<BranchPaginationResponseType> => {
  try {
    const searchParam = search ? `&search=${encodeURIComponent(search)}` : ''
    const response = await axiosInstance.get(`/admin/branches?page=${page}&limit=${limit}${searchParam}`)
    return response.data
  } catch (error) {
    throw error
  }
}

// Get branch by ID
export const getBranchById = async (branchId: string): Promise<BranchResponseType> => {
  try {
    const response = await axiosInstance.get(`/admin/branches/${branchId}`)
    return response.data
  } catch (error) {
    throw error
  }
}

// Create new branch
export const createBranch = async (branchData: CreateBranchType): Promise<BranchResponseType> => {
  try {
    const response = await axiosInstance.post('/admin/branches', branchData)
    return response.data
  } catch (error) {
    throw error
  }
}

// Update branch
export const updateBranch = async (branchId: string, branchData: UpdateBranchType): Promise<BranchResponseType> => {
  try {
    const response = await axiosInstance.put(`/admin/branches/${branchId}`, branchData)
    return response.data
  } catch (error) {
    throw error
  }
}

// Delete branch
export const deleteBranch = async (branchId: string): Promise<BranchResponseType> => {
  try {
    const response = await axiosInstance.delete(`/admin/branches/${branchId}`)
    return response.data
  } catch (error) {
    throw error
  }
}