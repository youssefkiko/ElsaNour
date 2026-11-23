import { NextResponse, type NextRequest } from "next/server";
import { defaultLocale, locales } from "@/i18n/config";
import { UTM_COOKIE, UTM_MAX_AGE, utmFromSearchParams } from "@/lib/utm";

// Every public page lives under /ar, /fr or /en.
// A URL without a language prefix is redirected to the default (Arabic).
// Ad links (?utm_source=...&utm_campaign=...) are remembered in a cookie for the order.
export function proxy(request: NextRequest) {
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

export const config = {
  // Skip Next.js internals, API routes and any file with an extension (images, favicon...).
  matcher: ["/((?!_next|api|.*\\..*).*)"],
};
