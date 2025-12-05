import axiosInstance from './axiosInstance';
import { 
  LeaveResponse, 
  CreateLeaveRequestDto, 
  LeaveRequest, 
  AttendanceQuery,
  AttendanceSummary,
  MonthlyCalendar,
  CalendarDate,
  AttendanceStatus,
  LeaveStatus
} from '../types/attendance-types';
import { UserInfo } from '../types/attendance-types';

export class AttendanceService {
  // Base API endpoints
  private static readonly ENDPOINTS = {
    LEAVES: '/leaves',
    LEAVE: '/leave',
    USER_LEAVES: '/leaves/user',
    LEAVE_STATS: '/leaves/stats',
    MONTHLY_SUMMARY: '/leaves/summary/monthly'
  } as const;

  /**
   * Convert Date object to local date string (YYYY-MM-DD) without timezone conversion
   */
  private static toLocalDateString(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  /**
   * Get all leave requests for a specific user
   */
  static async getUserLeaves(userId: string, query?: Partial<AttendanceQuery>): Promise<LeaveResponse> {
    try {
      const params = new URLSearchParams();
      if (query?.month) params.append('month', query.month.toString());
      if (query?.year) params.append('year', query.year.toString());
      if (query?.page) params.append('page', query.page.toString());
      if (query?.limit) params.append('limit', query.limit.toString());

      const response = await axiosInstance.get<LeaveResponse>(
        `${this.ENDPOINTS.USER_LEAVES}/${userId}${params.toString() ? `?${params.toString()}` : ''}`
      );
      return response.data;
    } catch (error: any) {
      console.error('Error fetching user leaves:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch leave requests'
      };
    }
  }

  /**
   * Create a new leave request
   */
  static async createLeaveRequest(leaveData: CreateLeaveRequestDto): Promise<LeaveResponse> {
    try {
      console.log('Creating leave request with data:', leaveData);
      console.log('API endpoint:', this.ENDPOINTS.LEAVE);
      
      const formData = new FormData();
      formData.append('userId', leaveData.userId);
      formData.append('leaveDate', leaveData.leaveDate);
      formData.append('reason', leaveData.reason);

      // Add documents if provided
      if (leaveData.documents && leaveData.documents.length > 0) {
        leaveData.documents.forEach((file, index) => {
          formData.append(`files`, file);
        });
        console.log(`Added ${leaveData.documents.length} documents to form data`);
      }
      
      console.log('Making POST request to:', this.ENDPOINTS.LEAVE);
      const response = await axiosInstance.post<LeaveResponse>(
        this.ENDPOINTS.LEAVE,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      
      console.log('Leave request response:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('Error creating leave request:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
      console.error('Error headers:', error.response?.headers);
      
      return {
        success: false,
        message: error.response?.data?.message || error.message || 'Failed to create leave request',
        errors: error.response?.data?.errors
      };
    }
  }

  /**
   * Get leave requests within a date range
   */
  static async getLeavesByDateRange(
    userId: string, 
    dateFrom: string, 
    dateTo: string
  ): Promise<LeaveResponse> {
    try {
      const params = new URLSearchParams({
        userId,
        dateFrom,
        dateTo
      });

      const response = await axiosInstance.get<LeaveResponse>(
        `${this.ENDPOINTS.LEAVES}/date-range?${params.toString()}`
      );
      return response.data;
    } catch (error: any) {
      console.error('Error fetching leaves by date range:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch leave requests'
      };
    }
  }

  /**
   * Generate calendar data for a specific month and user
   */
  static async generateMonthlyCalendar(
    userId: string, 
    month: number, 
    year: number, 
    userJoiningDate: string
  ): Promise<MonthlyCalendar> {
    try {
      // Get the first and last day of the month
      const firstDay = new Date(year, month - 1, 1);
      const lastDay = new Date(year, month, 0);
      
      // Get leave requests for this month (use local date strings)
      const dateFrom = `${year}-${String(month).padStart(2, '0')}-01`;
      const dateTo = `${year}-${String(month).padStart(2, '0')}-${String(lastDay.getDate()).padStart(2, '0')}`;
      
      const leaveResponse = await this.getLeavesByDateRange(userId, dateFrom, dateTo);
      const leaveRequests = leaveResponse.success && Array.isArray(leaveResponse.data) 
        ? leaveResponse.data as LeaveRequest[] 
        : [];

      // Create a map of leave requests by date (use consistent local date format)
      const leaveMap = new Map<string, LeaveRequest>();
      leaveRequests.forEach(leave => {
        // Parse the leave date and create local date string
        const leaveDate = new Date(leave.leaveDate);
        const dateKey = this.toLocalDateString(leaveDate);
        leaveMap.set(dateKey, leave);
      });

      // Generate calendar dates
      const dates: CalendarDate[] = [];
      const joiningDate = new Date(userJoiningDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // Add previous month dates to fill the first week
      const firstDayOfWeek = firstDay.getDay();
      for (let i = firstDayOfWeek - 1; i >= 0; i--) {
        const date = new Date(firstDay);
        date.setDate(date.getDate() - (i + 1));
        dates.push(this.createCalendarDate(date, month, leaveMap, joiningDate, today, false));
      }

      // Add current month dates
      for (let day = 1; day <= lastDay.getDate(); day++) {
        const date = new Date(year, month - 1, day);
        dates.push(this.createCalendarDate(date, month, leaveMap, joiningDate, today, true));
      }

      // Add next month dates to fill the last week
      const remainingDays = 42 - dates.length; // 6 weeks * 7 days
      for (let day = 1; day <= remainingDays; day++) {
        const date = new Date(year, month, day);
        dates.push(this.createCalendarDate(date, month, leaveMap, joiningDate, today, false));
      }

      return {
        month,
        year,
        dates,
        monthName: firstDay.toLocaleString('default', { month: 'long' })
      };
    } catch (error) {
      console.error('Error generating monthly calendar:', error);
      throw error;
    }
  }

  /**
   * Create a calendar date object with appropriate status
   */
  private static createCalendarDate(
    date: Date,
    currentMonth: number,
    leaveMap: Map<string, LeaveRequest>,
    joiningDate: Date,
    today: Date,
    isCurrentMonth: boolean
  ): CalendarDate {
    // Create date string in local timezone (YYYY-MM-DD format)
    const dateString = AttendanceService.toLocalDateString(date);
    const leaveRequest = leaveMap.get(dateString);
    
    let status: AttendanceStatus;
    let isClickable = false;
    
    // Set date to beginning of day for comparison
    const dateOnly = new Date(date);
    dateOnly.setHours(0, 0, 0, 0);
    
    const joiningDateOnly = new Date(joiningDate);
    joiningDateOnly.setHours(0, 0, 0, 0);

    // Determine status based on various conditions
    if (dateOnly < joiningDateOnly) {
      status = AttendanceStatus.BEFORE_JOINING;
    } else if (leaveRequest) {
      // Date has a leave request
      switch (leaveRequest.status) {
        case LeaveStatus.PENDING:
          status = AttendanceStatus.LEAVE_PENDING;
          break;
        case LeaveStatus.APPROVED:
          status = AttendanceStatus.LEAVE_APPROVED;
          break;
        case LeaveStatus.REJECTED:
          status = AttendanceStatus.LEAVE_REJECTED;
          break;
        default:
          status = AttendanceStatus.FUTURE;
      }
    } else if (dateOnly > today) {
      // Future date - clickable for leave requests
      status = AttendanceStatus.FUTURE;
      isClickable = true;
    } else if (dateOnly.getTime() === today.getTime()) {
      // Today - for now, we'll mark as present (this could be enhanced with actual attendance data)
      status = AttendanceStatus.PRESENT;
    } else {
      // Past date - for now, we'll mark as present (this could be enhanced with actual attendance data)
      status = AttendanceStatus.PRESENT;
    }

    return {
      date: dateString,
      day: date.getDate(),
      month: date.getMonth() + 1,
      year: date.getFullYear(),
      status,
      leaveRequest,
      isCurrentMonth,
      isToday: dateOnly.getTime() === today.getTime(),
      isClickable
    };
  }

  /**
   * Calculate attendance summary for a given month
   */
  static calculateAttendanceSummary(calendar: MonthlyCalendar): AttendanceSummary {
    const currentMonthDates = calendar.dates.filter(date => date.isCurrentMonth);
    const today = new Date();
    const currentMonth = today.getMonth() + 1;
    const currentYear = today.getFullYear();
    
    // Only count dates up to today if viewing current month
    const relevantDates = currentMonthDates.filter(date => {
      if (calendar.month === currentMonth && calendar.year === currentYear) {
        return new Date(date.date) <= today;
      }
      return true; // For past months, count all dates
    });

    const totalWorkingDays = relevantDates.filter(date => 
      date.status !== AttendanceStatus.BEFORE_JOINING &&
      date.status !== AttendanceStatus.FUTURE
    ).length;

    const presentDays = relevantDates.filter(date => 
      date.status === AttendanceStatus.PRESENT
    ).length;

    const absentDays = relevantDates.filter(date => 
      date.status === AttendanceStatus.ABSENT
    ).length;

    const leavesApproved = relevantDates.filter(date => 
      date.status === AttendanceStatus.LEAVE_APPROVED
    ).length;

    const leavesPending = relevantDates.filter(date => 
      date.status === AttendanceStatus.LEAVE_PENDING
    ).length;

    const leavesRejected = relevantDates.filter(date => 
      date.status === AttendanceStatus.LEAVE_REJECTED
    ).length;

    const attendancePercentage = totalWorkingDays > 0 
      ? Math.round((presentDays / totalWorkingDays) * 100) 
      : 0;

    return {
      totalWorkingDays,
      presentDays,
      absentDays: absentDays + leavesApproved, // Include approved leaves as absent days
      leavesApproved,
      leavesPending,
      leavesRejected,
      attendancePercentage
    };
  }

  /**
   * Get leave statistics (if needed for admin view)
   */
  static async getLeaveStats(): Promise<any> {
    try {
      const response = await axiosInstance.get(this.ENDPOINTS.LEAVE_STATS);
      return response.data;
    } catch (error: any) {
      console.error('Error fetching leave stats:', error);
      throw error;
    }
  }

  /**
   * Validate leave request data before submission
   */
  static validateLeaveRequest(leaveData: CreateLeaveRequestDto, userJoiningDate: string): string[] {
    const errors: string[] = [];
    
    if (!leaveData.leaveDate) {
      errors.push('Leave date is required');
    } else {
      const leaveDate = new Date(leaveData.leaveDate);
      const today = new Date();
      const joiningDate = new Date(userJoiningDate);
      
      today.setHours(0, 0, 0, 0);
      leaveDate.setHours(0, 0, 0, 0);
      joiningDate.setHours(0, 0, 0, 0);
      
      if (leaveDate <= today) {
        errors.push('Leave date must be in the future');
      }
      
      if (leaveDate < joiningDate) {
        errors.push('Leave date cannot be before joining date');
      }
    }
    
    if (!leaveData.reason || leaveData.reason.trim().length < 10) {
      errors.push('Reason must be at least 10 characters long');
    } else if (leaveData.reason.trim().length > 500) {
      errors.push('Reason cannot exceed 500 characters');
    }
    
    if (leaveData.documents && leaveData.documents.length > 5) {
      errors.push('Maximum 5 documents allowed');
    }
    
    return errors;
  }

  /**
   * Format date for display (timezone-safe)
   */
  static formatDate(date: string | Date): string {
    if (typeof date === 'string') {
      // Handle YYYY-MM-DD format strings to avoid timezone issues
      const parts = date.split('-');
      if (parts.length === 3) {
        const year = parseInt(parts[0]);
        const month = parseInt(parts[1]) - 1; // Month is 0-indexed
        const day = parseInt(parts[2]);
        const dateObj = new Date(year, month, day);
        return dateObj.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        });
      }
    }
    
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  /**
   * Get status color for calendar dates
   */
  static getStatusColor(status: AttendanceStatus): string {
    switch (status) {
      case AttendanceStatus.PRESENT:
        return '#10B981'; // Green
      case AttendanceStatus.ABSENT:
        return '#EF4444'; // Red
      case AttendanceStatus.LEAVE_PENDING:
        return '#F59E0B'; // Yellow/Amber
      case AttendanceStatus.LEAVE_APPROVED:
        return '#EF4444'; // Red (same as absent)
      case AttendanceStatus.LEAVE_REJECTED:
        return '#3B82F6'; // Blue
      case AttendanceStatus.FUTURE:
        return '#9CA3AF'; // Gray
      case AttendanceStatus.BEFORE_JOINING:
        return '#9CA3AF'; // Gray
      default:
        return '#9CA3AF'; // Gray
    }
  }

  /**
   * Get status text for display
   */
  static getStatusText(status: AttendanceStatus): string {
    switch (status) {
      case AttendanceStatus.PRESENT:
        return 'Present';
      case AttendanceStatus.ABSENT:
        return 'Absent';
      case AttendanceStatus.LEAVE_PENDING:
        return 'Leave Pending';
      case AttendanceStatus.LEAVE_APPROVED:
        return 'Leave Approved';
      case AttendanceStatus.LEAVE_REJECTED:
        return 'Leave Rejected';
      case AttendanceStatus.FUTURE:
        return 'Future Date';
      case AttendanceStatus.BEFORE_JOINING:
        return 'Before Joining';
      default:
        return 'Unknown';
    }
  }

    /**
     * Delete a leave request by ID
     */
    static async deleteLeaveRequest(leaveId: string): Promise<LeaveResponse> {
      try {
        const response = await axiosInstance.delete<LeaveResponse>(`${this.ENDPOINTS.LEAVE}/${leaveId}`);
        return response.data;
      } catch (error: any) {
        console.error('Error deleting leave request:', error);
        return {
          success: false,
          message: error.response?.data?.message || error.message || 'Failed to delete leave request',
          errors: error.response?.data?.errors
        };
      }
    }
}