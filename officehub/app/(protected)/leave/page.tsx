"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LeaveRequestForm } from "@/components/leave/leave-request-form";
import { LeaveBalanceCard } from "@/components/leave/leave-balance-card";
import { LeaveHistoryTable } from "@/components/leave/leave-history-table";
import { useLeaveRequests, useCreateLeaveRequest } from "@/hooks/use-leave";
import { toast } from "sonner";

export default function LeavePage() {
  const [statusFilter, setStatusFilter] = useState("");
  const { data: leaveRequests, isLoading } = useLeaveRequests({
    status: statusFilter || undefined,
  });
  const createLeave = useCreateLeaveRequest();

  const handleSubmit = async (data: Record<string, unknown>) => {
    try {
      await createLeave.mutateAsync(data);
      toast.success("Leave request submitted successfully");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to submit leave request");
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Leave Management</h1>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Request Leave</CardTitle>
            </CardHeader>
            <CardContent>
              <LeaveRequestForm
                onSubmit={handleSubmit}
                isLoading={createLeave.isPending}
              />
            </CardContent>
          </Card>

          <LeaveBalanceCard />
        </div>

        {/* Main Content */}
        <div className="lg:col-span-2">
          <Card>
            <CardContent className="p-0">
              <Tabs defaultValue="all" className="w-full">
                <div className="px-4 pt-4">
                  <TabsList>
                    <TabsTrigger value="all" onClick={() => setStatusFilter("")}>
                      All
                    </TabsTrigger>
                    <TabsTrigger value="pending" onClick={() => setStatusFilter("pending")}>
                      Pending
                    </TabsTrigger>
                    <TabsTrigger value="approved" onClick={() => setStatusFilter("approved")}>
                      Approved
                    </TabsTrigger>
                    <TabsTrigger value="rejected" onClick={() => setStatusFilter("rejected")}>
                      Rejected
                    </TabsTrigger>
                  </TabsList>
                </div>
                <TabsContent value="all" className="mt-0">
                  {isLoading ? (
                    <div className="p-6 space-y-2">
                      {[...Array(5)].map((_, i) => (
                        <div key={i} className="h-12 animate-pulse bg-muted rounded" />
                      ))}
                    </div>
                  ) : (
                    <LeaveHistoryTable requests={leaveRequests || []} />
                  )}
                </TabsContent>
                <TabsContent value="pending" className="mt-0">
                  {isLoading ? (
                    <div className="p-6 space-y-2">
                      {[...Array(3)].map((_, i) => (
                        <div key={i} className="h-12 animate-pulse bg-muted rounded" />
                      ))}
                    </div>
                  ) : (
                    <LeaveHistoryTable requests={leaveRequests || []} />
                  )}
                </TabsContent>
                <TabsContent value="approved" className="mt-0">
                  {isLoading ? (
                    <div className="p-6 space-y-2">
                      {[...Array(3)].map((_, i) => (
                        <div key={i} className="h-12 animate-pulse bg-muted rounded" />
                      ))}
                    </div>
                  ) : (
                    <LeaveHistoryTable requests={leaveRequests || []} />
                  )}
                </TabsContent>
                <TabsContent value="rejected" className="mt-0">
                  {isLoading ? (
                    <div className="p-6 space-y-2">
                      {[...Array(3)].map((_, i) => (
                        <div key={i} className="h-12 animate-pulse bg-muted rounded" />
                      ))}
                    </div>
                  ) : (
                    <LeaveHistoryTable requests={leaveRequests || []} />
                  )}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
