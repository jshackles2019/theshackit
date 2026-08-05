alter table public.crm_contacts
add column if not exists active boolean not null default true;

