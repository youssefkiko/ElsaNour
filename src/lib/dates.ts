/** Dates in Morocco time (Africa/Casablanca), for the admin. */
export const SHOP_TIME_ZONE = "Africa/Casablanca";

const dateTime = new Intl.DateTimeFormat("ar-MA-u-nu-latn", {
  timeZone: SHOP_TIME_ZONE,
  day: "numeric",
  month: "short",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
});

/** e.g. "23 نونبر 2026، 21:35" */
export const formatDateTime = (iso: string) => dateTime.format(new Date(iso));

/** Today's date in Morocco as YYYY-MM-DD. */
export function todayInShop(now = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: SHOP_TIME_ZONE }).format(now);
}

/** YYYY-MM-DD shifted by a number of days. */
export function addDays(day: string, days: number): string {
  const d = new Date(`${day}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

/** The UTC instant when a Morocco calendar day (YYYY-MM-DD) starts. */
export function shopDayStartUtc(day: string): Date {
  const noonUtc = new Date(`${day}T12:00:00Z`);
  // Offset of Morocco on that day, e.g. "GMT+1" (Morocco moves to GMT+0 during Ramadan).
  const name =
    new Intl.DateTimeFormat("en-US", { timeZone: SHOP_TIME_ZONE, timeZoneName: "shortOffset" })
      .formatToParts(noonUtc)
      .find((p) => p.type === "timeZoneName")?.value ?? "GMT";
  const m = name.match(/GMT([+-])(\d{1,2})(?::(\d{2}))?/);
  const offsetMin = m ? (m[1] === "-" ? -1 : 1) * (Number(m[2]) * 60 + Number(m[3] ?? 0)) : 0;
  return new Date(Date.parse(`${day}T00:00:00Z`) - offsetMin * 60_000);
}

export const isDay = (v: unknown): v is string => typeof v === "string" && /^\d{4}-\d{2}-\d{2}$/.test(v);

/** "2026-11-24 00:25" in Morocco time (for the CSV export, sorts well in Excel). */
export function csvDateTime(iso: string): string {
  const p = Object.fromEntries(
    new Intl.DateTimeFormat("en-GB", {
      timeZone: SHOP_TIME_ZONE,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    })
      .formatToParts(new Date(iso))
      .map((x) => [x.type, x.value]),
  );
  return `${p.year}-${p.month}-${p.day} ${p.hour}:${p.minute}`;
}
