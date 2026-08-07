"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useDepartments } from "@/hooks/use-departments";

interface DepartmentSelectProps {
  value?: string;
  onChange: (value: string | null) => void;
  placeholder?: string;
}

export function DepartmentSelect({
  value,
  onChange,
  placeholder = "Select department",
}: DepartmentSelectProps) {
  const { data: departments } = useDepartments();

  return (
    <Select value={value} onValueChange={(v) => onChange(v as string | null)}>
      <SelectTrigger>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {departments?.map((dept) => (
          <SelectItem key={dept.id} value={dept.id}>
            {dept.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
