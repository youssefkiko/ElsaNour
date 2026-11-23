/**
 * Ad tracking (UTM). When a visitor lands from an ad link such as
 * /ar?utm_source=instagram&utm_campaign=summer, the proxy keeps those two values in a
 * cookie for 30 days, and the order saves them. The latest ad clicked wins.
 */
export const UTM_COOKIE = "els_utm";
export const UTM_MAX_AGE = 60 * 60 * 24 * 30;

const clean = (value: string | null | undefined): string | null => {
  const v = (value ?? "").trim().slice(0, 100);
  return v === "" ? null : v;
};

export function utmFromSearchParams(params: URLSearchParams): string | null {
  const source = clean(params.get("utm_source"));
  const campaign = clean(params.get("utm_campaign"));
  if (!source && !campaign) return null;
  return JSON.stringify({ source, campaign });
}

export function readUtmCookie(value: string | undefined): { source: string | null; campaign: string | null } {
  try {
    const parsed = JSON.parse(value ?? "") as { source?: unknown; campaign?: unknown };
    return {
      source: typeof parsed.source === "string" ? clean(parsed.source) : null,
      campaign: typeof parsed.campaign === "string" ? clean(parsed.campaign) : null,
    };
  } catch {
    return { source: null, campaign: null };
  }
}
