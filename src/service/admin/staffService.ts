import { StaffBasicType } from "@/types/staff-type";
import axiosInstance from "../axiosInstance"

export const createStaff = async (data: StaffBasicType) => {
  try {
    const response = await axiosInstance.post("/admin/staff", data, {
      headers: {
        "Content-Type": "multipart/form-data"
      }
    });
    return response.data;
  } catch (error) {
    console.error("Error creating staff:", error);
    throw error;
  }
}