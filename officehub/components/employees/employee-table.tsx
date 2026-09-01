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
      <div className="text-center py-8 text-muted-foreground text-sm">
        No employees found.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <Table className="min-w-[600px]">
        <TableHeader>
          <TableRow>
            <TableHead className="min-w-[200px]">Employee</TableHead>
            <TableHead className="min-w-[120px] hidden sm:table-cell">Department</TableHead>
            <TableHead className="min-w-[120px] hidden md:table-cell">Designation</TableHead>
            <TableHead className="min-w-[80px]">Status</TableHead>
            <TableHead className="min-w-[80px] hidden sm:table-cell">Role</TableHead>
            <TableHead className="text-right min-w-[60px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {employees.map((emp) => (
            <TableRow key={emp.id}>
              <TableCell>
                <div className="flex items-center gap-3">
                  <Avatar className="h-8 w-8 shrink-0">
                    <AvatarFallback className="text-xs">
                      {emp.full_name?.charAt(0) || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <p className="font-medium truncate text-sm">{emp.full_name}</p>
                    <p className="text-xs text-muted-foreground truncate">{emp.email}</p>
                    {/* Mobile-only info */}
                    <div className="sm:hidden mt-1 flex flex-wrap gap-1">
                      <span className="text-[10px] text-muted-foreground">
                        {emp.departments?.name || "No dept"}
                      </span>
                      <span className="text-[10px] text-muted-foreground">|</span>
                      <span className="text-[10px] text-muted-foreground capitalize">
                        {emp.role}
                      </span>
                    </div>
                  </div>
                </div>
              </TableCell>
              <TableCell className="hidden sm:table-cell">{emp.departments?.name || "—"}</TableCell>
              <TableCell className="hidden md:table-cell">{emp.designation || "—"}</TableCell>
              <TableCell>
                <Badge
                  variant={emp.status === "active" ? "default" : "secondary"}
                  className="text-[10px] sm:text-xs"
                >
                  {emp.status}
                </Badge>
              </TableCell>
              <TableCell className="hidden sm:table-cell">
                <Badge variant="outline" className="capitalize text-[10px] sm:text-xs">{emp.role}</Badge>
              </TableCell>
              <TableCell className="text-right">
                <Link href={`/employees/${emp.id}`}>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <Eye className="h-4 w-4" />
                  </Button>
                </Link>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
