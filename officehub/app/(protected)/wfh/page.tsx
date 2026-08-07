"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { WfhRequestForm } from "@/components/wfh/wfh-request-form";
import { WfhHistoryTable } from "@/components/wfh/wfh-history-table";
import { useWfhRequests, useCreateWfhRequest } from "@/hooks/use-wfh";
import { toast } from "sonner";

export default function WfhPage() {
  const [statusFilter, setStatusFilter] = useState("");
  const { data: wfhRequests, isLoading } = useWfhRequests({
    status: statusFilter || undefined,
  });
  const createWfh = useCreateWfhRequest();

  const handleSubmit = async (data: Record<string, unknown>) => {
    try {
      await createWfh.mutateAsync(data);
      toast.success("WFH request submitted successfully");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to submit WFH request");
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Work From Home</h1>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Request WFH</CardTitle>
            </CardHeader>
            <CardContent>
              <WfhRequestForm
                onSubmit={handleSubmit}
                isLoading={createWfh.isPending}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">WFH Guidelines</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground space-y-2">
              <p>• Submit requests at least 1 day in advance</p>
              <p>• Manager approval is required</p>
              <p>• Maximum 3 consecutive WFH days</p>
              <p>• Must be available during working hours</p>
            </CardContent>
          </Card>
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
                    <WfhHistoryTable requests={wfhRequests || []} />
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
                    <WfhHistoryTable requests={wfhRequests || []} />
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
                    <WfhHistoryTable requests={wfhRequests || []} />
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
                    <WfhHistoryTable requests={wfhRequests || []} />
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
