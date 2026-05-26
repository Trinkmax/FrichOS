import { createClient } from "@/lib/supabase/server";
import { SkillsMatrixView } from "@/components/manager/SkillsMatrixView";

export const dynamic = "force-dynamic";

export default async function TeamPage({ params }: { params: Promise<{ chainSlug: string }> }) {
  const { chainSlug } = await params;
  const supabase = await createClient();
  const [employees, skills, locations] = await Promise.all([
    supabase
      .from("employees")
      .select("id, first_name, last_name, default_station_slug, active, location_id")
      .eq("active", true)
      .order("first_name"),
    supabase.from("skills_matrix").select("employee_id, station_slug, level"),
    supabase.from("locations").select("id, slug, short_name, name").order("name"),
  ]);
  return (
    <SkillsMatrixView
      chainSlug={chainSlug}
      employees={(employees.data ?? []) as never}
      skills={(skills.data ?? []) as never}
      locations={(locations.data ?? []).map((l) => ({ id: l.id, slug: l.slug, name: l.name, shortName: l.short_name ?? l.name }))}
    />
  );
}
