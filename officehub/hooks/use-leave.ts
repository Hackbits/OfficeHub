"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

interface LeaveRequestWithProfile {
  id: string;
  user_id: string;
  leave_type: string;
  start_date: string;
  end_date: string;
  reason: string;
  status: string;
  approved_by: string | null;
  created_at: string;
  profiles?: { full_name: string; employee_id: string } | null;
}

interface LeaveBalances {
  casual: { total: number; used: number };
  sick: { total: number; used: number };
  paid: { total: number; used: number };
  unpaid: { total: number; used: number };
  optional: { total: number; used: number };
}

export function useLeaveRequests(filters?: { status?: string; leave_type?: string }) {
  return useQuery({
    queryKey: ["leave-requests", filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters?.status) params.set("status", filters.status);
      if (filters?.leave_type) params.set("leave_type", filters.leave_type);

      const res = await fetch(`/api/leave?${params.toString()}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      return data.requests as LeaveRequestWithProfile[];
    },
  });
}

export function useCreateLeaveRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: Record<string, unknown>) => {
      const res = await fetch("/api/leave", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leave-requests"] });
      queryClient.invalidateQueries({ queryKey: ["leave-balance"] });
    },
  });
}

export function useApproveLeave() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/leave/${id}/approve`, { method: "PATCH" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leave-requests"] });
    },
  });
}

export function useRejectLeave() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/leave/${id}/reject`, { method: "PATCH" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leave-requests"] });
    },
  });
}

export function useCancelLeave() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/leave/${id}/cancel`, { method: "PATCH" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leave-requests"] });
      queryClient.invalidateQueries({ queryKey: ["leave-balance"] });
    },
  });
}

export function useLeaveBalance() {
  return useQuery({
    queryKey: ["leave-balance"],
    queryFn: async () => {
      const res = await fetch("/api/leave/balance");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      return data.balances as LeaveBalances;
    },
  });
}