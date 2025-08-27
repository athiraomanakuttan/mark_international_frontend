import { StudentData } from "@/components/student-registration-form";
import axiosInstance from "./axiosInstance";

export const createStudent = async (studentData: StudentData) => {
  try {
    const response = await axiosInstance.post("/students/student", studentData);
    return response.data;
  } catch (error) {
    throw new Error("Failed to create student");
  }
};
