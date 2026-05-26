"use client";

import { motion, AnimatePresence } from "motion/react";
import { useState, useTransition } from "react";
import {
  Bike,
  Layers3,
  MessageCircle,
  Monitor,
  Plus,
  Radio,
  Send,
  Store,
  Truck,
} from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { fadeUp, springs } from "@/lib/design/motion";
import { formatPrice } from "@/lib/utils/format";
import { cn } from "@/lib/utils/cn";
import { placeManualOrder, simulateChannelOrder } from "@/lib/actions/dispatcher";

type Loc = {
  id: string;
  slug: string;
  name: string;
  shortName: string;
  hasDiningArea: boolean;
};

type Product = {
  id: string;
  slug: string;
  name: string;
  priceCents: number;
  isVeggie: boolean;
};

type RecentOrder = {
  id: string;
  order_code: string;
  channel: string;
  customer_name: string | null;
  is_vip: boolean;
  complexity_score: number;
  status: string;
  placed_at: string;
  total_cents: number;
  location_id: string;
};

const CHANNELS: {
  slug: "rappi" | "pedidosya" | "whatsapp" | "salon";
  label: string;
  icon: React.ReactNode;
  cardCls: string;
  badgeCls: string;
  buttonCls: string;
}[] = [
  {
    slug: "rappi",
    label: "Rappi",
    icon: <Bike className="size-5" />,
    cardCls:
      "border-2 border-orange-500 bg-orange-100 text-orange-950 dark:bg-orange-500/15 dark:text-orange-100 dark:border-orange-500/60",
    badgeCls: "bg-orange-500 text-white",
    buttonCls:
      "bg-orange-500 hover:bg-orange-600 text-white shadow-[0_6px_18px_-4px_rgba(249,115,22,0.55)]",
  },
  {
    slug: "pedidosya",
    label: "PedidosYa",
    icon: <Truck className="size-5" />,
    cardCls:
      "border-2 border-pink-500 bg-pink-100 text-pink-950 dark:bg-pink-500/15 dark:text-pink-100 dark:border-pink-500/60",
    badgeCls: "bg-pink-500 text-white",
    buttonCls:
      "bg-pink-500 hover:bg-pink-600 text-white shadow-[0_6px_18px_-4px_rgba(236,72,153,0.55)]",
  },
  {
    slug: "whatsapp",
    label: "WhatsApp",
    icon: <MessageCircle className="size-5" />,
    cardCls:
      "border-2 border-emerald-600 bg-emerald-100 text-emerald-950 dark:bg-emerald-500/15 dark:text-emerald-100 dark:border-emerald-500/60",
    badgeCls: "bg-emerald-600 text-white",
    buttonCls:
      "bg-emerald-600 hover:bg-emerald-700 text-white shadow-[0_6px_18px_-4px_rgba(16,185,129,0.55)]",
  },
  {
    slug: "salon",
    label: "Salón",
    icon: <Store className="size-5" />,
    cardCls:
      "border-2 border-frich-yellow bg-frich-yellow text-frich-carbon dark:bg-frich-yellow/20 dark:text-frich-yellow",
    badgeCls: "bg-frich-carbon text-frich-yellow",
    buttonCls:
      "bg-frich-carbon hover:bg-black text-frich-yellow shadow-[0_6px_18px_-4px_rgba(11,11,14,0.45)]",
  },
];

