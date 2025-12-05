"use client";

import React, { useState, useEffect } from 'react';
import { ChevronLeftIcon, ChevronRightIcon, CalendarDays, Clock } from 'lucide-react';
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
  DEFAULT_CALENDAR_COLORS
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
  // Destructure props at the top so all variables are available
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
        setSummary(AttendanceService.calculateAttendanceSummary(calendarData));
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
        setSummary(AttendanceService.calculateAttendanceSummary(calendarData));
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
         <TooltipContent>
  <div className="text-left max-w-xs">
    <p className="font-medium">{AttendanceService.formatDate(date.date)}</p>
    <p className="text-sm text-gray-600">{statusText}</p>
    {date.leaveRequest && (
      <>
        <p className="text-xs text-orange-600 mt-1 break-words">
          <strong>Reason:</strong> {date.leaveRequest.reason}
        </p>
        {date.leaveRequest.documents && date.leaveRequest.documents.length > 0 && (
          <div className="mt-2">
            <strong>Documents:</strong>
            <ul className="list-disc list-inside">
              {date.leaveRequest.documents.map((doc, idx) => (
                <li key={idx}>
                  <a href={doc.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">
                    {doc.title}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}
        <button
          className="mt-2 px-3 py-1 bg-red-600 text-white rounded text-xs hover:bg-red-700"
          onClick={() => onDeleteLeave?.(date.leaveRequest?._id!)}
        >
          Delete
        </button>
      </>
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
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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
              <span>Future/Unavailable</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}