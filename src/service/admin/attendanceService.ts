// Service for attendance requests
import axiosInstance from "../axiosInstance";

export async function getPendingAttendanceRequests(page: number = 1, limit: number = 10) {
  // Use correct backend route for pending leave requests
  return axiosInstance.get(`/leaves/status/pending?page=${page}&limit=${limit}`);
}

export async function approveAttendanceRequest(requestId: string) {
  // Use correct backend route for approving leave
  return axiosInstance.patch(`/leave/${requestId}/status`, { status: "approved" });
}

export async function rejectAttendanceRequest(requestId: string) {
  // Use correct backend route for rejecting leave
  return axiosInstance.patch(`/leave/${requestId}/status`, { status: "rejected" });
}

export async function getLeavesByStatus(status: string, page: number = 1, limit: number = 10) {
  return axiosInstance.get(`/leaves/status/${status}?page=${page}&limit=${limit}`);
}
