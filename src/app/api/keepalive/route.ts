import { connection, NextResponse, type NextRequest } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

/**
 * Daily "alarm" (Vercel Cron, see vercel.json): one tiny database read so that the free
 * Supabase project never counts as inactive and is not paused after 7 quiet days.
 * Returns no shop data. If CRON_SECRET is set in Vercel, only Vercel's cron may call it.
 */
export async function GET(request: NextRequest) {
  await connection(); // always run, never cached

  const secret = process.env.CRON_SECRET;
  if (secret && request.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  const db = supabaseAdmin();
  if (!db) return NextResponse.json({ ok: false, error: "missing keys" }, { status: 500 });

  const { error } = await db.from("settings").select("id").eq("id", 1).maybeSingle();
  if (error) {
    console.error("[keepalive] database read failed:", error.message);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
  return NextResponse.json({ ok: true, at: new Date().toISOString() });
}
