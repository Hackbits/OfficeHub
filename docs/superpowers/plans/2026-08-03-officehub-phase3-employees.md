# OfficeHub Phase 3: Employee Management Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build employee CRUD, department management, profiles, and manager assignment for admin/manager roles.

**Architecture:** Supabase queries for employee data. Admin can create/edit/disable employees. Manager can view team. Employee can view/edit own profile. Reusable form components.

**Tech Stack:** Next.js 15, React 19, TypeScript, Supabase, TanStack Query, React Hook Form, Zod, shadcn/ui, Lucide React

---

## File Structure

```
officehub/
├── app/
│   ├── (protected)/
│   │   ├── employees/
│   │   │   ├── page.tsx              (employee list)
│   │   │   ├── [id]/page.tsx         (employee detail)
│   │   │   └── new/page.tsx          (create employee)
│   │   ├── profile/
│   │   │   └── page.tsx              (own profile)
│   │   └── api/
│   │       └── employees/
│   │           ├── route.ts          (list/create)
│   │           └── [id]/route.ts     (get/update/delete)
├── components/
│   ├── employees/
│   │   ├── employee-table.tsx
│   │   ├── employee-form.tsx
│   │   ├── employee-card.tsx
│   │   └── department-select.tsx
│   └── profile/
│       ├── profile-form.tsx
│       └── avatar-upload.tsx
├── hooks/
│   ├── use-employees.ts
│   └── use-departments.ts
└── lib/
    └── validations/
        └── employee.ts
```

---

## Task 1: Create Employee Validation Schema

**Files:**
- Create: `lib/validations/employee.ts`

- [ ] **Step 1: Create schema**

Create `lib/validations/employee.ts`:
```typescript
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
```

- [ ] **Step 2: Commit**

```powershell
git add lib/validations/employee.ts
git commit -m "feat: add employee validation schemas"
```

---

## Task 2: Create Employee API Routes

**Files:**
- Create: `app/api/employees/route.ts`
- Create: `app/api/employees/[id]/route.ts`

- [ ] **Step 1: Create list/create route**

Create `app/api/employees/route.ts`:
```typescript
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createEmployeeSchema } from "@/lib/validations/employee";

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    // Get current user's role
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    let query = supabase
      .from("profiles")
      .select("*, departments(name)")
      .order("created_at", { ascending: false });

    // Managers only see their team
    if (profile?.role === "manager") {
      query = query.eq("manager_id", user.id);
    }

    // Filter by department
    const department = searchParams.get("department");
    if (department) {
      query = query.eq("department_id", department);
    }

    // Filter by status
    const status = searchParams.get("status");
    if (status) {
      query = query.eq("status", status);
    }

    // Search by name or email
    const search = searchParams.get("search");
    if (search) {
      query = query.or(`full_name.ilike.%${search}%,email.ilike.%${search}%`);
    }

    const { data, error } = await query;

    if (error) throw error;
    return NextResponse.json({ employees: data });
  } catch (error) {
    console.error("Get employees error:", error);
    return NextResponse.json({ error: "Failed to get employees" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    // Check if user is admin
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profile?.role !== "admin") {
      return NextResponse.json({ error: "Not authorized" }, { status: 403 });
    }

    const body = await request.json();
    const validatedData = createEmployeeSchema.parse(body);

    // Generate employee ID
    const { count } = await supabase
      .from("profiles")
      .select("*", { count: "exact", head: true });

    const employeeId = `EMP-${String((count || 0) + 1).padStart(3, "0")}`;

    // Create auth user
    const { data: authData, error: signUpError } = await supabase.auth.admin.createUser({
      email: validatedData.email,
      email_confirm: true,
      password: "changeme123", // Default password
      user_metadata: {
        full_name: validatedData.full_name,
      },
    });

    if (signUpError) throw signUpError;

    // Create profile
    const { data, error } = await supabase
      .from("profiles")
      .insert({
        id: authData.user.id,
        employee_id: employeeId,
        full_name: validatedData.full_name,
        email: validatedData.email,
        phone: validatedData.phone || null,
        department_id: validatedData.department_id || null,
        manager_id: validatedData.manager_id || null,
        designation: validatedData.designation || null,
        joining_date: validatedData.joining_date || null,
        office_location: validatedData.office_location || null,
        role: validatedData.role,
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ employee: data, message: "Employee created successfully" });
  } catch (error) {
    console.error("Create employee error:", error);
    return NextResponse.json({ error: "Failed to create employee" }, { status: 500 });
  }
}
```

