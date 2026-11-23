import "server-only";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Supabase client with the SECRET key. Server only: it bypasses Row Level Security,
 * so it must never be imported by a "use client" file (the "server-only" import above
 * makes the build fail if that happens).
 * Returns null when the keys are missing (e.g. on a preview without env vars).
 */
let client: SupabaseClient | null | undefined;

export function supabaseAdmin(): SupabaseClient | null {
  if (client !== undefined) return client;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SECRET_KEY;
  client =
    url && key
      ? createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } })
      : null;
  return client;
}
