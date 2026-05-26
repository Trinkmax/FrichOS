import Link from "next/link";
import {
  ArrowRight,
  Cpu,
  Gauge,
  HeartHandshake,
  Hexagon,
  KeyRound,
  Mail,
  ScanLine,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ChainLogo } from "@/components/brand/Logo";
import { LiveStats, type LiveStat } from "@/components/landing/LiveStats";
import { ModuleBento } from "@/components/landing/ModuleBento";
import { OrderTimeline } from "@/components/landing/OrderTimeline";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

const CHAIN_SLUG = "frich";

async function loadStats(): Promise<LiveStat[]> {
  const supabase = await createClient();
  const [locations, inKitchen, products, employees] = await Promise.all([
    supabase.from("locations").select("id", { count: "exact", head: true }).eq("is_active", true),
    supabase
      .from("orders")
      .select("id", { count: "exact", head: true })
      .in("status", ["confirmed", "in_kitchen", "ready"]),
    supabase
      .from("products")
      .select("id", { count: "exact", head: true })
      .eq("active", true),
    supabase
      .from("employees")
      .select("id", { count: "exact", head: true })
      .eq("active", true),
  ]);
  return [
    { key: "locations", label: "Locales activos", value: locations.count ?? 0, accent: "yellow" },
    { key: "in_kitchen", label: "Pedidos en cocina", value: inKitchen.count ?? 0, accent: "green", realtime: true },
    { key: "team", label: "Equipo operativo", value: employees.count ?? 0, accent: "neutral" },
    { key: "products", label: "Productos en carta", value: products.count ?? 0, accent: "yellow" },
  ];
}

