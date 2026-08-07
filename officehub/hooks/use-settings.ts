"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

interface OfficeSettings {
  office_latitude: number;
  office_longitude: number;
  geofence_radius: number;
  office_start: string;
  office_end: string;
  standard_hours: number;
  late_threshold_minutes: number;
  overtime_threshold: number;
  half_day_max: number;
}

export function useOfficeSettings() {
  return useQuery({
    queryKey: ["office-settings"],
    queryFn: async () => {
      const res = await fetch("/api/settings");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      return data.settings as Record<string, string>;
    },
  });
}

export function useUpdateSettings() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (settings: OfficeSettings) => {
      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["office-settings"] });
    },
  });
}
