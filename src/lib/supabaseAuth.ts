import "server-only";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

/**
 * Supabase client for LOGIN only (publishable key + the visitor's session cookies).
 * Used by the admin pages and actions to know who is logged in. Order data is never
 * read with this client: after the admin check, the pages use supabaseAdmin().
 */
export async function supabaseAuth() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) throw new Error("Supabase URL / publishable key are missing");

  const store = await cookies();
  return createServerClient(url, key, {
    cookies: {
      getAll: () => store.getAll(),
      setAll: (list) => {
        try {
          for (const { name, value, options } of list) store.set(name, value, options);
        } catch {
          // Called from a Server Component: cookies are read-only there. The proxy
          // refreshes the session cookies on every /admin request, so this is fine.
        }
      },
    },
  });
}
