import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getChainConfig } from "@/lib/chain/config";
import { ManagerChrome } from "@/components/manager/ManagerChrome";

export const dynamic = "force-dynamic";

export default async function ManagerLayout({
  params,
  children,
}: {
  params: Promise<{ chainSlug: string }>;
  children: React.ReactNode;
}) {
  const { chainSlug } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const chain = await getChainConfig(chainSlug);
  if (!chain) redirect("/");

  const { data: locations } = await supabase
    .from("locations")
    .select("id, slug, name, short_name, has_dining_area, current_mode")
    .eq("chain_id", chain.id)
    .order("name", { ascending: true });

  return (
    <ManagerChrome
      chain={{ slug: chain.slug, name: chain.brand.name }}
      brand={chain.brand}
      locations={(locations ?? []).map((l) => ({
        id: l.id,
        slug: l.slug,
        name: l.name,
        shortName: l.short_name ?? l.name,
        hasDiningArea: l.has_dining_area,
        currentMode: l.current_mode,
      }))}
      user={
        user ? { email: user.email ?? "—" } : { email: "demo · sin login" }
      }
    >
      {children}
    </ManagerChrome>
  );
}
