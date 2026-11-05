-- Verifies the configs migration: constraints and that public roles cannot touch the table.
-- Runs entirely inside a transaction that is rolled back (safe on any scratch Postgres):
--   psql -v ON_ERROR_STOP=1 -f supabase/tests/configs_rls.sql
begin;

-- Supabase's API roles (created here only if this isn't a Supabase database).
do $$ begin
  if not exists (select 1 from pg_roles where rolname = 'anon') then create role anon nologin; end if;
  if not exists (select 1 from pg_roles where rolname = 'authenticated') then create role authenticated nologin; end if;
  if not exists (select 1 from pg_roles where rolname = 'service_role') then create role service_role nologin bypassrls; end if;
end $$;

-- Mimic Supabase's default grants, which the migration must revoke.
grant usage on schema public to anon, authenticated, service_role;
alter default privileges in schema public grant all on tables to anon, authenticated, service_role;

\ir ../migrations/20261106120000_create_configs.sql

-- service_role can write and read.
set local role service_role;
insert into public.configs (id, product_id, config, total_centavos)
values ('AbCdEf_123', 'chairlab-gt', '{"base":"racing"}', 1379900);
do $$ begin
  assert (select count(*) from public.configs) = 1, 'service_role should read its row';
end $$;
reset role;

-- anon and authenticated are denied outright (no grants), even for reads.
do $$
declare r text;
begin
  foreach r in array array['anon', 'authenticated'] loop
    execute format('set local role %I', r);
    begin
      perform 1 from public.configs;
      raise exception '% could read configs', r;
    exception when insufficient_privilege then null;
    end;
    begin
      insert into public.configs (id, product_id, config, total_centavos) values ('Zz_0000000', 'x', '{}', 0);
      raise exception '% could insert configs', r;
    exception when insufficient_privilege then null;
    end;
    reset role;
  end loop;
end $$;

-- Constraints.
do $$
begin
  begin
    insert into public.configs (id, product_id, config, total_centavos) values ('bad id!!!!', 'p', '{}', 0);
    raise exception 'malformed id accepted';
  exception when check_violation then null;
  end;
  begin
    insert into public.configs (id, product_id, config, total_centavos) values ('AbCdEf_124', 'p', '[]', 0);
    raise exception 'non-object config accepted';
  exception when check_violation then null;
  end;
  begin
    insert into public.configs (id, product_id, config, total_centavos) values ('AbCdEf_125', 'p', '{}', -1);
    raise exception 'negative price accepted';
  exception when check_violation then null;
  end;
end $$;

do $$ begin
  assert (select relrowsecurity from pg_class where oid = 'public.configs'::regclass), 'RLS must be enabled';
end $$;

\echo 'configs_rls: all checks passed'
rollback;
