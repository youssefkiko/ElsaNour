import "server-only";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { isAdminEmail } from "./adminEmail";
import { supabaseAuth } from "./supabaseAuth";

/** The logged-in admin, or null. getUser() asks Supabase to verify the session. */
export async function getAdmin() {
  // Admin pages always render at request time (the session check reads the clock
  // to see if the login has expired, which must not happen while prerendering).
  await connection();
  const supabase = await supabaseAuth();
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user || !isAdminEmail(data.user.email)) return null;
  return data.user;
}

/** Every admin page and action calls this first: no admin = back to the login page. */
export async function requireAdmin() {
  const user = await getAdmin();
  if (!user) redirect("/admin/login");
  return user;
}
