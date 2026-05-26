-- ============================================================
-- Frich OS · Migration 0001 — Foundations
-- Tenancy (chains → locations → stations), enums, roles,
-- employees, RLS helpers (auth.chain_id() y auth.has_role()).
-- ============================================================

create extension if not exists "pgcrypto" with schema extensions;
create extension if not exists "citext" with schema extensions;
create extension if not exists "pg_trgm";
create extension if not exists "btree_gin";
create extension if not exists "pg_cron";

-- ============================================================
-- Enums
-- ============================================================
do $$ begin
  create type station_slug as enum ('armado','plancha','freidora','despacho');
exception when duplicate_object then null; end $$;

do $$ begin
  create type app_role as enum ('owner','ops_manager','manager','station_employee','viewer');
exception when duplicate_object then null; end $$;

do $$ begin
  create type channel_slug as enum ('rappi','pedidosya','salon','whatsapp','web','kiosk');
exception when duplicate_object then null; end $$;

do $$ begin
  create type order_status as enum ('draft','confirmed','in_kitchen','ready','dispatched','delivered','cancelled');
exception when duplicate_object then null; end $$;

do $$ begin
  create type task_status as enum ('queued','in_progress','completed','skipped');
exception when duplicate_object then null; end $$;

do $$ begin
  create type andon_state as enum ('open','acknowledged','escalated_manager','escalated_owner','resolved','cancelled');
exception when duplicate_object then null; end $$;

do $$ begin
  create type customer_lifecycle as enum ('new','occasional','regular','vip','at_risk','lost');
exception when duplicate_object then null; end $$;

do $$ begin
  create type hold_kind as enum ('patty_cooked','caramelized_onion','blanched_fries','toasted_bun','assembled_burger');
exception when duplicate_object then null; end $$;

do $$ begin
  create type kitchen_mode as enum ('normal','turbo','degraded','opening','closing');
exception when duplicate_object then null; end $$;

-- ============================================================
-- updated_at trigger
-- ============================================================
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

