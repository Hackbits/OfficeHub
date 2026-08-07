# OfficeHub — Employee Attendance & Workforce Management System

## Design Document

**Date:** 2026-08-03
**Status:** Approved
**Version:** 1.0

---

## 1. Architecture & Tech Stack

### Frontend
- **Framework:** Next.js 15 (App Router)
- **UI Library:** React 19
- **Language:** TypeScript (strict mode)
- **Styling:** Tailwind CSS v4
- **Components:** shadcn/ui (built on Radix UI + Tailwind)
- **Icons:** Lucide React
- **Forms:** React Hook Form + Zod validation
- **Server State:** TanStack Query
- **Charts:** Recharts

### Backend (Supabase)
- **Database:** PostgreSQL with Row Level Security (RLS)
- **Auth:** Supabase Auth (JWT-based sessions)
- **Storage:** Supabase Storage (profile pictures)
- **Realtime:** Supabase Realtime (live notifications)
- **Edge Functions:** Future extensibility

### Deployment
- **Frontend:** Vercel
- **Backend:** Supabase (hosted)

### Key Architecture Decisions
- Server Components for static pages (better SEO, performance)
- Client Components only for interactive widgets (check-in/out, forms, modals)
- API route handlers in Next.js for complex logic
- Supabase client for direct DB access where RLS handles security
- Middleware for route protection based on role

---

## 2. Database Schema

### profiles (extends Supabase auth.users)
| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PK, FK → auth.users |
| employee_id | TEXT | UNIQUE, auto-generated (EMP-001) |
| full_name | TEXT | NOT NULL |
| email | TEXT | NOT NULL |
| phone | TEXT | |
| department_id | UUID | FK → departments |
| manager_id | UUID | FK → profiles (self-ref) |
| designation | TEXT | |
| joining_date | DATE | |
| status | ENUM | active, inactive, terminated |
| office_location | TEXT | |
| avatar_url | TEXT | |
| role | ENUM | employee, manager, admin |
| created_at | TIMESTAMPTZ | DEFAULT now() |

### departments
| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PK |
| name | TEXT | UNIQUE |
| created_at | TIMESTAMPTZ | DEFAULT now() |

### attendance
| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PK |
| user_id | UUID | FK → profiles |
| date | DATE | NOT NULL |
| check_in | TIMESTAMPTZ | |
| check_out | TIMESTAMPTZ | |
| working_hours | DECIMAL(4,2) | |
| status | ENUM | present, absent, wfh, leave, holiday, weekend, half_day, late, overtime |
| latitude | DECIMAL | |
| longitude | DECIMAL | |
| ip_address | TEXT | |
| device_info | TEXT | |
| created_at | TIMESTAMPTZ | DEFAULT now() |

### wfh_requests
| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PK |
| user_id | UUID | FK → profiles |
| start_date | DATE | NOT NULL |
| end_date | DATE | NOT NULL |
| reason | TEXT | NOT NULL |
| notes | TEXT | |
| status | ENUM | pending, approved, rejected, cancelled |
| approved_by | UUID | FK → profiles |
| created_at | TIMESTAMPTZ | DEFAULT now() |

### leave_requests
| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PK |
| user_id | UUID | FK → profiles |
| leave_type | ENUM | casual, sick, paid, unpaid, optional |
| start_date | DATE | NOT NULL |
| end_date | DATE | NOT NULL |
| reason | TEXT | NOT NULL |
| status | ENUM | pending, approved, rejected, cancelled |
| approved_by | UUID | FK → profiles |
| created_at | TIMESTAMPTZ | DEFAULT now() |

### holidays
| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PK |
| title | TEXT | NOT NULL |
| date | DATE | UNIQUE |
| type | ENUM | national, company |
| created_at | TIMESTAMPTZ | DEFAULT now() |

### notifications
| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PK |
| user_id | UUID | FK → profiles |
| title | TEXT | NOT NULL |
| message | TEXT | NOT NULL |
| read | BOOLEAN | DEFAULT false |
| type | ENUM | wfh, leave, attendance, system |
| link | TEXT | (optional deep link) |
| created_at | TIMESTAMPTZ | DEFAULT now() |

### Key Relationships
- profiles.manager_id → profiles.id (self-referencing hierarchy)
- attendance.user_id → profiles.id
- wfh_requests.approved_by → profiles.id
- leave_requests.approved_by → profiles.id

---

## 3. Authentication & Authorization

