"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AttendanceHistoryTable } from "@/components/attendance/attendance-history-table";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function AttendanceHistoryPage() {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [filterKey, setFilterKey] = useState(0);

  const handleFilter = () => {
    setFilterKey((k) => k + 1);
  };

  const handleClear = () => {
    setStartDate("");
    setEndDate("");
    setFilterKey((k) => k + 1);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/attendance" className="inline-flex size-8 items-center justify-center rounded-lg hover:bg-muted hover:text-foreground">
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <h1 className="text-2xl font-bold">Attendance History</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">Filter by Date Range</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4 items-end">
            <div className="space-y-2">
              <Label htmlFor="start">Start Date</Label>
              <Input
                id="start"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="end">End Date</Label>
              <Input
                id="end"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
            <Button onClick={handleFilter}>Apply Filter</Button>
            <Button variant="outline" onClick={handleClear}>
              Clear
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          <AttendanceHistoryTable
            key={filterKey}
            startDate={startDate || undefined}
            endDate={endDate || undefined}
          />
        </CardContent>
      </Card>
    </div>
  );
}