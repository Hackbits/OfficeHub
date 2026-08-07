"use client";

import Link from "next/link";
import { useAuth } from "@/hooks/use-auth";
import { useTodayAttendance, useAttendanceHistory } from "@/hooks/use-attendance";
import { useLeaveRequests } from "@/hooks/use-leave";
import { useWfhRequests } from "@/hooks/use-wfh";
import { LoadingSpinner } from "@/components/shared/loading-spinner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CalendarDays, ClipboardCheck, Home, Clock, TrendingUp } from "lucide-react";
import { format, subDays } from "date-fns";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

export default function DashboardPage() {
  const { profile, loading: authLoading } = useAuth();
  const { data: attendance, isLoading: attendanceLoading } = useTodayAttendance();

  const weekAgo = subDays(new Date(), 7).toISOString().split("T")[0];
  const today = new Date().toISOString().split("T")[0];
  const { data: weekAttendance } = useAttendanceHistory(weekAgo, today);

  const { data: pendingLeave } = useLeaveRequests({ status: "pending" });
  const { data: pendingWfh } = useWfhRequests({ status: "pending" });
  const { data: approvedLeave } = useLeaveRequests({ status: "approved" });
  const { data: approvedWfh } = useWfhRequests({ status: "approved" });

  if (authLoading || attendanceLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <LoadingSpinner size={32} />
      </div>
    );
  }

  const isManager = profile?.role === "manager" || profile?.role === "admin";
  const totalPending = (pendingLeave?.length || 0) + (pendingWfh?.length || 0);

  const upcomingLeave = approvedLeave?.filter((r) => r.start_date >= today).slice(0, 3) || [];
  const upcomingWfh = approvedWfh?.filter((r) => r.start_date >= today).slice(0, 3) || [];

  const weeklyData = [];
  for (let i = 6; i >= 0; i--) {
    const date = subDays(new Date(), i);
    const dateStr = format(date, "yyyy-MM-dd");
    const dayRecord = weekAttendance?.find((r) => r.date === dateStr);
    weeklyData.push({
      day: format(date, "EEE"),
      hours: dayRecord?.working_hours || 0,
      status: dayRecord?.status || "absent",
    });
  }

  const leavePieData = [
    { name: "Approved", value: approvedLeave?.filter((r) => r.status === "approved").length || 0, color: "#22c55e" },
    { name: "Pending", value: approvedLeave?.filter((r) => r.status === "pending").length || 0, color: "#eab308" },
    { name: "Rejected", value: approvedLeave?.filter((r) => r.status === "rejected").length || 0, color: "#ef4444" },
  ].filter((d) => d.value > 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">
          Welcome back, {profile?.full_name?.split(" ")[0] || "User"}
        </h1>
        <p className="text-muted-foreground">
          Here&apos;s what&apos;s happening today.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Today&apos;s Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Badge variant={attendance?.status === "present" || attendance?.status === "wfh" ? "default" : "secondary"}>
              {attendance?.status?.replace("_", " ") || "Not checked in"}
            </Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <CalendarDays className="h-4 w-4" />
              Check In
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {attendance?.check_in
                ? new Date(attendance.check_in).toLocaleTimeString("en-US", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })
                : "\u2014"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Home className="h-4 w-4" />
              Working Hours
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {attendance?.working_hours != null
                ? `${attendance.working_hours.toFixed(1)}h`
                : "\u2014"}
            </p>
          </CardContent>
        </Card>

        {isManager ? (
          <Card className="border-primary/20 bg-primary/5">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <ClipboardCheck className="h-4 w-4" />
                Pending Approvals
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <p className="text-2xl font-bold">{totalPending}</p>
                {totalPending > 0 && (
                  <Link href="/approvals">
                    <Button size="sm" variant="outline">Review</Button>
                  </Link>
                )}
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Role
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold capitalize">{profile?.role}</p>
            </CardContent>
          </Card>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              This Week&apos;s Hours
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={weeklyData}>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis dataKey="day" fontSize={12} tickLine={false} />
                  <YAxis fontSize={12} tickLine={false} />
                  <Tooltip />
                  <Bar dataKey="hours" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Leave Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            {leavePieData.length > 0 ? (
              <div className="h-[200px] flex items-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={leavePieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {leavePieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                <div className="ml-4 space-y-2">
                  {leavePieData.map((entry) => (
                    <div key={entry.name} className="flex items-center gap-2 text-sm">
                      <div className="h-3 w-3 rounded-full" style={{ backgroundColor: entry.color }} />
                      <span>{entry.name}: {entry.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="h-[200px] flex items-center justify-center text-muted-foreground text-sm">
                No leave data yet
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {(upcomingLeave.length > 0 || upcomingWfh.length > 0) && (
        <div className="grid gap-4 md:grid-cols-2">
          {upcomingLeave.length > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <CalendarDays className="h-4 w-4" />
                  Upcoming Leave
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {upcomingLeave.map((req) => (
                  <div key={req.id} className="flex items-center justify-between text-sm">
                    <span className="capitalize">{req.leave_type}</span>
                    <span className="text-muted-foreground">
                      {format(new Date(req.start_date), "MMM d")} - {format(new Date(req.end_date), "MMM d")}
                    </span>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {upcomingWfh.length > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Home className="h-4 w-4" />
                  Upcoming WFH
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {upcomingWfh.map((req) => (
                  <div key={req.id} className="flex items-center justify-between text-sm">
                    <span>Work From Home</span>
                    <span className="text-muted-foreground">
                      {format(new Date(req.start_date), "MMM d")} - {format(new Date(req.end_date), "MMM d")}
                    </span>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
