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
  const [recentLeaves, setRecentLeaves] = useState<LeaveRequest[]>([]);
  const [isLoading, setIsLoading] = useState(false);

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
        limit: 10
      });
      
      if (response.success && Array.isArray(response.data)) {
        setRecentLeaves(response.data.slice(0, 5)); // Show only 5 recent
      }
    } catch (error) {
      console.error('Error loading recent leaves:', error);
      toast.error('Failed to load leave requests');
    }
  };

  // Remove this duplicate call - it's now handled in the debugging useEffect below

  // Add debugging for user data
  useEffect(() => {
    console.log('Current user:', user);
    console.log('localStorage accessToken:', localStorage.getItem('accessToken'));
    console.log('localStorage userData:', localStorage.getItem('userData'));
    
    if (!user) {
      console.warn('User not authenticated');
    } else {
      console.log('User authenticated, loading attendance data...');
      loadRecentLeaves();
    }
  }, [user]);

  // Add debugging for date issues
  useEffect(() => {
    const today = new Date();
    console.log('Today (local):', today.toLocaleDateString());
    console.log('Today (ISO):', today.toISOString().split('T')[0]);
    console.log('Current month/year:', currentMonth, currentYear);
  }, [currentMonth, currentYear]);

  // Test API connectivity
  const testAPI = async () => {
    try {
      console.log('Testing API connectivity...');
      const response = await AttendanceService.getLeaveStats();
      console.log('API test successful:', response);
      toast.success('Backend connection successful!');
    } catch (error) {
      console.error('API test failed:', error);
      toast.error('Backend connection failed. Please check if the server is running.');
    }
  };

  // Handle date click from calendar
  const handleDateClick = (date: CalendarDate) => {
    if (date.isClickable && !date.leaveRequest) {
      setSelectedDate(date.date);
      setIsLeaveModalOpen(true);
    } else if (date.leaveRequest) {
      // Show leave request details
      toast.info(`Leave request: ${date.leaveRequest.reason} (Status: ${date.leaveRequest.status})`);
    }
  };

  // Handle leave request submission
  const handleLeaveRequestSubmit = async (leaveData: CreateLeaveRequestDto) => {
    setIsLoading(true);
    try {
      const response = await AttendanceService.createLeaveRequest(leaveData);
      
      if (response.success) {
        toast.success('Leave request submitted successfully!');
        setIsLeaveModalOpen(false);
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
                onClick={testAPI}
                variant="outline"
                size="sm"
              >
                Test API
              </Button>
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
            {/* Recent Leave Requests */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <FileText className="w-5 h-5" />
                  <span>Recent Leave Requests</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {recentLeaves.length === 0 ? (
                  <div className="text-center py-8">
                    <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">No leave requests found</p>
                    <Button 
                      onClick={() => setIsLeaveModalOpen(true)}
                      variant="outline" 
                      className="mt-4"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Create First Request
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {recentLeaves.map((leave) => (
                      <div 
                        key={leave._id} 
                        className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <p className="font-medium text-gray-900">
                              {AttendanceService.formatDate(leave.leaveDate)}
                            </p>
                            <Badge 
                              variant={getStatusBadgeVariant(leave.status)}
                              className="flex items-center space-x-1"
                            >
                              {getStatusIcon(leave.status)}
                              <span className="capitalize">{leave.status}</span>
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600 line-clamp-2">
                            {leave.reason}
                          </p>
                          {leave.documents && leave.documents.length > 0 && (
                            <p className="text-xs text-blue-600 mt-1">
                              {leave.documents.length} document(s) attached
                            </p>
                          )}
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-gray-500">
                            Submitted: {new Date(leave.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    ))}
                    
                    {recentLeaves.length === 5 && (
                      <div className="text-center pt-4">
                        <Button variant="outline" size="sm">
                          View All Requests
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
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