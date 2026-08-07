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
  // Leave-specific
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
      <div className="text-center py-8 text-muted-foreground">
        No pending {type === "leave" ? "leave" : "WFH"} requests.
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Employee</TableHead>
          {type === "leave" && <TableHead>Type</TableHead>}
          <TableHead>Duration</TableHead>
          <TableHead>Reason</TableHead>
          <TableHead>Submitted</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {requests.map((req) => (
          <TableRow key={req.id}>
            <TableCell>
              <div className="flex items-center gap-3">
                <Avatar className="h-8 w-8">
                  <AvatarFallback>
                    {req.profiles?.full_name?.charAt(0) || "U"}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{req.profiles?.full_name || "Unknown"}</p>
                  <p className="text-xs text-muted-foreground">
                    {req.profiles?.employee_id || ""}
                  </p>
                </div>
              </div>
            </TableCell>
            {type === "leave" && (
              <TableCell>
                <Badge variant="outline" className="capitalize">
                  {req.leave_type}
                </Badge>
              </TableCell>
            )}
            <TableCell>
              {format(new Date(req.start_date), "MMM d")} -{" "}
              {format(new Date(req.end_date), "MMM d, yyyy")}
            </TableCell>
            <TableCell className="max-w-[200px] truncate">{req.reason}</TableCell>
            <TableCell>{format(new Date(req.created_at), "MMM d, yyyy")}</TableCell>
            <TableCell className="text-right">
              <div className="flex justify-end gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onApprove(req.id)}
                  disabled={isProcessing}
                >
                  <Check className="h-4 w-4 mr-1" />
                  Approve
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => onReject(req.id)}
                  disabled={isProcessing}
                >
                  <X className="h-4 w-4 mr-1" />
                  Reject
                </Button>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}