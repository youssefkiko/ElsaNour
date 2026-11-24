/**
 * The shop has ONE admin account (Supabase Auth). Its email is set in ADMIN_EMAIL
 * (.env.local and Vercel; several emails can be separated by commas). Any other
 * account, even if it could log in, is refused.
 */
export function isAdminEmail(email: string | null | undefined): boolean {
  const allowed = (process.env.ADMIN_EMAIL ?? "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
  return !!email && allowed.includes(email.toLowerCase());
}
