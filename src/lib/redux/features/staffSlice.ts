import { createSlice } from "@reduxjs/toolkit";
import { fetchAllStaffs } from "../thunk/staffThunk"; // adjust path if needed
import { StaffBasicType } from "@/types/staff-type";
interface initialStateType{
    staffList: StaffBasicType[],
    loading: boolean,
    error: string
}

const initialState: initialStateType = {
  staffList: [],
  loading: false,
  error:""
};

const staffSlice = createSlice({
  name: "staff",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchAllStaffs.pending, (state) => {
        state.loading = true;
        state.error = "";
      })
      .addCase(fetchAllStaffs.fulfilled, (state, action) => {
        state.loading = false;
        state.staffList = action.payload;
      })
      .addCase(fetchAllStaffs.rejected, (state, action) => {
  state.loading = false;
  state.error = action.payload || "Unknown error";
});
  },
});

export default staffSlice.reducer;
export const staffActions = staffSlice.actions
