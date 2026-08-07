"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { OfficeSettingsForm } from "@/components/settings/office-settings-form";
import { DepartmentTable } from "@/components/settings/department-table";
import { DepartmentForm } from "@/components/settings/department-form";
import { HolidayTable } from "@/components/settings/holiday-table";
import { HolidayForm } from "@/components/settings/holiday-form";
import { useAuth } from "@/hooks/use-auth";
import { ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Building2, CalendarDays, Settings } from "lucide-react";

export default function SettingsPage() {
  const { profile } = useAuth();

  if (profile?.role !== "admin") {
    return (
      <div className="flex flex-col items-center justify-center py-12 space-y-4">
        <ShieldAlert className="h-12 w-12 text-muted-foreground" />
        <h2 className="text-xl font-semibold">Access Denied</h2>
        <p className="text-muted-foreground">Only administrators can access settings.</p>
        <Link href="/dashboard">
          <Button>Back to Dashboard</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Settings</h1>

      <Tabs defaultValue="office" className="w-full">
        <TabsList>
          <TabsTrigger value="office" className="gap-2">
            <Settings className="h-4 w-4" />
            Office
          </TabsTrigger>
          <TabsTrigger value="departments" className="gap-2">
            <Building2 className="h-4 w-4" />
            Departments
          </TabsTrigger>
          <TabsTrigger value="holidays" className="gap-2">
            <CalendarDays className="h-4 w-4" />
            Holidays
          </TabsTrigger>
        </TabsList>

        <TabsContent value="office">
          <OfficeSettingsForm />
        </TabsContent>

        <TabsContent value="departments" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Add Department</CardTitle>
            </CardHeader>
            <CardContent>
              <DepartmentForm />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Departments</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <DepartmentTable />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="holidays" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Add Holiday</CardTitle>
            </CardHeader>
            <CardContent>
              <HolidayForm />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Holidays</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <HolidayTable />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
