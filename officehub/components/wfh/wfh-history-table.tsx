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
import { useCancelWfh } from "@/hooks/use-wfh";
import { toast } from "sonner";
import { format } from "date-fns";

interface WfhRequest {
  id: string;
  start_date: string;
  end_date: string;
  reason: string;
  notes: string | null;
  status: string;
  created_at: string;
}

interface WfhHistoryTableProps {
  requests: WfhRequest[];
  showCancel?: boolean;
}

const STATUS_VARIANT: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  pending: "outline",
  approved: "default",
  rejected: "destructive",
  cancelled: "secondary",
};

export function WfhHistoryTable({ requests, showCancel = true }: WfhHistoryTableProps) {
  const cancelWfh = useCancelWfh();

  const handleCancel = async (id: string) => {
    try {
      await cancelWfh.mutateAsync(id);
      toast.success("WFH request cancelled");
    } catch {
      toast.error("Failed to cancel WFH request");
    }
  };

  if (!requests || requests.length === 0) {
    return (
      <div className="text-center py-6 sm:py-8 text-muted-foreground text-sm">
        No WFH requests found.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <Table className="min-w-100">
        <TableHeader>
          <TableRow>
            <TableHead className="min-w-30">Duration</TableHead>
            <TableHead className="min-w-25 hidden md:table-cell">Reason</TableHead>
            <TableHead className="min-w-20">Status</TableHead>
            <TableHead className="min-w-25 hidden lg:table-cell">Submitted</TableHead>
            {showCancel && <TableHead className="text-right min-w-17.5">Actions</TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {requests.map((req) => (
            <TableRow key={req.id}>
              <TableCell className="text-xs sm:text-sm">
                {format(new Date(req.start_date), "MMM d")} -{" "}
                {format(new Date(req.end_date), "MMM d, yyyy")}
              </TableCell>
              <TableCell className="max-w-37.5 sm:max-w-50 truncate text-xs sm:text-sm hidden md:table-cell">
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
                      disabled={cancelWfh.isPending}
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