-- ============================================================
-- chains (top-level tenant)
-- ============================================================
create table if not exists chains (
  id uuid primary key default gen_random_uuid(),
  slug citext unique not null,
  name text not null,
  brand_color text default '#FCD33B',
  logo_url text,
  timezone text not null default 'America/Argentina/Cordoba',
  currency text not null default 'ARS',
  settings jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger trg_chains_updated_at before update on chains
  for each row execute function public.set_updated_at();

-- ============================================================
-- locations (sucursales)
-- ============================================================
create table if not exists locations (
  id uuid primary key default gen_random_uuid(),
  chain_id uuid not null references chains(id) on delete cascade,
  slug citext not null,
  name text not null,
  short_name text,
  city text,
  address text,
  lat numeric(10,7),
  lng numeric(10,7),
  has_dining_area boolean not null default true,
  is_active boolean not null default true,
  current_mode kitchen_mode not null default 'normal',
  settings jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (chain_id, slug)
);
create index if not exists idx_locations_chain on locations(chain_id) where is_active;
create trigger trg_locations_updated_at before update on locations
  for each row execute function public.set_updated_at();

-- ============================================================
-- stations (por local, 4 por defecto)
-- ============================================================
create table if not exists stations (
  id uuid primary key default gen_random_uuid(),
  chain_id uuid not null references chains(id) on delete cascade,
  location_id uuid not null references locations(id) on delete cascade,
  slug station_slug not null,
  name text not null,
  display_order int not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (location_id, slug)
);
create index if not exists idx_stations_location on stations(location_id);
create trigger trg_stations_updated_at before update on stations
  for each row execute function public.set_updated_at();

-- ============================================================
-- Users (perfil que extiende auth.users)
-- ============================================================
create table if not exists user_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  chain_id uuid references chains(id) on delete set null,
  full_name text,
  avatar_url text,
  default_location_id uuid references locations(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger trg_user_profiles_updated_at before update on user_profiles
  for each row execute function public.set_updated_at();

-- ============================================================
-- User × Role × (location nullable)
-- ============================================================
create table if not exists user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  chain_id uuid not null references chains(id) on delete cascade,
  location_id uuid references locations(id) on delete cascade,
  role app_role not null,
  created_at timestamptz not null default now(),
  unique (user_id, chain_id, coalesce(location_id, '00000000-0000-0000-0000-000000000000'::uuid), role)
);
create index if not exists idx_user_roles_user on user_roles(user_id);
create index if not exists idx_user_roles_chain on user_roles(chain_id);

-- ============================================================
-- Employees (operativos — usan PIN, no Supabase Auth)
-- ============================================================
create table if not exists employees (
  id uuid primary key default gen_random_uuid(),
  chain_id uuid not null references chains(id) on delete cascade,
  location_id uuid not null references locations(id) on delete cascade,
  first_name text not null,
  last_name text not null,
  pin_hash text not null,
  avatar_url text,
  email citext,
  phone text,
  default_station_slug station_slug,
  active boolean not null default true,
  hired_at date not null default current_date,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists idx_employees_location on employees(location_id) where active;
create unique index if not exists uniq_employee_chain_email
  on employees(chain_id, email) where email is not null;
create trigger trg_employees_updated_at before update on employees
  for each row execute function public.set_updated_at();

-- ============================================================
-- Auth helpers — chain_id from JWT claims
-- ============================================================
-- Supabase JWT custom claim: app_metadata.chain_id (set by Edge Function on signup)
create or replace function auth.chain_id()
returns uuid language sql stable as $$
  select nullif(
    coalesce(
      (current_setting('request.jwt.claims', true)::jsonb -> 'app_metadata' ->> 'chain_id'),
      (current_setting('request.jwt.claims', true)::jsonb ->> 'chain_id')
    ),
    ''
  )::uuid;
$$;

create or replace function auth.has_role(_role app_role)
returns boolean language sql stable as $$
  select exists (
    select 1 from public.user_roles ur
    where ur.user_id = auth.uid()
      and ur.chain_id = auth.chain_id()
      and ur.role = _role
  );
$$;

create or replace function auth.has_any_role(_roles app_role[])
returns boolean language sql stable as $$
  select exists (
    select 1 from public.user_roles ur
    where ur.user_id = auth.uid()
      and ur.chain_id = auth.chain_id()
      and ur.role = any(_roles)
  );
$$;

-- ============================================================
-- Enable RLS — chains
-- ============================================================
alter table chains enable row level security;

drop policy if exists chains_select_self on chains;
create policy chains_select_self on chains
  for select to authenticated
  using (id = auth.chain_id());

-- ============================================================
-- locations RLS
-- ============================================================
alter table locations enable row level security;

drop policy if exists locations_select on locations;
create policy locations_select on locations
  for select to authenticated
  using (chain_id = auth.chain_id());

drop policy if exists locations_modify_mgmt on locations;
create policy locations_modify_mgmt on locations
  for all to authenticated
  using (chain_id = auth.chain_id() and auth.has_any_role(array['owner','ops_manager']::app_role[]))
  with check (chain_id = auth.chain_id());

-- ============================================================
-- stations RLS
-- ============================================================
alter table stations enable row level security;

drop policy if exists stations_select on stations;
create policy stations_select on stations
  for select to authenticated
  using (chain_id = auth.chain_id());

drop policy if exists stations_modify_mgmt on stations;
create policy stations_modify_mgmt on stations
  for all to authenticated
  using (chain_id = auth.chain_id() and auth.has_any_role(array['owner','ops_manager','manager']::app_role[]))
  with check (chain_id = auth.chain_id());

-- ============================================================
-- user_profiles + user_roles RLS
-- ============================================================
alter table user_profiles enable row level security;
drop policy if exists up_self on user_profiles;
create policy up_self on user_profiles
  for all to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

alter table user_roles enable row level security;
drop policy if exists ur_select on user_roles;
create policy ur_select on user_roles
  for select to authenticated
  using (chain_id = auth.chain_id());

-- ============================================================
-- employees RLS — gerencia ve y modifica; PIN session usa service role
-- ============================================================
alter table employees enable row level security;

drop policy if exists employees_select_chain on employees;
create policy employees_select_chain on employees
  for select to authenticated
  using (chain_id = auth.chain_id());

drop policy if exists employees_modify_mgmt on employees;
create policy employees_modify_mgmt on employees
  for all to authenticated
  using (chain_id = auth.chain_id() and auth.has_any_role(array['owner','ops_manager','manager']::app_role[]))
  with check (chain_id = auth.chain_id());

-- Allow anon role to SELECT employees for the PIN login screen (we filter by chain slug).
-- This is intentional: employees are not sensitive PII beyond first/last name + avatar.
drop policy if exists employees_select_anon on employees;
create policy employees_select_anon on employees
  for select to anon
  using (active and chain_id in (select id from chains));

comment on function auth.chain_id() is 'Resuelve chain_id desde JWT app_metadata.chain_id. NULL si no hay sesión.';
comment on function auth.has_role(app_role) is 'Helper RLS — chequea rol del usuario en la chain actual.';
comment on table employees is 'Empleados operativos. Usan PIN (auth/pin.ts) — no tienen auth.users.';
