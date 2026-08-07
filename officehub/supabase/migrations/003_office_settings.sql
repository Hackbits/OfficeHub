-- Office Settings (key-value store)
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

-- Seed default settings
insert into public.office_settings (key, value) values
  ('office_latitude', '22.80927076763711'),
  ('office_longitude', '86.21127374470689'),
  ('geofence_radius', '100'),
  ('office_start', '10:15'),
  ('office_end', '19:30'),
  ('standard_hours', '9'),
  ('late_threshold_minutes', '15'),
  ('overtime_threshold', '8'),
  ('half_day_max', '4');
