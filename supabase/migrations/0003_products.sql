-- Elsanour, Phase 5: products in the database (edited from /admin) and their photos.
-- Run once in Supabase dashboard > SQL Editor > New query > paste > Run.
-- Safe to run again: it only creates what does not exist yet.

-- ---------------------------------------------------------------------------
-- Products
-- ---------------------------------------------------------------------------
create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  -- Used in the page address (/ar/product/<slug>). Never changes after creation.
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$' and char_length(slug) <= 80),
  category text not null check (category in ('necklaces', 'earrings', 'rings', 'bracelets', 'watches', 'packs')),

  name_ar text not null check (char_length(name_ar) between 2 and 80),
  name_fr text check (name_fr is null or char_length(name_fr) <= 80),
  name_en text check (name_en is null or char_length(name_en) <= 80),
  -- Optional; when empty the site shows the short text of the collection.
  description_ar text check (description_ar is null or char_length(description_ar) <= 1000),
  description_fr text check (description_fr is null or char_length(description_fr) <= 1000),
  description_en text check (description_en is null or char_length(description_en) <= 1000),

  price numeric(10, 2) not null check (price > 0),
  compare_at numeric(10, 2) check (compare_at is null or compare_at > 0),
  -- Photo addresses (Supabase Storage, bucket "products"), first = main photo.
  images text[] not null default '{}',
  -- What is in the gift box (keys translated by the site: necklace, ring, giftBox...).
  includes text[] not null default '{}',

  in_stock boolean not null default true,
  -- Hidden products are not shown on the site (and cannot be ordered).
  is_active boolean not null default true,
  -- Order inside its collection (1 = first).
  sort_order int not null default 0,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists products_category_idx on public.products (category, sort_order);

-- The 18 placeholder products of Phase 2 (the owner replaces them with the real ones).
insert into public.products
  (slug, category, name_ar, name_fr, name_en, price, compare_at, includes, in_stock, is_active, sort_order)
values
  ('nour-necklace', 'necklaces', 'قلادة نور', 'Collier Nour', 'Nour Necklace', 189, 229, array['necklace', 'giftBox']::text[], true, true, 1),
  ('pearl-necklace', 'necklaces', 'قلادة اللؤلؤ', 'Collier Perle', 'Pearl Necklace', 219, null, array['pearlNecklace', 'giftBox']::text[], true, true, 2),
  ('moon-necklace', 'necklaces', 'قلادة القمر', 'Collier Lune', 'Moon Necklace', 199, null, array['necklace', 'giftBox']::text[], true, true, 3),
  ('star-earrings', 'earrings', 'أقراط النجمة', 'Boucles Étoile', 'Star Earrings', 149, null, array['earrings', 'giftBox']::text[], true, true, 1),
  ('pearl-earrings', 'earrings', 'أقراط اللؤلؤ', 'Boucles Perle', 'Pearl Earrings', 159, 199, array['pearlEarrings', 'giftBox']::text[], true, true, 2),
  ('golden-hoops', 'earrings', 'أقراط الحلقة الذهبية', 'Créoles Dorées', 'Golden Hoops', 139, null, array['hoops', 'giftBox']::text[], true, true, 3),
  ('diamond-ring', 'rings', 'خاتم الألماسة', 'Bague Diamant', 'Diamond Ring', 179, null, array['ring', 'giftBox']::text[], true, true, 1),
  ('crown-ring', 'rings', 'خاتم التاج', 'Bague Couronne', 'Crown Ring', 169, 209, array['ring', 'giftBox']::text[], true, true, 2),
  ('emerald-ring', 'rings', 'خاتم الزمرد', 'Bague Émeraude', 'Emerald Ring', 189, null, array['ring', 'giftBox']::text[], true, true, 3),
  ('fine-bracelet', 'bracelets', 'سوار رفيع', 'Bracelet Fin', 'Fine Bracelet', 129, null, array['bracelet', 'giftBox']::text[], true, true, 1),
  ('pearl-bracelet', 'bracelets', 'سوار اللؤلؤ', 'Bracelet Perle', 'Pearl Bracelet', 149, null, array['pearlBracelet', 'giftBox']::text[], true, true, 2),
  ('stars-bracelet', 'bracelets', 'سوار النجوم', 'Bracelet Étoiles', 'Stars Bracelet', 139, 179, array['bracelet', 'giftBox']::text[], true, true, 3),
  ('queen-watch', 'watches', 'ساعة الملكة', 'Montre Reine', 'Queen Watch', 299, 349, array['watch', 'giftBox']::text[], true, true, 1),
  ('emerald-watch', 'watches', 'ساعة الزمرد', 'Montre Émeraude', 'Emerald Watch', 279, null, array['watch', 'giftBox']::text[], true, true, 2),
  ('classic-gold-watch', 'watches', 'ساعة ذهبية كلاسيك', 'Montre Dorée Classique', 'Classic Gold Watch', 259, null, array['watch', 'giftBox']::text[], false, true, 3),
  ('princess-pack', 'packs', 'باقة الأميرة', 'Coffret Princesse', 'Princess Pack', 249, null, array['necklace', 'earrings', 'bracelet', 'giftBox']::text[], true, true, 1),
  ('queen-pack', 'packs', 'باقة الملكة', 'Coffret Reine', 'Queen Pack', 349, 399, array['watch', 'necklace', 'earrings', 'bracelet', 'giftBox']::text[], true, true, 2),
  ('pearl-pack', 'packs', 'باقة اللؤلؤ', 'Coffret Perle', 'Pearl Pack', 279, null, array['pearlNecklace', 'pearlEarrings', 'pearlBracelet', 'giftBox']::text[], true, true, 3)

on conflict (slug) do nothing;

-- ---------------------------------------------------------------------------
-- Photos: public bucket "products" (anyone can SEE a photo, like on any shop).
-- Uploads go through the admin only (signed upload links made by the server).
-- Max 5 MB per file, images only.
-- ---------------------------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('products', 'products', true, 5242880, array['image/webp', 'image/jpeg', 'image/png'])
on conflict (id) do nothing;

-- ---------------------------------------------------------------------------
-- Security: Row Level Security ON and NO public policy.
-- The site reads products on the server; only the admin (server, secret key) writes.
-- ---------------------------------------------------------------------------
alter table public.products enable row level security;
