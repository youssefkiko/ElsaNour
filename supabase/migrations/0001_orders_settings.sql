-- Elsanour, Phase 3: orders (with a basket of several products) and settings.
-- Run once in Supabase dashboard > SQL Editor > New query > paste > Run.
-- Safe to run again: it only creates what does not exist yet.

-- ---------------------------------------------------------------------------
-- Settings: one single row (id = 1) that the owner edits (admin in Phase 5).
-- Delivery fees are PLACEHOLDERS until the owner gives the real ones.
-- ---------------------------------------------------------------------------
create table if not exists public.settings (
  id smallint primary key default 1 check (id = 1),
  delivery_fee_casablanca numeric(10, 2) not null default 20 check (delivery_fee_casablanca >= 0),
  delivery_fee_other numeric(10, 2) not null default 35 check (delivery_fee_other >= 0),
  -- Basket subtotal from which delivery is free (owner: 300 MAD; null = never free).
  free_delivery_threshold numeric(10, 2) default 300 check (free_delivery_threshold is null or free_delivery_threshold >= 0),
  store_phone text,
  instagram_url text default 'https://www.instagram.com/elsanour.ma/',
  updated_at timestamptz not null default now()
);

insert into public.settings (id) values (1) on conflict (id) do nothing;

-- ---------------------------------------------------------------------------
-- Orders: one customer, one delivery, cash on delivery.
-- The products of the order are in order_items (one row per product).
-- ---------------------------------------------------------------------------
do $$
begin
  if not exists (select 1 from pg_type where typname = 'order_status') then
    create type public.order_status as enum
      ('new', 'confirmed', 'shipped', 'delivered', 'returned', 'cancelled');
  end if;
end $$;

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  -- Short human-friendly number shown to the customer: 1001, 1002, ...
  reference bigint generated always as identity (start with 1001) unique,
  created_at timestamptz not null default now(),

  customer_name text not null check (char_length(customer_name) between 2 and 80),
  -- Stored as +2126XXXXXXXX / +2127XXXXXXXX (ready for tap-to-call and wa.me).
  phone text not null check (phone ~ '^\+212[67][0-9]{8}$'),
  city text not null check (char_length(city) between 2 and 60),
  address text not null check (char_length(address) between 5 and 250),

  -- Total number of pieces, and a short text of the basket ("slug:qty|slug:qty")
  -- used to recognise the same order sent twice.
  item_count int not null check (item_count between 1 and 50),
  items_key text not null,
  -- All computed on the server.
  subtotal numeric(10, 2) not null check (subtotal >= 0),
  delivery_fee numeric(10, 2) not null check (delivery_fee >= 0),
  total numeric(10, 2) not null check (total >= 0),

  status public.order_status not null default 'new',
  note text check (note is null or char_length(note) <= 500),

  utm_source text,
  utm_campaign text,
  locale text,
  -- SHA-256 of the visitor IP (never the IP itself), used only for the rate limit.
  ip_hash text
);

create index if not exists orders_created_at_idx on public.orders (created_at desc);
create index if not exists orders_duplicate_idx on public.orders (phone, created_at desc);
create index if not exists orders_ip_idx on public.orders (ip_hash, created_at desc);

-- One row per product in the basket. Name and price are copied at order time.
create table if not exists public.order_items (
  id bigint generated always as identity primary key,
  order_id uuid not null references public.orders (id) on delete cascade,
  -- Products are still static data in the code; Phase 5 adds product_id.
  product_slug text not null,
  product_name text not null,
  unit_price numeric(10, 2) not null check (unit_price >= 0),
  quantity int not null check (quantity between 1 and 5),
  line_total numeric(10, 2) not null check (line_total >= 0)
);

create index if not exists order_items_order_idx on public.order_items (order_id);

-- ---------------------------------------------------------------------------
-- place_order: saves the order and its products together (all or nothing).
-- Returns the order number. Only the website server (secret key) may call it.
-- ---------------------------------------------------------------------------
create or replace function public.place_order(p_order jsonb, p_items jsonb)
returns bigint
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_id uuid;
  v_ref bigint;
begin
  insert into public.orders (
    customer_name, phone, city, address, item_count, items_key,
    subtotal, delivery_fee, total, note, utm_source, utm_campaign, locale, ip_hash
  ) values (
    p_order ->> 'customer_name',
    p_order ->> 'phone',
    p_order ->> 'city',
    p_order ->> 'address',
    (p_order ->> 'item_count')::int,
    p_order ->> 'items_key',
    (p_order ->> 'subtotal')::numeric,
    (p_order ->> 'delivery_fee')::numeric,
    (p_order ->> 'total')::numeric,
    nullif(p_order ->> 'note', ''),
    p_order ->> 'utm_source',
    p_order ->> 'utm_campaign',
    p_order ->> 'locale',
    p_order ->> 'ip_hash'
  )
  returning id, reference into v_id, v_ref;

  insert into public.order_items (order_id, product_slug, product_name, unit_price, quantity, line_total)
  select
    v_id,
    i ->> 'product_slug',
    i ->> 'product_name',
    (i ->> 'unit_price')::numeric,
    (i ->> 'quantity')::int,
    (i ->> 'line_total')::numeric
  from jsonb_array_elements(p_items) as i;

  return v_ref;
end;
$$;

revoke execute on function public.place_order(jsonb, jsonb) from public, anon, authenticated;
grant execute on function public.place_order(jsonb, jsonb) to service_role;

-- ---------------------------------------------------------------------------
-- Security: Row Level Security ON and NO public policy.
-- The browser (publishable key) can neither read nor write these tables.
-- Only the website server, with the secret key, saves orders.
-- Phase 4 adds the policies for the logged-in admin.
-- ---------------------------------------------------------------------------
alter table public.settings enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
