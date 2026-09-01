"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ReportFilters } from "@/components/reports/report-filters";
import { AttendanceReport } from "@/components/reports/attendance-report";
import { LeaveReport } from "@/components/reports/leave-report";
import { WfhReport } from "@/components/reports/wfh-report";
import { useAttendanceReport, useLeaveReport, useWfhReport } from "@/hooks/use-reports";
import { useAuth } from "@/hooks/use-auth";
import { ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function ReportsPage() {
  const { profile } = useAuth();
  const [filters, setFilters] = useState<{
    start_date?: string;
    end_date?: string;
  }>({});

  const { data: attendanceData, isLoading: loadingAttendance } = useAttendanceReport(filters);
  const { data: leaveData, isLoading: loadingLeave } = useLeaveReport(filters);
  const { data: wfhData, isLoading: loadingWfh } = useWfhReport(filters);

  if (profile?.role !== "manager" && profile?.role !== "admin") {
    return (
      <div className="flex flex-col items-center justify-center py-8 sm:py-12 px-4 space-y-4">
        <ShieldAlert className="h-10 w-10 sm:h-12 sm:w-12 text-muted-foreground" />
        <h2 className="text-lg sm:text-xl font-semibold text-center">Access Denied</h2>
        <p className="text-muted-foreground text-sm text-center">Only managers can access reports.</p>
        <Link href="/dashboard">
          <Button>Back to Dashboard</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <h1 className="text-xl sm:text-2xl font-bold">Reports</h1>

      <Card>
        <CardContent className="p-3 sm:p-6 pt-4 sm:pt-6">
          <ReportFilters onFilter={setFilters} />
        </CardContent>
      </Card>

      <Tabs defaultValue="attendance" className="w-full">
        <TabsList className="w-full sm:w-auto">
          <TabsTrigger value="attendance" className="text-xs sm:text-sm">Attendance</TabsTrigger>
          <TabsTrigger value="leave" className="text-xs sm:text-sm">Leave</TabsTrigger>
          <TabsTrigger value="wfh" className="text-xs sm:text-sm">WFH</TabsTrigger>
        </TabsList>

        <TabsContent value="attendance">
          {loadingAttendance ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 sm:gap-4">
                {[...Array(6)].map((_, i) => (
                  <Card key={i}>
                    <CardContent className="p-3 sm:p-4">
                      <div className="h-10 sm:h-12 animate-pulse bg-muted rounded" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ) : attendanceData ? (
            <AttendanceReport
              records={attendanceData.records}
              summary={attendanceData.summary}
            />
          ) : null}
        </TabsContent>

        <TabsContent value="leave">
          {loadingLeave ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 sm:gap-4">
                {[...Array(5)].map((_, i) => (
                  <Card key={i}>
                    <CardContent className="p-3 sm:p-4">
                      <div className="h-10 sm:h-12 animate-pulse bg-muted rounded" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ) : leaveData ? (
            <LeaveReport
              records={leaveData.records}
              summary={leaveData.summary}
            />
          ) : null}
        </TabsContent>

        <TabsContent value="wfh">
          {loadingWfh ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
                {[...Array(4)].map((_, i) => (
                  <Card key={i}>
                    <CardContent className="p-3 sm:p-4">
                      <div className="h-10 sm:h-12 animate-pulse bg-muted rounded" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ) : wfhData ? (
            <WfhReport
              records={wfhData.records}
              summary={wfhData.summary}
            />
          ) : null}
        </TabsContent>
      </Tabs>
    </div>
  );
}
