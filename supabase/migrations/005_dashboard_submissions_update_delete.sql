drop policy if exists "dashboard_submissions_update" on public.dashboard_submissions;
create policy "dashboard_submissions_update"
on public.dashboard_submissions
for update
to anon, authenticated
using (true)
with check (true);

drop policy if exists "dashboard_submissions_delete" on public.dashboard_submissions;
create policy "dashboard_submissions_delete"
on public.dashboard_submissions
for delete
to anon, authenticated
using (true);
