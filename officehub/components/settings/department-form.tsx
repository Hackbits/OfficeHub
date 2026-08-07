"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useCreateDepartment } from "@/hooks/use-departments";
import { toast } from "sonner";
import { Plus } from "lucide-react";

export function DepartmentForm() {
  const [name, setName] = useState("");
  const createDepartment = useCreateDepartment();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    try {
      await createDepartment.mutateAsync({ name: name.trim() });
      toast.success("Department created");
      setName("");
    } catch {
      toast.error("Failed to create department");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-4 items-end">
      <div className="flex-1 space-y-2">
        <Label htmlFor="dept-name">New Department</Label>
        <Input
          id="dept-name"
          placeholder="Department name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </div>
      <Button type="submit" disabled={createDepartment.isPending || !name.trim()}>
        <Plus className="mr-2 h-4 w-4" />
        {createDepartment.isPending ? "Adding..." : "Add"}
      </Button>
    </form>
  );
}
