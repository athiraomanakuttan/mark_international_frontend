"use client";

import React, { useState, useEffect } from 'react';
import { Calendar, Clock, FileText, Plus, AlertCircle, CheckCircle } from 'lucide-react';
import { ModernDashboardLayout } from '@/components/staff/modern-dashboard-navbar';
import { AttendanceCalendar } from '@/components/attendance/AttendanceCalendar';
import { LeaveRequestModal } from '@/components/attendance/LeaveRequestModal';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'react-toastify';
import { useSelector } from 'react-redux';
import {
  CalendarDate,
  CreateLeaveRequestDto,
  LeaveRequest,
  LeaveStatus
} from '@/types/attendance-types';
import { AttendanceService } from '@/service/attendanceService';
import { RootState } from '@/lib/redux/store';

export default function AttendancePage() {
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth() + 1);
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [isLeaveModalOpen, setIsLeaveModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string>('');
  // Remove editingLeave, only use selectedLeave for details modal
  const [recentLeaves, setRecentLeaves] = useState<LeaveRequest[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedLeave, setSelectedLeave] = useState<LeaveRequest | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  // Get user data from Redux store
  const { user } = useSelector((state: RootState) => state.user);

  // Load recent leave requests
  const loadRecentLeaves = async () => {
    if (!user?.id) {
      console.error('User not authenticated');
      toast.error('Please log in to view attendance data');
      return;
    }

    try {
      const response = await AttendanceService.getUserLeaves(user.id, {
        page: 1,
        limit: 20 // Increased limit to show more history
      });

      if (response.success && Array.isArray(response.data)) {
        setRecentLeaves(response.data); // Show all fetched leaves
      }
    } catch (error) {
      console.error('Error loading recent leaves:', error);
      toast.error('Failed to load leave requests');
    }
  };

  // Add debugging for user data
  useEffect(() => {
    if (!user) {
      console.warn('User not authenticated');
    } else {
      loadRecentLeaves();
    }
  }, [user]);

  // Handle date click from calendar
  const handleDateClick = (date: CalendarDate) => {
    if (date.isClickable && !date.leaveRequest) {
      setSelectedDate(date.date);
      setIsLeaveModalOpen(true);
    } else if (date.leaveRequest) {
      setSelectedLeave(date.leaveRequest);
    }
  };

  const handleDetailsModalClose = () => setSelectedLeave(null);

  const handleLeaveDeleted = (leaveId: string) => {
    setSelectedLeave(null);
    loadRecentLeaves();
  };

  const handleLeaveDelete = async (leaveId: string) => {
    if (!leaveId) return;
    try {
      const res = await AttendanceService.deleteLeaveRequest(leaveId);
      if (res && res.success) {
        toast.dismiss();
        toast.success('Leave request deleted');
        setRefreshKey((k) => k + 1);
        loadRecentLeaves();
      } else {
        toast.error(res?.message || 'Failed to delete leave request');
      }
    } catch (error) {
      console.error('Error deleting leave request:', error);
      toast.dismiss();
      toast.error('Failed to delete leave request');
    }
  }

  // Handle leave request submission
  const handleLeaveRequestSubmit = async (leaveData: CreateLeaveRequestDto) => {
    setIsLoading(true);
    try {
      const response = await AttendanceService.createLeaveRequest(leaveData);

      if (response.success) {
        toast.success('Leave request submitted successfully!');
        setIsLeaveModalOpen(false);
        setRefreshKey((k) => k + 1);
        loadRecentLeaves(); // Refresh recent leaves
        // The calendar will be refreshed automatically when the modal closes
      } else {
        toast.error(response.message || 'Failed to submit leave request');
        throw new Error(response.message || 'Failed to submit leave request');
      }
    } catch (error) {
      console.error('Error submitting leave request:', error);
      throw error; // Re-throw to be handled by the modal
    } finally {
      setIsLoading(false);
    }
  };

  // Get status badge variant
  const getStatusBadgeVariant = (status: LeaveStatus) => {
    switch (status) {
      case LeaveStatus.PENDING:
        return 'secondary';
      case LeaveStatus.APPROVED:
        return 'default';
      case LeaveStatus.REJECTED:
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  // Get status icon
  const getStatusIcon = (status: LeaveStatus) => {
    switch (status) {
      case LeaveStatus.PENDING:
        return <Clock className="w-3 h-3" />;
      case LeaveStatus.APPROVED:
        return <CheckCircle className="w-3 h-3" />;
      case LeaveStatus.REJECTED:
        return <AlertCircle className="w-3 h-3" />;
      default:
        return <Clock className="w-3 h-3" />;
    }
  };
  const currentDate = new Date().toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

  return (
    <ModernDashboardLayout>
      <div className="min-h-screen bg-gray-50 p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center space-x-2">
              <Calendar className="w-6 h-6" />
              <span>Attendance</span>
            </h1>
            <p className="text-gray-600 mt-1">
              Track your attendance and manage leave requests
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-gray-600">
              <Calendar className="w-4 h-4" />
              <span className="text-sm">{currentDate}</span>
            </div>
            <div className="flex gap-2">

              <Button
                onClick={() => setIsLeaveModalOpen(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Plus className="w-4 h-4 mr-2" />
                Request Leave
              </Button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="calendar" className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="calendar">Calendar View</TabsTrigger>
            <TabsTrigger value="requests">Leave Requests</TabsTrigger>
          </TabsList>

          <TabsContent value="calendar" className="space-y-6">
            {/* Attendance Calendar */}
            {user ? (
              <AttendanceCalendar
                userId={user.id}
                userJoiningDate={user.joiningDate || '2020-01-01'} // Fallback if joining date not available
                month={currentMonth}
                year={currentYear}
                onDateClick={handleDateClick}
                onLeaveRequest={handleLeaveRequestSubmit}
                onDeleteLeave={handleLeaveDelete}
                refreshKey={refreshKey}
              />
            ) : (
              <Card>
                <CardContent className="p-8 text-center">
                  <p className="text-gray-600">Loading user data...</p>
                  <div className="mt-4">
                    <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="requests" className="space-y-6">
            <Tabs defaultValue="pending" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-4">
                <TabsTrigger value="pending">Pending Requests</TabsTrigger>
                <TabsTrigger value="history">Leave History</TabsTrigger>
              </TabsList>

              <TabsContent value="pending" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Clock className="w-5 h-5" />
                      <span>Pending Requests</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {recentLeaves.filter(l => l.status === 'pending').length === 0 ? (
                      <div className="text-center py-8">
                        <p className="text-gray-600">No pending leave requests</p>
                        <Button
                          onClick={() => setIsLeaveModalOpen(true)}
                          variant="outline"
                          className="mt-4"
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          Create New Request
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {recentLeaves.filter(l => l.status === 'pending').map((leave) => (
                          <div
                            key={leave._id}
                            className="group bg-white border border-gray-200 rounded-xl p-5 hover:shadow-md transition-all duration-200"
                          >
                            <div className="flex items-start justify-between mb-4">
                              <div className="flex items-center space-x-3">
                                <div className="p-2 rounded-lg bg-amber-100 text-amber-600">
                                  {getStatusIcon(leave.status)}
                                </div>
                                <div>
                                  <h3 className="font-semibold text-gray-900">
                                    {AttendanceService.formatDate(leave.leaveDate)}
                                  </h3>
                                  <p className="text-sm text-gray-500">
                                    Applied on {new Date(leave.createdAt).toLocaleDateString()}
                                  </p>
                                </div>
                              </div>
                              <Badge variant="secondary" className="capitalize px-3 py-1">
                                {leave.status}
                              </Badge>
                            </div>

                            <div className="pl-12">
                              <p className="text-gray-600 mb-4 bg-gray-50 p-3 rounded-lg text-sm">
                                {leave.reason}
                              </p>

                              {leave.documents && leave.documents.length > 0 && (
                                <div className="space-y-2">
                                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Attachments ({leave.documents.length})
                                  </p>
                                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    {leave.documents.map((doc: any, index: number) => (
                                      <a
                                        key={index}
                                        href={doc.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center p-2 rounded-lg border border-gray-200 bg-gray-50 hover:bg-blue-50 hover:border-blue-200 transition-colors group/doc"
                                        onClick={(e) => e.stopPropagation()}
                                      >
                                        <div className="p-2 bg-white rounded-md border border-gray-100 mr-3 group-hover/doc:border-blue-100">
                                          <FileText className="w-4 h-4 text-blue-600" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                          <p className="text-sm font-medium text-gray-700 truncate group-hover/doc:text-blue-700">
                                            {doc.title || `Document ${index + 1}`}
                                          </p>
                                          <p className="text-xs text-gray-500">Click to view</p>
                                        </div>
                                      </a>
                                    ))}
                                  </div>
                                </div>
                              )}

                              <div className="mt-4 flex justify-end gap-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => setSelectedLeave(leave)}
                                  className="text-gray-500 hover:text-gray-900"
                                >
                                  View Details
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    if (confirm('Are you sure you want to delete this request?')) {
                                      handleLeaveDelete(leave._id);
                                    }
                                  }}
                                  className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                                >
                                  Delete Request
                                </Button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="history" className="space-y-6">
                {/* Upcoming Approved Leaves */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2 text-green-700">
                      <CheckCircle className="w-5 h-5" />
                      <span>Upcoming Approved Leaves</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {recentLeaves.filter(l => l.status === 'approved' && new Date(l.leaveDate) >= new Date()).length === 0 ? (
                      <p className="text-gray-500 text-center py-4">No upcoming approved leaves</p>
                    ) : (
                      <div className="space-y-4">
                        {recentLeaves.filter(l => l.status === 'approved' && new Date(l.leaveDate) >= new Date()).map((leave) => (
                          <div key={leave._id} className="flex items-center justify-between p-4 border border-green-100 bg-green-50 rounded-lg">
                            <div className="flex items-center space-x-3">
                              <div className="p-2 bg-green-100 rounded-full text-green-600">
                                <Calendar className="w-4 h-4" />
                              </div>
                              <div>
                                <p className="font-medium text-gray-900">{AttendanceService.formatDate(leave.leaveDate)}</p>
                                <p className="text-sm text-gray-500">{leave.reason}</p>
                              </div>
                            </div>
                            <Button variant="ghost" size="sm" onClick={() => setSelectedLeave(leave)}>View</Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Past/History Leaves */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2 text-gray-700">
                      <FileText className="w-5 h-5" />
                      <span>Leave History</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {recentLeaves.filter(l => l.status !== 'pending' && (l.status !== 'approved' || new Date(l.leaveDate) < new Date())).length === 0 ? (
                      <p className="text-gray-500 text-center py-4">No leave history</p>
                    ) : (
                      <div className="space-y-4">
                        {recentLeaves.filter(l => l.status !== 'pending' && (l.status !== 'approved' || new Date(l.leaveDate) < new Date())).map((leave) => (
                          <div key={leave._id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                            <div className="flex items-center space-x-3">
                              <div className={`p-2 rounded-lg ${leave.status === 'approved' ? 'bg-green-100 text-green-600' :
                                  leave.status === 'rejected' ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-600'
                                }`}>
                                {getStatusIcon(leave.status)}
                              </div>
                              <div>
                                <p className="font-medium text-gray-900">{AttendanceService.formatDate(leave.leaveDate)}</p>
                                <Badge variant={getStatusBadgeVariant(leave.status)} className="mt-1">{leave.status}</Badge>
                              </div>
                            </div>
                            <Button variant="ghost" size="sm" onClick={() => setSelectedLeave(leave)}>View</Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </TabsContent>
        </Tabs>

        {/* Leave Request Modal */}
        <LeaveRequestModal
          isOpen={isLeaveModalOpen}
          onClose={() => {
            setIsLeaveModalOpen(false);
            setSelectedDate('');
          }}
          onSubmit={handleLeaveRequestSubmit}
          selectedDate={selectedDate}
          userId={user?.id || ''}
          isLoading={isLoading}
        />
      </div>
    </ModernDashboardLayout>
  );
}