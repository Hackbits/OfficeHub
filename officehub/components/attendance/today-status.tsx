"use client";

import { useTodayAttendance } from "@/hooks/use-attendance";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, CheckCircle, XCircle, Home } from "lucide-react";

const statusConfig: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline"; icon: React.ReactNode }> = {
  present: { label: "Present", variant: "default", icon: <CheckCircle className="h-4 w-4" /> },
  absent: { label: "Absent", variant: "destructive", icon: <XCircle className="h-4 w-4" /> },
  wfh: { label: "Work From Home", variant: "secondary", icon: <Home className="h-4 w-4" /> },
  late: { label: "Late", variant: "outline", icon: <Clock className="h-4 w-4" /> },
  half_day: { label: "Half Day", variant: "outline", icon: <Clock className="h-4 w-4" /> },
  overtime: { label: "Overtime", variant: "default", icon: <Clock className="h-4 w-4" /> },
};

export function TodayStatus() {
  const { data: attendance, isLoading } = useTodayAttendance();

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="h-8 animate-pulse bg-muted rounded" />
        </CardContent>
      </Card>
    );
  }

  const status = attendance?.status || "absent";
  const config = statusConfig[status] || statusConfig.absent;

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          Today&apos;s Status
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-2">
          {config.icon}
          <Badge variant={config.variant}>{config.label}</Badge>
        </div>
        {attendance?.check_in && (
          <p className="text-sm text-muted-foreground mt-2">
            Check in: {new Date(attendance.check_in).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}
          </p>
        )}
        {attendance?.check_out && (
          <p className="text-sm text-muted-foreground">
            Check out: {new Date(attendance.check_out).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}
          </p>
        )}
        {attendance?.working_hours != null && (
          <p className="text-sm font-medium mt-1">
            Working hours: {attendance.working_hours.toFixed(1)}h
          </p>
        )}
      </CardContent>
    </Card>
  );
}