-- Add support tickets system
-- Includes tickets table, replies, attachments, and email settings

-- Support ticket table
create table if not exists public.support_tickets (
  id uuid default gen_random_uuid() primary key,
  contact_id uuid not null references public.crm_contacts(id) on delete cascade,
  subject text not null,
  description text not null,
  status text not null default 'open' check (status in ('open', 'in_progress', 'on_hold', 'resolved', 'closed')),
  priority text not null default 'medium' check (priority in ('low', 'medium', 'high', 'urgent')),
  assigned_to_admin uuid references public.profiles(id) on delete set null,
  created_by uuid not null references public.profiles(id) on delete restrict,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now(),
  resolved_at timestamp with time zone,
  source text not null default 'dashboard' check (source in ('dashboard', 'email'))
);

-- Ticket replies/comments
create table if not exists public.ticket_replies (
  id uuid default gen_random_uuid() primary key,
  ticket_id uuid not null references public.support_tickets(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete restrict,
  message text not null,
  is_internal_note boolean not null default false,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now()
);

-- Ticket attachments
create table if not exists public.ticket_attachments (
  id uuid default gen_random_uuid() primary key,
  ticket_id uuid not null references public.support_tickets(id) on delete cascade,
  file_name text not null,
  file_url text not null,
  file_size_bytes integer,
  mime_type text,
  uploaded_by uuid not null references public.profiles(id) on delete restrict,
  uploaded_at timestamp with time zone not null default now()
);

-- Support email settings (one row per organization)
create table if not exists public.support_email_settings (
  id uuid default gen_random_uuid() primary key,
  support_email text not null unique,
  forward_to_admin_email text,
  auto_response_subject text default 'We received your support request',
  auto_response_body text default 'Thank you for contacting us. Your ticket has been created and will be reviewed shortly.',
  enabled boolean not null default true,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now()
);

-- Indexes for common queries
create index if not exists support_tickets_contact_id_idx on public.support_tickets(contact_id);
create index if not exists support_tickets_assigned_to_admin_idx on public.support_tickets(assigned_to_admin);
create index if not exists support_tickets_created_by_idx on public.support_tickets(created_by);
create index if not exists support_tickets_status_idx on public.support_tickets(status);
create index if not exists support_tickets_created_at_idx on public.support_tickets(created_at desc);
create index if not exists ticket_replies_ticket_id_idx on public.ticket_replies(ticket_id);
create index if not exists ticket_attachments_ticket_id_idx on public.ticket_attachments(ticket_id);

-- RLS Policies

-- Support tickets: Admins see all tickets; clients see only their own
alter table public.support_tickets enable row level security;

create policy "support_tickets_admin_all" on public.support_tickets
  for all
  using (auth.jwt() ->> 'role' = 'authenticated' and (select role from public.profiles where id = auth.uid()) = 'admin')
  with check (auth.jwt() ->> 'role' = 'authenticated' and (select role from public.profiles where id = auth.uid()) = 'admin');

create policy "support_tickets_client_own" on public.support_tickets
  for select
  using (
    auth.jwt() ->> 'role' = 'authenticated'
    and (select role from public.profiles where id = auth.uid()) = 'client'
    and contact_id in (select id from public.crm_contacts where email = (select email from public.profiles where id = auth.uid()))
  );

create policy "support_tickets_client_create" on public.support_tickets
  for insert
  with check (
    auth.jwt() ->> 'role' = 'authenticated'
    and (select role from public.profiles where id = auth.uid()) = 'client'
    and created_by = auth.uid()
    and contact_id in (select id from public.crm_contacts where email = (select email from public.profiles where id = auth.uid()))
  );

-- Ticket replies: Similar access control
alter table public.ticket_replies enable row level security;

create policy "ticket_replies_admin_all" on public.ticket_replies
  for all
  using ((select role from public.profiles where id = auth.uid()) = 'admin');

create policy "ticket_replies_client_read" on public.ticket_replies
  for select
  using (
    (select role from public.profiles where id = auth.uid()) = 'client'
    and ticket_id in (
      select id from public.support_tickets
      where contact_id in (select id from public.crm_contacts where email = (select email from public.profiles where id = auth.uid()))
      and is_internal_note = false
    )
  );

create policy "ticket_replies_client_create" on public.ticket_replies
  for insert
  with check (
    (select role from public.profiles where id = auth.uid()) = 'client'
    and user_id = auth.uid()
    and is_internal_note = false
    and ticket_id in (
      select id from public.support_tickets
      where contact_id in (select id from public.crm_contacts where email = (select email from public.profiles where id = auth.uid()))
    )
  );

-- Ticket attachments: Similar access control
alter table public.ticket_attachments enable row level security;

create policy "ticket_attachments_admin_all" on public.ticket_attachments
  for all
  using ((select role from public.profiles where id = auth.uid()) = 'admin');

create policy "ticket_attachments_client_read" on public.ticket_attachments
  for select
  using (
    (select role from public.profiles where id = auth.uid()) = 'client'
    and ticket_id in (
      select id from public.support_tickets
      where contact_id in (select id from public.crm_contacts where email = (select email from public.profiles where id = auth.uid()))
    )
  );

create policy "ticket_attachments_client_insert" on public.ticket_attachments
  for insert
  with check (
    (select role from public.profiles where id = auth.uid()) = 'client'
    and uploaded_by = auth.uid()
    and ticket_id in (
      select id from public.support_tickets
      where contact_id in (select id from public.crm_contacts where email = (select email from public.profiles where id = auth.uid()))
    )
  );

-- Support email settings: Admin only
alter table public.support_email_settings enable row level security;

create policy "support_email_settings_admin" on public.support_email_settings
  for all
  using ((select role from public.profiles where id = auth.uid()) = 'admin')
  with check ((select role from public.profiles where id = auth.uid()) = 'admin');
