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

create index idx_leave_balances_user_year on public.leave_balances(user_id, year);
