"use client";

import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { format, startOfMonth, endOfMonth, eachDayOfInterval } from "date-fns";
import { CheckCircle, Home, CalendarOff, XCircle, TrendingUp } from "lucide-react";

const STATUS_CONFIG = {
  present: { color: "#22c55e", icon: CheckCircle, label: "Present" },
  wfh: { color: "#3b82f6", icon: Home, label: "WFH" },
  leave: { color: "#f59e0b", icon: CalendarOff, label: "Leave" },
  absent: { color: "#f87171", icon: XCircle, label: "Absent" },
};

interface ChartTooltipProps {
  active?: boolean;
  payload?: Array<{ value: number; dataKey: string }>;
  label?: string;
}

function ChartTooltip({ active, payload, label }: ChartTooltipProps) {
  if (!active || !payload) return null;

  const total = payload.reduce((sum, item) => sum + item.value, 0);

  return (
    <div className="bg-card border border-border rounded-lg shadow-lg p-3 min-w-[140px]">
      <p className="text-sm font-semibold mb-2 text-foreground">Day {label}</p>
      <div className="space-y-1.5">
        {payload.map((item) => {
          const config = STATUS_CONFIG[item.dataKey as keyof typeof STATUS_CONFIG];
          if (!config || item.value === 0) return null;
          return (
            <div key={item.dataKey} className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <div
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: config.color }}
                />
                <span className="text-xs text-muted-foreground">{config.label}</span>
              </div>
              <span className="text-xs font-medium">1</span>
            </div>
          );
        })}
      </div>
      {total > 0 && (
        <div className="mt-2 pt-2 border-t border-border">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Total</span>
            <span className="text-xs font-semibold">{total}</span>
          </div>
        </div>
      )}
    </div>
  );
}

export function MonthlyAttendanceChart() {
  const supabase = createClient();

  const { data: chartData, isLoading } = useQuery({
    queryKey: ["attendance", "monthly-chart"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const now = new Date();
      const start = startOfMonth(now);
      const end = now;

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
        const status = record?.status || "absent";
        return {
          day: format(day, "dd"),
          date: day,
          status,
          present: status === "present" ? 1 : 0,
          wfh: status === "wfh" ? 1 : 0,
          leave: status === "leave" ? 1 : 0,
          absent: status === "absent" || !record ? 1 : 0,
        };
      });
    },
  });

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="space-y-4">
            <div className="h-6 w-40 animate-pulse bg-muted rounded" />
            <div className="h-48 animate-pulse bg-muted rounded-lg" />
            <div className="grid grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-16 animate-pulse bg-muted rounded-lg" />
              ))}
            </div>
          </div>
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

  const totalDays = summary.present + summary.wfh + summary.leave + summary.absent;
  const attendanceRate = totalDays > 0
    ? Math.round(((summary.present + summary.wfh) / totalDays) * 100)
    : 0;

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold">Monthly Attendance</CardTitle>
          <Badge variant="secondary" className="font-medium">
            <TrendingUp className="h-3 w-3 mr-1" />
            {attendanceRate}% active
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground">
          {format(new Date(), "MMMM yyyy")}
        </p>
      </CardHeader>
      <CardContent className="pt-2">
        {/* Chart */}
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} barCategoryGap="15%">
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="hsl(var(--border))"
                vertical={false}
              />
              <XAxis
                dataKey="day"
                fontSize={11}
                tickLine={false}
                axisLine={false}
                tick={{ fill: "hsl(var(--muted-foreground))" }}
              />
              <YAxis
                fontSize={11}
                tickLine={false}
                axisLine={false}
                tick={{ fill: "hsl(var(--muted-foreground))" }}
                width={20}
              />
              <Tooltip content={<ChartTooltip />} cursor={{ fill: "hsl(var(--muted)/0.5)" }} />
              <Bar dataKey="present" stackId="status" radius={[0, 0, 0, 0]}>
                {chartData?.map((_, index) => (
                  <Cell
                    key={`present-${index}`}
                    fill={STATUS_CONFIG.present.color}
                    fillOpacity={0.9}
                  />
                ))}
              </Bar>
              <Bar dataKey="wfh" stackId="status" radius={[0, 0, 0, 0]}>
                {chartData?.map((_, index) => (
                  <Cell
                    key={`wfh-${index}`}
                    fill={STATUS_CONFIG.wfh.color}
                    fillOpacity={0.9}
                  />
                ))}
              </Bar>
              <Bar dataKey="leave" stackId="status" radius={[0, 0, 0, 0]}>
                {chartData?.map((_, index) => (
                  <Cell
                    key={`leave-${index}`}
                    fill={STATUS_CONFIG.leave.color}
                    fillOpacity={0.9}
                  />
                ))}
              </Bar>
              <Bar dataKey="absent" stackId="status" radius={[4, 4, 0, 0]}>
                {chartData?.map((_, index) => (
                  <Cell
                    key={`absent-${index}`}
                    fill={STATUS_CONFIG.absent.color}
                    fillOpacity={0.9}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-2 gap-3 mt-4 sm:grid-cols-4">
          {Object.entries(STATUS_CONFIG).map(([key, config]) => {
            const count = summary[key as keyof typeof summary];
            const Icon = config.icon;
            return (
              <div
                key={key}
                className="flex items-center gap-3 p-3 rounded-lg bg-muted/50"
              >
                <div
                  className="flex items-center justify-center w-9 h-9 rounded-lg"
                  style={{ backgroundColor: `${config.color}15` }}
                >
                  <Icon
                    className="w-4 h-4"
                    style={{ color: config.color }}
                  />
                </div>
                <div>
                  <p className="text-lg font-bold leading-none tabular-nums">{count}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{config.label}</p>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
