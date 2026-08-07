"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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

interface LeaveRecord {
  id: string;
  leave_type: string;
  start_date: string;
  end_date: string;
  reason: string;
  status: string;
  profiles?: { full_name: string; employee_id: string } | null;
}

interface LeaveReportProps {
  records: LeaveRecord[];
  summary: Record<string, { total: number; approved: number; rejected: number; pending: number }>;
}

const LEAVE_LABELS: Record<string, string> = {
  casual: "Casual",
  sick: "Sick",
  paid: "Paid",
  unpaid: "Unpaid",
  optional: "Optional",
};

const columns: ExportColumn[] = [
  { key: "employee_name", label: "Employee" },
  { key: "employee_id", label: "Employee ID" },
  { key: "leave_type", label: "Type", format: (v) => LEAVE_LABELS[v as string] || String(v) },
  { key: "start_date", label: "Start", format: (v) => format(new Date(v as string), "MMM d, yyyy") },
  { key: "end_date", label: "End", format: (v) => format(new Date(v as string), "MMM d, yyyy") },
  { key: "status", label: "Status" },
  { key: "reason", label: "Reason" },
];

const STATUS_VARIANT: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  pending: "outline",
  approved: "default",
  rejected: "destructive",
  cancelled: "secondary",
};

export function LeaveReport({ records, summary }: LeaveReportProps) {
  const exportData = records.map((r) => ({
    employee_name: r.profiles?.full_name || "",
    employee_id: r.profiles?.employee_id || "",
    ...r,
  }));

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        {Object.entries(summary).map(([type, stats]) => (
          <Card key={type}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">{LEAVE_LABELS[type]}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-1">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Total</span>
                <span className="font-medium">{stats.total}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Approved</span>
                <span className="font-medium text-green-600">{stats.approved}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Rejected</span>
                <span className="font-medium text-red-600">{stats.rejected}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Pending</span>
                <span className="font-medium text-yellow-600">{stats.pending}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex justify-end">
        <ExportButtons
          data={exportData}
          columns={columns}
          filename={`leave-report-${format(new Date(), "yyyy-MM-dd")}`}
          title="Leave Report"
        />
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Employee</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Duration</TableHead>
              <TableHead>Reason</TableHead>
              <TableHead>Status</TableHead>
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
                <TableCell>
                  <Badge variant="outline" className="capitalize">
                    {LEAVE_LABELS[record.leave_type] || record.leave_type}
                  </Badge>
                </TableCell>
                <TableCell>
                  {format(new Date(record.start_date), "MMM d")} - {format(new Date(record.end_date), "MMM d, yyyy")}
                </TableCell>
                <TableCell className="max-w-[200px] truncate">{record.reason}</TableCell>
                <TableCell>
                  <Badge variant={STATUS_VARIANT[record.status] || "outline"} className="capitalize">
                    {record.status}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
