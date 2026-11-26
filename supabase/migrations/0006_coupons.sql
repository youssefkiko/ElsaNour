-- Elsanour: "thank you" coupons (owner request, 2026-11-26).
-- Every order earns a coupon code for the next order: 10% off the products, usable once,
-- only with the same phone number, valid 60 days from the day the order is marked
-- "delivered" in the admin (so a fake order that is never paid earns nothing).
-- Run once in Supabase dashboard > SQL Editor > New query > paste > Run. Safe to run again.

create table if not exists public.coupons (
  code text primary key check (code ~ '^ELS-[A-Z2-9]{6}$'),
  -- The customer's phone (+2126XXXXXXXX): only this number can use the code.
  phone text not null check (phone ~ '^\+212[67][0-9]{8}$'),
  percent int not null default 10 check (percent between 1 and 50),
  -- The order that earned the coupon.
  earned_order_id uuid not null references public.orders (id) on delete cascade,
  created_at timestamptz not null default now(),
  -- Filled when that order is marked delivered; the code works for 60 days from then.
  active_from timestamptz,
  -- Filled when the code is used, with the order that used it.
  used_at timestamptz,
  used_order_id uuid references public.orders (id) on delete set null
);

create index if not exists coupons_earned_idx on public.coupons (earned_order_id);

-- Orders remember the code they used and the discount it gave (0 = none).
alter table public.orders add column if not exists coupon_code text;
alter table public.orders add column if not exists discount numeric(10, 2) not null default 0 check (discount >= 0);

-- The coupon follows the status of the order that earned it:
-- delivered -> the code starts working; back to another status -> it stops (if unused).
create or replace function public.coupon_follow_status()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  if new.status = 'delivered' and old.status is distinct from 'delivered' then
    update public.coupons set active_from = coalesce(active_from, now())
    where earned_order_id = new.id;
  elsif old.status = 'delivered' and new.status is distinct from 'delivered' then
    update public.coupons set active_from = null
    where earned_order_id = new.id and used_at is null;
  end if;
  return new;
end;
$$;

drop trigger if exists orders_coupon_follow_status on public.orders;
create trigger orders_coupon_follow_status
  after update of status on public.orders
  for each row execute function public.coupon_follow_status();

-- place_order now also:
--  * uses a coupon (p_order.coupon_code + p_order.discount), checked again here so the
--    same code can never be used twice, even by two orders sent at the same second;
--  * saves the new coupon earned by this order (p_order.new_coupon).
create or replace function public.place_order(p_order jsonb, p_items jsonb)
returns bigint
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_id uuid;
  v_ref bigint;
  v_code text := nullif(p_order ->> 'coupon_code', '');
  v_new text := nullif(p_order ->> 'new_coupon', '');
begin
  insert into public.orders (
    customer_name, phone, city, address, item_count, items_key,
    subtotal, delivery_fee, total, note, utm_source, utm_campaign, locale, ip_hash,
    coupon_code, discount
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
    p_order ->> 'ip_hash',
    v_code,
    coalesce((p_order ->> 'discount')::numeric, 0)
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

  if v_code is not null then
    update public.coupons
    set used_at = now(), used_order_id = v_id
    where code = v_code
      and phone = p_order ->> 'phone'
      and used_at is null
      and active_from is not null
      and active_from > now() - interval '60 days';
    if not found then
      raise exception 'coupon_invalid';
    end if;
  end if;

  if v_new is not null then
    insert into public.coupons (code, phone, percent, earned_order_id)
    values (v_new, p_order ->> 'phone', coalesce((p_order ->> 'new_coupon_percent')::int, 10), v_id);
  end if;

  return v_ref;
end;
$$;

revoke execute on function public.place_order(jsonb, jsonb) from public, anon, authenticated;
grant execute on function public.place_order(jsonb, jsonb) to service_role;

-- Security: Row Level Security ON and no public policy, like the orders.
-- Only the website server (secret key) reads and writes coupons.
alter table public.coupons enable row level security;
