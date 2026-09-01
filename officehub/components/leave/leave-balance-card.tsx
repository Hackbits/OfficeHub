"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLeaveBalance } from "@/hooks/use-leave";
import { CalendarDays } from "lucide-react";

const LEAVE_LABELS: Record<string, string> = {
  casual: "Casual",
  sick: "Sick",
  paid: "Paid",
  unpaid: "Unpaid",
  optional: "Optional",
};

const LEAVE_COLORS: Record<string, string> = {
  casual: "text-blue-600",
  sick: "text-orange-600",
  paid: "text-green-600",
  unpaid: "text-gray-600",
  optional: "text-purple-600",
};

export function LeaveBalanceCard() {
  const { data: balances, isLoading } = useLeaveBalance();

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-4 sm:p-6">
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-8 animate-pulse bg-muted rounded" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!balances) return null;

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <CalendarDays className="h-4 w-4" />
          Leave Balance ({new Date().getFullYear()})
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 pb-4 sm:pb-6">
        {Object.entries(balances)
          .filter(([key]) => key !== "unpaid")
          .map(([type, balance]) => (
            <div key={type} className="flex items-center justify-between gap-2">
              <span className="text-xs sm:text-sm">{LEAVE_LABELS[type]}</span>
              <div className="flex items-center gap-2">
                <div className="w-16 sm:w-24 h-1.5 sm:h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary rounded-full"
                    style={{
                      width: `${balance.total > 0 ? (balance.used / balance.total) * 100 : 0}%`,
                    }}
                  />
                </div>
                <span className={`text-xs sm:text-sm font-medium ${LEAVE_COLORS[type]} tabular-nums`}>
                  {balance.total - balance.used}/{balance.total}
                </span>
              </div>
            </div>
          ))}
      </CardContent>
    </Card>
  );
}
