import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { buildNocPayload } from "@/lib/queries/noc-snapshot";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const chain = searchParams.get("chain");
  if (!chain) return NextResponse.json({ error: "missing chain" }, { status: 400 });

  const supabase = await createClient();
  const payload = await buildNocPayload(supabase, chain);
  if (!payload) return NextResponse.json({ error: "chain not found" }, { status: 404 });
  return NextResponse.json(payload);
}