- [ ] **Step 2: Create get/update/delete route**

Create `app/api/employees/[id]/route.ts`:
```typescript
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { updateEmployeeSchema } from "@/lib/validations/employee";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const { id } = await params;

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const { data, error } = await supabase
      .from("profiles")
      .select("*, departments(name)")
      .eq("id", id)
      .single();

    if (error) throw error;
    if (!data) {
      return NextResponse.json({ error: "Employee not found" }, { status: 404 });
    }

    return NextResponse.json({ employee: data });
  } catch (error) {
    console.error("Get employee error:", error);
    return NextResponse.json({ error: "Failed to get employee" }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const { id } = await params;

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    // Check permissions
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    const isOwnProfile = user.id === id;
    const isAdmin = profile?.role === "admin";

    if (!isOwnProfile && !isAdmin) {
      return NextResponse.json({ error: "Not authorized" }, { status: 403 });
    }

    const body = await request.json();

    // Employees can only update limited fields
    let updateData;
    if (isAdmin) {
      updateData = updateEmployeeSchema.parse(body);
    } else {
      // Self-service: only name, phone, office_location
      const { full_name, phone, office_location } = body;
      updateData = { full_name, phone, office_location };
    }

    const { data, error } = await supabase
      .from("profiles")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ employee: data, message: "Employee updated successfully" });
  } catch (error) {
    console.error("Update employee error:", error);
    return NextResponse.json({ error: "Failed to update employee" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const { id } = await params;

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    // Only admins can delete
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profile?.role !== "admin") {
      return NextResponse.json({ error: "Not authorized" }, { status: 403 });
    }

    // Soft delete: set status to inactive
    const { error } = await supabase
      .from("profiles")
      .update({ status: "inactive" })
      .eq("id", id);

    if (error) throw error;

    return NextResponse.json({ message: "Employee deactivated successfully" });
  } catch (error) {
    console.error("Delete employee error:", error);
    return NextResponse.json({ error: "Failed to delete employee" }, { status: 500 });
  }
}
```

- [ ] **Step 3: Commit**

```powershell
git add app/api/employees/
git commit -m "feat: add employee API routes (list, create, get, update, delete)"
```

---

## Task 3: Create Employee Hooks

**Files:**
- Create: `hooks/use-employees.ts`
- Create: `hooks/use-departments.ts`

- [ ] **Step 1: Create employees hook**

Create `hooks/use-employees.ts`:
```typescript
"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { Profile } from "@/types";

interface EmployeeWithDept extends Profile {
  departments?: { name: string } | null;
}

export function useEmployees(filters?: {
  department?: string;
  status?: string;
  search?: string;
}) {
  return useQuery({
    queryKey: ["employees", filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters?.department) params.set("department", filters.department);
      if (filters?.status) params.set("status", filters.status);
      if (filters?.search) params.set("search", filters.search);

      const res = await fetch(`/api/employees?${params.toString()}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      return data.employees as EmployeeWithDept[];
    },
  });
}

export function useEmployee(id: string) {
  return useQuery({
    queryKey: ["employees", id],
    queryFn: async () => {
      const res = await fetch(`/api/employees/${id}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      return data.employee as EmployeeWithDept;
    },
    enabled: !!id,
  });
}

export function useCreateEmployee() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: {
      full_name: string;
      email: string;
      phone?: string;
      department_id?: string;
      manager_id?: string;
      designation?: string;
      joining_date?: string;
      office_location?: string;
      role?: string;
    }) => {
      const res = await fetch("/api/employees", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["employees"] });
    },
  });
}

export function useUpdateEmployee() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...payload }: { id: string; [key: string]: unknown }) => {
      const res = await fetch(`/api/employees/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["employees"] });
    },
  });
}

