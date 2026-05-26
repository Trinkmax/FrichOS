import { createClient } from "@/lib/supabase/server";
import { KaizenPanel } from "@/components/manager/KaizenPanel";

export const dynamic = "force-dynamic";

export default async function KaizenPage({ params }: { params: Promise<{ chainSlug: string }> }) {
  const { chainSlug } = await params;
  const supabase = await createClient();
  const [hypotheses, experiments] = await Promise.all([
    supabase.from("kaizen_hypotheses").select("*").order("generated_at", { ascending: false }).limit(20),
    supabase.from("experiments_pdca").select("*").order("created_at", { ascending: false }).limit(10),
  ]);
  return <KaizenPanel chainSlug={chainSlug} hypotheses={(hypotheses.data ?? []) as never} experiments={(experiments.data ?? []) as never} />;
}
