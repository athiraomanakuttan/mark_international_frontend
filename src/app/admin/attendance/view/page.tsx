"use client";
import React, { useEffect, useState, useCallback, useMemo, useRef } from "react";
import { ModernDashboardLayout } from "@/components/navbar/modern-dashboard-navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import {
  getLeavesByStatus,
  getAllStaffAttendance,
  approveAttendanceRequest,
  rejectAttendanceRequest,
  markStaffAbsent,
  removeStaffAbsent,
} from "@/service/admin/attendanceService";
import { AttendanceRequestType, LeaveType } from "@/types/attendance-types";
import {
  User,
  Calendar,
  FileText,
  CheckCircle2,
  XCircle,
  Clock,
  Inbox,
  Loader2,
  ImageIcon,
  ExternalLink,
  ChevronLeftIcon,
  ChevronRightIcon,
  CalendarDays,
  Search,
  UserCheck,
  UserX,
  Users,
  TrendingUp,
  CalendarCheck,
  CalendarClock,
  ChevronRight,
} from "lucide-react";
import { toast } from "react-toastify";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

type TabType = "requests" | "all-staff";

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export default function AttendanceViewPage() {
  const [activeTab, setActiveTab] = useState<TabType>("all-staff");
  const [status, setStatus] = useState("pending");
  const [requests, setRequests] = useState<AttendanceRequestType[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // All Staff Attendance state
  const [dateFrom, setDateFrom] = useState(() => {
    const d = new Date();
    d.setDate(1);
    return d.toISOString().split("T")[0];
  });
  const [dateTo, setDateTo] = useState(() => {
    const d = new Date();
    d.setMonth(d.getMonth() + 1);
    d.setDate(0); // Last day of current month
    return d.toISOString().split("T")[0];
  });
  const [staffAttendance, setStaffAttendance] = useState<any>(null);
  const [attendanceLoading, setAttendanceLoading] = useState(false);
  const [staffSearchInput, setStaffSearchInput] = useState("");
  const [staffSearchDebounced, setStaffSearchDebounced] = useState("");
  const [staffPage, setStaffPage] = useState(1);
  const staffSearchDebounceRef = useRef<NodeJS.Timeout | null>(null);
  const STAFF_PAGE_SIZE = 10;
  const [actionId, setActionId] = useState<string | null>(null);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [rejectRequestId, setRejectRequestId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState("");

  // Staff detail modal (click on staff row)
  const [staffDetailModalOpen, setStaffDetailModalOpen] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState<{ id: string; name: string } | null>(null);
  const [staffDetailMonth, setStaffDetailMonth] = useState(() => new Date().getMonth() + 1);
  const [staffDetailYear, setStaffDetailYear] = useState(() => new Date().getFullYear());
  const [staffDetailData, setStaffDetailData] = useState<any>(null);
  const [staffDetailLoading, setStaffDetailLoading] = useState(false);
  const [confirmAbsentOpen, setConfirmAbsentOpen] = useState(false);
  const [pendingAbsentDate, setPendingAbsentDate] = useState<string | null>(null);
  const [pendingAbsentType, setPendingAbsentType] = useState<LeaveType | null>(null);

  // Today's present/absent list modal
  const [dayListModalOpen, setDayListModalOpen] = useState(false);
  const [dayListType, setDayListType] = useState<"present" | "absent">("present");

  const fetchRequests = useCallback(async () => {
    if (activeTab !== "requests") return;
    setLoading(true);
    try {
      const { data } = await getLeavesByStatus(status, page);
      const leaves = data?.data ?? [];
      const totalPagesCount = data?.pagination?.totalPages ?? 1;
      setTotalPages(totalPagesCount);
      setRequests(
        leaves.map((leave: any) => ({
          id: leave._id ?? leave.id,
          staffName: leave.userId?.name ?? "—",
          date:
            leave.leaveDate != null
              ? new Date(leave.leaveDate).toLocaleDateString("en-IN", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                })
              : "—",
          reason: leave.reason ?? "—",
          status: leave.status ?? "pending",
          documents: leave.documents ?? [],
          leaveType: leave.leaveType as LeaveType | undefined,
        }))
      );
    } catch {
      setRequests([]);
    } finally {
      setLoading(false);
    }
  }, [status, page, activeTab]);

  useEffect(() => {
    if (activeTab !== "requests") return;
    fetchRequests();
  }, [activeTab, status, page, fetchRequests]);

  const handleApprove = async (requestId: string) => {
    setActionId(requestId);
    try {
      const { data } = await approveAttendanceRequest(requestId);
      if (data?.success) {
        toast.success("Leave request approved");
        fetchRequests();
      } else {
        toast.error(data?.message ?? "Failed to approve");
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? "Failed to approve");
    } finally {
      setActionId(null);
    }
  };

  const openRejectDialog = (requestId: string) => {
    setRejectRequestId(requestId);
    setRejectReason("");
    setRejectDialogOpen(true);
  };

  const closeRejectDialog = () => {
    setRejectDialogOpen(false);
    setRejectRequestId(null);
    setRejectReason("");
  };

  const handleRejectConfirm = async () => {
    if (!rejectRequestId) return;
    setActionId(rejectRequestId);
    try {
      const { data } = await rejectAttendanceRequest(rejectRequestId, rejectReason || undefined);
      if (data?.success) {
        toast.success("Leave request rejected");
        closeRejectDialog();
        fetchRequests();
      } else {
        toast.error(data?.message ?? "Failed to reject");
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? "Failed to reject");
    } finally {
      setActionId(null);
    }
  };

  const loadAllStaffAttendance = useCallback(async () => {
    setAttendanceLoading(true);
    setStaffPage(1);
    try {
      const { data } = await getAllStaffAttendance(dateFrom, dateTo);
      setStaffAttendance(data?.data ?? null);
    } catch {
      setStaffAttendance(null);
    } finally {
      setAttendanceLoading(false);
    }
  }, [dateFrom, dateTo]);

  const openStaffDetailModal = (s: { userId: string; userName: string }) => {
    setSelectedStaff({ id: s.userId, name: s.userName });
    setStaffDetailModalOpen(true);
    setStaffDetailData(null);
  };

  const getStaffDetailDateRange = () => {
    const first = new Date(staffDetailYear, staffDetailMonth - 1, 1);
    const last = new Date(staffDetailYear, staffDetailMonth, 0);
    return {
      from: first.toISOString().split("T")[0],
      to: last.toISOString().split("T")[0],
    };
  };

  const loadStaffDetail = useCallback(async () => {
    if (!selectedStaff) return;
    setStaffDetailLoading(true);
    try {
      const { from, to } = getStaffDetailDateRange();
      const { data } = await getAllStaffAttendance(from, to, selectedStaff.id);
      const payload = data?.data ?? null;
      const staff = payload?.staffAttendance?.[0] ?? null;
      setStaffDetailData(staff);
    } catch {
      setStaffDetailData(null);
    } finally {
      setStaffDetailLoading(false);
    }
  }, [selectedStaff, staffDetailMonth, staffDetailYear]);

  useEffect(() => {
    if (staffDetailModalOpen && selectedStaff) {
      loadStaffDetail();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [staffDetailModalOpen, selectedStaff?.id, staffDetailMonth, staffDetailYear]);

  const goStaffDetailPrevMonth = () => {
    if (staffDetailMonth === 1) {
      setStaffDetailMonth(12);
      setStaffDetailYear((y) => y - 1);
    } else {
      setStaffDetailMonth((m) => m - 1);
    }
  };

  const goStaffDetailNextMonth = () => {
    if (staffDetailMonth === 12) {
      setStaffDetailMonth(1);
      setStaffDetailYear((y) => y + 1);
    } else {
      setStaffDetailMonth((m) => m + 1);
    }
  };

  const [staffAbsentActionKey, setStaffAbsentActionKey] = useState<string | null>(null);

  const getLeaveTypeLabel = (type?: LeaveType) => {
    switch (type) {
      case LeaveType.CASUAL:
        return "Casual";
      case LeaveType.SICK:
        return "Sick";
      case LeaveType.LOP:
        return "LOP";
      default:
        return null;
    }
  };

  const handleMarkAbsent = async (dateStr: string, leaveType: LeaveType) => {
    if (!selectedStaff) return;
    setStaffAbsentActionKey(dateStr);
    try {
      const { data } = await markStaffAbsent(selectedStaff.id, dateStr, leaveType);
      if (data?.success) {
        toast.success("Leave recorded");
        loadStaffDetail();
      } else {
        toast.error(data?.message ?? "Failed to mark absent");
      }
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      toast.error(msg ?? "Failed to mark absent");
    } finally {
      setStaffAbsentActionKey(null);
    }
  };

  const confirmMarkAbsent = async () => {
    if (!selectedStaff || !pendingAbsentDate || !pendingAbsentType) return;
    await handleMarkAbsent(pendingAbsentDate, pendingAbsentType);
    setConfirmAbsentOpen(false);
    setPendingAbsentDate(null);
    setPendingAbsentType(null);
  };

  const handleRemoveAbsent = async (dateStr: string) => {
    if (!selectedStaff) return;
    setStaffAbsentActionKey(dateStr);
    try {
      const { data } = await removeStaffAbsent(selectedStaff.id, dateStr);
      if (data?.success) {
        toast.success("Absent mark removed");
        loadStaffDetail();
      } else {
        toast.error(data?.message ?? "Failed to remove absent mark");
      }
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      toast.error(msg ?? "Failed to remove absent mark");
    } finally {
      setStaffAbsentActionKey(null);
    }
  };

  useEffect(() => {
    if (activeTab === "all-staff" && dateFrom && dateTo) {
      loadAllStaffAttendance();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  // Debounce staff search input (300ms)
  useEffect(() => {
    if (staffSearchDebounceRef.current) {
      clearTimeout(staffSearchDebounceRef.current);
    }
    staffSearchDebounceRef.current = setTimeout(() => {
      setStaffSearchDebounced(staffSearchInput.trim());
      setStaffPage(1);
    }, 300);
    return () => {
      if (staffSearchDebounceRef.current) {
        clearTimeout(staffSearchDebounceRef.current);
        staffSearchDebounceRef.current = null;
      }
    };
  }, [staffSearchInput]);

  // Filter and paginate staff for All Staff Attendance table
  const { filteredStaff, paginatedStaff, totalStaffPages } = useMemo(() => {
    const list = staffAttendance?.staffAttendance ?? [];
    const term = staffSearchDebounced.toLowerCase();
    const filtered =
      term.length > 0
        ? list.filter((s: any) => {
            const name = (s.userName ?? "").toLowerCase();
            const email = (s.email ?? "").toLowerCase();
            const designation = (s.designation ?? "").toLowerCase();
            return (
              name.includes(term) ||
              email.includes(term) ||
              designation.includes(term)
            );
          })
        : list;
    const totalPages = Math.max(1, Math.ceil(filtered.length / STAFF_PAGE_SIZE));
    const start = (staffPage - 1) * STAFF_PAGE_SIZE;
    const paginated = filtered.slice(start, start + STAFF_PAGE_SIZE);
    return { filteredStaff: filtered, paginatedStaff: paginated, totalStaffPages: totalPages };
  }, [staffAttendance?.staffAttendance, staffSearchDebounced, staffPage]);

  useEffect(() => {
    if (staffPage > totalStaffPages && totalStaffPages >= 1) {
      setStaffPage(totalStaffPages);
    }
  }, [staffPage, totalStaffPages]);

  // Today's date (YYYY-MM-DD) and today's present/absent lists (only when today is in date range)
  const { todayStr, todayPresentList, todayAbsentList } = useMemo(() => {
    const d = new Date();
    const today = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    const from = staffAttendance?.dateFrom ?? "";
    const to = staffAttendance?.dateTo ?? "";
    const inRange = from && to && today >= from && today <= to;
    if (!inRange || !staffAttendance?.staffAttendance) {
      return { todayStr: today, todayPresentList: [], todayAbsentList: [] };
    }
    const present: { userId: string; userName: string; email?: string; designation?: string }[] = [];
    const absent: { userId: string; userName: string; email?: string; designation?: string; status?: string }[] = [];
    for (const s of staffAttendance.staffAttendance) {
      const daily = (s.dailyAttendance ?? []).find((d: any) => d.date === today);
      const status = daily?.status ?? "";
      if (status === "present") {
        present.push({ userId: s.userId, userName: s.userName, email: s.email, designation: s.designation });
      } else if (["absent", "leave", "pending"].includes(status)) {
        absent.push({
          userId: s.userId,
          userName: s.userName,
          email: s.email,
          designation: s.designation,
          status,
        });
      }
    }
    return { todayStr: today, todayPresentList: present, todayAbsentList: absent };
  }, [staffAttendance]);

  const isTodayInRange =
    staffAttendance &&
    todayStr >= (staffAttendance.dateFrom ?? "") &&
    todayStr <= (staffAttendance.dateTo ?? "");

  const openDayListModal = (type: "present" | "absent") => {
    if (!isTodayInRange) return;
    setDayListType(type);
    setDayListModalOpen(true);
  };

  return (
    <ModernDashboardLayout>
      <div className="p-6 space-y-6">
        <div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 dark:from-slate-100 dark:to-slate-300 bg-clip-text text-transparent">
            Attendance
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            View User attendance and manage leave requests
          </p>
        </div>

        <div className="flex gap-1 p-1 rounded-lg bg-slate-100 dark:bg-slate-800/50 w-fit">
          <button
            className={`px-4 py-2.5 text-sm font-medium rounded-md transition-all ${
              activeTab === "all-staff"
                ? "bg-white dark:bg-slate-700 text-primary shadow-sm"
                : "text-muted-foreground hover:text-foreground hover:bg-white/50 dark:hover:bg-slate-700/50"
            }`}
            onClick={() => setActiveTab("all-staff")}
          >
            All Staff Attendance
          </button>
          <button
            className={`px-4 py-2.5 text-sm font-medium rounded-md transition-all ${
              activeTab === "requests"
                ? "bg-white dark:bg-slate-700 text-primary shadow-sm"
                : "text-muted-foreground hover:text-foreground hover:bg-white/50 dark:hover:bg-slate-700/50"
            }`}
            onClick={() => setActiveTab("requests")}
          >
            Leave Requests
          </button>
        </div>

        {activeTab === "all-staff" && (
          <div className="space-y-6">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <p className="text-sm text-muted-foreground">
                Select date range to view User attendance
              </p>
              <div className="flex flex-wrap items-end gap-3 ml-auto">
                <div>
                  <label className="block text-sm font-medium mb-1">From</label>
                  <Input
                    type="date"
                    value={dateFrom}
                    onChange={(e) => setDateFrom(e.target.value)}
                    className="w-40"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">To</label>
                  <Input
                    type="date"
                    value={dateTo}
                    onChange={(e) => setDateTo(e.target.value)}
                    className="w-40"
                  />
                </div>
                <Button
                  onClick={loadAllStaffAttendance}
                  disabled={attendanceLoading || !dateFrom || !dateTo}
                >
                  {attendanceLoading ? "Loading..." : "Load"}
                </Button>
              </div>
            </div>

            {staffAttendance && (
              <>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                  {/* Total Staff */}
                  <div className="group relative overflow-hidden rounded-xl border border-slate-200/80 dark:border-slate-700/50 bg-gradient-to-br from-slate-50 via-white to-slate-100/80 dark:from-slate-900/60 dark:via-slate-800/50 dark:to-slate-900/70 p-5 shadow-sm hover:shadow-lg transition-all duration-300">
                    <div className="absolute -right-2 -top-2 h-20 w-20 rounded-full bg-slate-200/40 dark:bg-slate-600/20" />
                    <div className="relative">
                      <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-slate-600/10 dark:bg-slate-500/20 text-slate-600 dark:text-slate-400">
                        <Users className="h-5 w-5" />
                      </div>
                      <p className="text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">Total Staff</p>
                      <p className="mt-1 text-2xl font-bold tracking-tight text-slate-800 dark:text-slate-100">{staffAttendance.totalStaff}</p>
                    </div>
                  </div>

                  {/* Avg Attendance */}
                  <div className="group relative overflow-hidden rounded-xl border border-emerald-200/60 dark:border-emerald-800/40 bg-gradient-to-br from-emerald-50 via-white to-teal-50/60 dark:from-emerald-950/30 dark:via-slate-800/50 dark:to-teal-950/20 p-5 shadow-sm hover:shadow-lg transition-all duration-300">
                    <div className="absolute -right-2 -top-2 h-20 w-20 rounded-full bg-emerald-300/20 dark:bg-emerald-500/10" />
                    <div className="relative">
                      <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/15 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400">
                        <TrendingUp className="h-5 w-5" />
                      </div>
                      <p className="text-xs font-medium uppercase tracking-wider text-emerald-700/80 dark:text-emerald-400/80">Avg Attendance</p>
                      <p className="mt-1 text-2xl font-bold tracking-tight text-emerald-700 dark:text-emerald-400">
                        {staffAttendance.overallSummary?.averageAttendanceRate?.toFixed(1) ?? 0}%
                      </p>
                    </div>
                  </div>

                  {/* Today's Present */}
                  <button
                    type="button"
                    onClick={() => openDayListModal("present")}
                    disabled={!isTodayInRange}
                    className={cn(
                      "group relative overflow-hidden rounded-xl border p-5 text-left shadow-sm transition-all duration-300",
                      "border-emerald-200/70 dark:border-emerald-800/50",
                      "bg-gradient-to-br from-emerald-50 via-white to-green-50/70 dark:from-emerald-950/40 dark:via-slate-800/50 dark:to-green-950/30",
                      isTodayInRange
                        ? "hover:shadow-xl hover:shadow-emerald-500/10 hover:scale-[1.02] cursor-pointer focus:outline-none focus:ring-2 focus:ring-emerald-500/60 focus:ring-offset-2"
                        : "cursor-not-allowed opacity-70"
                    )}
                  >
                    <div className="absolute -right-2 -top-2 h-24 w-24 rounded-full bg-emerald-400/15 dark:bg-emerald-500/10" />
                    <div className="relative flex items-start justify-between">
                      <div>
                        <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/20 dark:bg-emerald-500/25 text-emerald-600 dark:text-emerald-400">
                          <UserCheck className="h-5 w-5" />
                        </div>
                        <p className="text-xs font-medium uppercase tracking-wider text-emerald-700/80 dark:text-emerald-400/80">Today&apos;s Present</p>
                        <p className="mt-1 text-2xl font-bold tracking-tight text-emerald-700 dark:text-emerald-400">
                          {isTodayInRange ? todayPresentList.length : "—"}
                        </p>
                        {isTodayInRange && (
                          <p className="mt-2 flex items-center gap-1 text-xs font-medium text-emerald-600 dark:text-emerald-500">
                            View list <ChevronRight className="h-3.5 w-3.5" />
                          </p>
                        )}
                      </div>
                      {isTodayInRange && (
                        <div className="rounded-full bg-emerald-500/10 p-1.5 dark:bg-emerald-500/15 group-hover:bg-emerald-500/20 transition-colors">
                          <ChevronRight className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                        </div>
                      )}
                    </div>
                  </button>

                  {/* Today's Absent */}
                  <button
                    type="button"
                    onClick={() => openDayListModal("absent")}
                    disabled={!isTodayInRange}
                    className={cn(
                      "group relative overflow-hidden rounded-xl border p-5 text-left shadow-sm transition-all duration-300",
                      "border-rose-200/70 dark:border-rose-800/50",
                      "bg-gradient-to-br from-rose-50/80 via-white to-red-50/50 dark:from-rose-950/40 dark:via-slate-800/50 dark:to-red-950/30",
                      isTodayInRange
                        ? "hover:shadow-xl hover:shadow-rose-500/10 hover:scale-[1.02] cursor-pointer focus:outline-none focus:ring-2 focus:ring-rose-500/60 focus:ring-offset-2"
                        : "cursor-not-allowed opacity-70"
                    )}
                  >
                    <div className="absolute -right-2 -top-2 h-24 w-24 rounded-full bg-rose-400/15 dark:bg-rose-500/10" />
                    <div className="relative flex items-start justify-between">
                      <div>
                        <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-rose-500/20 dark:bg-rose-500/25 text-rose-600 dark:text-rose-400">
                          <UserX className="h-5 w-5" />
                        </div>
                        <p className="text-xs font-medium uppercase tracking-wider text-rose-700/80 dark:text-rose-400/80">Today&apos;s Absent</p>
                        <p className="mt-1 text-2xl font-bold tracking-tight text-rose-700 dark:text-rose-400">
                          {isTodayInRange ? todayAbsentList.length : "—"}
                        </p>
                        {isTodayInRange && (
                          <p className="mt-2 flex items-center gap-1 text-xs font-medium text-rose-600 dark:text-rose-500">
                            View list <ChevronRight className="h-3.5 w-3.5" />
                          </p>
                        )}
                      </div>
                      {isTodayInRange && (
                        <div className="rounded-full bg-rose-500/10 p-1.5 dark:bg-rose-500/15 group-hover:bg-rose-500/20 transition-colors">
                          <ChevronRight className="h-4 w-4 text-rose-600 dark:text-rose-400" />
                        </div>
                      )}
                    </div>
                  </button>

                  {/* Total Present (period) */}
                  <div className="group relative overflow-hidden rounded-xl border border-blue-200/60 dark:border-blue-800/40 bg-gradient-to-br from-blue-50/80 via-white to-indigo-50/50 dark:from-blue-950/30 dark:via-slate-800/50 dark:to-indigo-950/20 p-5 shadow-sm hover:shadow-lg transition-all duration-300">
                    <div className="absolute -right-2 -top-2 h-20 w-20 rounded-full bg-blue-300/20 dark:bg-blue-500/10" />
                    <div className="relative">
                      <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/15 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400">
                        <CalendarCheck className="h-5 w-5" />
                      </div>
                      <p className="text-xs font-medium uppercase tracking-wider text-blue-700/80 dark:text-blue-400/80">Total Present</p>
                      <p className="mt-1 text-2xl font-bold tracking-tight text-blue-700 dark:text-blue-400">
                        {staffAttendance.overallSummary?.totalPresentDays ?? 0}
                      </p>
                      <p className="mt-0.5 text-[10px] text-blue-600/70 dark:text-blue-500/70">period total</p>
                    </div>
                  </div>

                  {/* Leaves (C / S / LOP) */}
                  <div className="group relative overflow-hidden rounded-xl border border-amber-200/60 dark:border-amber-800/40 bg-gradient-to-br from-amber-50/70 via-white to-orange-50/40 dark:from-amber-950/30 dark:via-slate-800/50 dark:to-orange-950/20 p-5 shadow-sm hover:shadow-lg transition-all duration-300">
                    <div className="absolute -right-2 -top-2 h-20 w-20 rounded-full bg-amber-300/20 dark:bg-amber-500/10" />
                    <div className="relative">
                      <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/15 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400">
                        <CalendarClock className="h-5 w-5" />
                      </div>
                      <p className="text-xs font-medium uppercase tracking-wider text-amber-700/80 dark:text-amber-400/80">Leaves</p>
                      <div className="mt-2 space-y-1">
                        <p className="flex justify-between text-sm font-semibold text-blue-600 dark:text-blue-400">
                          <span>Casual</span> <span>{staffAttendance.overallSummary?.totalCasualLeaves ?? 0}</span>
                        </p>
                        <p className="flex justify-between text-sm font-semibold text-amber-600 dark:text-amber-400">
                          <span>Sick</span> <span>{staffAttendance.overallSummary?.totalSickLeaves ?? 0}</span>
                        </p>
                        <p className="flex justify-between text-sm font-semibold text-rose-600 dark:text-rose-400">
                          <span>LOP</span> <span>{staffAttendance.overallSummary?.totalLopLeaves ?? 0}</span>
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-4">
                  <p className="text-sm text-muted-foreground">
                    {formatDate(staffAttendance.dateFrom)} – {formatDate(staffAttendance.dateTo)}
                  </p>
                  <div className="relative w-full sm:w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                    <Input
                      type="text"
                      placeholder="Search by name, email, designation..."
                      value={staffSearchInput}
                      onChange={(e) => setStaffSearchInput(e.target.value)}
                      className="pl-9"
                    />
                  </div>
                </div>

                <div className="bg-white rounded-lg border overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="min-w-full">
                      <thead>
                        <tr className="border-b bg-muted/50">
                          <th className="text-left p-3 font-medium">Staff</th>
                          <th className="text-left p-3 font-medium">Designation</th>
                          <th className="text-right p-3 font-medium">Present</th>
                          <th className="text-right p-3 font-medium">Casual</th>
                          <th className="text-right p-3 font-medium">Sick</th>
                          <th className="text-right p-3 font-medium">LOP</th>
                          <th className="text-right p-3 font-medium">Total Leave</th>
                          <th className="text-right p-3 font-medium">Pending</th>
                          <th className="text-right p-3 font-medium">Rejected</th>
                          <th className="text-right p-3 font-medium">Attendance %</th>
                        </tr>
                      </thead>
                      <tbody>
                        {paginatedStaff.map(
                          (s: any) => (
                            <tr
                              key={s.userId}
                              className="border-b hover:bg-muted/30 cursor-pointer"
                              onClick={() => openStaffDetailModal(s)}
                            >
                              <td className="p-3">
                                <span className="font-medium">{s.userName}</span>
                                {s.email && (
                                  <span className="block text-xs text-muted-foreground">
                                    {s.email}
                                  </span>
                                )}
                              </td>
                              <td className="p-3 text-muted-foreground">
                                {s.designation ?? "—"}
                              </td>
                              <td className="p-3 text-right">{s.summary?.presentDays ?? 0}</td>
                              <td className="p-3 text-right text-blue-600">
                                {s.summary?.casualLeaves ?? 0}
                              </td>
                              <td className="p-3 text-right text-blue-600">
                                {s.summary?.sickLeaves ?? 0}
                              </td>
                              <td className="p-3 text-right text-blue-600">
                                {s.summary?.lopLeaves ?? 0}
                              </td>
                              <td className="p-3 text-right font-semibold">
                                {(s.summary?.casualLeaves ?? 0) +
                                  (s.summary?.sickLeaves ?? 0) +
                                  (s.summary?.lopLeaves ?? 0)}
                              </td>
                              <td className="p-3 text-right text-gray-500">
                                {s.summary?.pendingLeaves ?? 0}
                              </td>
                              <td className="p-3 text-right text-red-600">
                                {s.summary?.rejectedLeaves ?? 0}
                              </td>
                              <td className="p-3 text-right">
                                <span
                                  className={
                                    (s.summary?.attendanceRate ?? 0) >= 80
                                      ? "text-green-600 font-medium"
                                      : (s.summary?.attendanceRate ?? 0) >= 60
                                        ? "text-amber-600"
                                        : "text-red-600"
                                  }
                                >
                                  {(s.summary?.attendanceRate ?? 0).toFixed(1)}%
                                </span>
                              </td>
                            </tr>
                          )
                        )}
                      </tbody>
                    </table>
                  </div>
                  {filteredStaff.length === 0 && (
                    <p className="p-8 text-center text-muted-foreground">
                      {staffSearchDebounced
                        ? "No staff match your search."
                        : "No staff records found for this period."}
                    </p>
                  )}
                  {filteredStaff.length > 0 && (
                    <div className="flex items-center justify-between px-4 py-3 border-t bg-muted/30">
                      <p className="text-sm text-muted-foreground">
                        Showing {(staffPage - 1) * STAFF_PAGE_SIZE + 1}–
                        {Math.min(staffPage * STAFF_PAGE_SIZE, filteredStaff.length)} of {filteredStaff.length}
                      </p>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={staffPage <= 1}
                          onClick={() => setStaffPage((p) => Math.max(1, p - 1))}
                        >
                          <ChevronLeftIcon className="h-4 w-4" />
                          Previous
                        </Button>
                        <span className="text-sm text-muted-foreground min-w-[80px] text-center">
                          Page {staffPage} of {totalStaffPages}
                        </span>
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={staffPage >= totalStaffPages}
                          onClick={() => setStaffPage((p) => p + 1)}
                        >
                          Next
                          <ChevronRightIcon className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        )}

        {activeTab === "requests" && (
          <>
            <Card className="border-0 shadow-md bg-gradient-to-br from-slate-50 to-slate-100/80 dark:from-slate-900/50 dark:to-slate-800/30">
              <CardHeader>
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <FileText className="h-5 w-5 text-primary" />
                    Leave Requests
                  </CardTitle>
                  <Select value={status} onValueChange={setStatus}>
                    <SelectTrigger className="w-[180px] border-slate-200 dark:border-slate-700">
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="approved">Approved</SelectItem>
                      <SelectItem value="rejected">Rejected</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {loading ? (
                  <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
                    <Loader2 className="h-10 w-10 animate-spin mb-3" />
                    <p>Loading requests...</p>
                  </div>
                ) : requests.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
                    <Inbox className="h-14 w-14 mb-4 opacity-50" />
                    <p className="font-medium">No leave requests found</p>
                    <p className="text-sm mt-1">
                      {status === "pending"
                        ? "There are no pending requests at the moment."
                        : `No ${status} requests.`}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {requests.map((req) => (
                      <div
                        key={req.id}
                        className={`flex flex-col sm:flex-row sm:items-center gap-4 p-4 rounded-xl bg-white dark:bg-slate-800/50 border shadow-sm hover:shadow-md transition-shadow ${
                          req.status === "approved"
                            ? "border-l-4 border-l-emerald-500 border-slate-200/80 dark:border-slate-700/50"
                            : req.status === "rejected"
                              ? "border-l-4 border-l-red-500 border-slate-200/80 dark:border-slate-700/50"
                              : "border-l-4 border-l-amber-500 border-slate-200/80 dark:border-slate-700/50"
                        }`}
                      >
                        <div className="flex-1 min-w-0 space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <User className="h-4 w-4 text-slate-500 shrink-0" />
                            <span className="font-semibold text-slate-900 dark:text-slate-100">
                              {req.staffName}
                            </span>
                            {getLeaveTypeLabel(req.leaveType) && (
                              <Badge
                                variant="outline"
                                className="text-xs px-2 py-0.5 border-slate-300 dark:border-slate-600"
                              >
                                {getLeaveTypeLabel(req.leaveType)}
                              </Badge>
                            )}
                            <Badge
                              variant="outline"
                              className={
                                req.status === "approved"
                                  ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-400 dark:border-emerald-800 font-medium px-2.5 py-0.5"
                                  : req.status === "rejected"
                                    ? "bg-red-50 text-red-700 border-red-200 dark:bg-red-950/50 dark:text-red-400 dark:border-red-800 font-medium px-2.5 py-0.5"
                                    : "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/50 dark:text-amber-400 dark:border-amber-800 font-medium px-2.5 py-0.5"
                              }
                            >
                              {req.status === "approved" && (
                                <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
                              )}
                              {req.status === "rejected" && (
                                <XCircle className="h-3.5 w-3.5 mr-1" />
                              )}
                              {req.status === "pending" && (
                                <Clock className="h-3.5 w-3.5 mr-1" />
                              )}
                              {req.status.charAt(0).toUpperCase() + req.status.slice(1)}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                            <Calendar className="h-3.5 w-3.5 shrink-0" />
                            <span>{req.date}</span>
                          </div>
                          <div className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-400">
                            <FileText className="h-3.5 w-3.5 shrink-0 mt-0.5" />
                            <span className="line-clamp-2">{req.reason}</span>
                          </div>
                          {req.documents && req.documents.length > 0 && (
                            <div className="pt-2 space-y-2">
                              <p className="text-xs font-medium text-slate-500 flex items-center gap-1">
                                <ImageIcon className="h-3.5 w-3.5" />
                                Attachments ({req.documents.length})
                              </p>
                              <div className="flex flex-wrap gap-2">
                                {req.documents.map((doc, idx) => {
                                  const hasImageExt = /\.(jpg|jpeg|png|gif|webp)(\?|$)/i.test(doc.url);
                                  const isCloudinaryImage = doc.url.includes("cloudinary.com") && doc.url.includes("/image/upload/");
                                  const isImage = hasImageExt || isCloudinaryImage;
                                  return (
                                    <a
                                      key={idx}
                                      href={doc.url}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 hover:border-slate-300 dark:hover:border-slate-500 transition-colors group"
                                    >
                                      {isImage ? (
                                        <img
                                          src={doc.url}
                                          alt={doc.title || `Attachment ${idx + 1}`}
                                          className="h-12 w-12 object-cover rounded border border-slate-200 dark:border-slate-600"
                                        />
                                      ) : (
                                        <FileText className="h-4 w-4 text-slate-500 group-hover:text-primary" />
                                      )}
                                      <span className="text-xs font-medium text-slate-700 dark:text-slate-300 truncate max-w-[120px] group-hover:text-primary">
                                        {doc.title || `Document ${idx + 1}`}
                                      </span>
                                      <ExternalLink className="h-3 w-3 text-slate-400 group-hover:text-primary shrink-0" />
                                    </a>
                                  );
                                })}
                              </div>
                            </div>
                          )}
                        </div>
                        {req.status === "pending" && (
                          <div className="flex items-center gap-2 shrink-0">
                            <Button
                              size="sm"
                              className="bg-emerald-600 hover:bg-emerald-700 text-white"
                              onClick={() => handleApprove(req.id)}
                              disabled={actionId === req.id}
                            >
                              {actionId === req.id ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <>
                                  <CheckCircle2 className="h-4 w-4 mr-1" />
                                  Approve
                                </>
                              )}
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => openRejectDialog(req.id)}
                              disabled={actionId === req.id}
                            >
                              {actionId === req.id ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <>
                                  <XCircle className="h-4 w-4 mr-1" />
                                  Reject
                                </>
                              )}
                            </Button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
                {requests.length > 0 && (
                  <div className="flex items-center justify-between pt-4 border-t">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={page === 1}
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                    >
                      Previous
                    </Button>
                    <span className="text-sm text-muted-foreground">
                      Page {page} of {totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={page >= totalPages}
                      onClick={() => setPage((p) => p + 1)}
                    >
                      Next
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        )}
      </div>

      {/* Today's Present / Absent List Modal */}
      <Dialog
        open={dayListModalOpen}
        onOpenChange={(open) => !open && setDayListModalOpen(false)}
      >
        <DialogContent className="max-w-lg max-h-[85vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {dayListType === "present" ? (
                <>
                  <UserCheck className="h-5 w-5 text-green-600" />
                  Today&apos;s Present — {formatDate(todayStr)}
                </>
              ) : (
                <>
                  <UserX className="h-5 w-5 text-red-600" />
                  Today&apos;s Absent — {formatDate(todayStr)}
                </>
              )}
            </DialogTitle>
            <DialogDescription>
              {dayListType === "present"
                ? `${todayPresentList.length} staff member${todayPresentList.length === 1 ? "" : "s"} marked present today`
                : `${todayAbsentList.length} staff member${todayAbsentList.length === 1 ? "" : "s"} absent or on leave today`}
            </DialogDescription>
          </DialogHeader>
          <div className="overflow-y-auto flex-1 min-h-0 -mx-6 px-6">
            {dayListType === "present" ? (
              todayPresentList.length === 0 ? (
                <p className="py-8 text-center text-muted-foreground text-sm">No one marked present today.</p>
              ) : (
                <ul className="space-y-2">
                  {todayPresentList.map((u) => (
                    <li
                      key={u.userId}
                      className="flex items-center gap-3 p-3 rounded-lg border bg-green-50/50 dark:bg-green-950/20 border-green-200/50 dark:border-green-800/50"
                    >
                      <UserCheck className="h-5 w-5 text-green-600 shrink-0" />
                      <div>
                        <p className="font-medium">{u.userName}</p>
                        {u.email && (
                          <p className="text-xs text-muted-foreground">{u.email}</p>
                        )}
                        {u.designation && (
                          <p className="text-xs text-muted-foreground">{u.designation}</p>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              )
            ) : todayAbsentList.length === 0 ? (
              <p className="py-8 text-center text-muted-foreground text-sm">No one absent today.</p>
            ) : (
              <ul className="space-y-2">
                {todayAbsentList.map((u) => (
                  <li
                    key={u.userId}
                    className="flex items-center gap-3 p-3 rounded-lg border bg-red-50/50 dark:bg-red-950/20 border-red-200/50 dark:border-red-800/50"
                  >
                    <UserX className="h-5 w-5 text-red-600 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium">{u.userName}</p>
                      {u.email && (
                        <p className="text-xs text-muted-foreground">{u.email}</p>
                      )}
                      {u.designation && (
                        <p className="text-xs text-muted-foreground">{u.designation}</p>
                      )}
                      {u.status && (
                        <Badge
                          variant="outline"
                          className="mt-1 text-xs"
                        >
                          {u.status === "leave" ? "On Leave" : u.status === "pending" ? "Leave Pending" : "Absent"}
                        </Badge>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Staff Detail Modal */}
      <Dialog
        open={staffDetailModalOpen}
        onOpenChange={(open) => {
          if (!open) setStaffDetailModalOpen(false);
        }}
      >
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              {selectedStaff?.name ?? "Staff"} — Attendance
            </DialogTitle>
            
          </DialogHeader>
          <div className="space-y-4">
            {staffDetailLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : staffDetailData ? (
              (() => {
                const daily = staffDetailData.dailyAttendance ?? [];
                const dateToDetail: Record<string, { status: string; leaveReason?: string; adminComments?: string; isManualAbsence?: boolean; leaveType?: LeaveType }> = {};
                daily.forEach((d: { date: string; status: string; leaveReason?: string; adminComments?: string; isManualAbsence?: boolean; leaveType?: LeaveType }) => {
                  dateToDetail[d.date] = {
                    status: d.status,
                    leaveReason: d.leaveReason,
                    adminComments: d.adminComments,
                    isManualAbsence: d.isManualAbsence,
                    leaveType: d.leaveType,
                  };
                });
                const lastDay = new Date(staffDetailYear, staffDetailMonth, 0).getDate();
                const firstDow = new Date(staffDetailYear, staffDetailMonth - 1, 1).getDay();
                const t = new Date();
                const todayStr = `${t.getFullYear()}-${String(t.getMonth() + 1).padStart(2, "0")}-${String(t.getDate()).padStart(2, "0")}`;
                const statusColors: Record<string, string> = {
                  present: "#10B981",
                  absent: "#EF4444",
                  leave: "#EF4444",
                  pending: "#F59E0B",
                  rejected: "#3B82F6",
                  before_joining: "#9CA3AF",
                  future: "#9CA3AF",
                };
                const statusLabels: Record<string, string> = {
                  present: "Present",
                  absent: "Absent",
                  leave: "Leave",
                  pending: "Pending",
                  rejected: "Rejected",
                  before_joining: "Before Joining",
                  future: "Future",
                };
                const leaveTypeLabels: Record<LeaveType, string> = {
                  [LeaveType.CASUAL]: "Casual Leave",
                  [LeaveType.SICK]: "Sick Leave",
                  [LeaveType.LOP]: "LOP (Loss of Pay)",
                };
                const cells: { dateStr: string; day: number; status: string; isCurrentMonth: boolean; isToday: boolean; leaveReason?: string; adminComments?: string; isManualAbsence?: boolean; leaveType?: LeaveType }[] = [];
                for (let i = 0; i < firstDow; i++) cells.push({ dateStr: "", day: 0, status: "", isCurrentMonth: false, isToday: false });
                for (let d = 1; d <= lastDay; d++) {
                  const dateStr = `${staffDetailYear}-${String(staffDetailMonth).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
                  const detail = dateToDetail[dateStr];
                  const status = detail?.status ?? (dateStr > todayStr ? "future" : "");
                  cells.push({
                    dateStr,
                    day: d,
                    status: status || (dateStr > todayStr ? "future" : ""),
                    isCurrentMonth: true,
                    isToday: dateStr === todayStr,
                    leaveReason: detail?.leaveReason,
                    adminComments: detail?.adminComments,
                    isManualAbsence: detail?.isManualAbsence,
                    leaveType: detail?.leaveType,
                  });
                }
                const remainder = cells.length % 7;
                if (remainder) for (let i = 0; i < 7 - remainder; i++) cells.push({ dateStr: "", day: 0, status: "", isCurrentMonth: false, isToday: false });
                const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
                return (
                  <div className="space-y-4">
                    <p className="text-sm text-muted-foreground">
                      Attendance: {(staffDetailData.summary?.attendanceRate ?? 0).toFixed(1)}%
                    </p>
                    <div className="flex items-center justify-between">
                      <Button variant="ghost" size="sm" onClick={goStaffDetailPrevMonth}>
                        <ChevronLeftIcon className="h-4 w-4" />
                      </Button>
                      <h2 className="text-lg font-semibold flex items-center gap-2">
                        <CalendarDays className="h-5 w-5" />
                        {monthNames[staffDetailMonth - 1]} {staffDetailYear}
                      </h2>
                      <Button variant="ghost" size="sm" onClick={goStaffDetailNextMonth}>
                        <ChevronRightIcon className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="grid grid-cols-7 gap-1 text-center text-xs font-medium text-muted-foreground mb-2">
                      {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
                        <div key={d}>{d}</div>
                      ))}
                    </div>
                    <TooltipProvider delayDuration={0}>
                      <div className="grid grid-cols-7 gap-1">
                        {cells.map((c, i) => {
                          const isPastDate = c.dateStr && c.dateStr <= todayStr;
                          // Allow mark leave for past dates that are Present or Unmarked (N/A)
                          const canMarkAbsent = isPastDate && (c.status === "present" || c.status === "");
                          const canRemoveAbsent = isPastDate && c.status === "absent" && c.isManualAbsence;
                          const showAbsentMenu = canMarkAbsent || canRemoveAbsent;
                          const isLoading = staffAbsentActionKey === c.dateStr;

                          const tooltipContent = c.dateStr ? (
                            <div className="space-y-1.5 max-w-xs">
                              <p className="font-medium">
                                {formatDate(c.dateStr)} — {statusLabels[c.status] || "N/A"}
                              </p>
                              {c.isManualAbsence && (
                                <p className="text-xs text-white/80">Marked absent by admin</p>
                              )}
                              {c.leaveType && (
                                <p className="text-xs text-white/80">
                                  Type: {leaveTypeLabels[c.leaveType] ?? c.leaveType}
                                </p>
                              )}
                              {c.status === "pending" && (
                                <p className="text-xs text-amber-200/90">
                                  Pending leave request — cannot mark absent.
                                </p>
                              )}
                              {c.leaveReason && (
                                <div>
                                  <p className="text-xs font-medium text-white/90">Reason</p>
                                  <p className="text-xs text-white/80 leading-snug">{c.leaveReason}</p>
                                </div>
                              )}
                              {c.adminComments && (
                                <div className="pt-1 border-t border-white/30">
                                  <p className="text-xs font-medium text-white/90">Rejection reason</p>
                                  <p className="text-xs text-white/80 leading-snug">{c.adminComments}</p>
                                </div>
                              )}
                            </div>
                          ) : null;
                          const cell = (
                            <div
                              className={cn(
                                "aspect-square p-1 border flex flex-col items-center justify-center text-sm rounded transition-all relative",
                                c.isCurrentMonth ? "border-border" : "border-transparent bg-muted/30",
                                c.isToday && "ring-2 ring-primary ring-offset-1",
                                c.dateStr && "cursor-help",
                                showAbsentMenu && "cursor-pointer"
                              )}
                              style={{
                                backgroundColor: c.isCurrentMonth && c.status ? `${statusColors[c.status] || "#9CA3AF"}20` : undefined,
                              }}
                            >
                              {isLoading && (
                                <div className="absolute inset-0 flex items-center justify-center bg-background/60 rounded z-10">
                                  <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                                </div>
                              )}
                              {c.day > 0 && <span className="font-medium">{c.day}</span>}
                              {c.isCurrentMonth && c.status && (
                                <div
                                  className="w-2 h-2 rounded-full mt-0.5"
                                  style={{ backgroundColor: statusColors[c.status] || "#9CA3AF" }}
                                />
                              )}
                            </div>
                          );
                          const wrappedCell = showAbsentMenu ? (
                            <DropdownMenu key={i}>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <DropdownMenuTrigger asChild>{cell}</DropdownMenuTrigger>
                                </TooltipTrigger>
                                <TooltipContent side="top" className="max-w-xs">
                                  {tooltipContent}
                                </TooltipContent>
                              </Tooltip>
                              <DropdownMenuContent align="start" onClick={(e) => e.stopPropagation()}>
                                {canMarkAbsent && (
                                  <>
                                    <DropdownMenuItem
                                      onClick={() => {
                                        setPendingAbsentDate(c.dateStr!);
                                        setPendingAbsentType(LeaveType.CASUAL);
                                        setConfirmAbsentOpen(true);
                                      }}
                                      disabled={!!staffAbsentActionKey}
                                    >
                                      Mark as Casual leave
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                      onClick={() => {
                                        setPendingAbsentDate(c.dateStr!);
                                        setPendingAbsentType(LeaveType.SICK);
                                        setConfirmAbsentOpen(true);
                                      }}
                                      disabled={!!staffAbsentActionKey}
                                    >
                                      Mark as Sick leave
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                      onClick={() => {
                                        setPendingAbsentDate(c.dateStr!);
                                        setPendingAbsentType(LeaveType.LOP);
                                        setConfirmAbsentOpen(true);
                                      }}
                                      disabled={!!staffAbsentActionKey}
                                    >
                                      Mark as LOP (Loss of Pay)
                                    </DropdownMenuItem>
                                  </>
                                )}
                                {canRemoveAbsent && (
                                  <DropdownMenuItem
                                    onClick={() => handleRemoveAbsent(c.dateStr!)}
                                    disabled={!!staffAbsentActionKey}
                                  >
                                    Remove absent mark
                                  </DropdownMenuItem>
                                )}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          ) : c.dateStr ? (
                            <Tooltip key={i}>
                              <TooltipTrigger asChild>{cell}</TooltipTrigger>
                              <TooltipContent side="top" className="max-w-xs">
                                {tooltipContent}
                              </TooltipContent>
                            </Tooltip>
                          ) : (
                            <React.Fragment key={i}>{cell}</React.Fragment>
                          );
                          return wrappedCell;
                        })}
                      </div>
                    </TooltipProvider>
                    <p className="text-xs text-muted-foreground text-center">
                      Click past dates (Present, Unmarked, or Marked absent) to mark absent or remove.
                    </p>
                    <div className="flex flex-wrap gap-4 justify-center text-xs">
                      {(["present", "absent", "leave", "pending", "rejected", "before_joining", "future"] as const).map((s) => (
                        <div key={s} className="flex items-center gap-1.5">
                          <div
                            className="w-3 h-3 rounded-full shrink-0"
                            style={{ backgroundColor: statusColors[s] }}
                          />
                          <span>{statusLabels[s]}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })()
            ) : (
              <p className="text-sm text-muted-foreground py-8 text-center">
                No data for this period.
              </p>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={rejectDialogOpen} onOpenChange={(open) => !open && closeRejectDialog()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Leave Request</DialogTitle>
            <DialogDescription>
              Optionally provide a reason for the rejection. The staff will see this when they view their leave status.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
              Reason (optional)
            </label>
            <Textarea
              placeholder="e.g. Insufficient notice period, conflicting with team schedule..."
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              rows={3}
              className="resize-none"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={closeRejectDialog}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleRejectConfirm}
              disabled={actionId !== null}
            >
              {actionId ? <Loader2 className="h-4 w-4 animate-spin" /> : "Reject"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={confirmAbsentOpen}
        onOpenChange={(open) => {
          if (!open) {
            setConfirmAbsentOpen(false);
            setPendingAbsentDate(null);
            setPendingAbsentType(null);
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Mark as absent?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to mark this staff member as absent for{" "}
              {pendingAbsentDate ? formatDate(pendingAbsentDate) : "this date"}?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmMarkAbsent}>
              Yes, mark absent
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

    </ModernDashboardLayout>
  );
}
