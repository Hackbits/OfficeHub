"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ApprovalTable } from "@/components/approvals/approval-table";
import { useLeaveRequests, useApproveLeave, useRejectLeave } from "@/hooks/use-leave";
import { useWfhRequests, useApproveWfh, useRejectWfh } from "@/hooks/use-wfh";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";
import { ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function ApprovalsPage() {
  const { profile } = useAuth();

  const { data: pendingLeave, isLoading: loadingLeave } = useLeaveRequests({ status: "pending" });
  const { data: pendingWfh, isLoading: loadingWfh } = useWfhRequests({ status: "pending" });

  const approveLeave = useApproveLeave();
  const rejectLeave = useRejectLeave();
  const approveWfh = useApproveWfh();
  const rejectWfh = useRejectWfh();

  if (profile?.role !== "manager" && profile?.role !== "admin") {
    return (
      <div className="flex flex-col items-center justify-center py-8 sm:py-12 px-4 space-y-4">
        <ShieldAlert className="h-10 w-10 sm:h-12 sm:w-12 text-muted-foreground" />
        <h2 className="text-lg sm:text-xl font-semibold text-center">Access Denied</h2>
        <p className="text-muted-foreground text-sm text-center">Only managers can access approvals.</p>
        <Link href="/dashboard">
          <Button>Back to Dashboard</Button>
        </Link>
      </div>
    );
  }

  const handleApproveLeave = async (id: string) => {
    try {
      await approveLeave.mutateAsync(id);
      toast.success("Leave request approved");
    } catch {
      toast.error("Failed to approve leave request");
    }
  };

  const handleRejectLeave = async (id: string) => {
    try {
      await rejectLeave.mutateAsync(id);
      toast.success("Leave request rejected");
    } catch {
      toast.error("Failed to reject leave request");
    }
  };

  const handleApproveWfh = async (id: string) => {
    try {
      await approveWfh.mutateAsync(id);
      toast.success("WFH request approved");
    } catch {
      toast.error("Failed to approve WFH request");
    }
  };

  const handleRejectWfh = async (id: string) => {
    try {
      await rejectWfh.mutateAsync(id);
      toast.success("WFH request rejected");
    } catch {
      toast.error("Failed to reject WFH request");
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <h1 className="text-xl sm:text-2xl font-bold">Approvals</h1>

      <Card>
        <CardContent className="p-0">
          <Tabs defaultValue="leave" className="w-full">
            <div className="px-3 sm:px-4 pt-3 sm:pt-4">
              <TabsList className="w-full sm:w-auto">
                <TabsTrigger value="leave" className="text-xs sm:text-sm">
                  Leave
                  {pendingLeave && pendingLeave.length > 0 && (
                    <span className="ml-1.5 sm:ml-2 px-1.5 sm:px-2 py-0.5 text-[10px] sm:text-xs bg-primary/10 text-primary rounded-full">
                      {pendingLeave.length}
                    </span>
                  )}
                </TabsTrigger>
                <TabsTrigger value="wfh" className="text-xs sm:text-sm">
                  WFH
                  {pendingWfh && pendingWfh.length > 0 && (
                    <span className="ml-1.5 sm:ml-2 px-1.5 sm:px-2 py-0.5 text-[10px] sm:text-xs bg-primary/10 text-primary rounded-full">
                      {pendingWfh.length}
                    </span>
                  )}
                </TabsTrigger>
              </TabsList>
            </div>
            <TabsContent value="leave" className="mt-0">
              {loadingLeave ? (
                <div className="p-4 sm:p-6 space-y-2">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="h-16 animate-pulse bg-muted rounded" />
                  ))}
                </div>
              ) : (
                <ApprovalTable
                  requests={(pendingLeave || []).map((r) => ({
                    ...r,
                    leave_type: r.leave_type,
                  }))}
                  type="leave"
                  onApprove={handleApproveLeave}
                  onReject={handleRejectLeave}
                  isProcessing={approveLeave.isPending || rejectLeave.isPending}
                />
              )}
            </TabsContent>
            <TabsContent value="wfh" className="mt-0">
              {loadingWfh ? (
                <div className="p-4 sm:p-6 space-y-2">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="h-16 animate-pulse bg-muted rounded" />
                  ))}
                </div>
              ) : (
                <ApprovalTable
                  requests={pendingWfh || []}
                  type="wfh"
                  onApprove={handleApproveWfh}
                  onReject={handleRejectWfh}
                  isProcessing={approveWfh.isPending || rejectWfh.isPending}
                />
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
