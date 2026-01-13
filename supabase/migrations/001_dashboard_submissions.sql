create table if not exists public.dashboard_submissions (
	id uuid primary key default gen_random_uuid(),
	created_at timestamptz not null default now(),
	page text not null,
	payload jsonb not null,
	user_id text
);

alter table public.dashboard_submissions enable row level security;

drop policy if exists "dashboard_submissions_insert" on public.dashboard_submissions;
create policy "dashboard_submissions_insert"
on public.dashboard_submissions
for insert
to anon, authenticated
with check (true);
