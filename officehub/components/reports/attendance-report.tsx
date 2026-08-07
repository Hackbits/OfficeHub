"use client";

import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ExportButtons } from "./export-buttons";
import type { ExportColumn } from "@/lib/export/types";
import { format } from "date-fns";

interface AttendanceRecord {
  id: string;
  date: string;
  check_in: string | null;
  check_out: string | null;
  working_hours: number | null;
  status: string;
  profiles?: { full_name: string; employee_id: string; departments?: { name: string } | null } | null;
}

interface AttendanceReportProps {
  records: AttendanceRecord[];
  summary: {
    total_days: number;
    present_days: number;
    absent_days: number;
    wfh_days: number;
    leave_days: number;
    average_hours: number;
  };
}

const columns: ExportColumn[] = [
  { key: "employee_name", label: "Employee" },
  { key: "employee_id", label: "Employee ID" },
  { key: "department", label: "Department" },
  { key: "date", label: "Date", format: (v) => format(new Date(v as string), "MMM d, yyyy") },
  { key: "status", label: "Status", format: (v) => String(v).replace("_", " ") },
  { key: "check_in", label: "Check In", format: (v) => v ? format(new Date(v as string), "hh:mm a") : "—" },
  { key: "check_out", label: "Check Out", format: (v) => v ? format(new Date(v as string), "hh:mm a") : "—" },
  { key: "working_hours", label: "Hours", format: (v) => v != null ? `${(v as number).toFixed(1)}h` : "—" },
];

const STATUS_VARIANT: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  present: "default",
  late: "outline",
  absent: "destructive",
  wfh: "default",
  leave: "secondary",
};

export function AttendanceReport({ records, summary }: AttendanceReportProps) {
  const exportData = records.map((r) => ({
    employee_name: r.profiles?.full_name || "",
    employee_id: r.profiles?.employee_id || "",
    department: r.profiles?.departments?.name || "",
    ...r,
  }));

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-6">
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold">{summary.total_days}</p>
            <p className="text-xs text-muted-foreground">Total Days</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-green-600">{summary.present_days}</p>
            <p className="text-xs text-muted-foreground">Present</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-red-600">{summary.absent_days}</p>
            <p className="text-xs text-muted-foreground">Absent</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-blue-600">{summary.wfh_days}</p>
            <p className="text-xs text-muted-foreground">WFH</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-orange-600">{summary.leave_days}</p>
            <p className="text-xs text-muted-foreground">Leave</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold">{summary.average_hours}h</p>
            <p className="text-xs text-muted-foreground">Avg Hours</p>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-end">
        <ExportButtons
          data={exportData}
          columns={columns}
          filename={`attendance-report-${format(new Date(), "yyyy-MM-dd")}`}
          title="Attendance Report"
        />
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Employee</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Check In</TableHead>
              <TableHead>Check Out</TableHead>
              <TableHead>Hours</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {records.slice(0, 50).map((record) => (
              <TableRow key={record.id}>
                <TableCell>
                  <div>
                    <p className="font-medium">{record.profiles?.full_name || "—"}</p>
                    <p className="text-xs text-muted-foreground">{record.profiles?.employee_id}</p>
                  </div>
                </TableCell>
                <TableCell>{format(new Date(record.date), "MMM d, yyyy")}</TableCell>
                <TableCell>
                  <Badge variant={STATUS_VARIANT[record.status] || "outline"} className="capitalize">
                    {record.status.replace("_", " ")}
                  </Badge>
                </TableCell>
                <TableCell>
                  {record.check_in ? format(new Date(record.check_in), "hh:mm a") : "—"}
                </TableCell>
                <TableCell>
                  {record.check_out ? format(new Date(record.check_out), "hh:mm a") : "—"}
                </TableCell>
                <TableCell>
                  {record.working_hours != null ? `${record.working_hours.toFixed(1)}h` : "—"}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
