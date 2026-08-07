"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AttendanceClock } from "@/components/attendance/attendance-clock";
import { CheckInButton } from "@/components/attendance/check-in-button";
import { TodayStatus } from "@/components/attendance/today-status";
import { MonthlyAttendanceChart } from "@/components/attendance/monthly-attendance-chart";
import { AttendanceHistoryTable } from "@/components/attendance/attendance-history-table";
import Link from "next/link";
import { History } from "lucide-react";

export default function AttendancePage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Attendance</h1>
        <Link href="/attendance/history" className="inline-flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-1.5 text-sm font-medium hover:bg-muted hover:text-foreground">
          <History className="mr-1 h-4 w-4" />
          View History
        </Link>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Current Time
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center gap-4">
            <AttendanceClock />
            <CheckInButton />
          </CardContent>
        </Card>

        <TodayStatus />
      </div>

      <MonthlyAttendanceChart />

      <Card>
        <CardHeader>
          <CardTitle>Recent Attendance</CardTitle>
        </CardHeader>
        <CardContent>
          <AttendanceHistoryTable />
        </CardContent>
      </Card>
    </div>
  );
}