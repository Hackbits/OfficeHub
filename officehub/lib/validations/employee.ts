import { z } from "zod";

export const createEmployeeSchema = z.object({
  full_name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  phone: z.string().optional(),
  department_id: z.string().optional(),
  manager_id: z.string().optional(),
  designation: z.string().optional(),
  joining_date: z.string().optional(),
  office_location: z.string().optional(),
  role: z.enum(["employee", "manager", "admin"]).default("employee"),
});

export type CreateEmployeeInput = z.infer<typeof createEmployeeSchema>;

export const updateEmployeeSchema = z.object({
  full_name: z.string().min(2).optional(),
  phone: z.string().optional(),
  department_id: z.string().optional(),
  manager_id: z.string().optional(),
  designation: z.string().optional(),
  joining_date: z.string().optional(),
  office_location: z.string().optional(),
  status: z.enum(["active", "inactive", "terminated"]).optional(),
  role: z.enum(["employee", "manager", "admin"]).optional(),
});

export type UpdateEmployeeInput = z.infer<typeof updateEmployeeSchema>;

export const updateProfileSchema = z.object({
  full_name: z.string().min(2).optional(),
  phone: z.string().optional(),
  office_location: z.string().optional(),
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
