"use client";
import React, { useEffect, useState } from "react";
import { ModernDashboardLayout } from "@/components/navbar/modern-dashboard-navbar";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { getLeavesByStatus } from "@/service/admin/attendanceService";
import { AttendanceRequestType } from "@/types/attendance-types";

export default function AttendanceViewPage() {
  const [status, setStatus] = useState("pending");
  const [requests, setRequests] = useState<AttendanceRequestType[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    async function fetchRequests() {
      setLoading(true);
      try {
        const { data } = await getLeavesByStatus(status, page);
        setRequests(data.leaves || []);
        setTotalPages(data.totalPages || 1);
      } catch (error) {
        setRequests([]);
      } finally {
        setLoading(false);
      }
    }
    fetchRequests();
  }, [status, page]);

  return (
    <ModernDashboardLayout>
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4">Attendance</h1>
        <div className="mb-4 flex gap-4 items-center">
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="bg-white rounded shadow p-4">
          {loading ? (
            <p>Loading...</p>
          ) : requests.length === 0 ? (
            <p>No attendance requests found.</p>
          ) : (
            <table className="min-w-full">
              <thead>
                <tr>
                  <th>Staff Name</th>
                  <th>Date</th>
                  <th>Reason</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {requests.map((req) => (
                  <tr key={req.id}>
                    <td>{req.staffName}</td>
                    <td>{req.date}</td>
                    <td>{req.reason}</td>
                    <td>{req.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
        <div className="flex items-center justify-between mt-4">
          <Button
            disabled={page === 1}
            onClick={() => setPage(page - 1)}
          >
            Previous
          </Button>
          <span>
            Page {page} of {totalPages}
          </span>
          <Button
            disabled={page === totalPages}
            onClick={() => setPage(page + 1)}
          >
            Next
          </Button>
        </div>
      </div>
    </ModernDashboardLayout>
  );
}
