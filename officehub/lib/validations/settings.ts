import { z } from "zod";

export const officeSettingsSchema = z.object({
  office_latitude: z.coerce.number().min(-90).max(90),
  office_longitude: z.coerce.number().min(-180).max(180),
  geofence_radius: z.coerce.number().min(50).max(5000),
  office_start: z.string().regex(/^\d{2}:\d{2}$/),
  office_end: z.string().regex(/^\d{2}:\d{2}$/),
  standard_hours: z.coerce.number().min(1).max(16),
  late_threshold_minutes: z.coerce.number().min(0).max(120),
  overtime_threshold: z.coerce.number().min(1).max(16),
  half_day_max: z.coerce.number().min(1).max(8),
});

export type OfficeSettingsInput = z.infer<typeof officeSettingsSchema>;
