"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Check, X } from "lucide-react";
import { format } from "date-fns";

interface ApprovalRequest {
  id: string;
  user_id: string;
  start_date: string;
  end_date: string;
  reason: string;
  status: string;
  created_at: string;
  profiles?: { full_name: string; employee_id: string } | null;
  leave_type?: string;
}

interface ApprovalTableProps {
  requests: ApprovalRequest[];
  type: "leave" | "wfh";
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
  isProcessing?: boolean;
}

export function ApprovalTable({
  requests,
  type,
  onApprove,
  onReject,
  isProcessing,
}: ApprovalTableProps) {
  if (!requests || requests.length === 0) {
    return (
      <div className="text-center py-6 sm:py-8 text-muted-foreground text-sm">
        No pending {type === "leave" ? "leave" : "WFH"} requests.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <Table className="min-w-[500px]">
        <TableHeader>
          <TableRow>
            <TableHead className="min-w-[150px]">Employee</TableHead>
            {type === "leave" && <TableHead className="min-w-[80px] hidden sm:table-cell">Type</TableHead>}
            <TableHead className="min-w-[120px]">Duration</TableHead>
            <TableHead className="min-w-[100px] hidden md:table-cell">Reason</TableHead>
            <TableHead className="min-w-[100px] hidden lg:table-cell">Submitted</TableHead>
            <TableHead className="text-right min-w-[120px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {requests.map((req) => (
            <TableRow key={req.id}>
              <TableCell>
                <div className="flex items-center gap-2 sm:gap-3">
                  <Avatar className="h-7 w-7 sm:h-8 sm:w-8 shrink-0">
                    <AvatarFallback className="text-xs">
                      {req.profiles?.full_name?.charAt(0) || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <p className="font-medium text-sm truncate">{req.profiles?.full_name || "Unknown"}</p>
                    <p className="text-[10px] sm:text-xs text-muted-foreground truncate">
                      {req.profiles?.employee_id || ""}
                    </p>
                    {/* Mobile-only info */}
                    <div className="sm:hidden mt-1">
                      {type === "leave" && req.leave_type && (
                        <Badge variant="outline" className="capitalize text-[10px]">
                          {req.leave_type}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </TableCell>
              {type === "leave" && (
                <TableCell className="hidden sm:table-cell">
                  <Badge variant="outline" className="capitalize text-[10px] sm:text-xs">
                    {req.leave_type}
                  </Badge>
                </TableCell>
              )}
              <TableCell className="text-xs sm:text-sm">
                {format(new Date(req.start_date), "MMM d")} -{" "}
                {format(new Date(req.end_date), "MMM d, yyyy")}
              </TableCell>
              <TableCell className="max-w-[150px] sm:max-w-[200px] truncate text-xs sm:text-sm hidden md:table-cell">
                {req.reason}
              </TableCell>
              <TableCell className="text-xs sm:text-sm hidden lg:table-cell">
                {format(new Date(req.created_at), "MMM d, yyyy")}
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-1.5 sm:gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onApprove(req.id)}
                    disabled={isProcessing}
                    className="h-7 sm:h-8 px-2 sm:px-3"
                  >
                    <Check className="h-3.5 w-3.5 sm:h-4 sm:w-4 sm:mr-1" />
                    <span className="hidden sm:inline">Approve</span>
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => onReject(req.id)}
                    disabled={isProcessing}
                    className="h-7 sm:h-8 px-2 sm:px-3"
                  >
                    <X className="h-3.5 w-3.5 sm:h-4 sm:w-4 sm:mr-1" />
                    <span className="hidden sm:inline">Reject</span>
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
