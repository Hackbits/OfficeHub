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
    <div className="space-y-4 sm:space-y-6">
      <h1 className="text-xl sm:text-2xl font-bold">Leave Management</h1>

      <div className="grid gap-4 sm:gap-6 grid-cols-1 lg:grid-cols-3">
        {/* Sidebar */}
        <div className="space-y-4 sm:space-y-6 order-2 lg:order-1">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm sm:text-base">Request Leave</CardTitle>
            </CardHeader>
            <CardContent className="pb-4 sm:pb-6">
              <LeaveRequestForm
                onSubmit={handleSubmit}
                isLoading={createLeave.isPending}
              />
            </CardContent>
          </Card>

          <LeaveBalanceCard />
        </div>

        {/* Main Content */}
        <div className="lg:col-span-2 order-1 lg:order-2">
          <Card>
            <CardContent className="p-0">
              <Tabs defaultValue="all" className="w-full">
                <div className="px-3 sm:px-4 pt-3 sm:pt-4">
                  <TabsList className="w-full sm:w-auto">
                    <TabsTrigger value="all" onClick={() => setStatusFilter("")} className="text-xs sm:text-sm">
                      All
                    </TabsTrigger>
                    <TabsTrigger value="pending" onClick={() => setStatusFilter("pending")} className="text-xs sm:text-sm">
                      Pending
                    </TabsTrigger>
                    <TabsTrigger value="approved" onClick={() => setStatusFilter("approved")} className="text-xs sm:text-sm">
                      Approved
                    </TabsTrigger>
                    <TabsTrigger value="rejected" onClick={() => setStatusFilter("rejected")} className="text-xs sm:text-sm">
                      Rejected
                    </TabsTrigger>
                  </TabsList>
                </div>
                <TabsContent value="all" className="mt-0">
                  {isLoading ? (
                    <div className="p-4 sm:p-6 space-y-2">
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
                    <div className="p-4 sm:p-6 space-y-2">
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
                    <div className="p-4 sm:p-6 space-y-2">
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
                    <div className="p-4 sm:p-6 space-y-2">
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
