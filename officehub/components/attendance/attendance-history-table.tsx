"use client";

import { useAttendanceHistory } from "@/hooks/use-attendance";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

const statusColors: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  present: "default",
  absent: "destructive",
  wfh: "secondary",
  leave: "secondary",
  late: "outline",
  half_day: "outline",
  overtime: "default",
  holiday: "secondary",
  weekend: "secondary",
};

export function AttendanceHistoryTable({
  startDate,
  endDate,
}: {
  startDate?: string;
  endDate?: string;
}) {
  const { data: attendance, isLoading } = useAttendanceHistory(startDate, endDate);

  if (isLoading) {
    return (
      <div className="space-y-2 p-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-12 animate-pulse bg-muted rounded" />
        ))}
      </div>
    );
  }

  if (!attendance || attendance.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No attendance records found.
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Date</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Check In</TableHead>
          <TableHead>Check Out</TableHead>
          <TableHead>Hours</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {attendance.map((record) => (
          <TableRow key={record.id}>
            <TableCell>{format(new Date(record.date), "MMM dd, yyyy")}</TableCell>
            <TableCell>
              <Badge variant={statusColors[record.status] || "default"}>
                {record.status.replace("_", " ")}
              </Badge>
            </TableCell>
            <TableCell>
              {record.check_in
                ? format(new Date(record.check_in), "hh:mm a")
                : "—"}
            </TableCell>
            <TableCell>
              {record.check_out
                ? format(new Date(record.check_out), "hh:mm a")
                : "—"}
            </TableCell>
            <TableCell>
              {record.working_hours != null
                ? `${record.working_hours.toFixed(1)}h`
                : "—"}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
