"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { CalendarDays } from "lucide-react";

interface ReportFiltersProps {
  onFilter: (filters: { start_date?: string; end_date?: string }) => void;
  showEmployeeFilter?: boolean;
}

export function ReportFilters({ onFilter }: ReportFiltersProps) {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const handleApply = () => {
    onFilter({
      start_date: startDate || undefined,
      end_date: endDate || undefined,
    });
  };

  const handleClear = () => {
    setStartDate("");
    setEndDate("");
    onFilter({});
  };

  return (
    <div className="flex flex-wrap gap-4 items-end">
      <div className="space-y-2">
        <Label htmlFor="report-start">Start Date</Label>
        <Input
          id="report-start"
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="report-end">End Date</Label>
        <Input
          id="report-end"
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
        />
      </div>
      <Button onClick={handleApply}>
        <CalendarDays className="mr-2 h-4 w-4" />
        Apply
      </Button>
      <Button variant="outline" onClick={handleClear}>
        Clear
      </Button>
    </div>
  );
}
