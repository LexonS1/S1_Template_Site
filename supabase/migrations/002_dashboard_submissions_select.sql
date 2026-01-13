drop policy if exists "dashboard_submissions_select" on public.dashboard_submissions;
create policy "dashboard_submissions_select"
on public.dashboard_submissions
for select
to anon, authenticated
using (true);
