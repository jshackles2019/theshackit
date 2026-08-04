create table if not exists public.invoices (
  id uuid primary key default gen_random_uuid(),
  invoice_number text not null unique,
  contact_id uuid not null references public.crm_contacts(id) on delete cascade,
  estimate_id uuid unique references public.estimates(id) on delete set null,
  title text not null,
  notes text,
  status text not null default 'draft',
  issued_at timestamptz,
  due_date date,
  subtotal numeric(12,2) not null default 0,
  tax_total numeric(12,2) not null default 0,
  total numeric(12,2) not null default 0,
  amount_paid numeric(12,2) not null default 0,
  balance_due numeric(12,2) not null default 0,
  payment_method text,
  sent_at timestamptz,
  paid_at timestamptz,
  created_by_user_id uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.invoice_payments (
  id uuid primary key default gen_random_uuid(),
  invoice_id uuid not null references public.invoices(id) on delete cascade,
  amount numeric(12,2) not null,
  method text not null,
  reference text,
  notes text,
  received_at timestamptz not null default now(),
  created_by_user_id uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists set_invoices_updated_at on public.invoices;
create trigger set_invoices_updated_at before update on public.invoices
for each row execute function public.set_updated_at();

drop trigger if exists set_invoice_payments_updated_at on public.invoice_payments;
create trigger set_invoice_payments_updated_at before update on public.invoice_payments
for each row execute function public.set_updated_at();

alter table public.invoices enable row level security;
alter table public.invoice_payments enable row level security;

create policy "invoices_admin_access"
on public.invoices for all
using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'))
with check (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'));

create policy "invoices_client_select"
on public.invoices for select
using (
  status <> 'draft'
  and exists (
    select 1
    from public.crm_contacts c
    join public.profiles p on lower(p.email) = lower(c.email)
    where p.id = auth.uid()
      and c.id = invoices.contact_id
  )
);

create policy "invoice_payments_admin_access"
on public.invoice_payments for all
using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'))
with check (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'));

create policy "invoice_payments_client_select"
on public.invoice_payments for select
using (
  exists (
    select 1
    from public.invoices i
    join public.crm_contacts c on c.id = i.contact_id
    join public.profiles p on lower(p.email) = lower(c.email)
    where p.id = auth.uid()
      and i.id = invoice_payments.invoice_id
      and i.status <> 'draft'
  )
);

insert into public.invoices (invoice_number, contact_id, estimate_id, title, notes, status, issued_at, due_date, subtotal, tax_total, total, amount_paid, balance_due, sent_at)
select
  'INV-' || e.estimate_number,
  e.contact_id,
  e.id,
  e.title,
  e.notes,
  'sent',
  coalesce(e.finalized_at, now()),
  current_date + 30,
  e.total_sell,
  0,
  e.total_sell,
  0,
  e.total_sell,
  coalesce(e.finalized_at, now())
from public.estimates e
where e.status = 'finalized'
  and e.contact_id is not null
  and not exists (
    select 1
    from public.invoices i
    where i.estimate_id = e.id
  );
