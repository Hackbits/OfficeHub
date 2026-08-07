# Phase 4: WFH & Leave Management

## Overview
Implement Work-From-Home (WFH) and Leave request/approval workflows, leave balance tracking, and a team calendar view for managers.

## Tasks

### Task 1: Add leave_balances table
- Create migration `002_leave_balances.sql`
- Table: `leave_balances` (id, user_id, leave_type, year, total_days, used_days, created_at)
- Add RLS policies (users read own, managers read team, admin full access)
- Run migration in Supabase

### Task 2: Create Validation Schemas
- `lib/validations/leave.ts` — createLeaveRequestSchema (leave_type, start_date, end_date, reason)
- `lib/validations/wfh.ts` — createWfhRequestSchema (start_date, end_date, reason, notes)

### Task 3: Create Leave API Routes
- `app/api/leave/route.ts` — GET (list with filters), POST (create)
- `app/api/leave/[id]/route.ts` — GET (single)
- `app/api/leave/[id]/approve/route.ts` — PATCH (approve)
- `app/api/leave/[id]/reject/route.ts` — PATCH (reject)
- `app/api/leave/[id]/cancel/route.ts` — PATCH (cancel)
- `app/api/leave/balance/route.ts` — GET (user's balances)

### Task 4: Create WFH API Routes
- `app/api/wfh/route.ts` — GET (list), POST (create)
- `app/api/wfh/[id]/route.ts` — GET (single)
- `app/api/wfh/[id]/approve/route.ts` — PATCH (approve)
- `app/api/wfh/[id]/reject/route.ts` — PATCH (reject)
- `app/api/wfh/[id]/cancel/route.ts` — PATCH (cancel)

### Task 5: Create Leave & WFH Hooks
- `hooks/use-leave.ts` — useLeaveRequests, useCreateLeaveRequest, useApproveLeave, useRejectLeave, useCancelLeave, useLeaveBalance
- `hooks/use-wfh.ts` — useWfhRequests, useCreateWfhRequest, useApproveWfh, useRejectWfh, useCancelWfh

### Task 6: Create Leave Components
- `components/leave/leave-request-form.tsx` — form with leave type select, date range, reason
- `components/leave/leave-balance-card.tsx` — shows balances per type (casual=10, sick=10, paid=10, optional=2)
- `components/leave/leave-history-table.tsx` — table of past requests with status badges

### Task 7: Create WFH Components
- `components/wfh/wfh-request-form.tsx` — form with date range, reason, notes
- `components/wfh/wfh-history-table.tsx` — table of past requests with status badges

### Task 8: Create Approval Components
- `components/approvals/approval-table.tsx` — generic table for pending requests (used on both leave and wfh pages)

### Task 9: Create Leave Page
- Replace `app/(protected)/leave/page.tsx`
- Layout: sidebar (form + balance cards) + main content (history table + calendar)
- Calendar component: month view showing approved leave/wfh dates

### Task 10: Create WFH Page
- Replace `app/(protected)/wfh/page.tsx`
- Layout: sidebar (form) + main content (history table)

### Task 11: Create Approvals Page
- New `app/(protected)/approvals/page.tsx`
- Tabbed: "Leave Requests" | "WFH Requests"
- Each tab shows pending requests with approve/reject buttons (manager/admin only)
- Add nav item for Approvals

### Task 12: Update Dashboard
- Add pending approvals count widget
- Add upcoming leave/wfh summary

### Task 13: Final Verification
- Build, lint, typecheck
- Commit all changes

## Database Schema Addition

```sql
-- Leave Balances
create table public.leave_balances (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  leave_type text not null check (leave_type in ('casual', 'sick', 'paid', 'unpaid', 'optional')),
  year integer not null,
  total_days integer not null default 0,
  used_days integer not null default 0,
  created_at timestamptz default now(),
  unique(user_id, leave_type, year)
);

alter table public.leave_balances enable row level security;

create policy "Users can view own leave balances" on public.leave_balances
  for select using (auth.uid() = user_id);

create policy "Managers can view team leave balances" on public.leave_balances
  for select using (public.get_user_role() in ('manager', 'admin'));

create policy "Admins can manage leave balances" on public.leave_balances
  for all using (public.get_user_role() = 'admin');
```

## Default Balances
- Casual: 10 days
- Sick: 10 days
- Paid: 10 days
- Unpaid: unlimited (no balance tracking)
- Optional: 2 days

## Dependencies
- Phase 3 (Employees) — DONE
- shadcn/ui components: Badge, Button, Card, Input, Label, Select, Table, Tabs, Avatar
- date-fns for calendar/date formatting
- sonner for toast notifications
