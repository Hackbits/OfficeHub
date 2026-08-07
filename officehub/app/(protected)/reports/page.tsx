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
      <div className="flex flex-col items-center justify-center py-12 space-y-4">
        <ShieldAlert className="h-12 w-12 text-muted-foreground" />
        <h2 className="text-xl font-semibold">Access Denied</h2>
        <p className="text-muted-foreground">Only managers can access reports.</p>
        <Link href="/dashboard">
          <Button>Back to Dashboard</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Reports</h1>

      <Card>
        <CardContent className="pt-6">
          <ReportFilters onFilter={setFilters} />
        </CardContent>
      </Card>

      <Tabs defaultValue="attendance" className="w-full">
        <TabsList>
          <TabsTrigger value="attendance">Attendance</TabsTrigger>
          <TabsTrigger value="leave">Leave</TabsTrigger>
          <TabsTrigger value="wfh">WFH</TabsTrigger>
        </TabsList>

        <TabsContent value="attendance">
          {loadingAttendance ? (
            <div className="space-y-4">
              <div className="grid gap-4 md:grid-cols-6">
                {[...Array(6)].map((_, i) => (
                  <Card key={i}>
                    <CardContent className="p-4">
                      <div className="h-12 animate-pulse bg-muted rounded" />
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
              <div className="grid gap-4 md:grid-cols-5">
                {[...Array(5)].map((_, i) => (
                  <Card key={i}>
                    <CardContent className="p-4">
                      <div className="h-12 animate-pulse bg-muted rounded" />
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
              <div className="grid gap-4 md:grid-cols-4">
                {[...Array(4)].map((_, i) => (
                  <Card key={i}>
                    <CardContent className="p-4">
                      <div className="h-12 animate-pulse bg-muted rounded" />
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
