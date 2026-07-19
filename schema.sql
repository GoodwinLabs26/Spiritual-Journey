-- Spiritual Journey job tracker schema
-- Run this in the Supabase SQL Editor (Project > SQL Editor > New query)

create table if not exists jobs (
  id uuid primary key default gen_random_uuid(),
  num integer not null,
  client text,
  addr text,
  type text default 'Repair',
  stage text default 'lead',
  value numeric default 0,
  job_date date,
  materials numeric default 0,
  labor numeric default 0,
  paid numeric default 0,
  phone text,
  notes text,
  created_at timestamptz default now()
);

-- Row Level Security
alter table jobs enable row level security;

-- Permissive policy: anyone with the anon key can read/write.
-- Fine for a single-user internal tool with no public signup.
-- If you ever add login/auth, replace this with a policy scoped to auth.uid().
create policy "Allow all access to jobs"
  on jobs
  for all
  using (true)
  with check (true);

-- Keeps ticket numbers sequential
create index if not exists jobs_num_idx on jobs (num);
