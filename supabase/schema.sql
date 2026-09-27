-- Wellness app schema (migrated from Base44 entities)
-- Run ONCE in the Supabase SQL Editor.

create extension if not exists "pgcrypto";

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  full_name text,
  role text not null default 'user' check (role in ('admin', 'user')),
  language_preference text default 'es' check (language_preference in ('es', 'en', 'fr', 'eu')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name, role, language_preference)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data->>'role', 'user'),
    coalesce(new.raw_user_meta_data->>'language_preference', 'es')
  )
  on conflict (id) do update set
    email = excluded.email,
    full_name = coalesce(public.profiles.full_name, excluded.full_name);
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

create or replace function public.is_admin()
returns boolean
language plpgsql
stable
security definer
set search_path = public
as $$
begin
  return exists (
    select 1 from public.profiles p
    where p.id = (select auth.uid()) and p.role = 'admin'
  );
end;
$$;

create table if not exists public.problem_types (
  id uuid primary key default gen_random_uuid(),
  name jsonb not null default '{}'::jsonb,
  slug text not null unique,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists problem_types_set_updated_at on public.problem_types;
create trigger problem_types_set_updated_at
  before update on public.problem_types
  for each row execute function public.set_updated_at();

create table if not exists public.questionnaires (
  id uuid primary key default gen_random_uuid(),
  problem_type_id uuid references public.problem_types(id) on delete set null,
  title jsonb not null default '{}'::jsonb,
  description jsonb default '{}'::jsonb,
  is_active boolean not null default true,
  questions jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists questionnaires_set_updated_at on public.questionnaires;
create trigger questionnaires_set_updated_at
  before update on public.questionnaires
  for each row execute function public.set_updated_at();

create table if not exists public.task_definitions (
  id uuid primary key default gen_random_uuid(),
  name jsonb not null default '{}'::jsonb,
  description jsonb default '{}'::jsonb,
  task_type text not null check (task_type in ('questionnaire', 'note_prompt', 'module', 'custom')),
  linked_questionnaire_id uuid references public.questionnaires(id) on delete set null,
  linked_problem_type_id uuid references public.problem_types(id) on delete set null,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists task_definitions_set_updated_at on public.task_definitions;
create trigger task_definitions_set_updated_at
  before update on public.task_definitions
  for each row execute function public.set_updated_at();

create table if not exists public.patient_task_assignments (
  id uuid primary key default gen_random_uuid(),
  patient_user_id uuid not null references public.profiles(id) on delete cascade,
  patient_email text,
  task_definition_id uuid not null references public.task_definitions(id) on delete cascade,
  reason text,
  status text not null default 'active' check (status in ('active', 'paused', 'completed', 'archived')),
  start_date date,
  end_date date,
  frequency text not null default 'weekly' check (frequency in ('once', 'daily', 'weekly', 'custom')),
  notes_clinician text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists patient_task_assignments_set_updated_at on public.patient_task_assignments;
create trigger patient_task_assignments_set_updated_at
  before update on public.patient_task_assignments
  for each row execute function public.set_updated_at();

create table if not exists public.submissions (
  id uuid primary key default gen_random_uuid(),
  patient_user_id uuid not null references public.profiles(id) on delete cascade,
  questionnaire_id uuid not null references public.questionnaires(id) on delete cascade,
  problem_type_id uuid references public.problem_types(id) on delete set null,
  assignment_id uuid references public.patient_task_assignments(id) on delete set null,
  language_used text check (language_used in ('es', 'en', 'fr', 'eu')),
  answers jsonb not null default '[]'::jsonb,
  created_by_id uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists submissions_set_updated_at on public.submissions;
create trigger submissions_set_updated_at
  before update on public.submissions
  for each row execute function public.set_updated_at();

create table if not exists public.sensation_notes (
  id uuid primary key default gen_random_uuid(),
  patient_user_id uuid not null references public.profiles(id) on delete cascade,
  problem_type_id uuid references public.problem_types(id) on delete set null,
  note_text text not null,
  language text check (language in ('es', 'en', 'fr', 'eu')),
  created_by_id uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists sensation_notes_set_updated_at on public.sensation_notes;
create trigger sensation_notes_set_updated_at
  before update on public.sensation_notes
  for each row execute function public.set_updated_at();

create table if not exists public.pending_invites (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  role text not null default 'user' check (role in ('admin', 'user')),
  invited_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;
alter table public.problem_types enable row level security;
alter table public.questionnaires enable row level security;
alter table public.task_definitions enable row level security;
alter table public.patient_task_assignments enable row level security;
alter table public.submissions enable row level security;
alter table public.sensation_notes enable row level security;
alter table public.pending_invites enable row level security;

drop policy if exists "profiles_select" on public.profiles;
create policy "profiles_select" on public.profiles
  for select to authenticated
  using (id = (select auth.uid()) or public.is_admin());

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own" on public.profiles
  for update to authenticated
  using (id = (select auth.uid()) or public.is_admin())
  with check (id = (select auth.uid()) or public.is_admin());

drop policy if exists "problem_types_select" on public.problem_types;
create policy "problem_types_select" on public.problem_types
  for select to authenticated using (true);

drop policy if exists "problem_types_write" on public.problem_types;
create policy "problem_types_write" on public.problem_types
  for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "questionnaires_select" on public.questionnaires;
create policy "questionnaires_select" on public.questionnaires
  for select to authenticated using (true);

drop policy if exists "questionnaires_write" on public.questionnaires;
create policy "questionnaires_write" on public.questionnaires
  for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "task_definitions_select" on public.task_definitions;
create policy "task_definitions_select" on public.task_definitions
  for select to authenticated using (true);

drop policy if exists "task_definitions_write" on public.task_definitions;
create policy "task_definitions_write" on public.task_definitions
  for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "assignments_select" on public.patient_task_assignments;
create policy "assignments_select" on public.patient_task_assignments
  for select to authenticated
  using (patient_user_id = (select auth.uid()) or public.is_admin());

drop policy if exists "assignments_write" on public.patient_task_assignments;
create policy "assignments_write" on public.patient_task_assignments
  for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "submissions_select" on public.submissions;
create policy "submissions_select" on public.submissions
  for select to authenticated
  using (patient_user_id = (select auth.uid()) or created_by_id = (select auth.uid()) or public.is_admin());

drop policy if exists "submissions_insert" on public.submissions;
create policy "submissions_insert" on public.submissions
  for insert to authenticated
  with check (patient_user_id = (select auth.uid()) or public.is_admin());

drop policy if exists "submissions_update" on public.submissions;
create policy "submissions_update" on public.submissions
  for update to authenticated
  using (created_by_id = (select auth.uid()) or public.is_admin())
  with check (created_by_id = (select auth.uid()) or public.is_admin());

drop policy if exists "submissions_delete" on public.submissions;
create policy "submissions_delete" on public.submissions
  for delete to authenticated
  using (created_by_id = (select auth.uid()) or public.is_admin());

drop policy if exists "notes_select" on public.sensation_notes;
create policy "notes_select" on public.sensation_notes
  for select to authenticated
  using (patient_user_id = (select auth.uid()) or created_by_id = (select auth.uid()) or public.is_admin());

drop policy if exists "notes_insert" on public.sensation_notes;
create policy "notes_insert" on public.sensation_notes
  for insert to authenticated
  with check (patient_user_id = (select auth.uid()) or public.is_admin());

drop policy if exists "notes_update" on public.sensation_notes;
create policy "notes_update" on public.sensation_notes
  for update to authenticated
  using (created_by_id = (select auth.uid()) or public.is_admin())
  with check (created_by_id = (select auth.uid()) or public.is_admin());

drop policy if exists "notes_delete" on public.sensation_notes;
create policy "notes_delete" on public.sensation_notes
  for delete to authenticated
  using (created_by_id = (select auth.uid()) or public.is_admin());

drop policy if exists "invites_admin" on public.pending_invites;
create policy "invites_admin" on public.pending_invites
  for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());

grant usage on schema public to anon, authenticated;
grant select on public.problem_types, public.questionnaires, public.task_definitions to anon;
grant select, insert, update, delete on
  public.profiles,
  public.problem_types,
  public.questionnaires,
  public.task_definitions,
  public.patient_task_assignments,
  public.submissions,
  public.sensation_notes,
  public.pending_invites
to authenticated;
