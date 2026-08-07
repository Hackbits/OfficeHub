"use client";

import { useQuery } from "@tanstack/react-query";

interface ReportFilters {
  start_date?: string;
  end_date?: string;
  employee_id?: string;
  leave_type?: string;
}

export function useAttendanceReport(filters?: ReportFilters) {
  return useQuery({
    queryKey: ["reports", "attendance", filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters?.start_date) params.set("start_date", filters.start_date);
      if (filters?.end_date) params.set("end_date", filters.end_date);
      if (filters?.employee_id) params.set("employee_id", filters.employee_id);

      const res = await fetch(`/api/reports/attendance?${params.toString()}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      return data;
    },
  });
}

export function useLeaveReport(filters?: ReportFilters) {
  return useQuery({
    queryKey: ["reports", "leave", filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters?.start_date) params.set("start_date", filters.start_date);
      if (filters?.end_date) params.set("end_date", filters.end_date);
      if (filters?.leave_type) params.set("leave_type", filters.leave_type);

      const res = await fetch(`/api/reports/leave?${params.toString()}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      return data;
    },
  });
}

export function useWfhReport(filters?: ReportFilters) {
  return useQuery({
    queryKey: ["reports", "wfh", filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters?.start_date) params.set("start_date", filters.start_date);
      if (filters?.end_date) params.set("end_date", filters.end_date);

      const res = await fetch(`/api/reports/wfh?${params.toString()}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      return data;
    },
  });
}
