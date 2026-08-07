# OfficeHub Phase 1: Foundation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Scaffold the Next.js project with Supabase auth, database schema, route protection, and a responsive shell layout with sidebar navigation.

**Architecture:** Next.js 15 App Router with Server Components by default. Supabase for auth/database. shadcn/ui for components. Middleware for route protection. Layout with collapsible sidebar and top header.

**Tech Stack:** Next.js 15, React 19, TypeScript, Tailwind CSS v4, shadcn/ui, Supabase JS, Lucide React, React Context

---

## File Structure

```
officehub/
├── app/
│   ├── (auth)/
│   │   ├── login/
│   │   │   └── page.tsx
│   │   ├── register/
│   │   │   └── page.tsx
│   │   └── layout.tsx
│   ├── (protected)/
│   │   ├── dashboard/
│   │   │   └── page.tsx
│   │   ├── layout.tsx
│   │   └── loading.tsx
│   ├── layout.tsx
│   ├── page.tsx
│   └── globals.css
├── components/
│   ├── ui/                  (shadcn/ui)
│   ├── layout/
│   │   ├── sidebar.tsx
│   │   ├── header.tsx
│   │   ├── nav-items.tsx
│   │   └── mobile-nav.tsx
│   └── shared/
│       └── loading-spinner.tsx
├── lib/
│   ├── supabase/
│   │   ├── client.ts
│   │   ├── server.ts
│   │   └── middleware.ts
│   ├── utils.ts
│   └── constants.ts
├── hooks/
│   └── use-auth.ts
├── types/
│   └── index.ts
├── middleware.ts
├── tailwind.config.ts
├── tsconfig.json
├── next.config.ts
└── package.json
```

---

## Task 1: Initialize Next.js Project

**Files:**
- Create: `package.json` (via create-next-app)
- Create: `tsconfig.json`
- Create: `next.config.ts`
- Create: `tailwind.config.ts`
- Create: `app/globals.css`
- Create: `app/layout.tsx`
- Create: `app/page.tsx`

- [ ] **Step 1: Create Next.js project**

Run:
```powershell
cd "C:\Users\91810\OneDrive - RCM Group of Institution\Desktop\OfficeAttend"
npx create-next-app@latest officehub --typescript --tailwind --eslint --app --src-dir=false --import-alias="@/*" --use-npm
```

