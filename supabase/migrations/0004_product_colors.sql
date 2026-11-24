-- Elsanour: product colors (each color has its own photos and its own "in stock").
-- Run once in Supabase dashboard > SQL Editor > New query > paste > Run.
-- Safe to run again.

-- Colors of a product, in order. Each item:
--   { "id": "c1a2b3", "name_ar": "ذهبي", "name_fr": "Doré", "name_en": "Gold",
--     "images": ["https://.../p/xxx.webp", ...], "in_stock": true }
-- Empty list = the product has no colors (works exactly as before).
alter table public.products
  add column if not exists colors jsonb not null default '[]'::jsonb;

-- The color chosen by the customer, copied at order time (Arabic name), or null.
alter table public.order_items
  add column if not exists color text check (color is null or char_length(color) <= 40);

-- place_order now also saves the color of each line.
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

  insert into public.order_items (order_id, product_slug, product_name, unit_price, quantity, line_total, color)
  select
    v_id,
    i ->> 'product_slug',
    i ->> 'product_name',
    (i ->> 'unit_price')::numeric,
    (i ->> 'quantity')::int,
    (i ->> 'line_total')::numeric,
    nullif(i ->> 'color', '')
  from jsonb_array_elements(p_items) as i;

  return v_ref;
end;
$$;

revoke execute on function public.place_order(jsonb, jsonb) from public, anon, authenticated;
grant execute on function public.place_order(jsonb, jsonb) to service_role;