export default async function RootPage() {
  const stats = await loadStats();

  return (
    <main className="relative min-h-screen overflow-hidden bg-background text-foreground">
      {/* Background ambient */}
      <div className="pointer-events-none absolute inset-0 grid-overlay-yellow opacity-80" />
      <div className="pointer-events-none absolute -top-32 left-1/2 h-[70vh] w-[70vh] -translate-x-1/2 rounded-full bg-frich-yellow/30 blur-[140px]" />
      <div className="pointer-events-none absolute right-0 top-1/3 h-[40vh] w-[40vh] rounded-full bg-frich-yellow/20 blur-[160px]" />

      {/* Sticky header */}
      <header className="sticky top-0 z-40 border-b border-border/60 bg-background/70 backdrop-blur-lg">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-6 py-3">
          <Link href="/" className="inline-flex items-center">
            <ChainLogo height={44} priority />
          </Link>
          <nav className="hidden items-center gap-1 text-xs uppercase tracking-[0.18em] text-muted-foreground md:flex">
            <a href="#operacion" className="rounded-md px-3 py-2 transition hover:text-foreground">
              Operación
            </a>
            <a href="#modulos" className="rounded-md px-3 py-2 transition hover:text-foreground">
              Módulos
            </a>
            <a href="#flujo" className="rounded-md px-3 py-2 transition hover:text-foreground">
              Un pedido
            </a>
            <a href="#manifesto" className="rounded-md px-3 py-2 transition hover:text-foreground">
              Manifesto
            </a>
          </nav>
          <div className="flex items-center gap-2">
            <Button asChild variant="ghost" size="sm">
              <Link href={`/c/${CHAIN_SLUG}/login`}>
                <Mail className="size-4" /> Gerencia
              </Link>
            </Button>
            <Button asChild variant="primary" size="sm">
              <Link href={`/c/${CHAIN_SLUG}/dashboard`}>
                Abrir consola <ArrowRight />
              </Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative z-10 mx-auto max-w-7xl px-6 pt-12 pb-20 md:pt-24 md:pb-28">
        <div className="flex flex-col items-center gap-10 text-center md:gap-14">
          <ChainLogo height={200} priority className="mx-auto" />

          <div className="space-y-6">
            <h1 className="font-display text-balance text-5xl leading-[0.95] tracking-tight md:text-7xl lg:text-[5.5rem]">
              El sistema operativo
              <br className="hidden md:block" />
              <span className="brand-headline-xl text-frich-yellow">de tu cocina.</span>
            </h1>

            <p className="mx-auto max-w-2xl text-balance text-lg leading-relaxed text-foreground/80 md:text-xl">
              Diseñado a medida para Frich. La capa industrial entre Rappi, PedidosYa, salón y
              WhatsApp, y los <strong className="font-semibold text-foreground">4 locales</strong>.
              En vivo, sin enfriarse, con la rigurosidad que solo las cadenas globales tienen hoy.
            </p>

            <div className="flex flex-wrap justify-center gap-3 pt-2">
              <Button asChild variant="primary" size="xl" className="text-base">
                <Link href={`/c/${CHAIN_SLUG}/dashboard`}>
                  Entrar al NOC <ArrowRight />
                </Link>
              </Button>
              <Button asChild variant="outline" size="xl" className="text-base">
                <Link href={`/c/${CHAIN_SLUG}/kds`}>Ver KDS en vivo</Link>
              </Button>
              <Button asChild variant="ghost" size="xl" className="text-base">
                <Link href={`/c/${CHAIN_SLUG}/pin`}>
                  <KeyRound className="size-4" /> Iniciar turno
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Live stats */}
      <section id="operacion" className="relative z-10 mx-auto -mt-4 max-w-7xl px-6 md:-mt-8">
        <div className="rounded-3xl border-2 border-border bg-card/95 p-6 backdrop-blur md:p-8">
          <div className="mb-5 flex flex-wrap items-baseline justify-between gap-2">
            <div>
              <p className="text-[0.65rem] uppercase tracking-[0.22em] text-muted-foreground">
                Snapshot de Frich · ahora mismo
              </p>
              <h2 className="mt-1 text-2xl font-bold tracking-tight md:text-3xl">
                La operación real, no maqueta.
              </h2>
            </div>
            <Link
              href={`/c/${CHAIN_SLUG}/noc`}
              className="inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-wider text-foreground/70 hover:text-frich-yellow-deep dark:hover:text-frich-yellow"
            >
              Abrir NOC <ArrowRight className="size-3.5" />
            </Link>
          </div>
          <LiveStats stats={stats} />
        </div>
      </section>

      {/* Principios */}
      <section className="relative z-10 mx-auto max-w-7xl px-6 pt-20 md:pt-28">
        <div className="mb-10 max-w-2xl">
          <p className="text-[0.65rem] uppercase tracking-[0.22em] text-muted-foreground">
            Principios fundacionales
          </p>
          <h2 className="mt-2 font-display brand-headline-lg text-4xl text-frich-yellow md:text-5xl">
            Seis ideas, ningún relleno.
          </h2>
          <p className="mt-3 text-base text-foreground/80">
            Cada decisión de diseño se anota contra una de estas. Si no encaja, no entra.
          </p>
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <Pillar
            n="01"
            icon={<Gauge className="size-5" />}
            title="Medir lo que importa"
            body="Cada estación tiene tiempo objetivo, real, σ y Cpk visibles. La consistencia es la métrica que escala, no el promedio."
          />
          <Pillar
            n="02"
            icon={<Hexagon className="size-5" />}
            title="La restricción manda"
            body="Drum-Buffer-Rope dinámico. El sistema modera la admisión cuando el cuello de botella se mueve durante el día."
          />
          <Pillar
            n="03"
            icon={<Cpu className="size-5" />}
            title="Propone, no solo refleja"
            body="Cada semana, 3-5 hipótesis con experimento PDCA y métrica de éxito. Es un coach del próximo turno."
          />
          <Pillar
            n="04"
            icon={<HeartHandshake className="size-5" />}
            title="Cliente con info, no ansiedad"
            body="Cada estado del pedido viaja por WhatsApp con ETA dinámico calculado sobre la cocina real."
          />
          <Pillar
            n="05"
            icon={<ScanLine className="size-5" />}
            title="Estandarizar sin perder marca"
            body="Mismos KPIs, mismas pantallas, mismos SOPs. Comparados con normalización por mix y franja."
          />
          <Pillar
            n="06"
            icon={<Zap className="size-5" />}
            title="Cero fricción para el cliente"
            body="No instala nada. Todo pasa por WhatsApp que ya tiene. Cero descargas, cero registros."
          />
        </div>
      </section>

      {/* Module bento */}
      <section id="modulos" className="relative z-10 mx-auto max-w-7xl px-6 pt-20 md:pt-28">
        <div className="mb-10 flex flex-wrap items-end justify-between gap-3">
          <div className="max-w-2xl">
            <p className="text-[0.65rem] uppercase tracking-[0.22em] text-muted-foreground">
              20 módulos · 3 anillos
            </p>
            <h2 className="mt-2 font-display brand-headline-lg text-4xl text-frich-yellow md:text-5xl">
              Cada parte hecha a propósito.
            </h2>
            <p className="mt-3 text-base text-foreground/80">
              Núcleo operativo en vivo. Inteligencia que mide variabilidad. Mejora continua con
              ciclo de aprendizaje cerrado. Todo accesible desde acá.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2 text-[0.6rem] font-mono uppercase tracking-wider">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-signal-green/15 px-2 py-1 text-signal-green">
              <span className="size-1.5 rounded-full bg-signal-green" />
              en vivo
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-frich-yellow/20 px-2 py-1 text-frich-yellow-deep dark:text-frich-yellow">
              <span className="size-1.5 rounded-full bg-frich-yellow" />
              beta
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-foreground/10 px-2 py-1 text-foreground/70">
              <span className="size-1.5 rounded-full bg-foreground/40" />
              próximo
            </span>
          </div>
        </div>
        <ModuleBento chainSlug={CHAIN_SLUG} />
      </section>

      {/* End-to-end flow */}
      <section id="flujo" className="relative z-10 mx-auto max-w-5xl px-6 pt-20 md:pt-28">
        <div className="mb-10 text-center">
          <p className="text-[0.65rem] uppercase tracking-[0.22em] text-muted-foreground">
            Un pedido, end to end
          </p>
          <h2 className="mt-2 font-display brand-headline-lg text-4xl text-frich-yellow md:text-5xl">
            48 minutos puerta a puerta.
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-base text-foreground/80">
            Trazado del primer mensaje al feedback. Planificación inversa, convergencia sub-30s,
            comunicación honesta con el cliente, registro financiero por pedido.
          </p>
        </div>
        <OrderTimeline />
      </section>

      {/* Manifesto */}
      <section id="manifesto" className="relative z-10 mx-auto max-w-5xl px-6 pt-20 md:pt-28">
        <div className="relative overflow-hidden rounded-3xl border-2 border-frich-yellow/50 bg-gradient-to-br from-frich-yellow/15 via-card to-card p-8 md:p-12">
          <div className="absolute -right-20 -top-20 size-60 rounded-full bg-frich-yellow/30 blur-3xl" />
          <p className="relative text-[0.65rem] uppercase tracking-[0.22em] text-muted-foreground">
            Manifesto
          </p>
          <blockquote className="relative mt-3 max-w-3xl font-display text-3xl leading-[1.1] tracking-tight md:text-5xl">
            <span className="brand-headline-lg text-frich-yellow">Mide lo que importa</span> con la
            granularidad correcta. No solo el promedio sino la variabilidad. No solo la cocina sino
            el puerta a puerta. No solo qué pasó sino dónde está la restricción ahora.
          </blockquote>
          <p className="relative mt-6 max-w-2xl text-base text-foreground/80">
            La conversación deja de ser <em>quién falló</em> y se vuelve <em>qué proceso falló</em>.
            Esa es la base más duradera de ventaja competitiva en gastronomía a esta escala.
          </p>
          <div className="relative mt-8 flex flex-wrap gap-3">
            <Button asChild variant="primary" size="lg">
              <Link href={`/c/${CHAIN_SLUG}/dashboard`}>
                Abrir Frich OS <ArrowRight />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href={`/c/${CHAIN_SLUG}/kaizen`}>Ver hipótesis Kaizen</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 mt-24 border-t border-border bg-card/40 backdrop-blur">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-6 py-8 text-xs text-muted-foreground">
          <div className="flex items-center gap-3">
            <ChainLogo height={36} />
            <div>
              <p className="font-semibold text-foreground">Frich OS</p>
              <p>Sistema operativo a medida · Preparado por studiOS</p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-4">
            <span className="font-mono">v0.1.0 · mayo 2026</span>
            <span className="font-mono">Postgres · Realtime · Next.js</span>
            <Link
              href={`/c/${CHAIN_SLUG}/dashboard`}
              className="font-semibold text-foreground hover:text-frich-yellow-deep dark:hover:text-frich-yellow"
            >
              Entrar →
            </Link>
          </div>
        </div>
      </footer>
    </main>
  );
}

function Pillar({
  n,
  icon,
  title,
  body,
}: {
  n: string;
  icon: React.ReactNode;
  title: string;
  body: string;
}) {
  return (
    <div className="group relative overflow-hidden rounded-2xl border-2 border-border bg-card p-6 transition-all hover:-translate-y-0.5 hover:border-frich-yellow/60 hover:shadow-xl">
      <div className="absolute inset-0 -z-10 rounded-2xl bg-gradient-to-br from-frich-yellow/0 to-frich-yellow/0 opacity-0 transition-opacity group-hover:opacity-100 group-hover:from-frich-yellow/8" />
      <div className="flex items-center justify-between">
        <span className="grid size-10 place-items-center rounded-lg bg-frich-yellow/15 text-frich-yellow-deep dark:text-frich-yellow ring-1 ring-frich-yellow/30">
          {icon}
        </span>
        <span className="font-mono text-xs uppercase tracking-[0.22em] text-muted-foreground">
          {n}
        </span>
      </div>
      <h3 className="mt-4 text-lg font-bold tracking-tight">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{body}</p>
    </div>
  );
}
