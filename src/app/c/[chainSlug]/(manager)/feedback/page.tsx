import { createClient } from "@/lib/supabase/server";
import { FeedbackInbox } from "@/components/manager/FeedbackInbox";

export const dynamic = "force-dynamic";

export default async function FeedbackPage({ params }: { params: Promise<{ chainSlug: string }> }) {
  const { chainSlug } = await params;
  const supabase = await createClient();
  const [responses, nps] = await Promise.all([
    supabase
      .from("feedback_responses")
      .select("*, locations(short_name)")
      .order("responded_at", { ascending: false })
      .limit(50),
    supabase.from("v_nps_by_location").select("*").order("day", { ascending: false }).limit(30),
  ]);
  return (
    <FeedbackInbox
      chainSlug={chainSlug}
      responses={(responses.data ?? []) as never}
      nps={(nps.data ?? []) as never}
    />
  );
}
