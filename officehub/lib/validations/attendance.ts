import { z } from "zod";

export const checkInSchema = z.object({
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  device_info: z.string().optional(),
  ip_address: z.string().optional(),
});

export type CheckInInput = z.infer<typeof checkInSchema>;

export const attendanceFilterSchema = z.object({
  start_date: z.string().optional(),
  end_date: z.string().optional(),
  status: z.string().optional(),
});

export type AttendanceFilterInput = z.infer<typeof attendanceFilterSchema>;
