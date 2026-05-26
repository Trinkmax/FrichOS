import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { buildNocPayload } from "@/lib/queries/noc-snapshot";
import { NocVirtualV2 } from "@/components/owner/noc/NocVirtualV2";

export const dynamic = "force-dynamic";

export default async function NocPage({
  params,
}: {
  params: Promise<{ chainSlug: string }>;
}) {
  const { chainSlug } = await params;
  const supabase = await createClient();
  const payload = await buildNocPayload(supabase, chainSlug);
  if (!payload) notFound();
  return <NocVirtualV2 chainSlug={chainSlug} initialData={payload} />;
}
