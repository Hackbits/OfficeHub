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
    <div className="space-y-4 sm:space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl sm:text-2xl font-bold">Attendance</h1>
        <Link
          href="/attendance/history"
          className="inline-flex items-center gap-1.5 sm:gap-2 rounded-lg border border-border bg-background px-2.5 sm:px-3 py-1.5 text-xs sm:text-sm font-medium hover:bg-muted hover:text-foreground"
        >
          <History className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
          <span className="hidden xs:inline">View </span>History
        </Link>
      </div>

      <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Current Time
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center gap-3 sm:gap-4 pb-4 sm:pb-6">
            <AttendanceClock />
            <CheckInButton />
          </CardContent>
        </Card>

        <TodayStatus />
      </div>

      <MonthlyAttendanceChart />

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm sm:text-base">Recent Attendance</CardTitle>
        </CardHeader>
        <CardContent className="p-3 sm:p-6">
          <AttendanceHistoryTable />
        </CardContent>
      </Card>
    </div>
  );
}
