import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("andon_pulls")
    .select("id, state, triggered_at, station_slug, note, location_id, andon_categories(name, color, slug), locations(short_name)")
    .not("state", "in", "(resolved,cancelled)")
    .order("triggered_at", { ascending: false });
  return NextResponse.json({ open: data ?? [] });
}
