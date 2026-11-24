import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { defaultLocale, locales } from "@/i18n/config";
import { isAdminEmail } from "@/lib/adminEmail";
import { UTM_COOKIE, UTM_MAX_AGE, utmFromSearchParams } from "@/lib/utm";

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (pathname === "/admin" || pathname.startsWith("/admin/")) return adminProxy(request);
  return siteProxy(request);
}

/**
 * Public site: every page lives under /ar, /fr or /en; a URL without a language prefix
 * is redirected to Arabic. Ad links (?utm_source=...&utm_campaign=...) are remembered
 * in a cookie for the order.
 */
function siteProxy(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl;

  const hasLocalePrefix = locales.some(
    (locale) => pathname === `/${locale}` || pathname.startsWith(`/${locale}/`),
  );

  let response: NextResponse | undefined;
  if (!hasLocalePrefix) {
    const url = request.nextUrl.clone();
    url.pathname = `/${defaultLocale}${pathname === "/" ? "" : pathname}`;
    response = NextResponse.redirect(url);
  }

  const utm = utmFromSearchParams(searchParams);
  if (utm) {
    response ??= NextResponse.next();
    response.cookies.set(UTM_COOKIE, utm, {
      maxAge: UTM_MAX_AGE,
      path: "/",
      sameSite: "lax",
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
    });
  }

  return response;
}

/**
 * Admin (/admin): refreshes the Supabase login session cookies and lets only the shop's
 * admin account through. Anyone else is sent to /admin/login before any page renders.
 * (Each admin page and action checks again on the server.)
 */
async function adminProxy(request: NextRequest) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  const isLogin = request.nextUrl.pathname === "/admin/login";

  let response = NextResponse.next({ request });
  let isAdmin = false;

  if (url && key) {
    const supabase = createServerClient(url, key, {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (list) => {
          for (const { name, value } of list) request.cookies.set(name, value);
          response = NextResponse.next({ request });
          for (const { name, value, options } of list) response.cookies.set(name, value, options);
        },
      },
    });
    const { data } = await supabase.auth.getUser();
    isAdmin = isAdminEmail(data.user?.email);
  }

  const goTo = (path: string) => {
    const redirect = NextResponse.redirect(new URL(path, request.url));
    // Keep any refreshed session cookies.
    for (const cookie of response.cookies.getAll()) redirect.cookies.set(cookie);
    return redirect;
  };

  if (!isAdmin && !isLogin) response = goTo("/admin/login");
  else if (isAdmin && isLogin) response = goTo("/admin");

  // Never in Google, never cached by a shared cache.
  response.headers.set("X-Robots-Tag", "noindex, nofollow");
  response.headers.set("Cache-Control", "private, no-store");
  return response;
}

export const config = {
  // Skip Next.js internals, API routes and any file with an extension (images, favicon...).
  matcher: ["/((?!_next|api|.*\\..*).*)"],
};
