create table if not exists public.glossary_terms (
  id uuid primary key default gen_random_uuid(),
  korean text not null,
  english text not null,
  category text not null default '',
  memo text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists glossary_terms_korean_idx
  on public.glossary_terms using gin (to_tsvector('simple', korean));

create index if not exists glossary_terms_english_idx
  on public.glossary_terms using gin (to_tsvector('simple', english));

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists glossary_terms_set_updated_at on public.glossary_terms;

create trigger glossary_terms_set_updated_at
before update on public.glossary_terms
for each row
execute function public.set_updated_at();

alter table public.glossary_terms enable row level security;

drop policy if exists "Allow glossary read" on public.glossary_terms;
create policy "Allow glossary read"
on public.glossary_terms
for select
to anon
using (true);

drop policy if exists "Allow glossary insert" on public.glossary_terms;
create policy "Allow glossary insert"
on public.glossary_terms
for insert
to anon
with check (true);

drop policy if exists "Allow glossary update" on public.glossary_terms;
create policy "Allow glossary update"
on public.glossary_terms
for update
to anon
using (true)
with check (true);

drop policy if exists "Allow glossary delete" on public.glossary_terms;
create policy "Allow glossary delete"
on public.glossary_terms
for delete
to anon
using (true);
