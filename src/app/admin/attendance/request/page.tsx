"use client";

import React, { useEffect, useState } from "react";
import { AttendanceRequestType } from "@/types/attendance-types";
import { getPendingAttendanceRequests, approveAttendanceRequest, rejectAttendanceRequest } from "@/service/admin/attendanceService";
import { Button } from "@/components/ui/button";
import { ModernDashboardLayout } from "@/components/navbar/modern-dashboard-navbar";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";

export default function AttendanceRequestPage() {
  const [requests, setRequests] = useState<AttendanceRequestType[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function fetchRequests() {
      setLoading(true);
      try {
        const { data } = await getPendingAttendanceRequests();
        // Correctly extract array from backend response
        setRequests(Array.isArray(data.data) ? data.data : []);
      } catch (error) {
        setRequests([]);
      } finally {
        setLoading(false);
      }
    }
    fetchRequests();
  }, []);

  const handleApprove = async (id: string) => {
    await approveAttendanceRequest(id);
    setRequests((prev) => prev.filter((r) => r.id !== id));
  };

  const handleReject = async (id: string) => {
    await rejectAttendanceRequest(id);
    setRequests((prev) => prev.filter((r) => r.id !== id));
  };

  return (
    <ModernDashboardLayout>
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4">Attendance Requests</h1>
        <div className="bg-white rounded shadow p-4">
          {loading ? (
            <p>Loading...</p>
          ) : requests.length === 0 ? (
            <p>No pending attendance requests.</p>
          ) : (
            <Table>
              <TableHeader className="bg-slate-50">
                <TableRow>
                  <TableHead>Staff Name</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Reason</TableHead>
                  <TableHead className="text-center">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {requests.map((req, idx) => (
                  <TableRow key={req.id} className={idx % 2 === 0 ? "bg-white" : "bg-slate-100"}>
                    <TableCell className="align-top break-words max-w-[180px]">{req.staffName}</TableCell>
                    <TableCell className="align-top">{req.date}</TableCell>
                    <TableCell className="align-top break-words max-w-[350px]">{req.reason}</TableCell>
                    <TableCell className="flex justify-center space-x-2 align-top">
                      <Button onClick={() => handleApprove(req.id)} className="bg-green-500 text-white mr-2">Approve</Button>
                      <Button onClick={() => handleReject(req.id)} className="bg-red-500 text-white">Reject</Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      </div>
    </ModernDashboardLayout>
  );
}
