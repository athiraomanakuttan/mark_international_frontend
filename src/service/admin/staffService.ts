import { StaffBasicType, StaffUpdateType } from "@/types/staff-type";
import axiosInstance from "../axiosInstance"

export const createStaff = async (data: StaffBasicType) => {
  try {

    const formData = new FormData();
    (Object.keys(data) as Array<keyof StaffBasicType>).forEach((key) => {
      const value = data[key];
      if (value !== undefined && value !== null) {
        formData.append(key, value as any); 
      }
    });

    const response = await axiosInstance.post("/admin/staff", formData);
    console.log("response", response);
    return response.data;
  } catch (error:any) {
    console.log("Error creating staff:", error.response?.data?.error);
    throw {message:  error.response?.data?.error || "Failed to create staff member."};
  }
}
export const getStaffList = async (status: number,page: number, limit:number) => {
  console.log("Fetching staff list with status:", status, "page:", page, "limit:", limit);
  try {
    //geting user details pass with query
    const response = await axiosInstance.get(`/admin/staff?status=${status}&page=${page}&limit=${limit}`);
    return response.data;
  } catch (error: any) {
    console.log("Error fetching staff list:", error.response?.data?.error);
    throw {message:  error.response?.data?.error || "Failed to fetch staff list."};
  }
}
export const updateStaff = async (id: string, data: StaffUpdateType) => {
  try {
    const formData = new FormData();
    (Object.keys(data) as Array<keyof StaffUpdateType>).forEach((key) => {
      const value = data[key];
      if (value !== undefined && value !== null) {
        formData.append(key, value as any); // handle strings/files
      }
    });   

    const response = await axiosInstance.patch(`/admin/staff/${id}`, formData);
    return response.data;
  } catch (error:any) {
    console.log("Error updating staff:", error.response?.data?.error);
    throw {message:  error.response?.data?.error || "Failed to update staff member."};
  }
}

export const updateStatus = async (id: string, status: number) => {
  try {
    const response = await axiosInstance.patch(`/admin/staff/${id}/${status}`, { status });
    return response.data;
  } catch (error:any) {
    console.log("Error updating staff status:", error.response?.data?.error);
    throw {message:  error.response?.data?.error || "Failed to update staff status."};
  }
}

export const getStaffById = async (id: string)=>{
  try {
    const response =  await axiosInstance.get(`/admin/staff/${id}`)
    return response.data
  } catch (error) {
    throw error
  }
}