### Auth Flow
1. **Sign Up:** Name + email + password → Supabase Auth creates user → Trigger creates profiles row (role: employee)
2. **Login:** Email + password → JWT (access + refresh token) → httpOnly cookie
3. **Session:** JWT contains user_id and role → Middleware checks on every request
4. **Password Reset:** Supabase Auth email magic link
5. **Logout:** Clear cookie → redirect to /login

### Route Protection (middleware.ts)
| Route | Access |
|-------|--------|
| / | Redirect to /dashboard |
| /login | Public |
| /register | Admin only |
| /dashboard | All authenticated |
| /attendance | Employee, Manager, Admin |
| /wfh | Employee, Manager, Admin |
| /leave | Employee, Manager, Admin |
| /employees | Manager (team), Admin (all) |
| /settings | Admin only |
| /profile | All authenticated |

### RLS Policies
| Table | Employee | Manager | Admin |
|-------|----------|---------|-------|
| profiles | SELECT own | SELECT team | ALL |
| attendance | SELECT own | SELECT team | ALL |
| wfh_requests | INSERT/SELECT own | SELECT team, UPDATE approve/reject | ALL |
| leave_requests | INSERT/SELECT own | SELECT team, UPDATE approve/reject | ALL |
| holidays | SELECT | SELECT | ALL |
| notifications | SELECT own | SELECT own | ALL |

Manager identification: profiles.manager_id links employee to manager.

---

## 4. Attendance Module

### Check-In Flow
1. User clicks "Check In"
2. Browser requests GPS coordinates
3. Sends { lat, lng, device_info, ip_address } to /api/attendance/check-in
4. Server validates:
   - No duplicate check-in for today
   - GPS distance from office ≤ geofence radius
   - Not a holiday or weekend
   - If WFH approved → skip GPS check
5. Valid: INSERT attendance row (status: present)
6. GPS outside radius: REJECT with "Outside office geofence"

### Check-Out Flow
1. User clicks "Check Out"
2. UPDATE attendance row: check_out = now()
3. Calculate working_hours = (check_out - check_in).hours
4. If working_hours ≥ 8: status stays present
5. If working_hours < 4: status = half_day
6. If late arrival detected: status = late

### Late Arrival Detection
- Office start time configurable (default: 09:30)
- If check_in > office_start + late_threshold → mark as late

### Working Hours Rules (configurable)
- Standard day: 8 hours
- Late threshold: 15 minutes
- Overtime threshold: > 8 hours

### WFH Attendance
- If today has approved WFH → GPS validation skipped
- Check-in from any location
- Status marked as wfh

### Auto-Marks
- End of day: no check-in → status = absent
- Holidays: auto-mark all as holiday
- Weekends: auto-mark as weekend

---

## 5. WFH & Leave Management

### WFH Request Flow
1. Employee submits: start_date, end_date, reason, notes
2. Validates: dates not in past, end ≥ start, no overlap
3. INSERT wfh_requests (status: pending)
4. INSERT notification to manager
5. Manager approves/rejects
6. If approved: UPDATE status, INSERT notification to employee

### WFH Rules
- Max consecutive WFH days: 5 (configurable)
- Can cancel pending requests
- Approved WFH disables GPS validation for date range

### Leave Request Flow
1. Employee submits: leave_type, start_date, end_date, reason
2. Validates: sufficient balance, dates not in past, no overlap
3. INSERT leave_requests (status: pending)
4. INSERT notification to manager
5. Manager approves/rejects
6. If approved: attendance auto-marked as leave

### Leave Types & Balances
| Type | Annual Balance |
|------|---------------|
| Casual | 10 days |
| Sick | 10 days |
| Paid | 10 days |
| Unpaid | unlimited |
| Optional | 2 days |

### Leave Balance Calculation
- Balance = allocated - (approved leaves for current year)
- Prorated for mid-year joins
- Admin can manually adjust

---

## 6. Employee Management

### Admin Capabilities
- **Create:** Name, email, phone, department, designation, manager, joining_date, office_location
- **Update:** All profile fields (admin), limited fields (employee self-service)
- **Disable:** status = 'inactive'
- **Delete:** Hard delete with confirmation, deactivates Auth user
- **Auto-generate:** employee_id (EMP-001, EMP-002...)

### Employee List
- Searchable table with filters (department, status, manager)
- Columns: avatar, name, employee_id, department, designation, status, join date
- Pagination: 20 per page

### Profile Page
- Employee: edit own profile, upload avatar, change password
- Manager: view team members, quick links to approve requests
- Admin: full edit access, view audit log