Select: TypeScript = Yes, ESLint = Yes, Tailwind = Yes, src directory = No, App Router = Yes, import alias = @/*

- [ ] **Step 2: Verify project runs**

Run:
```powershell
cd officehub
npm run dev
```

Expected: Server starts on http://localhost:3000, shows Next.js welcome page

- [ ] **Step 3: Initialize git**

```powershell
git init
git add .
git commit -m "chore: initial Next.js scaffold"
```

---

## Task 2: Install Dependencies

**Files:**
- Modify: `package.json`

- [ ] **Step 1: Install core dependencies**

Run:
```powershell
cd "C:\Users\91810\OneDrive - RCM Group of Institution\Desktop\OfficeAttend\officehub"
npm install @supabase/supabase-js @supabase/ssr lucide-react react-hook-form @hookform/resolvers zod tanstack-query recharts date-fns clsx tailwind-merge class-variance-authority
```

- [ ] **Step 2: Install dev dependencies**

Run:
```powershell
npm install -D @types/node
```

- [ ] **Step 3: Verify install**

Run:
```powershell
npm ls --depth=0
```

Expected: All packages listed without errors

- [ ] **Step 4: Commit**

```powershell
git add package.json package-lock.json
git commit -m "deps: install core dependencies"
```

---

## Task 3: Initialize shadcn/ui

**Files:**
- Create: `components.json`
- Create: `lib/utils.ts`
- Create: `components/ui/button.tsx`
- Create: `components/ui/input.tsx`
- Create: `components/ui/card.tsx`
- Create: `components/ui/avatar.tsx`
- Create: `components/ui/dropdown-menu.tsx`
- Create: `components/ui/sheet.tsx`
- Create: `components/ui/separator.tsx`
- Create: `components/ui/toast.tsx` (via shadcn)

- [ ] **Step 1: Initialize shadcn/ui**

Run:
```powershell
cd "C:\Users\91810\OneDrive - RCM Group of Institution\Desktop\OfficeAttend\officehub"
npx shadcn@latest init
```

Select: Style = Default, Base color = Neutral, CSS variables = Yes

- [ ] **Step 2: Add required components**

Run:
```powershell
npx shadcn@latest add button input card avatar dropdown-menu sheet separator label badge
```

- [ ] **Step 3: Verify components exist**

Check: `components/ui/button.tsx`, `components/ui/input.tsx`, `components/ui/card.tsx` exist

- [ ] **Step 4: Commit**

```powershell
git add .
git commit -m "feat: initialize shadcn/ui with base components"
```

---

## Task 4: Set Up Supabase Client

**Files:**
- Create: `lib/supabase/client.ts`
- Create: `lib/supabase/server.ts`
- Create: `.env.local`

- [ ] **Step 1: Create environment file**

Create `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
```

- [ ] **Step 2: Create browser client**

Create `lib/supabase/client.ts`:
```typescript
import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
```

- [ ] **Step 3: Create server client**

Create `lib/supabase/server.ts`:
```typescript
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Server Component — ignore
          }
        },
      },
    }
  );
}
```

- [ ] **Step 4: Commit**

```powershell
git add lib/supabase/ .env.local
git commit -m "feat: add Supabase client setup"
```

---

## Task 5: Create Database Schema

**Files:**
- Create: `supabase/migrations/001_initial_schema.sql`

- [ ] **Step 1: Create migration file**

Create `supabase/migrations/001_initial_schema.sql`:
```sql
-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Departments
create table public.departments (
  id uuid primary key default uuid_generate_v4(),
  name text unique not null,
  created_at timestamptz default now()
);

-- Profiles (extends auth.users)
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  employee_id text unique not null,
  full_name text not null,
  email text not null,
  phone text,
  department_id uuid references public.departments(id),
  manager_id uuid references public.profiles(id),
  designation text,
  joining_date date,
  status text default 'active' check (status in ('active', 'inactive', 'terminated')),
  office_location text,
  avatar_url text,
  role text default 'employee' check (role in ('employee', 'manager', 'admin')),
  created_at timestamptz default now()
);

-- Attendance
create table public.attendance (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  date date not null,
  check_in timestamptz,
  check_out timestamptz,
  working_hours decimal(4,2),
  status text default 'absent' check (status in ('present', 'absent', 'wfh', 'leave', 'holiday', 'weekend', 'half_day', 'late', 'overtime')),
  latitude decimal,
  longitude decimal,
  ip_address text,
  device_info text,
  created_at timestamptz default now(),
  unique(user_id, date)
);

-- WFH Requests
create table public.wfh_requests (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  start_date date not null,
  end_date date not null,
  reason text not null,
  notes text,
  status text default 'pending' check (status in ('pending', 'approved', 'rejected', 'cancelled')),
  approved_by uuid references public.profiles(id),
  created_at timestamptz default now()
);

-- Leave Requests
create table public.leave_requests (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  leave_type text not null check (leave_type in ('casual', 'sick', 'paid', 'unpaid', 'optional')),
  start_date date not null,
  end_date date not null,
  reason text not null,
  status text default 'pending' check (status in ('pending', 'approved', 'rejected', 'cancelled')),
  approved_by uuid references public.profiles(id),
  created_at timestamptz default now()
);

-- Holidays
create table public.holidays (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  date date unique not null,
  type text default 'national' check (type in ('national', 'company')),
  created_at timestamptz default now()
);

-- Notifications
create table public.notifications (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  message text not null,
  read boolean default false,
  type text default 'system' check (type in ('wfh', 'leave', 'attendance', 'system')),
  link text,
  created_at timestamptz default now()
);

-- Indexes
create index idx_attendance_user_date on public.attendance(user_id, date);
create index idx_wfh_requests_user on public.wfh_requests(user_id);
create index idx_leave_requests_user on public.leave_requests(user_id);
create index idx_notifications_user on public.notifications(user_id, read);

-- Row Level Security
alter table public.profiles enable row level security;
alter table public.attendance enable row level security;
alter table public.wfh_requests enable row level security;
alter table public.leave_requests enable row level security;
alter table public.holidays enable row level security;
alter table public.notifications enable row level security;

-- Profiles policies
create policy "Users can view own profile" on public.profiles
  for select using (auth.uid() = id);

create policy "Managers can view team profiles" on public.profiles
  for select using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role in ('manager', 'admin')
    )
  );

create policy "Admins can do everything on profiles" on public.profiles
  for all using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

-- Attendance policies
create policy "Users can view own attendance" on public.attendance
  for select using (auth.uid() = user_id);

create policy "Managers can view team attendance" on public.attendance
  for select using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role in ('manager', 'admin')
    )
  );

create policy "Users can insert own attendance" on public.attendance
  for insert with check (auth.uid() = user_id);

create policy "Users can update own attendance" on public.attendance
  for update using (auth.uid() = user_id);

-- WFH request policies
create policy "Users can view own WFH requests" on public.wfh_requests
  for select using (auth.uid() = user_id);

create policy "Managers can view team WFH requests" on public.wfh_requests
  for select using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role in ('manager', 'admin')
    )
  );

create policy "Users can insert own WFH requests" on public.wfh_requests
  for insert with check (auth.uid() = user_id);

create policy "Managers can update WFH requests" on public.wfh_requests
  for update using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role in ('manager', 'admin')
    )
  );

-- Leave request policies
create policy "Users can view own leave requests" on public.leave_requests
  for select using (auth.uid() = user_id);

create policy "Managers can view team leave requests" on public.leave_requests
  for select using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role in ('manager', 'admin')
    )
  );

create policy "Users can insert own leave requests" on public.leave_requests
  for insert with check (auth.uid() = user_id);

create policy "Managers can update leave requests" on public.leave_requests
  for update using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role in ('manager', 'admin')
    )
  );

-- Holidays policies (everyone can view, admin can manage)
create policy "Everyone can view holidays" on public.holidays
  for select using (true);

create policy "Admins can manage holidays" on public.holidays
  for all using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

-- Notifications policies
create policy "Users can view own notifications" on public.notifications
  for select using (auth.uid() = user_id);

create policy "Users can update own notifications" on public.notifications
  for update using (auth.uid() = user_id);

create policy "System can insert notifications" on public.notifications
  for insert with check (true);

-- Function to auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, employee_id, full_name, email, role)
  values (
    new.id,
    'EMP-' || lpad((select count(*) + 1 from public.profiles)::text, 3, '0'),
    coalesce(new.raw_user_meta_data->>'full_name', 'New User'),
    new.email,
    coalesce(new.raw_user_meta_data->>'role', 'employee')
  );
  return new;
end;
$$ language plpgsql security definer;

-- Trigger for auto profile creation
create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
```

- [ ] **Step 2: Commit**

```powershell
git add supabase/
git commit -m "feat: add database schema with RLS policies"
```

---

## Task 6: Create Types

**Files:**
- Create: `types/index.ts`

- [ ] **Step 1: Create type definitions**

Create `types/index.ts`:
```typescript
export type UserRole = "employee" | "manager" | "admin";

export type EmployeeStatus = "active" | "inactive" | "terminated";

export type AttendanceStatus =
  | "present"
  | "absent"
  | "wfh"
  | "leave"
  | "holiday"
  | "weekend"
  | "half_day"
  | "late"
  | "overtime";

export type RequestStatus = "pending" | "approved" | "rejected" | "cancelled";

export type LeaveType = "casual" | "sick" | "paid" | "unpaid" | "optional";

export type NotificationType = "wfh" | "leave" | "attendance" | "system";

export type HolidayType = "national" | "company";

export interface Profile {
  id: string;
  employee_id: string;
  full_name: string;
  email: string;
  phone: string | null;
  department_id: string | null;
  manager_id: string | null;
  designation: string | null;
  joining_date: string | null;
  status: EmployeeStatus;
  office_location: string | null;
  avatar_url: string | null;
  role: UserRole;
  created_at: string;
}

export interface Department {
  id: string;
  name: string;
  created_at: string;
}

export interface Attendance {
  id: string;
  user_id: string;
  date: string;
  check_in: string | null;
  check_out: string | null;
  working_hours: number | null;
  status: AttendanceStatus;
  latitude: number | null;
  longitude: number | null;
  ip_address: string | null;
  device_info: string | null;
  created_at: string;
}

export interface WfhRequest {
  id: string;
  user_id: string;
  start_date: string;
  end_date: string;
  reason: string;
  notes: string | null;
  status: RequestStatus;
  approved_by: string | null;
  created_at: string;
}

export interface LeaveRequest {
  id: string;
  user_id: string;
  leave_type: LeaveType;
  start_date: string;
  end_date: string;
  reason: string;
  status: RequestStatus;
  approved_by: string | null;
  created_at: string;
}

export interface Holiday {
  id: string;
  title: string;
  date: string;
  type: HolidayType;
  created_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  read: boolean;
  type: NotificationType;
  link: string | null;
  created_at: string;
}
```

- [ ] **Step 2: Commit**

```powershell
git add types/
git commit -m "feat: add TypeScript type definitions"
```

---

## Task 7: Create Constants

**Files:**
- Create: `lib/constants.ts`

- [ ] **Step 1: Create constants**

Create `lib/constants.ts`:
```typescript
export const APP_NAME = "OfficeHub";

export const ROLES = {
  EMPLOYEE: "employee",
  MANAGER: "manager",
  ADMIN: "admin",
} as const;

export const ATTENDANCE_STATUS = {
  PRESENT: "present",
  ABSENT: "absent",
  WFH: "wfh",
  LEAVE: "leave",
  HOLIDAY: "holiday",
  WEEKEND: "weekend",
  HALF_DAY: "half_day",
  LATE: "late",
  OVERTIME: "overtime",
} as const;

export const LEAVE_TYPES = {
  CASUAL: "casual",
  SICK: "sick",
  PAID: "paid",
  UNPAID: "unpaid",
  OPTIONAL: "optional",
} as const;

export const LEAVE_BALANCES: Record<string, number> = {
  casual: 10,
  sick: 10,
  paid: 10,
  unpaid: Infinity,
  optional: 2,
};

export const WORKING_HOURS = {
  STANDARD: 8,
  LATE_THRESHOLD_MINUTES: 15,
  OVERTIME_THRESHOLD: 8,
  HALF_DAY_MAX: 4,
} as const;

export const DEFAULT_OFFICE_START = "09:30";
export const DEFAULT_OFFICE_END = "18:30";
```

- [ ] **Step 2: Commit**

```powershell
git add lib/constants.ts
git commit -m "feat: add application constants"
```

---

## Task 8: Create Auth Hook

**Files:**
- Create: `hooks/use-auth.tsx`

- [ ] **Step 1: Create auth context and hook**

Create `hooks/use-auth.tsx`:
```typescript
"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { Profile } from "@/types";
import type { User } from "@supabase/supabase-js";

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  loading: true,
  signOut: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);

      if (user) {
        const { data } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single();
        setProfile(data);
      }

      setLoading(false);
    };

    getUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setUser(session?.user ?? null);

        if (session?.user) {
          const { data } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", session.user.id)
            .single();
          setProfile(data);
        } else {
          setProfile(null);
        }

        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, [supabase]);

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
    router.push("/login");
  };

  return (
    <AuthContext.Provider value={{ user, profile, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
```

- [ ] **Step 2: Commit**

```powershell
git add hooks/use-auth.tsx
git commit -m "feat: add auth context and useAuth hook"
```

---

## Task 9: Create Middleware

**Files:**
- Create: `middleware.ts`
- Create: `lib/supabase/middleware.ts`

- [ ] **Step 1: Create Supabase middleware helper**

Create `lib/supabase/middleware.ts`:
```typescript
import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Protected routes
  const protectedPaths = [
    "/dashboard",
    "/attendance",
    "/wfh",
    "/leave",
    "/employees",
    "/profile",
    "/settings",
    "/notifications",
  ];

  const isProtected = protectedPaths.some((path) =>
    request.nextUrl.pathname.startsWith(path)
  );

  if (isProtected && !user) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  // Redirect logged-in users away from auth pages
  const authPaths = ["/login", "/register"];
  const isAuth = authPaths.some((path) =>
    request.nextUrl.pathname.startsWith(path)
  );

  if (isAuth && user) {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}
```

- [ ] **Step 2: Create main middleware**

Create `middleware.ts`:
```typescript
import { type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

export async function middleware(request: NextRequest) {
  return await updateSession(request);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
```

- [ ] **Step 3: Commit**

```powershell
git add middleware.ts lib/supabase/middleware.ts
git commit -m "feat: add middleware for route protection"
```

---

## Task 10: Create Layout Components

**Files:**
- Create: `components/layout/sidebar.tsx`
- Create: `components/layout/header.tsx`
- Create: `components/layout/nav-items.tsx`
- Create: `components/layout/mobile-nav.tsx`
- Create: `components/shared/loading-spinner.tsx`

- [ ] **Step 1: Create nav items config**

Create `components/layout/nav-items.tsx`:
```typescript
import {
  LayoutDashboard,
  Clock,
  Home,
  CalendarOff,
  Users,
  Settings,
  Bell,
  User,
} from "lucide-react";

export interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  roles: string[];
}

export const navItems: NavItem[] = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
    roles: ["employee", "manager", "admin"],
  },
  {
    label: "Attendance",
    href: "/attendance",
    icon: Clock,
    roles: ["employee", "manager", "admin"],
  },
  {
    label: "Work From Home",
    href: "/wfh",
    icon: Home,
    roles: ["employee", "manager", "admin"],
  },
  {
    label: "Leave",
    href: "/leave",
    icon: CalendarOff,
    roles: ["employee", "manager", "admin"],
  },
  {
    label: "Employees",
    href: "/employees",
    icon: Users,
    roles: ["manager", "admin"],
  },
  {
    label: "Notifications",
    href: "/notifications",
    icon: Bell,
    roles: ["employee", "manager", "admin"],
  },
  {
    label: "Profile",
    href: "/profile",
    icon: User,
    roles: ["employee", "manager", "admin"],
  },
  {
    label: "Settings",
    href: "/settings",
    icon: Settings,
    roles: ["admin"],
  },
];
```

- [ ] **Step 2: Create loading spinner**

Create `components/shared/loading-spinner.tsx`:
```typescript
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface LoadingSpinnerProps {
  className?: string;
  size?: number;
}

export function LoadingSpinner({ className, size = 24 }: LoadingSpinnerProps) {
  return (
    <Loader2
      className={cn("animate-spin text-muted-foreground", className)}
      size={size}
    />
  );
}
```

- [ ] **Step 3: Create sidebar component**

Create `components/layout/sidebar.tsx`:
```typescript
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { APP_NAME } from "@/lib/constants";
import { navItems } from "./nav-items";
import { useAuth } from "@/hooks/use-auth";
import { Building2 } from "lucide-react";

export function Sidebar() {
  const pathname = usePathname();
  const { profile } = useAuth();

  const filteredNavItems = navItems.filter((item) =>
    item.roles.includes(profile?.role || "employee")
  );

  return (
    <aside className="hidden lg:flex lg:flex-col lg:w-64 lg:border-r border-border bg-card">
      {/* Logo */}
      <div className="flex items-center gap-2 px-6 py-5 border-b border-border">
        <Building2 className="h-6 w-6 text-primary" />
        <span className="text-lg font-semibold">{APP_NAME}</span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {filteredNavItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <item.icon className="h-5 w-5" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* User info */}
      <div className="px-3 py-4 border-t border-border">
        <div className="flex items-center gap-3 px-3 py-2">
          <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-medium text-primary">
            {profile?.full_name?.charAt(0) || "U"}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">
              {profile?.full_name || "User"}
            </p>
            <p className="text-xs text-muted-foreground capitalize">
              {profile?.role || "employee"}
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}
```

- [ ] **Step 4: Create header component**

Create `components/layout/header.tsx`:
```typescript
"use client";

