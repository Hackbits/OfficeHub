"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useHolidays, useDeleteHoliday } from "@/hooks/use-holidays";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";
import { format } from "date-fns";

export function HolidayTable() {
  const { data: holidays, isLoading } = useHolidays();
  const deleteHoliday = useDeleteHoliday();

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Remove holiday "${title}"?`)) return;
    try {
      await deleteHoliday.mutateAsync(id);
      toast.success("Holiday removed");
    } catch {
      toast.error("Failed to remove holiday");
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-2">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-10 animate-pulse bg-muted rounded" />
        ))}
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Title</TableHead>
          <TableHead>Date</TableHead>
          <TableHead>Type</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {holidays?.map((holiday) => (
          <TableRow key={holiday.id}>
            <TableCell className="font-medium">{holiday.title}</TableCell>
            <TableCell>{format(new Date(holiday.date), "MMMM d, yyyy")}</TableCell>
            <TableCell>
              <Badge variant="outline" className="capitalize">{holiday.type}</Badge>
            </TableCell>
            <TableCell className="text-right">
              <Button
                size="icon"
                variant="ghost"
                onClick={() => handleDelete(holiday.id, holiday.title)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </TableCell>
          </TableRow>
        ))}
        {holidays?.length === 0 && (
          <TableRow>
            <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
              No holidays configured.
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
}
