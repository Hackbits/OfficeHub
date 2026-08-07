"use client";

import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { format, startOfMonth, endOfMonth, eachDayOfInterval } from "date-fns";

export function MonthlyAttendanceChart() {
  const supabase = createClient();

  const { data: chartData, isLoading } = useQuery({
    queryKey: ["attendance", "monthly-chart"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const now = new Date();
      const start = startOfMonth(now);
      const end = endOfMonth(now);

      const { data } = await supabase
        .from("attendance")
        .select("date, status")
        .eq("user_id", user.id)
        .gte("date", start.toISOString().split("T")[0])
        .lte("date", end.toISOString().split("T")[0]);

      const days = eachDayOfInterval({ start, end });
      return days.map((day) => {
        const dateStr = format(day, "yyyy-MM-dd");
        const record = data?.find((d: { date: string; status: string }) => d.date === dateStr);
        return {
          day: format(day, "dd"),
          present: record?.status === "present" ? 1 : 0,
          wfh: record?.status === "wfh" ? 1 : 0,
          leave: record?.status === "leave" ? 1 : 0,
          absent: record?.status === "absent" || !record ? 1 : 0,
        };
      });
    },
  });

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="h-64 animate-pulse bg-muted rounded" />
        </CardContent>
      </Card>
    );
  }

  const summary = {
    present: chartData?.reduce((sum, d) => sum + d.present, 0) || 0,
    wfh: chartData?.reduce((sum, d) => sum + d.wfh, 0) || 0,
    absent: chartData?.reduce((sum, d) => sum + d.absent, 0) || 0,
    leave: chartData?.reduce((sum, d) => sum + d.leave, 0) || 0,
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Monthly Attendance</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" fontSize={12} />
              <YAxis fontSize={12} />
              <Tooltip />
              <Legend />
              <Bar dataKey="present" fill="#22c55e" name="Present" />
              <Bar dataKey="wfh" fill="#3b82f6" name="WFH" />
              <Bar dataKey="leave" fill="#f59e0b" name="Leave" />
              <Bar dataKey="absent" fill="#ef4444" name="Absent" />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="grid grid-cols-4 gap-4 mt-4 text-center">
          <div>
            <p className="text-2xl font-bold text-green-600">{summary.present}</p>
            <p className="text-xs text-muted-foreground">Present</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-blue-600">{summary.wfh}</p>
            <p className="text-xs text-muted-foreground">WFH</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-amber-600">{summary.leave}</p>
            <p className="text-xs text-muted-foreground">Leave</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-red-600">{summary.absent}</p>
            <p className="text-xs text-muted-foreground">Absent</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
