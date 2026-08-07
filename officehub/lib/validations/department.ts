import { z } from "zod";

export const createDepartmentSchema = z.object({
  name: z.string().min(2, "Department name must be at least 2 characters"),
});

export type CreateDepartmentInput = z.infer<typeof createDepartmentSchema>;
