create extension if not exists pgcrypto;

do $$
begin
  create type app_role as enum ('user', 'client', 'admin');
exception
  when duplicate_object then null;
end $$;

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
  email text not null unique,
  full_name text,
  role app_role not null default 'user',
  company_name text,
  phone text,
  title text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.services (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  description text,
  pricing_model text,
  base_price numeric(12,2),
  internal_cost numeric(12,2),
  markup_pct numeric(8,2),
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.hardware_catalog (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  description text,
  internal_cost numeric(12,2),
  sell_price numeric(12,2),
  markup_pct numeric(8,2),
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.consultation_requests (
  id uuid primary key default gen_random_uuid(),
  requested_by uuid references auth.users(id) on delete set null,
  topic text not null,
  preferred_time text,
  notes text,
  status text not null default 'new',
  source text not null default 'booking_page',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.crm_contacts (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  email text not null unique,
  company_name text,
  pipeline_stage text not null default 'Lead',
  status text not null default 'lead',
  source text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.service_agreements (
  id uuid primary key default gen_random_uuid(),
  contact_id uuid not null unique references public.crm_contacts(id) on delete cascade,
  billing_frequency text,
  monthly_amount numeric(12,2),
  start_date date,
  end_date date,
  included_services text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.crm_activities (
  id uuid primary key default gen_random_uuid(),
  contact_id uuid not null references public.crm_contacts(id) on delete cascade,
  activity_type text not null,
  note text not null,
  follow_up_at date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.estimates (
  id uuid primary key default gen_random_uuid(),
  estimate_number text not null unique,
  contact_id uuid references public.crm_contacts(id) on delete set null,
  created_by_user_id uuid references auth.users(id) on delete set null,
  created_by_role app_role not null default 'user',
  title text not null,
  notes text,
  status text not null default 'draft',
  visible_to_client boolean not null default false,
  subtotal_sell numeric(12,2) not null default 0,
  subtotal_cost numeric(12,2) not null default 0,
  total_sell numeric(12,2) not null default 0,
  total_cost numeric(12,2) not null default 0,
  finalized_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.estimate_line_items (
  id uuid primary key default gen_random_uuid(),
  estimate_id uuid not null references public.estimates(id) on delete cascade,
  item_type text not null default 'custom',
  description text not null,
  quantity numeric(12,2) not null default 1,
  unit_sell_price numeric(12,2) not null default 0,
  unit_cost_price numeric(12,2) not null default 0,
  markup_pct numeric(8,2) not null default 0,
  source_service_id uuid references public.services(id) on delete set null,
  source_hardware_id uuid references public.hardware_catalog(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.site_settings (
  key text primary key,
  value text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name'),
    'user'
  )
  on conflict (id) do update
    set email = excluded.email,
        full_name = coalesce(excluded.full_name, public.profiles.full_name),
        updated_at = now();
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();

drop trigger if exists set_profiles_updated_at on public.profiles;
create trigger set_profiles_updated_at before update on public.profiles
for each row execute function public.set_updated_at();

drop trigger if exists set_services_updated_at on public.services;
create trigger set_services_updated_at before update on public.services
for each row execute function public.set_updated_at();

drop trigger if exists set_hardware_updated_at on public.hardware_catalog;
create trigger set_hardware_updated_at before update on public.hardware_catalog
for each row execute function public.set_updated_at();

drop trigger if exists set_consultation_requests_updated_at on public.consultation_requests;
create trigger set_consultation_requests_updated_at before update on public.consultation_requests
for each row execute function public.set_updated_at();

drop trigger if exists set_crm_contacts_updated_at on public.crm_contacts;
create trigger set_crm_contacts_updated_at before update on public.crm_contacts
for each row execute function public.set_updated_at();

drop trigger if exists set_service_agreements_updated_at on public.service_agreements;
create trigger set_service_agreements_updated_at before update on public.service_agreements
for each row execute function public.set_updated_at();

drop trigger if exists set_crm_activities_updated_at on public.crm_activities;
create trigger set_crm_activities_updated_at before update on public.crm_activities
for each row execute function public.set_updated_at();

drop trigger if exists set_estimates_updated_at on public.estimates;
create trigger set_estimates_updated_at before update on public.estimates
for each row execute function public.set_updated_at();

drop trigger if exists set_estimate_line_items_updated_at on public.estimate_line_items;
create trigger set_estimate_line_items_updated_at before update on public.estimate_line_items
for each row execute function public.set_updated_at();

drop trigger if exists set_site_settings_updated_at on public.site_settings;
create trigger set_site_settings_updated_at before update on public.site_settings
for each row execute function public.set_updated_at();

alter table public.profiles enable row level security;
alter table public.services enable row level security;
alter table public.hardware_catalog enable row level security;
alter table public.consultation_requests enable row level security;
alter table public.crm_contacts enable row level security;
alter table public.service_agreements enable row level security;
alter table public.crm_activities enable row level security;
alter table public.estimates enable row level security;
alter table public.estimate_line_items enable row level security;
alter table public.site_settings enable row level security;

create policy "profiles_select_own_or_admin"
on public.profiles for select
using (auth.uid() = id);

create policy "profiles_insert_own"
on public.profiles for insert
with check (auth.uid() = id);

create policy "profiles_update_own_or_admin"
on public.profiles for update
using (auth.uid() = id)
with check (auth.uid() = id);

create policy "services_select_public"
on public.services for select
using (true);

create policy "services_admin_write"
on public.services for all
using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'))
with check (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'));

create policy "hardware_select_public"
on public.hardware_catalog for select
using (true);

create policy "hardware_admin_write"
on public.hardware_catalog for all
using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'))
with check (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'));

create policy "consultation_requests_insert_auth"
on public.consultation_requests for insert
with check (auth.uid() = requested_by);

create policy "consultation_requests_select_owner_or_admin"
on public.consultation_requests for select
using (
  auth.uid() = requested_by
  or exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
);

create policy "consultation_requests_admin_update"
on public.consultation_requests for update
using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'))
with check (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'));

create policy "crm_contacts_admin_access"
on public.crm_contacts for all
using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'))
with check (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'));

create policy "service_agreements_admin_access"
on public.service_agreements for all
using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'))
with check (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'));

create policy "crm_activities_admin_access"
on public.crm_activities for all
using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'))
with check (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'));

create policy "estimates_admin_write"
on public.estimates for all
using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'))
with check (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'));

create policy "estimates_client_select_finalized"
on public.estimates for select
using (
  visible_to_client = true
  and status = 'finalized'
  and exists (
    select 1
    from public.crm_contacts c
    join public.profiles p on lower(p.email) = lower(c.email)
    where p.id = auth.uid()
      and c.id = estimates.contact_id
  )
);

create policy "estimate_line_items_admin_write"
on public.estimate_line_items for all
using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'))
with check (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'));

create policy "estimate_line_items_client_select_finalized"
on public.estimate_line_items for select
using (
  exists (
    select 1
    from public.estimates e
    join public.crm_contacts c on c.id = e.contact_id
    join public.profiles p on lower(p.email) = lower(c.email)
    where p.id = auth.uid()
      and e.id = estimate_line_items.estimate_id
      and e.visible_to_client = true
      and e.status = 'finalized'
  )
);

create policy "site_settings_public_select"
on public.site_settings for select
using (true);

create policy "site_settings_admin_write"
on public.site_settings for all
using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'))
with check (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'));
