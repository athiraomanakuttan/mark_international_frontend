"use client";

import React, { useState, useEffect } from 'react';
import { ChevronLeftIcon, ChevronRightIcon, CalendarDays, Clock, FileText, ExternalLink, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import {
  AttendanceCalendarProps,
  CalendarDate,
  AttendanceStatus,
  MonthlyCalendar,
  AttendanceSummary,
  DEFAULT_CALENDAR_COLORS,
} from '@/types/attendance-types';
import { AttendanceService } from '@/service/attendanceService';

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

interface AttendanceCalendarWithDeleteProps extends AttendanceCalendarProps {
  onDeleteLeave?: (leaveId: string) => void;
  refreshKey?: any;
}

export function AttendanceCalendar(props: AttendanceCalendarWithDeleteProps) {
  const {
    userId,
    userJoiningDate,
    month: initialMonth,
    year: initialYear,
    onDateClick,
    onLeaveRequest,
    onDeleteLeave,
    colors = {},
    className
  } = props;

  // State and logic for calendar
  const [currentMonth, setCurrentMonth] = useState(initialMonth);
  const [currentYear, setCurrentYear] = useState(initialYear);
  const [calendar, setCalendar] = useState<MonthlyCalendar | null>(null);
  const [summary, setSummary] = useState<AttendanceSummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Use provided colors or fallback to default
  const calendarColors = { ...DEFAULT_CALENDAR_COLORS, ...colors };

  // Handler to load calendar data (dummy for now, should be implemented)
  const loadCalendarData = () => {
    setLoading(true);
    AttendanceService.generateMonthlyCalendar(userId, currentMonth, currentYear, userJoiningDate)
      .then((calendarData) => {
        setCalendar(calendarData);
        // Use backend-provided summary if available, otherwise fallback to calculated summary
        setSummary(calendarData.summary || AttendanceService.calculateAttendanceSummary(calendarData));
        setLoading(false);
      })
      .catch((err) => {
        setError('Failed to load calendar');
        setLoading(false);
      });
  };

  // Handler for previous month navigation
  const goToPreviousMonth = () => {
    if (currentMonth === 1) {
      setCurrentMonth(12);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  // Load calendar data when relevant props change (must be after all variables are defined)
  useEffect(() => {
    if (!userId || !userJoiningDate) return;
    setLoading(true);
    setError(null);
    AttendanceService.generateMonthlyCalendar(userId, currentMonth, currentYear, userJoiningDate)
      .then((calendarData) => {
        setCalendar(calendarData);
        // Use backend-provided summary if available, otherwise fallback to calculated summary
        setSummary(calendarData.summary || AttendanceService.calculateAttendanceSummary(calendarData));
        setLoading(false);
      })
      .catch((err) => {
        setError('Failed to load calendar');
        setLoading(false);
      });
  }, [userId, userJoiningDate, currentMonth, currentYear, props.refreshKey]);

  // ...existing code...

  // ...existing hooks and logic for loading calendar data...

  const goToNextMonth = () => {
    if (currentMonth === 12) {
      setCurrentMonth(1);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  const goToToday = () => {
    const today = new Date();
    setCurrentMonth(today.getMonth() + 1);
    setCurrentYear(today.getFullYear());
  };

  // Handle date click
  const handleDateClick = (date: CalendarDate) => {
    if (!date.isClickable) return;

    if (onDateClick) {
      onDateClick(date);
    }
  };

  // Get status color
  const getStatusColor = (status: AttendanceStatus): string => {
    return AttendanceService.getStatusColor(status);
  };

  // Get status text
  const getStatusText = (status: AttendanceStatus): string => {
    return AttendanceService.getStatusText(status);
  };

  const getLeaveTypeLabel = (leaveType?: string): string | null => {
    if (!leaveType) return null;
    switch (leaveType) {
      case 'casual':
        return 'Casual Leave';
      case 'sick':
        return 'Sick Leave';
      case 'lop':
        return 'LOP (Loss of Pay)';
      default:
        return leaveType;
    }
  };

  // Render date cell
  const renderDateCell = (date: CalendarDate) => {
    const statusColor = getStatusColor(date.status);
    const statusText = getStatusText(date.status);

    return (
      <TooltipProvider key={date.date}>
        <Tooltip>
          <TooltipTrigger asChild>
            <div
              className={cn(
                'aspect-square p-1 border border-gray-200 flex flex-col items-center justify-center text-sm relative transition-all duration-200',
                date.isCurrentMonth ? 'text-gray-900' : 'text-gray-400',
                date.isClickable && 'cursor-pointer hover:bg-gray-50 hover:shadow-sm',
                date.isToday && 'ring-2 ring-purple-500 ring-offset-1',
                !date.isCurrentMonth && 'bg-gray-50/50'
              )}
              style={{
                backgroundColor: date.isCurrentMonth ? statusColor + '20' : undefined,
              }}
              onClick={() => handleDateClick(date)}
            >
              {/* Date number */}
              <span className="font-medium">{date.day}</span>

              {/* Status indicator */}
              <div
                className="w-2 h-2 rounded-full mt-1"
                style={{ backgroundColor: statusColor }}
              />

              {/* Leave request indicator */}
              {date.leaveRequest && (
                <div className="absolute top-0 right-0 w-1 h-1 bg-orange-500 rounded-full" />
              )}
            </div>
          </TooltipTrigger>
          <TooltipContent 
            className="p-0 max-w-sm border border-gray-200 shadow-md bg-white text-gray-900 rounded-md z-50 [&>svg]:fill-white [&>svg]:border-gray-200" 
            sideOffset={8}
          >
            <div className="bg-white text-gray-900 rounded-md overflow-hidden">
              {/* Header */}
              <div className="px-4 py-3 border-b border-gray-200">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 mb-1.5">
                      {AttendanceService.formatDate(date.date)}
                    </p>
                    <Badge 
                      variant="outline" 
                      className={cn(
                        "text-xs font-medium h-5",
                        date.status === 'present' && "border-green-200 text-green-700 bg-green-50",
                        date.status === 'absent' && "border-red-200 text-red-700 bg-red-50",
                        date.status === 'leave_approved' && "border-green-200 text-green-700 bg-green-50",
                        date.status === 'leave_pending' && "border-amber-200 text-amber-700 bg-amber-50",
                        date.status === 'leave_rejected' && "border-blue-200 text-blue-700 bg-blue-50",
                        date.status === 'future' && "border-gray-200 text-gray-600 bg-gray-50",
                        date.status === 'before_joining' && "border-gray-200 text-gray-600 bg-gray-50"
                      )}
                    >
                      {statusText}
                    </Badge>
                    {date.leaveRequest?.leaveType && (
                      <p className="mt-1 text-xs text-gray-500">
                        {getLeaveTypeLabel(date.leaveRequest.leaveType)}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Content */}
              {date.leaveRequest && (
                <div className="px-4 py-3 space-y-4">
                  {/* Reason */}
                  <div>
                    <p className="text-xs font-medium text-gray-500 mb-1.5">
                      Reason
                    </p>
                    <p className="text-sm text-gray-900 leading-snug break-words">
                      {date.leaveRequest.reason}
                    </p>
                  </div>

                  {/* Rejection reason (when rejected) */}
                  {date.leaveRequest.status === 'rejected' && date.leaveRequest.adminComments && (
                    <div className="p-2 rounded bg-red-50 border border-red-200">
                      <p className="text-xs font-medium text-red-800 mb-1">
                        Rejection reason
                      </p>
                      <p className="text-xs text-red-700 leading-snug">
                        {date.leaveRequest.adminComments}
                      </p>
                    </div>
                  )}

                  {/* Documents */}
                  {date.leaveRequest.documents && date.leaveRequest.documents.length > 0 && (
                    <div>
                      <p className="text-xs font-medium text-gray-500 mb-2">
                        Documents
                      </p>
                      <div className="space-y-1">
                        {date.leaveRequest.documents.map((doc, idx) => (
                          <a
                            key={idx}
                            href={doc.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 px-2 py-1.5 rounded border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-all group"
                          >
                            <FileText className="w-3.5 h-3.5 text-gray-400 group-hover:text-blue-600 flex-shrink-0" />
                            <span className="text-xs text-gray-700 group-hover:text-blue-700 truncate flex-1">
                              {doc.title}
                            </span>
                            <ExternalLink className="w-3 h-3 text-gray-400 group-hover:text-blue-600 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
                          </a>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Delete Button for Pending Leaves */}
                  {date.leaveRequest.status === 'pending' && onDeleteLeave && (
                    <div className="pt-2 border-t border-gray-200">
                      <Button
                        variant="destructive"
                        size="sm"
                        className="w-full h-8 text-xs"
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteLeave?.(date.leaveRequest?._id!);
                        }}
                      >
                        <Trash2 className="w-3.5 h-3.5 mr-1.5" />
                        Delete Leave Request
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  };

  if (loading) {
    return (
      <Card className={cn('w-full', className)}>
        <CardContent className="p-6">
          <div className="flex items-center justify-center h-96">
            <div className="flex items-center space-x-2">
              <Clock className="w-5 h-5 animate-spin" />
              <span>Loading attendance data...</span>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || !calendar) {
    return (
      <Card className={cn('w-full', className)}>
        <CardContent className="p-6">
          <div className="flex items-center justify-center h-96">
            <div className="text-center">
              <p className="text-red-600 mb-2">{error || 'Failed to load calendar'}</p>
              <Button onClick={loadCalendarData} variant="outline" size="sm">
                Retry
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={cn('w-full space-y-4', className)}>
      {/* Summary Cards */}
      {summary && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600">{summary.presentDays}</p>
                <p className="text-sm text-gray-600">Present Days</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-red-600">{summary.absentDays}</p>
                <p className="text-sm text-gray-600">Absent Days</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-yellow-600">{summary.leavesPending}</p>
                <p className="text-sm text-gray-600">Pending Leaves</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600">{summary.leavesApproved}</p>
                <p className="text-sm text-gray-600">Approved Leaves</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-600">{summary.attendancePercentage}%</p>
                <p className="text-sm text-gray-600">Attendance Rate</p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Calendar */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <CalendarDays className="w-5 h-5" />
              <span>Attendance Calendar</span>
            </CardTitle>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm" onClick={goToToday}>
                Today
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Calendar Header */}
          <div className="flex items-center justify-between mb-6">
            <Button variant="ghost" size="sm" onClick={goToPreviousMonth}>
              <ChevronLeftIcon className="w-4 h-4" />
            </Button>
            <h2 className="text-xl font-semibold">
              {MONTHS[currentMonth - 1]} {currentYear}
            </h2>
            <Button variant="ghost" size="sm" onClick={goToNextMonth}>
              <ChevronRightIcon className="w-4 h-4" />
            </Button>
          </div>

          {/* Weekday Headers */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {WEEKDAYS.map((day) => (
              <div key={day} className="p-2 text-center text-sm font-medium text-gray-600">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-1">
            {calendar.dates.map((date) => renderDateCell(date))}
          </div>

          {/* Legend */}
          <div className="mt-6 flex flex-wrap gap-4 justify-center text-sm">
            <div className="flex items-center space-x-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: calendarColors.present }}
              />
              <span>Present</span>
            </div>
            <div className="flex items-center space-x-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: calendarColors.absent }}
              />
              <span>Absent/Leave</span>
            </div>
            <div className="flex items-center space-x-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: calendarColors.leavePending }}
              />
              <span>Leave Pending</span>
            </div>
            <div className="flex items-center space-x-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: calendarColors.leaveRejected }}
              />
              <span>Leave Rejected</span>
            </div>
            <div className="flex items-center space-x-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: calendarColors.future }}
              />
              <span>Future/Before Joining</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}