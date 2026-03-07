// Leave Status Enum (matching backend)
export enum LeaveStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected'
}

// Leave Type Enum (per-month quotas, same for all staff)
export enum LeaveType {
  CASUAL = 'casual',
  SICK = 'sick',
  LOP = 'lop',
}

// Leave Document Interface
export interface LeaveDocument {
  title: string;
  url: string;
}

// User Info in Leave Request (from backend)
export interface LeaveRequestUserInfo {
  _id: string;
  name: string;
  email: string;
  joiningDate: string;
}

// Leave Request Interface
export interface LeaveRequest {
  _id: string;
  userId: string | LeaveRequestUserInfo; // Can be string or populated user object
  leaveDate: string; // ISO date string
  reason: string;
  documents?: LeaveDocument[];
  status: LeaveStatus;
   // New: leave category used for quotas and reporting
  leaveType?: LeaveType;
  adminComments?: string; // Optional reason when admin rejects
  createdAt: string;
  updatedAt: string;
  // Optional fields from backend response
  formattedLeaveDate?: string;
  daysUntilLeave?: number;
  id?: string;
}

// Response from getLeavesByDateRange API
export interface LeavesByDateRangeResponse {
  leaves: LeaveRequest[];
  total: number;
  presentDays: number;
  absentDays: number;
  pendingLeaves: number;
  approvedLeaves: number;
  attendanceRate: number;
  totalWorkingDays: number;
  pastDays: number;
  upcomingDays: number;
  manualAbsentDates?: string[]; // Admin-marked absent dates (YYYY-MM-DD)
  // Per-type approved leave counts in the queried range (backend summary)
  casualLeaves?: number;
  sickLeaves?: number;
  lopLeaves?: number;
}

// Monthly leave configuration (same for all staff)
export interface MonthlyLeaveConfig {
  year: number;
  month: number;
  casualLimit: number;
  sickLimit: number;
}

// Per-user monthly leave usage (approved counts by type)
export interface MonthlyLeaveUsage {
  casualApproved: number;
  sickApproved: number;
  lopApproved: number;
}

// Create Leave Request DTO
export interface CreateLeaveRequestDto {
  userId: string;
  leaveDate: string; // ISO date string (YYYY-MM-DD)
  reason: string;
  leaveType: LeaveType;
  documents?: File[];
}

// Leave Response from API
export interface LeaveResponse {
  success: boolean;
  message: string;
  data?: LeaveRequest | LeaveRequest[];
  errors?: LeaveFormErrors;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Form validation errors
export interface LeaveFormErrors {
  userId?: string;
  leaveDate?: string;
  reason?: string;
  documents?: string;
  general?: string;
}

// Attendance Status for Calendar
export enum AttendanceStatus {
  PRESENT = 'present',
  ABSENT = 'absent',
  LEAVE_PENDING = 'leave_pending',
  LEAVE_APPROVED = 'leave_approved',
  LEAVE_REJECTED = 'leave_rejected',
  FUTURE = 'future',
  BEFORE_JOINING = 'before_joining',
  WEEKEND = 'weekend'
}

// Calendar Date Info
export interface CalendarDate {
  date: string; // YYYY-MM-DD format
  day: number;
  month: number;
  year: number;
  status: AttendanceStatus;
  leaveRequest?: LeaveRequest;
  isCurrentMonth: boolean;
  isToday: boolean;
  isClickable: boolean;
}

// Monthly Calendar Data
export interface MonthlyCalendar {
  month: number;
  year: number;
  dates: CalendarDate[];
  monthName: string;
  // Optional: backend-provided summary can be stored here
  summary?: AttendanceSummary;
}

// User Attendance Summary
export interface AttendanceSummary {
  totalWorkingDays: number;
  presentDays: number;
  absentDays: number;
  leavesApproved: number;
  leavesPending: number;
  leavesRejected: number;
  attendancePercentage: number;
}

// Filter options for attendance view
export interface AttendanceFilters {
  month: number;
  year: number;
  status?: AttendanceStatus;
}

// User Info (extended from existing user type)
export interface UserInfo {
  id: string;
  name: string;
  phoneNumber: string;
  designation: string;
  email?: string;
  joiningDate: string; // ISO date string
  role: string;
  isActive: number;
}

// Attendance API Query Parameters
export interface AttendanceQuery {
  userId: string;
  month: number;
  year: number;
  page?: number;
  limit?: number;
}

// Leave Request Form Data
export interface LeaveRequestFormData {
  leaveDate: string;
  reason: string;
  documents: File[];
  leaveType: LeaveType | '';
}

// Calendar Configuration
export interface CalendarConfig {
  minDate?: string; // Earliest selectable date (joining date)
  maxDate?: string; // Latest selectable date
  disabledDates?: string[]; // Dates that should be disabled
  highlightToday?: boolean;
  showOtherMonthDates?: boolean;
}

// Color Configuration for Calendar
export interface CalendarColors {
  present: string;
  absent: string;
  leavePending: string;
  leaveApproved: string;
  leaveRejected: string;
  future: string;
  beforeJoining: string;
  today: string;
  hover: string;
  weekend: string;
}

// Default color scheme
export const DEFAULT_CALENDAR_COLORS: CalendarColors = {
  present: '#10B981', // Green
  absent: '#EF4444', // Red
  leavePending: '#F59E0B', // Yellow/Amber
  leaveApproved: '#EF4444', // Red (same as absent)
  leaveRejected: '#3B82F6', // Blue
  future: '#9CA3AF', // Gray
  beforeJoining: '#9CA3AF', // Gray
  today: '#8B5CF6', // Purple border
  hover: '#F3F4F6', // Light gray
  weekend: '#E5E7EB' // Gray-200 for weekends
};

// Component Props Interfaces
export interface AttendanceCalendarProps {
  userId: string;
  userJoiningDate: string;
  month: number;
  year: number;
  onDateClick?: (date: CalendarDate) => void;
  onLeaveRequest?: (leaveData: CreateLeaveRequestDto) => void;
  colors?: Partial<CalendarColors>;
  className?: string;
}

export interface LeaveRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (leaveData: CreateLeaveRequestDto) => void;
  selectedDate?: string;
  userId: string;
  isLoading?: boolean;
  monthlyConfig?: MonthlyLeaveConfig;
  monthlyUsage?: MonthlyLeaveUsage;
}

export interface AttendanceSummaryProps {
  summary: AttendanceSummary;
  month: number;
  year: number;
  className?: string;
}

// Attendance Request Interface
export interface AttendanceRequestType {
  id: string;
  staffName: string;
  date: string;
  reason: string;
  status: "pending" | "approved" | "rejected";
  documents?: LeaveDocument[];
  leaveType?: LeaveType;
}