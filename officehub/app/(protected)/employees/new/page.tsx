"use client";

import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmployeeForm } from "@/components/employees/employee-form";
import { useCreateEmployee } from "@/hooks/use-employees";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";
import Link from "next/link";
import { ArrowLeft, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NewEmployeePage() {
  const router = useRouter();
  const { profile } = useAuth();
  const createEmployee = useCreateEmployee();

  if (profile?.role !== "admin") {
    return (
      <div className="flex flex-col items-center justify-center py-12 space-y-4">
        <ShieldAlert className="h-12 w-12 text-muted-foreground" />
        <h2 className="text-xl font-semibold">Access Denied</h2>
        <p className="text-muted-foreground">Only administrators can create new employees.</p>
        <Link href="/employees">
          <Button>Back to Employees</Button>
        </Link>
      </div>
    );
  }

  const handleSubmit = async (data: Record<string, unknown>) => {
    try {
      await createEmployee.mutateAsync(data);
      toast.success("Employee created successfully");
      router.push("/employees");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to create employee");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/employees">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <h1 className="text-2xl font-bold">Add New Employee</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Employee Details</CardTitle>
        </CardHeader>
        <CardContent>
          <EmployeeForm
            onSubmit={handleSubmit}
            isLoading={createEmployee.isPending}
          />
        </CardContent>
      </Card>
    </div>
  );
}