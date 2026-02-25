-- Add contact fields to companies if they don't exist
do $$ begin
  if not exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'companies' and column_name = 'contact_url'
  ) then
    alter table public.companies add column contact_url text;
  end if;
  if not exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'companies' and column_name = 'phone'
  ) then
    alter table public.companies add column phone text;
  end if;
  if not exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'companies' and column_name = 'email'
  ) then
    alter table public.companies add column email text;
  end if;
  if not exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'companies' and column_name = 'address'
  ) then
    alter table public.companies add column address text;
  end if;
end $$;

