create or replace function public.ping()
returns boolean
language sql
security definer
as $$
    select true;
$$;

grant execute on function public.ping() to anon, authenticated;
