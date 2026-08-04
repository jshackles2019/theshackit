create or replace function public.handle_new_crm_contact()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.crm_contacts (full_name, email, source)
  values (
    coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name', new.email),
    new.email,
    'auth_signup'
  )
  on conflict (email) do update
    set full_name = excluded.full_name,
        updated_at = now();

  return new;
end;
$$;

drop trigger if exists on_auth_user_created_crm_contact on auth.users;
create trigger on_auth_user_created_crm_contact
after insert on auth.users
for each row execute procedure public.handle_new_crm_contact();

insert into public.crm_contacts (full_name, email, source)
select
  coalesce(p.full_name, split_part(p.email, '@', 1)),
  p.email,
  'auth_signup_backfill'
from public.profiles p
where not exists (
  select 1
  from public.crm_contacts c
  where lower(c.email) = lower(p.email)
);
