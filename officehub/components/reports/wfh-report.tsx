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

interface WfhRecord {
  id: string;
  start_date: string;
  end_date: string;
  reason: string;
  status: string;
  profiles?: { full_name: string; employee_id: string } | null;
}

interface WfhReportProps {
  records: WfhRecord[];
  summary: { total: number; approved: number; rejected: number; pending: number };
}

const columns: ExportColumn[] = [
  { key: "employee_name", label: "Employee" },
  { key: "employee_id", label: "Employee ID" },
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

export function WfhReport({ records, summary }: WfhReportProps) {
  const exportData = records.map((r) => ({
    employee_name: r.profiles?.full_name || "",
    employee_id: r.profiles?.employee_id || "",
    ...r,
  }));

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold">{summary.total}</p>
            <p className="text-xs text-muted-foreground">Total Requests</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-green-600">{summary.approved}</p>
            <p className="text-xs text-muted-foreground">Approved</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-red-600">{summary.rejected}</p>
            <p className="text-xs text-muted-foreground">Rejected</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-yellow-600">{summary.pending}</p>
            <p className="text-xs text-muted-foreground">Pending</p>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-end">
        <ExportButtons
          data={exportData}
          columns={columns}
          filename={`wfh-report-${format(new Date(), "yyyy-MM-dd")}`}
          title="WFH Report"
        />
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Employee</TableHead>
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