import { Bell, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import Link from "next/link";

interface HeaderProps {
  onMenuClick: () => void;
}

export function Header({ onMenuClick }: HeaderProps) {
  const { signOut } = useAuth();

  return (
    <header className="flex items-center justify-between h-16 px-4 lg:px-6 border-b border-border bg-card">
      {/* Mobile menu button */}
      <Button
        variant="ghost"
        size="icon"
        className="lg:hidden"
        onClick={onMenuClick}
      >
        <Menu className="h-5 w-5" />
        <span className="sr-only">Toggle menu</span>
      </Button>

      {/* Spacer for desktop */}
      <div className="hidden lg:block" />

      {/* Right side */}
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/notifications">
            <Bell className="h-5 w-5" />
            <span className="sr-only">Notifications</span>
          </Link>
        </Button>
        <Button variant="ghost" size="sm" onClick={signOut}>
          Logout
        </Button>
      </div>
    </header>
  );
}
```

- [ ] **Step 5: Create mobile nav**

Create `components/layout/mobile-nav.tsx`:
```typescript
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { APP_NAME } from "@/lib/constants";
import { navItems } from "./nav-items";
import { useAuth } from "@/hooks/use-auth";
import { Building2 } from "lucide-react";

interface MobileNavProps {
  open: boolean;
  onClose: () => void;
}

export function MobileNav({ open, onClose }: MobileNavProps) {
  const pathname = usePathname();
  const { profile } = useAuth();

  const filteredNavItems = navItems.filter((item) =>
    item.roles.includes(profile?.role || "employee")
  );

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent side="left" className="w-64 p-0">
        <SheetHeader className="border-b border-border px-6 py-5">
          <SheetTitle className="flex items-center gap-2">
            <Building2 className="h-6 w-6 text-primary" />
            {APP_NAME}
          </SheetTitle>
        </SheetHeader>
        <nav className="px-3 py-4 space-y-1">
          {filteredNavItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <item.icon className="h-5 w-5" />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </SheetContent>
    </Sheet>
  );
}
```

- [ ] **Step 6: Commit**

```powershell
git add components/
git commit -m "feat: add layout components (sidebar, header, mobile-nav)"
```

---

## Task 11: Create Root Layout

**Files:**
- Modify: `app/layout.tsx`

- [ ] **Step 1: Update root layout**

Replace `app/layout.tsx`:
```typescript
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/hooks/use-auth";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "OfficeHub - Employee Attendance & Workforce Management",
  description:
    "Modern employee attendance and workforce management system for small and medium businesses.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
```

- [ ] **Step 2: Commit**

```powershell
git add app/layout.tsx
git commit -m "feat: wrap root layout with AuthProvider"
```

---

## Task 12: Create Protected Layout

**Files:**
- Create: `app/(protected)/layout.tsx`
- Create: `app/(protected)/loading.tsx`

- [ ] **Step 1: Create protected layout**

Create `app/(protected)/layout.tsx`:
```typescript
"use client";

import { useState } from "react";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { MobileNav } from "@/components/layout/mobile-nav";

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Desktop sidebar */}
      <Sidebar />

      {/* Mobile nav */}
      <MobileNav
        open={mobileNavOpen}
        onClose={() => setMobileNavOpen(false)}
      />

      {/* Main content */}
      <div className="flex flex-col flex-1 overflow-hidden">
        <Header onMenuClick={() => setMobileNavOpen(true)} />
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Create loading state**

