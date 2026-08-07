"use client";

import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useDepartments, useUpdateDepartment, useDeleteDepartment } from "@/hooks/use-departments";
import { toast } from "sonner";
import { Pencil, Trash2, Check, X } from "lucide-react";

export function DepartmentTable() {
  const { data: departments, isLoading } = useDepartments();
  const updateDepartment = useUpdateDepartment();
  const deleteDepartment = useDeleteDepartment();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");

  const handleEdit = (id: string, name: string) => {
    setEditingId(id);
    setEditName(name);
  };

  const handleSave = async (id: string) => {
    try {
      await updateDepartment.mutateAsync({ id, name: editName });
      toast.success("Department updated");
      setEditingId(null);
    } catch {
      toast.error("Failed to update department");
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete department "${name}"?`)) return;
    try {
      await deleteDepartment.mutateAsync(id);
      toast.success("Department deleted");
    } catch {
      toast.error("Failed to delete department");
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
          <TableHead>Department Name</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {departments?.map((dept) => (
          <TableRow key={dept.id}>
            <TableCell>
              {editingId === dept.id ? (
                <Input
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="max-w-[300px]"
                />
              ) : (
                dept.name
              )}
            </TableCell>
            <TableCell className="text-right">
              {editingId === dept.id ? (
                <div className="flex justify-end gap-2">
                  <Button size="icon" variant="ghost" onClick={() => handleSave(dept.id)}>
                    <Check className="h-4 w-4" />
                  </Button>
                  <Button size="icon" variant="ghost" onClick={() => setEditingId(null)}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <div className="flex justify-end gap-2">
                  <Button size="icon" variant="ghost" onClick={() => handleEdit(dept.id, dept.name)}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button size="icon" variant="ghost" onClick={() => handleDelete(dept.id, dept.name)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </TableCell>
          </TableRow>
        ))}
        {departments?.length === 0 && (
          <TableRow>
            <TableCell colSpan={2} className="text-center text-muted-foreground py-8">
              No departments yet. Create one above.
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
}
