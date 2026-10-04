-- Daybook — Supabase schema for cloud sync (Feature 2) and shared lists (Feature 3).
--
-- HOW TO RUN
--   1. Create a project at https://supabase.com.
--   2. Open the project's SQL Editor (left sidebar) and paste this whole file.
--   3. Press "Run". It is idempotent enough to re-run during setup.
--   4. Copy the project URL and the anon/publishable key from
--      Project Settings → API into the app's environment:
--         EXPO_PUBLIC_SUPABASE_URL=...
--         EXPO_PUBLIC_SUPABASE_ANON_KEY=...
--      (see .env.example). Then rebuild/restart Expo so EXPO_PUBLIC_* inline.
--
-- AUTH MODEL — READ THIS
--   The app ships with an ANONYMOUS owner id (a uuid generated on-device and
--   stored in the local settings table) as a stand-in for a real account. The
--   RLS policies below are written for real Supabase Auth: `owner = auth.uid()`.
--   For true multi-device / multi-user sync you MUST wire Supabase Auth (e.g.
--   anonymous sign-in or email) so that auth.uid() matches the stored owner id,
--   otherwise the anon key has no uid and these policies will reject every row.
--   Everything here is correct-by-construction but has NOT been run against a
--   live project in this build.
--
-- All `*At` style timestamps are epoch milliseconds (bigint) to mirror the
-- on-device SQLite schema in src/lib/db.ts. Boolean-ish flags are stored as
-- integer 0/1 to match the local column types exactly.

-- ---------------------------------------------------------------------------
-- Synced entity tables (Feature 2)
-- ---------------------------------------------------------------------------

create table if not exists public.tasks (
  id text primary key,
  title text not null,
  meta text,
  list text,
  "projectId" text,
  "over" integer,
  later integer,
  "desc" text,
  priority text,
  status text,
  "dueAt" bigint,
  "reminderAt" bigint,
  recurrence text,
  color text,
  urgent integer,
  important integer,
  someday integer,
  owner uuid not null,
  updated_at bigint not null,
  deleted_at bigint
);

create table if not exists public.projects (
  id text primary key,
  name text not null,
  color text not null,
  owner uuid not null,
  updated_at bigint not null,
  deleted_at bigint
);

create table if not exists public.entries (
  id text primary key,
  "journalId" text not null,
  day text not null,
  title text not null,
  body text not null,
  "templateId" text,
  "placeName" text,
  lat double precision,
  lng double precision,
  "tempC" double precision,
  "weatherCode" integer,
  "createdAt" bigint not null,
  owner uuid not null,
  updated_at bigint not null,
  deleted_at bigint
);

create table if not exists public.journals (
  id text primary key,
  name text not null,
  color text not null,
  icon text not null,
  owner uuid not null,
  updated_at bigint not null,
  deleted_at bigint
);

create table if not exists public.habits (
  id text primary key,
  name text not null,
  streak integer not null,
  minutes integer not null,
  owner uuid not null,
  updated_at bigint not null,
  deleted_at bigint
);

create table if not exists public.subtasks (
  id text primary key,
  "taskId" text not null,
  title text not null,
  done integer not null default 0,
  position integer not null default 0,
  owner uuid not null,
  updated_at bigint not null,
  deleted_at bigint
);

create table if not exists public.smart_lists (
  id text primary key,
  name text not null,
  rules text not null,
  position integer not null default 0,
  builtin integer not null default 0,
  owner uuid not null,
  updated_at bigint not null,
  deleted_at bigint
);

create table if not exists public.focus_sessions (
  id text primary key,
  "taskId" text,
  "startedAt" bigint not null,
  seconds integer not null,
  owner uuid not null,
  updated_at bigint not null,
  deleted_at bigint
);

-- Attachment metadata only — the binary file itself stays on-device.
create table if not exists public.attachments (
  id text primary key,
  "taskId" text,
  "entryId" text,
  kind text not null,
  uri text not null,
  "durationMs" bigint,
  width integer,
  height integer,
  "createdAt" bigint not null,
  owner uuid not null,
  updated_at bigint not null,
  deleted_at bigint
);

-- ---------------------------------------------------------------------------
-- Shared-list tables (Feature 3)
-- ---------------------------------------------------------------------------

create table if not exists public.shared_projects (
  project_id text primary key,
  owner uuid not null,
  share_code text not null unique,
  updated_at bigint not null,
  deleted_at bigint
);

create table if not exists public.project_members (
  project_id text not null,
  member uuid not null,
  updated_at bigint not null,
  deleted_at bigint,
  primary key (project_id, member)
);

create index if not exists idx_tasks_project on public.tasks ("projectId");
create index if not exists idx_project_members_member on public.project_members (member);

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------

alter table public.tasks enable row level security;
alter table public.projects enable row level security;
alter table public.entries enable row level security;
alter table public.journals enable row level security;
alter table public.habits enable row level security;
alter table public.subtasks enable row level security;
alter table public.smart_lists enable row level security;
alter table public.focus_sessions enable row level security;
alter table public.attachments enable row level security;
alter table public.shared_projects enable row level security;
alter table public.project_members enable row level security;

-- Helper: is the current user a member of the given project?
create or replace function public.is_project_member(pid text)
returns boolean
language sql
security definer
stable
as $$
  select exists (
    select 1 from public.project_members m
    where m.project_id = pid and m.member = auth.uid() and m.deleted_at is null
  );
$$;

-- Owner-scoped policies for the private entity tables.
do $$
declare
  tbl text;
begin
  foreach tbl in array array[
    'projects','entries','journals','habits','subtasks','smart_lists','focus_sessions','attachments'
  ]
  loop
    execute format('drop policy if exists owner_all on public.%I;', tbl);
    execute format(
      'create policy owner_all on public.%I for all using (owner = auth.uid()) with check (owner = auth.uid());',
      tbl
    );
  end loop;
end $$;

-- Tasks: owner OR a member of the task's shared project can read/write.
drop policy if exists tasks_access on public.tasks;
create policy tasks_access on public.tasks
  for all
  using (owner = auth.uid() or public.is_project_member("projectId"))
  with check (owner = auth.uid() or public.is_project_member("projectId"));

-- shared_projects: the owner manages it; members may read it.
drop policy if exists shared_projects_owner on public.shared_projects;
create policy shared_projects_owner on public.shared_projects
  for all
  using (owner = auth.uid())
  with check (owner = auth.uid());

drop policy if exists shared_projects_member_read on public.shared_projects;
create policy shared_projects_member_read on public.shared_projects
  for select
  using (public.is_project_member(project_id));

-- project_members: a user manages their own membership; project owners may read all.
drop policy if exists project_members_self on public.project_members;
create policy project_members_self on public.project_members
  for all
  using (member = auth.uid())
  with check (member = auth.uid());

drop policy if exists project_members_owner_read on public.project_members;
create policy project_members_owner_read on public.project_members
  for select
  using (
    exists (
      select 1 from public.shared_projects s
      where s.project_id = project_members.project_id and s.owner = auth.uid()
    )
  );

-- ---------------------------------------------------------------------------
-- Realtime — live updates for shared task lists (Feature 3)
-- ---------------------------------------------------------------------------
-- Adds the tasks table to the realtime publication. Safe to run once; remove
-- the DO block guard error handling if your Postgres version rejects re-adds.
do $$
begin
  begin
    alter publication supabase_realtime add table public.tasks;
  exception when duplicate_object then null;
  end;
end $$;
