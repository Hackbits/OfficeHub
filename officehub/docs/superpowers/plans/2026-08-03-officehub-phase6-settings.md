# Phase 6: Admin Settings

## Overview
Build admin settings for office configuration, department management, and holiday management.

## Tasks

### Task 1: Add office_settings table + migration
- Create migration `003_office_settings.sql`
- Table: `office_settings` (id, key, value, updated_by, updated_at) — key-value store
- Add RLS: admin full access, everyone read
- Update `getOfficeSettings()` in `lib/supabase/queries.ts` to read from DB with fallback to defaults

### Task 2: Create Validation Schemas
- `lib/validations/settings.ts` — office settings schema
- `lib/validations/department.ts` — department schema

### Task 3: Create Settings API
- `app/api/settings/route.ts` — GET (all settings), PUT (bulk update)
- `app/api/departments/route.ts` — GET (list), POST (create)
- `app/api/departments/[id]/route.ts` — PATCH (update), DELETE (soft delete)
- `app/api/holidays/route.ts` — GET (list), POST (create)
- `app/api/holidays/[id]/route.ts` — DELETE (remove)

### Task 4: Create Settings Hooks
- `hooks/use-settings.ts` — useOfficeSettings, useUpdateSettings
- `hooks/use-departments.ts` — already exists (from Phase 3), verify it covers CRUD
- `hooks/use-holidays.ts` — useHolidays, useCreateHoliday, useDeleteHoliday

### Task 5: Create Settings Components
- `components/settings/office-settings-form.tsx` — geofence, working hours, office hours form
- `components/settings/department-table.tsx` — department list with edit/delete
- `components/settings/department-form.tsx` — create/edit department form
- `components/settings/holiday-table.tsx` — holiday list with delete
- `components/settings/holiday-form.tsx` — add holiday form (title, date, type)

### Task 6: Create Settings Page
- Replace `app/(protected)/settings/page.tsx`
- Tabbed: Office | Departments | Holidays
- Admin-only access
- Office tab: settings form for coordinates, geofence, working hours
- Departments tab: table + create form
- Holidays tab: table + add form

### Task 7: Final Verification
- Build, lint, typecheck
- Commit all changes

## Database Schema Addition

```sql
-- Office Settings (key-value)
create table public.office_settings (
  id uuid primary key default uuid_generate_v4(),
  key text unique not null,
  value text not null,
  updated_by uuid references public.profiles(id),
  updated_at timestamptz default now()
);

alter table public.office_settings enable row level security;

create policy "Everyone can read office settings" on public.office_settings
  for select using (true);

create policy "Admins can manage office settings" on public.office_settings
  for all using (public.get_user_role() = 'admin');

create index idx_office_settings_key on public.office_settings(key);
```

Default settings to seed:
- `office_latitude` = "22.80927076763711"
- `office_longitude` = "86.21127374470689"
- `geofence_radius` = "100"
- `office_start` = "10:15"
- `office_end` = "19:30"
- `standard_hours` = "9"
- `late_threshold_minutes` = "15"
- `overtime_threshold` = "8"
- `half_day_max` = "4"

## Dependencies
- Phase 3 (Employees) — DONE
- Phase 4 (Leave/WFH) — DONE
- Phase 5 (Reports) — DONE
