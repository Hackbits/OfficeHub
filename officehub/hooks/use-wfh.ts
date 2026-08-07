"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

interface WfhRequestWithProfile {
  id: string;
  user_id: string;
  start_date: string;
  end_date: string;
  reason: string;
  notes: string | null;
  status: string;
  approved_by: string | null;
  created_at: string;
  profiles?: { full_name: string; employee_id: string } | null;
}

export function useWfhRequests(filters?: { status?: string }) {
  return useQuery({
    queryKey: ["wfh-requests", filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters?.status) params.set("status", filters.status);

      const res = await fetch(`/api/wfh?${params.toString()}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      return data.requests as WfhRequestWithProfile[];
    },
  });
}

export function useCreateWfhRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: Record<string, unknown>) => {
      const res = await fetch("/api/wfh", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["wfh-requests"] });
    },
  });
}

export function useApproveWfh() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/wfh/${id}/approve`, { method: "PATCH" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["wfh-requests"] });
    },
  });
}

export function useRejectWfh() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/wfh/${id}/reject`, { method: "PATCH" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["wfh-requests"] });
    },
  });
}

export function useCancelWfh() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/wfh/${id}/cancel`, { method: "PATCH" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["wfh-requests"] });
    },
  });
}