---

## 7. Dashboard & Reports

### Employee Dashboard
- Today's attendance status with check-in/out button
- Working hours counter
- Leave balance summary
- Upcoming holidays
- Monthly attendance chart (Recharts)
- Recent attendance history

### Manager Dashboard
- Team overview (present/absent/WFH/leave counts)
- Pending WFH and leave requests
- Team attendance table
- Weekly attendance trend chart

### Admin Dashboard
- Total employees, present, absent, WFH, on leave, late counts
- Department-wise attendance (bar chart)
- Monthly trends (line chart)
- Leave distribution (pie chart)
- Recent activity feed

### Reports
| Report Type | Filters | Export Formats |
|-------------|---------|----------------|
| Daily | Date | CSV, PDF, Excel |
| Weekly | Date range | CSV, PDF, Excel |
| Monthly | Month/Year | CSV, PDF, Excel |
| Department | Department, date range | CSV, PDF, Excel |
| Individual | Employee, date range | CSV, PDF, Excel |

### Export Implementation
- CSV: client-side Blob generation
- PDF: jspdf + jspdf-autotable
- Excel: xlsx library

---

## 8. Admin Settings & Holiday Calendar

### Office Settings
- Office location (lat/lng)
- Geofence radius (meters)
- Working hours (start/end time)
- Standard hours, late threshold, overtime threshold

### Leave Policies
- Casual: 10 days/year
- Sick: 10 days/year
- Paid: 10 days/year
- Optional: 2 days/year
- Max consecutive WFH: 5 days

### Holiday Calendar
- CRUD for holidays (title, date, type: national/company)
- Bulk import via CSV
- Auto-attendance marking on holidays

---

## 9. Notifications

### Notification Events
| Event | Target | Message |
|-------|--------|---------|
| WFH submitted | Manager | "[Name] requested WFH [dates]" |
| WFH approved | Employee | "Your WFH [dates] has been approved" |
| WFH rejected | Employee | "Your WFH [dates] was rejected" |
| Leave submitted | Manager | "[Name] requested leave [dates]" |
| Leave approved | Employee | "Your leave [dates] has been approved" |
| Leave rejected | Employee | "Your leave [dates] was rejected" |
| Late check-in | Employee | "You checked in late today" |
| Missing check-out | Employee | "You forgot to check out today" |

### Notification UI
- Bell icon with unread count badge
- Dropdown panel (recent 20)
- Mark as read / mark all as read
- Type icon + link to relevant page
- Realtime updates via Supabase Realtime

---

## 10. Aesthetic Direction

**Style:** Minimal & Warm
- Soft neutrals (warm grays, off-whites)
- Gentle contrast (no harsh blacks)
- Approachable feel suitable for HR/workforce management
- Clean typography with warm undertones
- Subtle shadows and rounded corners
- Consistent 8px spacing grid

---

## 11. Project Structure

```
officehub/
├── app/
│   ├── (auth)/
│   │   ├── login/
│   │   └── register/
│   ├── (protected)/
│   │   ├── dashboard/
│   │   ├── attendance/
│   │   ├── leave/
│   │   ├── wfh/
│   │   ├── employees/
│   │   ├── profile/
│   │   ├── settings/
│   │   └── notifications/
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── ui/           (shadcn/ui)
│   ├── dashboard/
│   ├── attendance/
│   ├── forms/
│   ├── layout/
│   └── shared/
├── lib/
│   ├── supabase/
│   │   ├── client.ts
│   │   ├── server.ts
│   │   └── middleware.ts
│   ├── auth/
│   ├── validations/
│   ├── utils/
│   └── constants/
├── hooks/
├── types/
├── public/
├── middleware.ts
└── package.json
```

---

## 12. Non-Functional Requirements

- Mobile-first responsive UI
- Secure authentication with JWT
- Role-based access control (RLS + middleware)
- Audit logging for critical actions
- Scalable modular architecture
- TypeScript-first development
- Server Components by default
- Reusable UI components
- Dark mode support (future)
- WCAG accessibility compliance

---

## 13. Future Roadmap

### Phase 2
- QR Code Check-In
- Face Recognition Attendance
- Shift Scheduling
- Attendance Corrections
- Payroll Integration
- Push/Email Notifications

### Phase 3
- Asset Management
- Expense Claims
- Performance Reviews
- OKRs
- Visitor Management
- Recruitment
- Multi-Tenant Support
