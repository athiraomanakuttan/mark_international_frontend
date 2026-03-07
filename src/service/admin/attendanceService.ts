// Service for attendance requests
import axiosInstance from "../axiosInstance";

/** Get client's local today as YYYY-MM-DD (avoids timezone mismatches) */
function getTodayLocal(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

/** Get all staff attendance for a date range (admin only) */
export async function getAllStaffAttendance(dateFrom: string, dateTo: string, staffId?: string) {
  const params = new URLSearchParams({ dateFrom, dateTo });
  if (staffId) params.append("staffId", staffId);
  params.append("today", getTodayLocal());
  return axiosInstance.get(`/admin/attendance/staff-attendance?${params.toString()}`);
}

export async function getPendingAttendanceRequests(page: number = 1, limit: number = 10) {
  // Use correct backend route for pending leave requests
  return axiosInstance.get(`/leaves/status/pending?page=${page}&limit=${limit}`);
}

export async function approveAttendanceRequest(requestId: string) {
  // Use correct backend route for approving leave
  return axiosInstance.patch(`/leave/${requestId}/status`, { status: "approved" });
}

export async function rejectAttendanceRequest(requestId: string, adminComments?: string) {
  return axiosInstance.patch(`/leave/${requestId}/status`, {
    status: "rejected",
    ...(adminComments && adminComments.trim() ? { adminComments: adminComments.trim() } : {}),
  });
}

export async function getLeavesByStatus(status: string, page: number = 1, limit: number = 10) {
  return axiosInstance.get(`/leaves/status/${status}?page=${page}&limit=${limit}`);
}

/** Mark a staff member as absent for a date (admin only) */
export async function markStaffAbsent(staffId: string, date: string, leaveType: string) {
  return axiosInstance.post("/admin/attendance/mark-absent", { staffId, date, leaveType });
}

/** Remove manual absent mark for a staff member on a date (admin only) */
export async function removeStaffAbsent(staffId: string, date: string) {
  return axiosInstance.post("/admin/attendance/remove-absent", { staffId, date });
}