export function Dispatcher({
  chainSlug,
  locations,
  products,
  recent,
}: {
  chainSlug: string;
  locations: Loc[];
  products: Product[];
  recent: RecentOrder[];
}) {
  const [selectedLoc, setSelectedLoc] = useState<string>(locations[0]?.slug ?? "");
  const [cart, setCart] = useState<{ slug: string; qty: number }[]>([]);
  const [customer, setCustomer] = useState({ name: "", phone: "" });
  const [vip, setVip] = useState(false);
  const [isPending, startTransition] = useTransition();

  const cartTotal = cart.reduce((acc, item) => {
    const p = products.find((x) => x.slug === item.slug);
    return acc + (p?.priceCents ?? 0) * item.qty;
  }, 0);

  function addToCart(slug: string) {
    setCart((prev) => {
      const exists = prev.find((c) => c.slug === slug);
      if (exists) return prev.map((c) => (c.slug === slug ? { ...c, qty: c.qty + 1 } : c));
      return [...prev, { slug, qty: 1 }];
    });
  }

  function removeFromCart(slug: string) {
    setCart((prev) => prev.filter((c) => c.slug !== slug));
  }

  function submit() {
    if (!selectedLoc || cart.length === 0) {
      toast.error("Elegí local y al menos 1 producto");
      return;
    }
    startTransition(async () => {
      const res = await placeManualOrder({
        chainSlug,
        locationSlug: selectedLoc,
        channel: "salon",
        customerName: customer.name || "Salón",
        customerPhone: customer.phone || null,
        items: cart.map((c) => ({ productSlug: c.slug, qty: c.qty })),
        isVip: vip,
      });
      if (!res.ok) toast.error(res.error);
      else {
        toast.success(`Pedido ${res.orderCode} confirmado`);
        setCart([]);
        setCustomer({ name: "", phone: "" });
        setVip(false);
      }
    });
  }

  function simulate(channel: "rappi" | "pedidosya" | "whatsapp") {
    if (!selectedLoc) return;
    startTransition(async () => {
      const res = await simulateChannelOrder({ chainSlug, locationSlug: selectedLoc, channel });
      if (!res.ok) toast.error(res.error);
      else toast.success(`${channel.toUpperCase()} · pedido ${res.orderCode} entró a cocina`);
    });
  }

  return (
    <div className="space-y-6">
      <header>
        <p className="text-[0.65rem] uppercase tracking-[0.18em] text-muted-foreground">Anillo 1</p>
        <h1 className="font-display brand-headline-lg text-4xl text-frich-yellow md:text-5xl">Orquestador omnicanal</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Admisión unificada de Rappi, PedidosYa, WhatsApp y salón. Simulá tráfico real o cargá manualmente para entrenar al equipo.
        </p>
      </header>

      <section className="flex flex-wrap items-center gap-2">
        <p className="text-[0.65rem] uppercase tracking-[0.18em] text-muted-foreground">Local destino</p>
        {locations.map((l) => (
          <button
            key={l.id}
            type="button"
            onClick={() => setSelectedLoc(l.slug)}
            className={cn(
              "inline-flex items-center gap-2 rounded-lg border px-3 py-1.5 text-xs transition",
              selectedLoc === l.slug
                ? "border-frich-yellow bg-frich-yellow text-frich-carbon font-semibold"
                : "border-border bg-card/90 text-foreground/80 hover:border-frich-yellow/40",
            )}
          >
            {l.shortName}
            {!l.hasDiningArea ? (
              <span className="font-mono text-[0.55rem] uppercase tracking-wider opacity-70">delivery</span>
            ) : null}
          </button>
        ))}
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        {CHANNELS.filter((c) => c.slug !== "salon").map((c) => (
          <motion.div key={c.slug} variants={fadeUp} initial="initial" animate="animate">
            <div className={cn("rounded-2xl p-5", c.cardCls)}>
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-2 text-base font-bold tracking-tight">
                  {c.icon} {c.label}
                </span>
                <span
                  className={cn(
                    "inline-flex items-center rounded-full px-2 py-0.5 text-[0.6rem] font-mono uppercase tracking-wider",
                    c.badgeCls,
                  )}
                >
                  webhook mock
                </span>
              </div>
              <p className="mt-2 text-sm font-medium opacity-90">
                Simulá un pedido entrante con composición realista del mix del canal.
              </p>
              <button
                type="button"
                disabled={isPending || !selectedLoc}
                onClick={() => simulate(c.slug as "rappi" | "pedidosya" | "whatsapp")}
                className={cn(
                  "mt-4 inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg text-sm font-bold tracking-tight transition-all active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50",
                  c.buttonCls,
                )}
              >
                <Radio className="size-4" /> Disparar pedido {c.label}
              </button>
            </div>
          </motion.div>
        ))}
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[0.65rem] uppercase tracking-[0.18em] text-muted-foreground">
                  Admisión manual · canal Salón
                </p>
                <h2 className="font-sans font-bold text-2xl tracking-tight">Cargar pedido del mostrador</h2>
              </div>
              <Store className="size-5 text-frich-yellow" />
            </div>

            <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2">
              <input
                placeholder="Nombre del cliente"
                value={customer.name}
                onChange={(e) => setCustomer({ ...customer, name: e.target.value })}
                className="h-11 rounded-lg border border-border bg-card/90 px-3 text-sm"
              />
              <input
                placeholder="WhatsApp (opcional)"
                value={customer.phone}
                onChange={(e) => setCustomer({ ...customer, phone: e.target.value })}
                className="h-11 rounded-lg border border-border bg-card/90 px-3 text-sm font-mono"
              />
            </div>

            <div className="mt-4 flex items-center gap-2">
              <button
                type="button"
                onClick={() => setVip(!vip)}
                className={cn(
                  "inline-flex items-center gap-2 rounded-lg border px-3 py-1.5 text-xs transition",
                  vip
                    ? "border-frich-yellow bg-frich-yellow text-frich-carbon font-semibold"
                    : "border-border text-muted-foreground hover:border-frich-yellow/40",
                )}
              >
                {vip ? "VIP — Prioridad alta" : "Marcar VIP"}
              </button>
            </div>

            <div className="mt-5">
              <p className="text-[0.65rem] uppercase tracking-[0.18em] text-muted-foreground">
                Carta
              </p>
              <div className="mt-2 max-h-[460px] overflow-y-auto rounded-xl border border-border bg-background/70 p-2">
                <ul className="grid grid-cols-2 gap-1.5 md:grid-cols-3">
                  {products.map((p) => (
                    <li key={p.id}>
                      <button
                        type="button"
                        onClick={() => addToCart(p.slug)}
                        className="group flex w-full items-start justify-between gap-2 rounded-lg border border-border/60 bg-muted/40 px-3 py-2 text-left text-xs transition hover:border-frich-yellow/40"
                      >
                        <span className="flex-1 truncate">
                          {p.name}
                          {p.isVeggie ? (
                            <span className="ml-1 inline-block rounded bg-emerald-500/20 px-1 py-0.5 text-[0.55rem] font-mono uppercase tracking-wider text-emerald-300">
                              veg
                            </span>
                          ) : null}
                        </span>
                        <span className="font-mono text-muted-foreground">{formatPrice(p.priceCents)}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[0.65rem] uppercase tracking-[0.18em] text-muted-foreground">
                  Carrito
                </p>
                <h2 className="font-sans font-bold text-2xl tracking-tight">
                  {cart.reduce((acc, c) => acc + c.qty, 0)} ítems
                </h2>
              </div>
              <Layers3 className="size-5 text-muted-foreground" />
            </div>

            <ul className="mt-3 space-y-1.5">
              <AnimatePresence initial={false}>
                {cart.map((c) => {
                  const p = products.find((x) => x.slug === c.slug);
                  if (!p) return null;
                  return (
                    <motion.li
                      key={c.slug}
                      layout
                      variants={fadeUp}
                      initial="initial"
                      animate="animate"
                      exit={{ opacity: 0, x: 12, transition: springs.ambient }}
                      className="flex items-center justify-between gap-2 rounded-lg border border-border/60 bg-background/70 px-3 py-2 text-sm"
                    >
                      <span className="truncate">
                        <span className="font-mono text-muted-foreground">{c.qty}×</span> {p.name}
                      </span>
                      <button
                        type="button"
                        onClick={() => removeFromCart(c.slug)}
                        className="text-xs text-muted-foreground hover:text-signal-red"
                      >
                        quitar
                      </button>
                    </motion.li>
                  );
                })}
              </AnimatePresence>
              {cart.length === 0 ? (
                <li className="rounded-lg border border-dashed border-border/60 px-3 py-4 text-center text-xs text-muted-foreground">
                  Sumá productos desde la carta
                </li>
              ) : null}
            </ul>

            <div className="mt-4 flex items-center justify-between border-t border-border/60 pt-3 text-sm">
              <span className="text-muted-foreground">Total</span>
              <span className="font-mono text-xl text-frich-yellow">{formatPrice(cartTotal)}</span>
            </div>
            <Button
              size="lg"
              variant="primary"
              className="mt-3 w-full"
              disabled={isPending || cart.length === 0 || !selectedLoc}
              onClick={submit}
            >
              <Send className="size-4" /> Confirmar pedido
            </Button>
          </CardContent>
        </Card>
      </section>

      <section>
        <p className="mb-3 text-[0.65rem] uppercase tracking-[0.18em] text-muted-foreground">
          Pedidos recientes (todos los locales)
        </p>
        <Card>
          <CardContent className="p-0">
            <div className="divide-y divide-border/60">
              {recent.map((o) => (
                <div key={o.id} className="flex items-center justify-between gap-3 px-4 py-2 text-sm">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-xs uppercase tracking-wider text-muted-foreground">{o.channel}</span>
                    <span className="font-mono text-muted-foreground">#{o.order_code}</span>
                    <span className="truncate">{o.customer_name ?? "—"}</span>
                    {o.is_vip ? <Badge tone="yellow">VIP</Badge> : null}
                  </div>
                  <div className="flex items-center gap-3 text-xs">
                    <Badge tone="outline">{o.status}</Badge>
                    <span className="font-mono text-frich-yellow">{formatPrice(o.total_cents)}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
