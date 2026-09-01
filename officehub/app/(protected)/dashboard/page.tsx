"use client";

import Link from "next/link";
import { useAuth } from "@/hooks/use-auth";
import { useTeamTodayAttendance } from "@/hooks/use-team-attendance";
import { useLeaveRequests } from "@/hooks/use-leave";
import { useWfhRequests } from "@/hooks/use-wfh";
import { useEmployees } from "@/hooks/use-employees";
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
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">
            Welcome back, {profile?.full_name?.split(" ")[0] || "User"}
          </h1>
          <p className="text-muted-foreground">
            Here&apos;s what&apos;s happening today.
          </p>
        </div>
        <Card>
          <CardContent className="p-6 text-center text-muted-foreground">
            <p>
              Welcome to your dashboard. Use the navigation to access
              attendance, leave, and WFH features.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">OFFICE DASHBOARD</h1>
        <p className="text-muted-foreground">
          Overview of Team&apos;s Attendance Dashboard.
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Users className="h-4 w-4" />
              Total Employees
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{teamData?.summary.total || 0}</p>
          </CardContent>
        </Card>

        <Card className="border-green-200 bg-green-50/50 dark:border-green-900 dark:bg-green-950/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-green-600 dark:text-green-400 flex items-center gap-2">
              <UserCheck className="h-4 w-4" />
              Present Today
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-green-600 dark:text-green-400">
              {(teamData?.summary.present || 0) + (teamData?.summary.late || 0)}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Including {teamData?.summary.late || 0} late
            </p>
          </CardContent>
        </Card>

        <Card className="border-blue-200 bg-blue-50/50 dark:border-blue-900 dark:bg-blue-950/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-blue-600 dark:text-blue-400 flex items-center gap-2">
              <Home className="h-4 w-4" />
              Working From Home
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {teamData?.summary.wfh || 0}
            </p>
          </CardContent>
        </Card>

        <Card className="border-red-200 bg-red-50/50 dark:border-red-900 dark:bg-red-950/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-red-600 dark:text-red-400 flex items-center gap-2">
              <UserX className="h-4 w-4" />
              Absent Today
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-red-600 dark:text-red-400">
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
              <ClipboardCheck className="h-4 w-4" />
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
        <CardHeader>
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Today&apos;s Attendance
          </CardTitle>
        </CardHeader>
        <CardContent>
          {teamData?.employees && teamData.employees.length > 0 ? (
            <div className="space-y-2 max-h-[400px] overflow-y-auto">
              {teamData.employees.map((member) => (
                <div
                  key={member.user_id}
                  className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center text-sm font-medium text-primary">
                      {member.full_name?.charAt(0) || "U"}
                    </div>
                    <div>
                      <p className="text-sm font-medium">{member.full_name}</p>
                      <p className="text-xs text-muted-foreground">
                        {member.employee_id}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {member.check_in && (
                      <span className="text-xs text-muted-foreground">
                        In:{" "}
                        {new Date(member.check_in).toLocaleTimeString("en-US", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    )}
                    {member.working_hours != null && (
                      <span className="text-xs font-medium">
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
                      className="capitalize"
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
            <div className="text-center text-muted-foreground py-8">
              No team members found.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
