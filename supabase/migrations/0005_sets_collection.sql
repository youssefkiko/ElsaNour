-- Elsanour, Phase 8: new collection "sets" (الأطقم / Ensembles / Sets), owner request 2026-11-25.
-- Run once in Supabase: SQL Editor -> New query -> paste -> Run.

-- 1) Allow the new collection name in products.category.
do $$
declare c record;
begin
  -- Remove the old rule that only allowed the 6 first collections (whatever its name).
  for c in
    select con.conname
    from pg_constraint con
    where con.conrelid = 'public.products'::regclass
      and con.contype = 'c'
      and pg_get_constraintdef(con.oid) ilike '%category%'
  loop
    execute format('alter table public.products drop constraint %I', c.conname);
  end loop;
end $$;

alter table public.products
  add constraint products_category_check
  check (category in ('necklaces', 'earrings', 'rings', 'bracelets', 'watches', 'sets', 'packs'));

-- 2) Move the real set "طقم الأوراق اللامعة" from gift packs to sets.
update public.products
set category = 'sets'
where slug = 'parure-feuilles-scintillantes';

-- Check: should show the product in "sets".
select slug, name_ar, category from public.products where category = 'sets';
