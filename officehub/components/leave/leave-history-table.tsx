"use client";

import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { useCancelLeave } from "@/hooks/use-leave";
import { toast } from "sonner";
import { format } from "date-fns";

interface LeaveRequest {
  id: string;
  leave_type: string;
  start_date: string;
  end_date: string;
  reason: string;
  status: string;
  created_at: string;
}

interface LeaveHistoryTableProps {
  requests: LeaveRequest[];
  showCancel?: boolean;
}

const LEAVE_TYPE_LABELS: Record<string, string> = {
  casual: "Casual",
  sick: "Sick",
  paid: "Paid",
  unpaid: "Unpaid",
  optional: "Optional",
};

const STATUS_VARIANT: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  pending: "outline",
  approved: "default",
  rejected: "destructive",
  cancelled: "secondary",
};

export function LeaveHistoryTable({ requests, showCancel = true }: LeaveHistoryTableProps) {
  const cancelLeave = useCancelLeave();

  const handleCancel = async (id: string) => {
    try {
      await cancelLeave.mutateAsync(id);
      toast.success("Leave request cancelled");
    } catch {
      toast.error("Failed to cancel leave request");
    }
  };

  if (!requests || requests.length === 0) {
    return (
      <div className="text-center py-6 sm:py-8 text-muted-foreground text-sm">
        No leave requests found.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <Table className="min-w-[450px]">
        <TableHeader>
          <TableRow>
            <TableHead className="min-w-[80px]">Type</TableHead>
            <TableHead className="min-w-[120px]">Duration</TableHead>
            <TableHead className="min-w-[100px] hidden md:table-cell">Reason</TableHead>
            <TableHead className="min-w-[80px]">Status</TableHead>
            <TableHead className="min-w-[100px] hidden lg:table-cell">Submitted</TableHead>
            {showCancel && <TableHead className="text-right min-w-[70px]">Actions</TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {requests.map((req) => (
            <TableRow key={req.id}>
              <TableCell className="font-medium text-sm">
                {LEAVE_TYPE_LABELS[req.leave_type] || req.leave_type}
              </TableCell>
              <TableCell className="text-xs sm:text-sm">
                {format(new Date(req.start_date), "MMM d")} -{" "}
                {format(new Date(req.end_date), "MMM d, yyyy")}
              </TableCell>
              <TableCell className="max-w-[150px] sm:max-w-[200px] truncate text-xs sm:text-sm hidden md:table-cell">
                {req.reason}
              </TableCell>
              <TableCell>
                <Badge variant={STATUS_VARIANT[req.status] || "outline"} className="capitalize text-[10px] sm:text-xs">
                  {req.status}
                </Badge>
              </TableCell>
              <TableCell className="text-xs sm:text-sm hidden lg:table-cell">
                {format(new Date(req.created_at), "MMM d, yyyy")}
              </TableCell>
              {showCancel && (
                <TableCell className="text-right">
                  {req.status === "pending" && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleCancel(req.id)}
                      disabled={cancelLeave.isPending}
                      className="h-7 sm:h-8 text-xs"
                    >
                      Cancel
                    </Button>
                  )}
                </TableCell>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
