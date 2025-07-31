import { StaffBasicType } from "@/types/staff-type";
import axiosInstance from "../axiosInstance"

export const createStaff = async (data: StaffBasicType) => {
  try {
    console.log("Original data =========>", data);

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
  } catch (error) {
    console.error("Error creating staff:", error);
    throw error;
  }
}