Create `app/(protected)/loading.tsx`:
```typescript
import { LoadingSpinner } from "@/components/shared/loading-spinner";

export default function Loading() {
  return (
    <div className="flex items-center justify-center h-full">
      <LoadingSpinner size={32} />
    </div>
  );
}
```

- [ ] **Step 3: Commit**

```powershell
git add app/\(protected\)/
git commit -m "feat: add protected layout with sidebar and header"
```

---

## Task 13: Create Auth Layout

**Files:**
- Create: `app/(auth)/layout.tsx`

- [ ] **Step 1: Create auth layout**

Create `app/(auth)/layout.tsx`:
```typescript
import { Building2 } from "lucide-react";
import { APP_NAME } from "@/lib/constants";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 px-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="flex flex-col items-center gap-2">
          <Building2 className="h-10 w-10 text-primary" />
          <h1 className="text-2xl font-bold">{APP_NAME}</h1>
          <p className="text-sm text-muted-foreground">
            Employee Attendance & Workforce Management
          </p>
        </div>
        {children}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```powershell
git add app/\(auth\)/layout.tsx
git commit -m "feat: add auth layout with branding"
```

---

## Task 14: Create Login Page

**Files:**
- Create: `app/(auth)/login/page.tsx`
- Create: `lib/validations/auth.ts`

- [ ] **Step 1: Create validation schema**

Create `lib/validations/auth.ts`:
```typescript
import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export type LoginInput = z.infer<typeof loginSchema>;
```

- [ ] **Step 2: Create login page**

Create `app/(auth)/login/page.tsx`:
```typescript
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { loginSchema, type LoginInput } from "@/lib/validations/auth";

