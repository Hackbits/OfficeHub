"use client";

import { Button } from "@/components/ui/button";
import { exportToCSV } from "@/lib/export/csv";
import { exportToPDF } from "@/lib/export/pdf";
import { exportToExcel } from "@/lib/export/excel";
import type { ExportColumn } from "@/lib/export/types";
import { Download } from "lucide-react";

interface ExportButtonsProps {
  data: Record<string, unknown>[];
  columns: ExportColumn[];
  filename: string;
  title: string;
}

export function ExportButtons({ data, columns, filename, title }: ExportButtonsProps) {
  return (
    <div className="flex gap-2">
      <Button variant="outline" size="sm" onClick={() => exportToCSV(data, columns, filename)}>
        <Download className="mr-2 h-4 w-4" />
        CSV
      </Button>
      <Button variant="outline" size="sm" onClick={() => exportToPDF(data, columns, title, filename)}>
        <Download className="mr-2 h-4 w-4" />
        PDF
      </Button>
      <Button variant="outline" size="sm" onClick={() => exportToExcel(data, columns, filename)}>
        <Download className="mr-2 h-4 w-4" />
        Excel
      </Button>
    </div>
  );
}
