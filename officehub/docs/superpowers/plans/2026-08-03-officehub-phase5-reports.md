# Phase 5: Dashboards & Reports

## Overview
Build comprehensive reporting with export capabilities (CSV, PDF, Excel) and enhanced dashboard analytics.

## Tasks

### Task 1: Install Export Dependencies
- `npm install jspdf jspdf-autotable xlsx file-saver`
- `npm install -D @types/file-saver`

### Task 2: Create Export Utilities
- `lib/export/csv.ts` — generic CSV export utility
- `lib/export/pdf.ts` — PDF export using jspdf + jspdf-autotable
- `lib/export/excel.ts` — Excel export using xlsx
- `lib/export/types.ts` — shared export column config type

### Task 3: Create Reports API
- `app/api/reports/attendance/route.ts` — GET attendance report data (date range, user filter)
- `app/api/reports/leave/route.ts` — GET leave report data
- `app/api/reports/wfh/route.ts` — GET WFH report data

### Task 4: Create Report Hooks
- `hooks/use-reports.ts` — useAttendanceReport, useLeaveReport, useWfhReport

### Task 5: Create Report Components
- `components/reports/report-filters.tsx` — date range + employee/department filter
- `components/reports/attendance-report.tsx` — attendance report table with summary stats
- `components/reports/leave-report.tsx` — leave report table with breakdown by type
- `components/reports/wfh-report.tsx` — WFH report table
- `components/reports/export-buttons.tsx` — CSV/PDF/Excel export buttons

### Task 6: Create Reports Page
- New `app/(protected)/reports/page.tsx`
- Tabbed: Attendance | Leave | WFH
- Each tab: filters + report table + export buttons
- Admin/manager access only

### Task 7: Enhance Dashboard
- Add attendance trend chart (weekly bar chart using Recharts)
- Add leave usage pie chart
- Add team attendance summary for managers

### Task 8: Add Reports Nav Item
- Add to nav-items.tsx (manager/admin roles)

### Task 9: Final Verification
- Build, lint, typecheck
- Commit

## Dependencies
- Phase 3 (Employees) — DONE
- Phase 4 (Leave/WFH) — DONE
- recharts — already installed
- jspdf + jspdf-autotable — new
- xlsx — new
- file-saver + @types/file-saver — new
