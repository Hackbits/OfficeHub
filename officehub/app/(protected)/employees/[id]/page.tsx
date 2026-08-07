"use client";

import { use } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useEmployee, useDeleteEmployee } from "@/hooks/use-employees";
import { useAuth } from "@/hooks/use-auth";
import { ArrowLeft, Mail, Phone, MapPin, Calendar, Building2, Edit } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export default function EmployeeDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { profile } = useAuth();
  const { data: employee, isLoading } = useEmployee(id);
  const deleteEmployee = useDeleteEmployee();
  const [confirmDelete, setConfirmDelete] = useState(false);

  if (isLoading) {
    return <div className="h-64 animate-pulse bg-muted rounded" />;
  }

  if (!employee) {
    return <div className="text-center py-12 text-muted-foreground">Employee not found.</div>;
  }

  const isAdmin = profile?.role === "admin";

  const handleDelete = async () => {
    if (!confirmDelete) {
      setConfirmDelete(true);
      return;
    }
    await deleteEmployee.mutateAsync(id);
    router.push("/employees");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/employees">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold">{employee.full_name}</h1>
          <p className="text-muted-foreground">{employee.employee_id || "No employee ID"}</p>
        </div>
        {isAdmin && (
          <div className="flex gap-2">
            <Link href={`/employees/${id}/edit`}>
              <Button variant="outline">
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </Button>
            </Link>
            <Button
              variant={confirmDelete ? "destructive" : "outline"}
              onClick={handleDelete}
              disabled={deleteEmployee.isPending}
            >
              {confirmDelete ? "Confirm Delete" : "Deactivate"}
            </Button>
          </div>
        )}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <span>{employee.email}</span>
            </div>
            <div className="flex items-center gap-3">
              <Phone className="h-4 w-4 text-muted-foreground" />
              <span>{employee.phone || "Not provided"}</span>
            </div>
            <div className="flex items-center gap-3">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <span>{employee.office_location || "Not assigned"}</span>
            </div>
            <div className="flex items-center gap-3">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span>
                {employee.joining_date
                  ? new Date(employee.joining_date).toLocaleDateString()
                  : "Not set"}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Work Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <Building2 className="h-4 w-4 text-muted-foreground" />
              <span>{(employee.departments as { name: string })?.name || "No department"}</span>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Designation</p>
              <p>{employee.designation || "Not set"}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Role</p>
              <Badge variant="outline" className="capitalize">{employee.role}</Badge>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Status</p>
              <Badge variant={employee.status === "active" ? "default" : "secondary"}>
                {employee.status}
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}