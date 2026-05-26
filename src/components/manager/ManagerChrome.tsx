"use client";

import { motion, AnimatePresence } from "motion/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ChartLine,
  ChefHat,
  Cpu,
  Flame,
  HandPlatter,
  Lightbulb,
  MessageSquareQuote,
  Package,
  PiggyBank,
  Radio,
  ShieldAlert,
  Sparkles,
  Users,
  Zap,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Wordmark } from "@/components/brand/Logo";
import { BrandProvider } from "@/lib/chain/brand-context";
import type { BrandSettings } from "@/lib/chain/config";
import { Badge } from "@/components/ui/badge";
import { springs } from "@/lib/design/motion";
import { cn } from "@/lib/utils/cn";
import type { KitchenMode } from "@/lib/types/db-enums";

type Location = {
  id: string;
  slug: string;
  name: string;
  shortName: string;
  hasDiningArea: boolean;
  currentMode: KitchenMode;
};

export function ManagerChrome({
  chain,
  brand,
  locations,
  user,
  children,
}: {
  chain: { slug: string; name: string };
  brand: BrandSettings;
  locations: Location[];
  user: { email: string };
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const t = useTranslations();
  const [time, setTime] = useState<string>("");

  useEffect(() => {
    const tick = () => {
      const now = new Date();
      setTime(
        now.toLocaleTimeString("es-AR", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: false,
        }),
      );
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  const nav: { href: string; label: string; icon: React.ReactNode; ring: "ops" | "intel" | "improve" }[] = [
    { href: `/c/${chain.slug}/dashboard`, label: t("nav.operations"), icon: <Flame className="size-4" />, ring: "ops" },
    { href: `/c/${chain.slug}/dispatcher`, label: t("nav.dispatcher"), icon: <Radio className="size-4" />, ring: "ops" },
    { href: `/c/${chain.slug}/andon`, label: t("nav.andon"), icon: <ShieldAlert className="size-4" />, ring: "ops" },
    { href: `/c/${chain.slug}/holds`, label: t("nav.holds"), icon: <ChefHat className="size-4" />, ring: "ops" },
    { href: `/c/${chain.slug}/inventory`, label: t("nav.inventory"), icon: <Package className="size-4" />, ring: "ops" },
    { href: `/c/${chain.slug}/dispatch`, label: t("nav.dispatch"), icon: <HandPlatter className="size-4" />, ring: "ops" },
    { href: `/c/${chain.slug}/noc`, label: t("nav.noc"), icon: <Cpu className="size-4" />, ring: "intel" },
    { href: `/c/${chain.slug}/team`, label: t("nav.team"), icon: <Users className="size-4" />, ring: "intel" },
    { href: `/c/${chain.slug}/feedback`, label: t("nav.feedback"), icon: <MessageSquareQuote className="size-4" />, ring: "intel" },
    { href: `/c/${chain.slug}/financial`, label: t("nav.financial"), icon: <PiggyBank className="size-4" />, ring: "intel" },
    { href: `/c/${chain.slug}/metrics`, label: t("nav.metrics"), icon: <ChartLine className="size-4" />, ring: "intel" },
    { href: `/c/${chain.slug}/kaizen`, label: t("nav.kaizen"), icon: <Lightbulb className="size-4" />, ring: "improve" },
    { href: `/c/${chain.slug}/twin`, label: t("nav.twin"), icon: <Zap className="size-4" />, ring: "improve" },
  ];

  const ringTitle = { ops: t("rings.1"), intel: t("rings.2"), improve: t("rings.3") };

  return (
    <BrandProvider value={brand}>
    <div className="flex min-h-screen w-full bg-background text-foreground">
      <aside className="sticky top-0 hidden h-screen w-72 shrink-0 flex-col border-r border-border bg-muted/40 backdrop-blur md:flex">
        <div className="flex items-center justify-center border-b border-border px-6 py-6">
          <Wordmark size="lg" />
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-4">
          {(["ops", "intel", "improve"] as const).map((ring) => (
            <div key={ring} className="mb-4">
              <p className="px-3 pb-1.5 text-[0.6rem] uppercase tracking-[0.18em] text-muted-foreground">
                {ringTitle[ring]}
              </p>
              <ul className="space-y-0.5">
                {nav
                  .filter((n) => n.ring === ring)
                  .map((item) => {
                    const active = pathname === item.href;
                    return (
                      <li key={item.href}>
                        <Link
                          href={item.href}
                          className={cn(
                            "group relative flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                            active
                              ? "bg-frich-yellow text-frich-carbon font-semibold shadow-[0_2px_8px_-2px_rgba(252,211,59,0.55)]"
                              : "text-foreground/80 hover:bg-card hover:text-foreground",
                          )}
                        >
                          <span
                            className={cn(
                              "grid size-5 place-items-center transition-colors",
                              active
                                ? "text-frich-carbon"
                                : "text-muted-foreground group-hover:text-foreground",
                            )}
                          >
                            {item.icon}
                          </span>
                          <span>{item.label}</span>
                        </Link>
                      </li>
                    );
                  })}
              </ul>
            </div>
          ))}
        </nav>

        <div className="border-t border-border px-4 py-4">
          <p className="text-[0.6rem] uppercase tracking-[0.18em] text-muted-foreground">{t("chrome.account")}</p>
          <p className="mt-1 truncate text-sm text-foreground/90">{user.email}</p>
          <p className="mt-1 text-[0.6rem] uppercase tracking-wider text-muted-foreground/70">
            {t("chrome.chain")} · <span className="font-mono text-frich-yellow-deep dark:text-frich-yellow">{chain.slug}</span>
          </p>
        </div>
      </aside>

      <div className="flex flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-border bg-background/90 px-4 backdrop-blur md:px-8">
          <LocationsSelector chainSlug={chain.slug} locations={locations} />
          <div className="ml-auto flex items-center gap-3">
            <AnimatePresence>
              {locations.some((l) => l.currentMode === "turbo") && (
                <motion.div
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={springs.snap}
                >
                  <Badge tone="amber" className="gap-1.5">
                    <Sparkles className="size-3" />
                    {t("chrome.turboMode")}
                  </Badge>
                </motion.div>
              )}
            </AnimatePresence>
            <span className="hidden font-mono text-xs text-muted-foreground md:inline">
              {time} · Córdoba
            </span>
          </div>
        </header>

        <main className="flex-1 px-4 py-6 md:px-8 md:py-8">{children}</main>
      </div>
    </div>
    </BrandProvider>
  );
}

function LocationsSelector({
  chainSlug: _chainSlug,
  locations,
}: {
  chainSlug: string;
  locations: Location[];
}) {
  const t = useTranslations("chrome");
  return (
    <div className="flex items-center gap-2 overflow-x-auto">
      <p className="text-[0.6rem] uppercase tracking-[0.18em] text-muted-foreground">{t("locations")}</p>
      {locations.map((l) => (
        <span
          key={l.id}
          className={cn(
            "inline-flex items-center gap-1.5 rounded-lg border px-3 py-1 text-xs",
            l.currentMode === "turbo"
              ? "border-signal-amber/40 bg-signal-amber/10 text-signal-amber"
              : "border-border bg-card/90 text-foreground/90",
          )}
        >
          {l.shortName}
          {!l.hasDiningArea ? (
            <span className="ml-1 font-mono text-[0.55rem] uppercase tracking-wider text-frich-yellow/70">
              delivery
            </span>
          ) : null}
        </span>
      ))}
    </div>
  );
}