export function useDeleteEmployee() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/employees/${id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["employees"] });
    },
  });
}
```

- [ ] **Step 2: Create departments hook**

Create `hooks/use-departments.ts`:
```typescript
"use client";

import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import type { Department } from "@/types";

export function useDepartments() {
  const supabase = createClient();

  return useQuery({
    queryKey: ["departments"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("departments")
        .select("*")
        .order("name");

      if (error) throw error;
      return data as Department[];
    },
  });
}
```

- [ ] **Step 3: Commit**

```powershell
git add hooks/use-employees.ts hooks/use-departments.ts
git commit -m "feat: add employee and department hooks"
```

---

## Task 4: Create Employee Components

**Files:**
- Create: `components/employees/employee-table.tsx`
- Create: `components/employees/employee-form.tsx`
- Create: `components/employees/department-select.tsx`

- [ ] **Step 1: Create employee table**

Create `components/employees/employee-table.tsx`:
```typescript
"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Eye } from "lucide-react";
import type { Profile } from "@/types";

interface EmployeeWithDept extends Profile {
  departments?: { name: string } | null;
}

interface EmployeeTableProps {
  employees: EmployeeWithDept[];
}

export function EmployeeTable({ employees }: EmployeeTableProps) {
  if (!employees || employees.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No employees found.
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Employee</TableHead>
          <TableHead>Department</TableHead>
          <TableHead>Designation</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Role</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {employees.map((emp) => (
          <TableRow key={emp.id}>
            <TableCell>
              <div className="flex items-center gap-3">
                <Avatar className="h-8 w-8">
                  <AvatarFallback>
                    {emp.full_name?.charAt(0) || "U"}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{emp.full_name}</p>
                  <p className="text-xs text-muted-foreground">{emp.email}</p>
                </div>
              </div>
            </TableCell>
            <TableCell>{emp.departments?.name || "—"}</TableCell>
            <TableCell>{emp.designation || "—"}</TableCell>
            <TableCell>
              <Badge variant={emp.status === "active" ? "default" : "secondary"}>
                {emp.status}
              </Badge>
            </TableCell>
            <TableCell>
              <Badge variant="outline" className="capitalize">{emp.role}</Badge>
            </TableCell>
            <TableCell className="text-right">
              <Button variant="ghost" size="icon" asChild>
                <Link href={`/employees/${emp.id}`}>
                  <Eye className="h-4 w-4" />
                </Link>
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
```

- [ ] **Step 2: Create employee form**

Create `components/employees/employee-form.tsx`:
```typescript
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createEmployeeSchema, type CreateEmployeeInput } from "@/lib/validations/employee";
import { useDepartments } from "@/hooks/use-departments";
import { useEmployees } from "@/hooks/use-employees";

interface EmployeeFormProps {
  onSubmit: (data: CreateEmployeeInput) => void;
  isLoading?: boolean;
}

export function EmployeeForm({ onSubmit, isLoading }: EmployeeFormProps) {
  const { data: departments } = useDepartments();
  const { data: managers } = useEmployees({ status: "active" });

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CreateEmployeeInput>({
    resolver: zodResolver(createEmployeeSchema),
    defaultValues: { role: "employee" },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="full_name">Full Name *</Label>
          <Input id="full_name" {...register("full_name")} />
          {errors.full_name && (
            <p className="text-sm text-destructive">{errors.full_name.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email *</Label>
          <Input id="email" type="email" {...register("email")} />
          {errors.email && (
            <p className="text-sm text-destructive">{errors.email.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone">Phone</Label>
          <Input id="phone" {...register("phone")} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="designation">Designation</Label>
          <Input id="designation" {...register("designation")} />
        </div>

        <div className="space-y-2">
          <Label>Department</Label>
          <Select
            value={watch("department_id")}
            onValueChange={(v) => setValue("department_id", v)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select department" />
            </SelectTrigger>
            <SelectContent>
              {departments?.map((dept) => (
                <SelectItem key={dept.id} value={dept.id}>
                  {dept.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Manager</Label>
          <Select
            value={watch("manager_id")}
            onValueChange={(v) => setValue("manager_id", v)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select manager" />
            </SelectTrigger>
            <SelectContent>
              {managers?.filter((m) => m.role === "manager" || m.role === "admin").map((m) => (
                <SelectItem key={m.id} value={m.id}>
                  {m.full_name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="joining_date">Joining Date</Label>
          <Input id="joining_date" type="date" {...register("joining_date")} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="office_location">Office Location</Label>
          <Input id="office_location" {...register("office_location")} />
        </div>

        <div className="space-y-2">
          <Label>Role</Label>
          <Select
            value={watch("role")}
            onValueChange={(v) => setValue("role", v as "employee" | "manager" | "admin")}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="employee">Employee</SelectItem>
              <SelectItem value="manager">Manager</SelectItem>
              <SelectItem value="admin">Admin</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Button type="submit" disabled={isLoading}>
        {isLoading ? "Creating..." : "Create Employee"}
      </Button>
    </form>
  );
}
```

- [ ] **Step 3: Create department select**

Create `components/employees/department-select.tsx`:
```typescript
"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useDepartments } from "@/hooks/use-departments";

interface DepartmentSelectProps {
  value?: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export function DepartmentSelect({
  value,
  onChange,
  placeholder = "Select department",
}: DepartmentSelectProps) {
  const { data: departments, isLoading } = useDepartments();

  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {departments?.map((dept) => (
          <SelectItem key={dept.id} value={dept.id}>
            {dept.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
```

- [ ] **Step 4: Commit**

```powershell
git add components/employees/
git commit -m "feat: add employee components (table, form, department select)"
```

---

## Task 5: Create Employee List Page

**Files:**
- Modify: `app/(protected)/employees/page.tsx`

- [ ] **Step 1: Create employee list page**

Replace `app/(protected)/employees/page.tsx`:
```typescript
"use client";

import { useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { EmployeeTable } from "@/components/employees/employee-table";
import { useEmployees } from "@/hooks/use-employees";
import { useAuth } from "@/hooks/use-auth";
import { Plus, Search } from "lucide-react";

export default function EmployeesPage() {
  const { profile } = useAuth();
  const [search, setSearch] = useState("");
  const [department, setDepartment] = useState("");
  const [status, setStatus] = useState("");

  const { data: employees, isLoading } = useEmployees({
    search: search || undefined,
    department: department || undefined,
    status: status || undefined,
  });

  const isAdmin = profile?.role === "admin";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Employees</h1>
        {isAdmin && (
          <Button asChild>
            <Link href="/employees/new">
              <Plus className="mr-2 h-4 w-4" />
              Add Employee
            </Link>
          </Button>
        )}
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name or email..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="px-3 py-2 rounded-md border border-input bg-background text-sm"
            >
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="terminated">Terminated</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Employee Table */}
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-6 space-y-2">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-12 animate-pulse bg-muted rounded" />
              ))}
            </div>
          ) : (
            <EmployeeTable employees={employees || []} />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```powershell
git add app/\(protected\)/employees/page.tsx
git commit -m "feat: build employee list page with filters"
```

---

## Task 6: Create Employee Detail Page

**Files:**
- Create: `app/(protected)/employees/[id]/page.tsx`

- [ ] **Step 1: Create employee detail page**

Create `app/(protected)/employees/[id]/page.tsx`:
```typescript
"use client";

import { useParams, useRouter } from "next/navigation";
import { useEmployee, useUpdateEmployee, useDeleteEmployee } from "@/hooks/use-employees";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Mail, Phone, Building2, MapPin, Calendar } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export default function EmployeeDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const { profile: currentUser } = useAuth();
  const { data: employee, isLoading } = useEmployee(id);
  const updateMutation = useUpdateEmployee();
  const deleteMutation = useDeleteEmployee();
  const [confirmDelete, setConfirmDelete] = useState(false);

  const isAdmin = currentUser?.role === "admin";

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-32 animate-pulse bg-muted rounded" />
        <div className="h-64 animate-pulse bg-muted rounded" />
      </div>
    );
  }

  if (!employee) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Employee not found.</p>
        <Button variant="link" asChild>
          <Link href="/employees">Back to list</Link>
        </Button>
      </div>
    );
  }

  const handleDeactivate = async () => {
    await deleteMutation.mutateAsync(id);
    router.push("/employees");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/employees">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <h1 className="text-2xl font-bold">Employee Detail</h1>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Profile Card */}
        <Card className="md:col-span-1">
          <CardContent className="p-6">
            <div className="flex flex-col items-center text-center">
              <Avatar className="h-20 w-20 mb-4">
                <AvatarFallback className="text-2xl">
                  {employee.full_name?.charAt(0) || "U"}
                </AvatarFallback>
              </Avatar>
              <h2 className="text-xl font-bold">{employee.full_name}</h2>
              <p className="text-sm text-muted-foreground">{employee.employee_id}</p>
              <div className="flex gap-2 mt-2">
                <Badge variant={employee.status === "active" ? "default" : "secondary"}>
                  {employee.status}
                </Badge>
                <Badge variant="outline" className="capitalize">{employee.role}</Badge>
              </div>
            </div>

            <Separator className="my-6" />

            <div className="space-y-3 text-sm">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span>{employee.email}</span>
              </div>
              {employee.phone && (
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span>{employee.phone}</span>
                </div>
              )}
              {employee.departments?.name && (
                <div className="flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-muted-foreground" />
                  <span>{employee.departments.name}</span>
                </div>
              )}
              {employee.office_location && (
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span>{employee.office_location}</span>
                </div>
              )}
              {employee.joining_date && (
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span>Joined {new Date(employee.joining_date).toLocaleDateString()}</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Details Card */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Employment Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <p className="text-sm text-muted-foreground">Designation</p>
                <p className="font-medium">{employee.designation || "—"}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Department</p>
                <p className="font-medium">{employee.departments?.name || "—"}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Employee ID</p>
                <p className="font-medium">{employee.employee_id}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Joining Date</p>
                <p className="font-medium">
                  {employee.joining_date
                    ? new Date(employee.joining_date).toLocaleDateString()
                    : "—"}
                </p>
              </div>
            </div>

            {isAdmin && (
              <>
                <Separator />
                <div className="flex gap-2">
                  {!confirmDelete ? (
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => setConfirmDelete(true)}
                    >
                      Deactivate Employee
                    </Button>
                  ) : (
                    <div className="flex gap-2">
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={handleDeactivate}
                        disabled={deleteMutation.isPending}
                      >
                        {deleteMutation.isPending ? "Deactivating..." : "Confirm Deactivate"}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setConfirmDelete(false)}
                      >
                        Cancel
                      </Button>
                    </div>
                  )}
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```powershell
git add app/\(protected\)/employees/\[id\]/
git commit -m "feat: add employee detail page"
```

---

## Task 7: Create New Employee Page

**Files:**
- Create: `app/(protected)/employees/new/page.tsx`

- [ ] **Step 1: Create new employee page**

Create `app/(protected)/employees/new/page.tsx`:
```typescript
"use client";

import { useRouter } from "next/navigation";
import { useCreateEmployee } from "@/hooks/use-employees";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { EmployeeForm } from "@/components/employees/employee-form";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function NewEmployeePage() {
  const router = useRouter();
  const createMutation = useCreateEmployee();

  const handleSubmit = async (data: Parameters<typeof createMutation.mutateAsync>[0]) => {
    await createMutation.mutateAsync(data);
    router.push("/employees");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/employees">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <h1 className="text-2xl font-bold">Add Employee</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>New Employee</CardTitle>
        </CardHeader>
        <CardContent>
          <EmployeeForm
            onSubmit={handleSubmit}
            isLoading={createMutation.isPending}
          />
          {createMutation.isError && (
            <p className="text-sm text-destructive mt-4">
              {createMutation.error.message}
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```powershell
git add app/\(protected\)/employees/new/
git commit -m "feat: add new employee page with form"
```

---

## Task 8: Update Profile Page

**Files:**
- Modify: `app/(protected)/profile/page.tsx`

- [ ] **Step 1: Create profile page**

Replace `app/(protected)/profile/page.tsx`:
```typescript
"use client";

import { useAuth } from "@/hooks/use-auth";
import { useUpdateEmployee } from "@/hooks/use-employees";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { useForm } from "react-hook-form";
import { useEffect } from "react";

interface ProfileForm {
  full_name: string;
  phone: string;
  office_location: string;
}

export default function ProfilePage() {
  const { profile, loading } = useAuth();
  const updateMutation = useUpdateEmployee();

  const { register, handleSubmit, reset } = useForm<ProfileForm>();

  useEffect(() => {
    if (profile) {
      reset({
        full_name: profile.full_name || "",
        phone: profile.phone || "",
        office_location: profile.office_location || "",
      });
    }
  }, [profile, reset]);

  const onSubmit = async (data: ProfileForm) => {
    if (!profile) return;
    await updateMutation.mutateAsync({ id: profile.id, ...data });
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-32 animate-pulse bg-muted rounded" />
        <div className="h-64 animate-pulse bg-muted rounded" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <h1 className="text-2xl font-bold">My Profile</h1>

      {/* Avatar Section */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <Avatar className="h-20 w-20">
              <AvatarFallback className="text-2xl">
                {profile?.full_name?.charAt(0) || "U"}
              </AvatarFallback>
            </Avatar>
            <div>
              <h2 className="text-xl font-bold">{profile?.full_name}</h2>
              <p className="text-muted-foreground">{profile?.email}</p>
              <p className="text-sm text-muted-foreground">{profile?.employee_id}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Profile Form */}
      <Card>
        <CardHeader>
          <CardTitle>Personal Information</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="full_name">Full Name</Label>
              <Input id="full_name" {...register("full_name")} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input id="phone" {...register("phone")} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="office_location">Office Location</Label>
              <Input id="office_location" {...register("office_location")} />
            </div>

            <Button type="submit" disabled={updateMutation.isPending}>
              {updateMutation.isPending ? "Saving..." : "Save Changes"}
            </Button>

            {updateMutation.isSuccess && (
              <p className="text-sm text-green-600">Profile updated successfully!</p>
            )}
          </form>
        </CardContent>
      </Card>

      {/* Read-only info */}
      <Card>
        <CardHeader>
          <CardTitle>Employment Info</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <p className="text-sm text-muted-foreground">Employee ID</p>
            <p className="font-medium">{profile?.employee_id}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Email</p>
            <p className="font-medium">{profile?.email}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Role</p>
            <p className="font-medium capitalize">{profile?.role}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Status</p>
            <p className="font-medium capitalize">{profile?.status}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```powershell
git add app/\(protected\)/profile/
git commit -m "feat: build profile page with self-service edit"
```

---

## Task 9: Final Verification

**Files:** None

- [ ] **Step 1: Build verification**

Run:
```powershell
cd "C:\Users\91810\OneDrive - RCM Group of Institution\Desktop\OfficeAttend\officehub"
npm run build
```

- [ ] **Step 2: Lint check**

```powershell
npm run lint
```

- [ ] **Step 3: Final commit**

```powershell
git add .
git commit -m "chore: Phase 3 employee management complete"
```

---

## Phase 3 Summary

| Task | Description | Files |
|------|-------------|-------|
| 1 | Validation schemas | lib/validations/employee.ts |
| 2 | API routes | app/api/employees/* |
| 3 | Employee hooks | hooks/use-employees.ts, hooks/use-departments.ts |
| 4 | Employee components | components/employees/* |
| 5 | Employee list page | app/(protected)/employees/page.tsx |
| 6 | Employee detail page | app/(protected)/employees/[id]/page.tsx |
| 7 | New employee page | app/(protected)/employees/new/page.tsx |
| 8 | Profile page | app/(protected)/profile/page.tsx |
| 9 | Verification | build + lint |

**After Phase 3, you have:**
- Admin can create/edit/deactivate employees
- Admin can assign managers and departments
- Manager can view team members
- Employee can view/edit own profile
- Searchable employee list with filters
- Department management (basic)
