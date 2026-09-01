"use client";

import Link from "next/link";
import { useAuth } from "@/hooks/use-auth";
import { useTeamTodayAttendance } from "@/hooks/use-team-attendance";
import { useLeaveRequests } from "@/hooks/use-leave";
import { useWfhRequests } from "@/hooks/use-wfh";
import { LoadingSpinner } from "@/components/shared/loading-spinner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Users,
  ClipboardCheck,
  Home,
  UserCheck,
  UserX,
  TrendingUp,
} from "lucide-react";

export default function DashboardPage() {
  const { profile, loading: authLoading } = useAuth();

  const isAdmin = profile?.role === "admin" || profile?.role === "manager";

  const { data: teamData, isLoading: teamLoading } = useTeamTodayAttendance();
  const { data: pendingLeave } = useLeaveRequests({ status: "pending" });
  const { data: pendingWfh } = useWfhRequests({ status: "pending" });

  if (authLoading || teamLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <LoadingSpinner size={32} />
      </div>
    );
  }

  const totalPending = (pendingLeave?.length || 0) + (pendingWfh?.length || 0);

  if (!isAdmin) {
    return (
      <div className="space-y-4 sm:space-y-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold">
            Welcome back, {profile?.full_name?.split(" ")[0] || "User"}
          </h1>
          <p className="text-muted-foreground text-sm sm:text-base">
            Here&apos;s what&apos;s happening today.
          </p>
        </div>
        <Card>
          <CardContent className="p-4 sm:p-6 text-center text-muted-foreground">
            <p className="text-sm sm:text-base">
              Welcome to your dashboard. Use the navigation to access
              attendance, leave, and WFH features.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold">OFFICE DASHBOARD</h1>
        <p className="text-muted-foreground text-sm sm:text-base">
          Overview of Team&apos;s Attendance Dashboard.
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Users className="h-4 w-4 shrink-0" />
              <span className="truncate">Total Employees</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="pb-3 sm:pb-4">
            <p className="text-xl sm:text-2xl font-bold">{teamData?.summary.total || 0}</p>
          </CardContent>
        </Card>

        <Card className="border-green-200 bg-green-50/50 dark:border-green-900 dark:bg-green-950/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium text-green-600 dark:text-green-400 flex items-center gap-2">
              <UserCheck className="h-4 w-4 shrink-0" />
              <span className="truncate">Present</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="pb-3 sm:pb-4">
            <p className="text-xl sm:text-2xl font-bold text-green-600 dark:text-green-400">
              {(teamData?.summary.present || 0) + (teamData?.summary.late || 0)}
            </p>
            <p className="text-[10px] sm:text-xs text-muted-foreground mt-1">
              Including {teamData?.summary.late || 0} late
            </p>
          </CardContent>
        </Card>

        <Card className="border-blue-200 bg-blue-50/50 dark:border-blue-900 dark:bg-blue-950/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium text-blue-600 dark:text-blue-400 flex items-center gap-2">
              <Home className="h-4 w-4 shrink-0" />
              <span className="truncate">WFH</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="pb-3 sm:pb-4">
            <p className="text-xl sm:text-2xl font-bold text-blue-600 dark:text-blue-400">
              {teamData?.summary.wfh || 0}
            </p>
          </CardContent>
        </Card>

        <Card className="border-red-200 bg-red-50/50 dark:border-red-900 dark:bg-red-950/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium text-red-600 dark:text-red-400 flex items-center gap-2">
              <UserX className="h-4 w-4 shrink-0" />
              <span className="truncate">Absent</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="pb-3 sm:pb-4">
            <p className="text-xl sm:text-2xl font-bold text-red-600 dark:text-red-400">
              {teamData?.summary.absent || 0}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Pending Approvals */}
      {totalPending > 0 && (
        <Card className="border-primary/20 bg-primary/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <ClipboardCheck className="h-4 w-4 shrink-0" />
              Pending Approvals
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <p className="text-2xl font-bold">{totalPending}</p>
              <Link href="/approvals">
                <Button size="sm" variant="outline">
                  Review
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Team Attendance List */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm sm:text-base font-semibold flex items-center gap-2">
            <TrendingUp className="h-4 w-4 shrink-0" />
            Today&apos;s Attendance
          </CardTitle>
        </CardHeader>
        <CardContent className="p-3 sm:p-6">
          {teamData?.employees && teamData.employees.length > 0 ? (
            <div className="space-y-2 max-h-75 sm:max-h-100 overflow-y-auto">
              {teamData.employees.map((member) => (
                <div
                  key={member.user_id}
                  className="flex items-center justify-between p-2.5 sm:p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                >
                  <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
                    <div className="h-8 w-8 sm:h-9 sm:w-9 rounded-full bg-primary/10 flex items-center justify-center text-xs sm:text-sm font-medium text-primary shrink-0">
                      {member.full_name?.charAt(0) || "U"}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">{member.full_name}</p>
                      <p className="text-[10px] sm:text-xs text-muted-foreground truncate">
                        {member.employee_id}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 sm:gap-3 shrink-0">
                    {member.check_in && (
                      <span className="text-[10px] sm:text-xs text-muted-foreground hidden sm:inline">
                        In:{" "}
                        {new Date(member.check_in).toLocaleTimeString("en-US", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    )}
                    {member.working_hours != null && (
                      <span className="text-[10px] sm:text-xs font-medium hidden sm:inline">
                        {member.working_hours.toFixed(1)}h
                      </span>
                    )}
                    <Badge
                      variant={
                        member.status === "present" || member.status === "wfh"
                          ? "default"
                          : member.status === "late"
                            ? "outline"
                            : member.status === "absent" ||
                                member.status === "no_record"
                              ? "destructive"
                              : "secondary"
                      }
                      className="capitalize text-[10px] sm:text-xs px-1.5 sm:px-2.5"
                    >
                      {member.status === "no_record"
                        ? "No record"
                        : member.status.replace("_", " ")}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center text-muted-foreground py-6 sm:py-8 text-sm">
              No team members found.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
