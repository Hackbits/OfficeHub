"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { Notification } from "@/types";

export function useNotifications(options?: { unreadOnly?: boolean }) {
  return useQuery({
    queryKey: ["notifications", options],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (options?.unreadOnly) params.set("unread", "true");

      const res = await fetch(`/api/notifications?${params.toString()}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      return data as { notifications: Notification[]; unreadCount: number };
    },
  });
}

export function useMarkNotificationsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ ids, markAll }: { ids?: string[]; markAll?: boolean }) => {
      const res = await fetch("/api/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids, markAll }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });
}
