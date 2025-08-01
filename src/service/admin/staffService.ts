import { StaffBasicType } from "@/types/staff-type";
import axiosInstance from "../axiosInstance"

export const createStaff = async (data: StaffBasicType) => {
  try {

    const formData = new FormData();
    (Object.keys(data) as Array<keyof StaffBasicType>).forEach((key) => {
      const value = data[key];
      if (value !== undefined && value !== null) {
        formData.append(key, value as any); // handle strings/files
      }
    });

    const response = await axiosInstance.post("/admin/staff", formData); // ❌ no custom headers here
    console.log("response", response);
    return response.data;
  } catch (error:any) {
    console.log("Error creating staff:", error.response?.data?.error);
    throw {message:  error.response?.data?.error || "Failed to create staff member."};
  }
}