export default function LoginPage() {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginInput) => {
    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    router.push("/dashboard");
    router.refresh();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Welcome back</CardTitle>
        <CardDescription>
          Sign in to your account to continue
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit(onSubmit)}>
        <CardContent className="space-y-4">
          {error && (
            <div className="p-3 text-sm text-destructive bg-destructive/10 rounded-lg">
              {error}
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="name@company.com"
              {...register("email")}
            />
            {errors.email && (
              <p className="text-sm text-destructive">{errors.email.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              {...register("password")}
            />
            {errors.password && (
              <p className="text-sm text-destructive">
                {errors.password.message}
              </p>
            )}
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-4">
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Signing in..." : "Sign in"}
          </Button>
          <p className="text-sm text-muted-foreground">
            Don&apos;t have an account?{" "}
            <Link href="/register" className="text-primary hover:underline">
              Contact admin
            </Link>
          </p>
        </CardFooter>
      </form>
    </Card>
  );
}
```

- [ ] **Step 3: Commit**

```powershell
git add app/\(auth\)/login/ lib/validations/
git commit -m "feat: add login page with form validation"
```

---

## Task 15: Create Register Page

**Files:**
- Create: `app/(auth)/register/page.tsx`
- Create: `lib/validations/auth.ts` (modify)

- [ ] **Step 1: Update validation schema**

Add to `lib/validations/auth.ts`:
```typescript
export const registerSchema = z
  .object({
    fullName: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Please enter a valid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

export type RegisterInput = z.infer<typeof registerSchema>;
```

- [ ] **Step 2: Create register page**

Create `app/(auth)/register/page.tsx`:
```typescript
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { registerSchema, type RegisterInput } from "@/lib/validations/auth";

export default function RegisterPage() {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterInput) => {
    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: {
          full_name: data.fullName,
        },
      },
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    router.push("/login");
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create account</CardTitle>
        <CardDescription>
          Register for a new account
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit(onSubmit)}>
        <CardContent className="space-y-4">
          {error && (
            <div className="p-3 text-sm text-destructive bg-destructive/10 rounded-lg">
              {error}
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="fullName">Full Name</Label>
            <Input
              id="fullName"
              placeholder="John Doe"
              {...register("fullName")}
            />
            {errors.fullName && (
              <p className="text-sm text-destructive">
                {errors.fullName.message}
              </p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="name@company.com"
              {...register("email")}
            />
            {errors.email && (
              <p className="text-sm text-destructive">{errors.email.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              {...register("password")}
            />
            {errors.password && (
              <p className="text-sm text-destructive">
                {errors.password.message}
              </p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm Password</Label>
            <Input
              id="confirmPassword"
              type="password"
              placeholder="••••••••"
              {...register("confirmPassword")}
            />
            {errors.confirmPassword && (
              <p className="text-sm text-destructive">
                {errors.confirmPassword.message}
              </p>
            )}
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-4">
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Creating account..." : "Create account"}
          </Button>
          <p className="text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link href="/login" className="text-primary hover:underline">
              Sign in
            </Link>
          </p>
        </CardFooter>
      </form>
    </Card>
  );
}
```

- [ ] **Step 3: Commit**

```powershell
git add app/\(auth\)/register/ lib/validations/auth.ts
git commit -m "feat: add register page with form validation"
```

---

## Task 16: Create Dashboard Page

**Files:**
- Create: `app/(protected)/dashboard/page.tsx`

- [ ] **Step 1: Create placeholder dashboard**

Create `app/(protected)/dashboard/page.tsx`:
```typescript
"use client";

import { useAuth } from "@/hooks/use-auth";
import { LoadingSpinner } from "@/components/shared/loading-spinner";

export default function DashboardPage() {
  const { profile, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <LoadingSpinner size={32} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">
          Welcome back, {profile?.full_name?.split(" ")[0] || "User"}
        </h1>
        <p className="text-muted-foreground">
          Here&apos;s what&apos;s happening today.
        </p>
      </div>

      {/* Placeholder cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div className="p-6 rounded-lg border bg-card">
          <p className="text-sm text-muted-foreground">Today&apos;s Status</p>
          <p className="text-2xl font-bold mt-1">—</p>
        </div>
        <div className="p-6 rounded-lg border bg-card">
          <p className="text-sm text-muted-foreground">Working Hours</p>
          <p className="text-2xl font-bold mt-1">0h 0m</p>
        </div>
        <div className="p-6 rounded-lg border bg-card">
          <p className="text-sm text-muted-foreground">Leave Balance</p>
          <p className="text-2xl font-bold mt-1">—</p>
        </div>
        <div className="p-6 rounded-lg border bg-card">
          <p className="text-sm text-muted-foreground">Pending Requests</p>
          <p className="text-2xl font-bold mt-1">0</p>
        </div>
      </div>

      <div className="p-6 rounded-lg border bg-card">
        <p className="text-muted-foreground">
          Dashboard widgets will be implemented in Phase 5.
        </p>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```powershell
git add app/\(protected\)/dashboard/
git commit -m "feat: add placeholder dashboard page"
```

---

## Task 17: Create Placeholder Pages

**Files:**
- Create: `app/(protected)/attendance/page.tsx`
- Create: `app/(protected)/wfh/page.tsx`
- Create: `app/(protected)/leave/page.tsx`
- Create: `app/(protected)/employees/page.tsx`
- Create: `app/(protected)/profile/page.tsx`
- Create: `app/(protected)/settings/page.tsx`
- Create: `app/(protected)/notifications/page.tsx`
- Modify: `app/page.tsx`

- [ ] **Step 1: Create attendance placeholder**

Create `app/(protected)/attendance/page.tsx`:
```typescript
export default function AttendancePage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Attendance</h1>
      <p className="text-muted-foreground">
        Attendance module will be implemented in Phase 2.
      </p>
    </div>
  );
}
```

- [ ] **Step 2: Create WFH placeholder**

Create `app/(protected)/wfh/page.tsx`:
```typescript
export default function WfhPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Work From Home</h1>
      <p className="text-muted-foreground">
        WFH module will be implemented in Phase 4.
      </p>
    </div>
  );
}
```

- [ ] **Step 3: Create leave placeholder**

Create `app/(protected)/leave/page.tsx`:
```typescript
export default function LeavePage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Leave</h1>
      <p className="text-muted-foreground">
        Leave module will be implemented in Phase 4.
      </p>
    </div>
  );
}
```

- [ ] **Step 4: Create employees placeholder**

Create `app/(protected)/employees/page.tsx`:
```typescript
export default function EmployeesPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Employees</h1>
      <p className="text-muted-foreground">
        Employee management will be implemented in Phase 3.
      </p>
    </div>
  );
}
```

- [ ] **Step 5: Create profile placeholder**

Create `app/(protected)/profile/page.tsx`:
```typescript
export default function ProfilePage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Profile</h1>
      <p className="text-muted-foreground">
        Profile module will be implemented in Phase 3.
      </p>
    </div>
  );
}
```

- [ ] **Step 6: Create settings placeholder**

Create `app/(protected)/settings/page.tsx`:
```typescript
export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Settings</h1>
      <p className="text-muted-foreground">
        Settings module will be implemented in Phase 6.
      </p>
    </div>
  );
}
```

- [ ] **Step 7: Create notifications placeholder**

Create `app/(protected)/notifications/page.tsx`:
```typescript
export default function NotificationsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Notifications</h1>
      <p className="text-muted-foreground">
        Notifications module will be implemented in Phase 4.
      </p>
    </div>
  );
}
```

- [ ] **Step 8: Update root page to redirect**

Replace `app/page.tsx`:
```typescript
import { redirect } from "next/navigation";

export default function Home() {
  redirect("/dashboard");
}
```

- [ ] **Step 9: Commit**

```powershell
git add app/
git commit -m "feat: add placeholder pages for all modules"
```

---

## Task 18: Final Verification

**Files:** None (verification only)

- [ ] **Step 1: Verify build**

Run:
```powershell
cd "C:\Users\91810\OneDrive - RCM Group of Institution\Desktop\OfficeAttend\officehub"
npm run build
```

Expected: Build succeeds with no errors

- [ ] **Step 2: Verify dev server**

Run:
```powershell
npm run dev
```

Expected:
- http://localhost:3000 redirects to /login
- /login shows login form
- /register shows register form
- /dashboard shows protected layout with sidebar (after auth)
- All nav links work

- [ ] **Step 3: Commit final state**

```powershell
git add .
git commit -m "chore: Phase 1 foundation complete"
```

---

## Phase 1 Summary

| Task | Description | Files Created |
|------|-------------|---------------|
| 1 | Initialize Next.js project | project scaffold |
| 2 | Install dependencies | package.json |
| 3 | Initialize shadcn/ui | components/ui/*, lib/utils.ts |
| 4 | Set up Supabase client | lib/supabase/*, .env.local |
| 5 | Create database schema | supabase/migrations/ |
| 6 | Create types | types/index.ts |
| 7 | Create constants | lib/constants.ts |
| 8 | Create auth hook | hooks/use-auth.tsx |
| 9 | Create middleware | middleware.ts, lib/supabase/middleware.ts |
| 10 | Create layout components | components/layout/*, components/shared/* |
| 11 | Create root layout | app/layout.tsx |
| 12 | Create protected layout | app/(protected)/layout.tsx |
| 13 | Create auth layout | app/(auth)/layout.tsx |
| 14 | Create login page | app/(auth)/login/page.tsx |
| 15 | Create register page | app/(auth)/register/page.tsx |
| 16 | Create dashboard page | app/(protected)/dashboard/page.tsx |
| 17 | Create placeholder pages | app/(protected)/*/page.tsx |
| 18 | Final verification | build + dev test |

**After Phase 1, you have:**
- Working Next.js app with Supabase auth
- Database schema ready (run SQL in Supabase dashboard)
- Login/register flow
- Protected routes with role-based sidebar
- Responsive layout with mobile navigation
- Foundation for all subsequent phases
