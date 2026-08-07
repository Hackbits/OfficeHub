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

-- Helper function to get user role (avoids recursive RLS)
create or replace function public.get_user_role()
returns text as $$
  select role from public.profiles where id = auth.uid();
$$ language sql security definer stable;

-- Profiles policies (non-recursive using get_user_role function)
create policy "Users can view own profile" on public.profiles
  for select using (auth.uid() = id);

create policy "Managers can view team profiles" on public.profiles
  for select using (
    public.get_user_role() in ('manager', 'admin')
  );

create policy "Admins can do everything on profiles" on public.profiles
  for all using (
    public.get_user_role() = 'admin'
  );

-- Attendance policies
create policy "Users can view own attendance" on public.attendance
  for select using (auth.uid() = user_id);

create policy "Managers can view team attendance" on public.attendance
  for select using (
    public.get_user_role() in ('manager', 'admin')
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
    public.get_user_role() in ('manager', 'admin')
  );

create policy "Users can insert own WFH requests" on public.wfh_requests
  for insert with check (auth.uid() = user_id);

create policy "Managers can update WFH requests" on public.wfh_requests
  for update using (
    public.get_user_role() in ('manager', 'admin')
  );

-- Leave request policies
create policy "Users can view own leave requests" on public.leave_requests
  for select using (auth.uid() = user_id);

create policy "Managers can view team leave requests" on public.leave_requests
  for select using (
    public.get_user_role() in ('manager', 'admin')
  );

create policy "Users can insert own leave requests" on public.leave_requests
  for insert with check (auth.uid() = user_id);

create policy "Managers can update leave requests" on public.leave_requests
  for update using (
    public.get_user_role() in ('manager', 'admin')
  );

-- Holidays policies (everyone can view, admin can manage)
create policy "Everyone can view holidays" on public.holidays
  for select using (true);

create policy "Admins can manage holidays" on public.holidays
  for all using (
    public.get_user_role() = 'admin'
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