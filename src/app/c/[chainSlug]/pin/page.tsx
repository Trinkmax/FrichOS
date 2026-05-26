import Link from "next/link";
import { redirect } from "next/navigation";
import { Mail } from "lucide-react";
import { Wordmark } from "@/components/brand/Logo";
import { PinPad } from "@/components/auth/PinPad";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

async function loginWithPin(formData: FormData) {
  "use server";
  const chainSlug = String(formData.get("chainSlug") ?? "frich");
  const employeeId = String(formData.get("employeeId") ?? "");
  const pin = String(formData.get("pin") ?? "");
  const stationSlug = String(formData.get("stationSlug") ?? "");

  const { signInWithPin } = await import("@/lib/actions/pin-auth");
  const result = await signInWithPin({ chainSlug, employeeId, pin, stationSlug });
  if (!result.ok) {
    redirect(`/c/${chainSlug}/pin?error=${encodeURIComponent(result.error)}`);
  }
  redirect(`/c/${chainSlug}/kds/${stationSlug || "armado"}`);
}

async function loadEmployees(chainSlug: string) {
  const supabase = await createClient();
  const { data } = await supabase.rpc("list_employees_for_login", {
    p_chain_slug: chainSlug,
  });
  return (data ?? []) as unknown as {
    id: string;
    first_name: string;
    last_name: string;
    avatar_url: string | null;
    default_station_slug: "armado" | "plancha" | "freidora" | "despacho" | null;
    location_id: string;
  }[];
}

export default async function PinLoginPage({
  params,
  searchParams,
}: {
  params: Promise<{ chainSlug: string }>;
  searchParams: Promise<{ error?: string; station?: string }>;
}) {
  const { chainSlug } = await params;
  const { error, station } = await searchParams;
  const employees = await loadEmployees(chainSlug).catch(() => []);

  return (
    <main className="relative min-h-screen overflow-hidden bg-background" data-kiosk="true">
      <div className="pointer-events-none absolute inset-0 bg-grid-frich [background-size:48px_48px] opacity-20" />

      <header className="relative z-10 mx-auto flex max-w-7xl items-center justify-between px-8 py-6">
        <Link href="/">
          <Wordmark size="md" />
        </Link>
        <Link
          href={`/c/${chainSlug}/login`}
          className="inline-flex items-center gap-2 rounded-lg border border-border bg-card/95 px-3 py-2 text-xs uppercase tracking-wider text-foreground/80 transition hover:border-frich-yellow/40 hover:text-foreground"
        >
          <Mail className="size-3.5" /> Ingreso gerencia
        </Link>
      </header>

      <section className="relative z-10 mx-auto max-w-7xl px-8 pb-10">
        <div className="mb-8">
          <h1 className="font-display brand-headline-xl text-4xl text-frich-yellow md:text-6xl">Tap tu cara y tu PIN.</h1>
          <p className="mt-2 text-muted-foreground">
            Sesión efímera por turno · Estación: <span className="font-mono uppercase tracking-wider text-frich-yellow">{station ?? "elegí"}</span>
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            Demo: PIN del primer empleado de cada local = <span className="font-mono">1234</span>. Probá con María, Ana, Gabi, Mariano.
          </p>
        </div>

        <PinPad
          chainSlug={chainSlug}
          employees={employees}
          presetStation={station ?? null}
          action={loginWithPin}
          error={error ?? null}
        />
      </section>
    </main>
  );
}
