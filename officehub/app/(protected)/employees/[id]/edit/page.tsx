"use client";

import { use, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useEmployee, useUpdateEmployee } from "@/hooks/use-employees";
import { useDepartments } from "@/hooks/use-departments";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";
import { ArrowLeft, ShieldAlert } from "lucide-react";

export default function EditEmployeePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const queryClient = useQueryClient();
  const { profile } = useAuth();
  const { data: employee, isLoading } = useEmployee(id);
  const { data: departments } = useDepartments();
  const updateEmployee = useUpdateEmployee();
  const [loaded, setLoaded] = useState(false);

  const [form, setForm] = useState({
    full_name: "",
    phone: "",
    designation: "",
    department_id: "",
    manager_id: "",
    office_location: "",
    role: "employee",
    status: "active",
  });

  // Initialize form when BOTH employee and departments load
  if (employee && departments && !loaded) {
    setForm({
      full_name: employee.full_name || "",
      phone: employee.phone || "",
      designation: employee.designation || "",
      department_id: employee.department_id || "",
      manager_id: employee.manager_id || "",
      office_location: employee.office_location || "",
      role: employee.role || "employee",
      status: employee.status || "active",
    });
    setLoaded(true);
  }

  const isAdmin = profile?.role === "admin";

  if (!isAdmin) {
    return (
      <div className="flex flex-col items-center justify-center py-12 space-y-4">
        <ShieldAlert className="h-12 w-12 text-muted-foreground" />
        <h2 className="text-xl font-semibold">Access Denied</h2>
        <p className="text-muted-foreground">
          Only administrators can edit employees.
        </p>
        <Link href={`/employees/${id}`}>
          <Button>Back to Employee</Button>
        </Link>
      </div>
    );
  }

  if (isLoading || !departments) {
    return (
      <div className="space-y-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-10 animate-pulse bg-muted rounded" />
        ))}
      </div>
    );
  }

  if (!employee) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        Employee not found.
      </div>
    );
  }

  const handleSave = async () => {
    try {
      await updateEmployee.mutateAsync({
        id,
        ...form,
        department_id: form.department_id || null,
        manager_id: form.manager_id || null,
      });
      // Remove cached data so detail page fetches fresh
      queryClient.removeQueries({ queryKey: ["employees", id] });
      queryClient.removeQueries({ queryKey: ["employees"] });
      toast.success("Employee updated successfully");
      router.replace(`/employees/${id}`);
    } catch {
      toast.error("Failed to update employee");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href={`/employees/${id}`}
          className="inline-flex items-center justify-center h-10 w-10 rounded-lg hover:bg-muted"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <h1 className="text-2xl font-bold">Edit Employee</h1>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="full_name">Full Name</Label>
              <Input
                id="full_name"
                value={form.full_name}
                onChange={(e) =>
                  setForm({ ...form, full_name: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="office_location">Office Location</Label>
              <Input
                id="office_location"
                value={form.office_location}
                onChange={(e) =>
                  setForm({ ...form, office_location: e.target.value })
                }
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Work Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="designation">Designation</Label>
              <Input
                id="designation"
                value={form.designation}
                onChange={(e) =>
                  setForm({ ...form, designation: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label>Department</Label>
              <select
                value={form.department_id}
                onChange={(e) =>
                  setForm({ ...form, department_id: e.target.value })
                }
                className="flex w-full h-8 rounded-lg border border-input bg-transparent px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
              >
                <option value="">No department</option>
                {departments?.map((dept) => (
                  <option key={dept.id} value={dept.id}>
                    {dept.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label>Role</Label>
              <select
                value={form.role}
                onChange={(e) => setForm({ ...form, role: e.target.value })}
                className="flex w-full h-8 rounded-lg border border-input bg-transparent px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
              >
                <option value="employee">Employee</option>
                <option value="manager">Manager</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <select
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value })}
                className="flex w-full h-8 rounded-lg border border-input bg-transparent px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="terminated">Terminated</option>
              </select>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex gap-4">
        <Button onClick={handleSave} disabled={updateEmployee.isPending}>
          {updateEmployee.isPending ? "Saving..." : "Save Changes"}
        </Button>
        <Link href={`/employees/${id}`}>
          <Button variant="outline">Cancel</Button>
        </Link>
      </div>
    </div>
  );
}
