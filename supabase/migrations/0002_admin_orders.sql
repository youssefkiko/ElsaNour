-- Elsanour, Phase 4: what the admin needs on orders.
-- Run once in Supabase dashboard > SQL Editor > New query > paste > Run.
-- Safe to run again.

-- Private note written by the shop (never shown to the customer).
alter table public.orders
  add column if not exists internal_note text check (internal_note is null or char_length(internal_note) <= 2000);

-- When the order was last changed by the admin (status or note).
alter table public.orders
  add column if not exists updated_at timestamptz not null default now();

-- Fast filters by status and date in the admin list.
create index if not exists orders_status_created_idx on public.orders (status, created_at desc);

-- Security stays the same: Row Level Security ON, no public policy.
-- The admin pages read and write orders on the server with the secret key, and only
-- after checking that the logged-in user is the shop's admin account.
