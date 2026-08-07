-- Departments RLS policies
-- Everyone can read departments
create policy "Everyone can view departments" on public.departments
  for select using (true);

-- Admins can manage departments
create policy "Admins can manage departments" on public.departments
  for all using (public.get_user_role() = 'admin');
