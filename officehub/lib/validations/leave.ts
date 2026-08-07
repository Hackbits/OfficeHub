import { z } from "zod";

export const createLeaveRequestSchema = z.object({
  leave_type: z.enum(["casual", "sick", "paid", "unpaid", "optional"]),
  start_date: z.string().min(1, "Start date is required"),
  end_date: z.string().min(1, "End date is required"),
  reason: z.string().min(5, "Reason must be at least 5 characters"),
}).refine((data) => new Date(data.end_date) >= new Date(data.start_date), {
  message: "End date must be after start date",
  path: ["end_date"],
});

export type CreateLeaveRequestInput = z.infer<typeof createLeaveRequestSchema>;
