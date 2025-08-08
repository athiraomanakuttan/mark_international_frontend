'use client'
import { createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from '@/service/axiosInstance'
import { StaffBasicType } from "@/types/staff-type";
import { ChartNoAxesColumnIncreasingIcon } from "lucide-react";

export const fetchAllStaffs = createAsyncThunk<
  StaffBasicType[], // return type on success
  void,             // argument type
  { rejectValue: string } // type for rejectWithValue
>(
  "staff/fetchAll",
  async (_, thunkAPI) => {
    try {
      const response = await axiosInstance.get("/admin/staff/get-all-active");
      console.log("response thunk", response.data.data)
      return response?.data?.data as StaffBasicType[];
    } catch (error: any) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Failed to fetch staff"
      );
    }
  }
);
