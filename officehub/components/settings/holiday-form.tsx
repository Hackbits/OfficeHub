"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCreateHoliday } from "@/hooks/use-holidays";
import { toast } from "sonner";
import { Plus } from "lucide-react";

export function HolidayForm() {
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [type, setType] = useState("national");
  const createHoliday = useCreateHoliday();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !date) return;

    try {
      await createHoliday.mutateAsync({ title: title.trim(), date, type });
      toast.success("Holiday added");
      setTitle("");
      setDate("");
    } catch {
      toast.error("Failed to add holiday");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-wrap gap-4 items-end">
      <div className="flex-1 min-w-[200px] space-y-2">
        <Label htmlFor="holiday-title">Holiday Name</Label>
        <Input
          id="holiday-title"
          placeholder="e.g. Independence Day"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="holiday-date">Date</Label>
        <Input
          id="holiday-date"
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />
      </div>
      <div className="space-y-2">
        <Label>Type</Label>
        <Select value={type} onValueChange={(v) => v && setType(v)}>
          <SelectTrigger className="w-[140px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="national">National</SelectItem>
            <SelectItem value="company">Company</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <Button type="submit" disabled={createHoliday.isPending || !title.trim() || !date}>
        <Plus className="mr-2 h-4 w-4" />
        Add
      </Button>
    </form>
  );
}
