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
              <Link href={`/employees/${emp.id}`}>
                <Button variant="ghost" size="icon">
                  <Eye className="h-4 w-4" />
                </Button>
              </Link>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
