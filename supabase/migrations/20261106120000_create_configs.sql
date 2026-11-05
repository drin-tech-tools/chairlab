-- Saved ChairLab builds, addressed by a content hash of (product, config): see src/lib/configurator/share-id.ts.
-- Rows are immutable and bounded by the catalog's combinations.

create table if not exists public.configs (
  id             text        primary key check (id ~ '^[A-Za-z0-9_-]{10}$'),
  product_id     text        not null check (char_length(product_id) between 1 and 64),
  config         jsonb       not null check (jsonb_typeof(config) = 'object' and pg_column_size(config) <= 2048),
  total_centavos integer     not null check (total_centavos >= 0),
  created_at     timestamptz not null default now()
);

comment on table public.configs is 'Saved configurator builds. Written and read only by the Next.js BFF via the service role.';
comment on column public.configs.total_centavos is 'Server-computed price snapshot at save time, integer centavos (PHP).';

-- Analytics: builds per product over time.
create index if not exists configs_product_created_idx on public.configs (product_id, created_at desc);

-- Deny-by-default. No policies are defined, so anon/authenticated (the public API keys) can do nothing;
-- the BFF uses the service role, which bypasses RLS and never reaches the browser.
alter table public.configs enable row level security;
revoke all on table public.configs from anon, authenticated;
