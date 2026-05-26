"use client";

import { useMemo } from "react";
import { motion } from "motion/react";
import { Coins, PiggyBank, Receipt, TrendingDown } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { fadeUp } from "@/lib/design/motion";
import { formatPrice } from "@/lib/utils/format";
import { cn } from "@/lib/utils/cn";

type Order = {
  id: string;
  order_code: string;
  channel: string;
  total_cents: number;
  complexity_score: number;
  placed_at: string;
  locations: { short_name: string | null } | null;
};

type Product = {
  id: string;
  slug: string;
  name: string;
  price_cents: number;
  cost_cents: number;
  complexity_factor: number;
};

type Throughput = {
  hour: string;
  orders_count: number;
  revenue_cents: number;
  avg_door_to_door_sec: number | null;
};

export function FinancialDashboard({
  chainSlug: _chainSlug,
  commissionPct,
  foodCostPct,
  orders,
  products,
  throughput,
}: {
  chainSlug: string;
  commissionPct: Record<string, number>;
  foodCostPct: number;
  orders: Order[];
  products: Product[];
  throughput: Throughput[];
}) {
  const insights = useMemo(() => {
    const revenue = orders.reduce((a, o) => a + o.total_cents, 0);
    const commissions = orders.reduce(
      (a, o) => a + o.total_cents * (commissionPct[o.channel] ?? 0),
      0,
    );
    const food = orders.reduce((a, o) => a + Math.round(o.total_cents * foodCostPct), 0);
    const labor =
      orders.reduce((a, o) => a + Math.round(80000 + o.complexity_score * 40000), 0) / 100;
    return {
      revenue,
      commissions,
      food,
      labor: Math.round(labor),
      margin: revenue - commissions - food - labor,
    };
  }, [orders, commissionPct, foodCostPct]);

  const menuEng = useMemo(() => {
    return products
      .filter((p) => p.cost_cents > 0)
      .map((p) => {
        const margin = p.price_cents - p.cost_cents;
        const marginPct = (margin / p.price_cents) * 100;
        return { ...p, margin, marginPct };
      })
      .sort((a, b) => b.marginPct - a.marginPct);
  }, [products]);

  return (
    <div className="space-y-6">
      <PageHeader
        ring="Anillo 2"
        title="Modelo financiero por pedido"
        subtitle="Food cost real, comisiones plataforma, mano de obra atribuida y margen efectivo. Menú engineering con dato, no intuición."
      />

      <section className="grid gap-3 md:grid-cols-4">
        <FinTile label="Revenue" value={formatPrice(insights.revenue)} icon={<Coins className="size-4" />} accent="yellow" />
        <FinTile label="Comisiones" value={formatPrice(insights.commissions)} icon={<Receipt className="size-4" />} accent="red" />
        <FinTile label={`Food cost (${Math.round(foodCostPct * 100)}%)`} value={formatPrice(insights.food)} icon={<TrendingDown className="size-4" />} accent="amber" />
        <FinTile label="Margen efectivo" value={formatPrice(insights.margin)} icon={<PiggyBank className="size-4" />} accent="green" />
      </section>

      <section className="grid gap-5 lg:grid-cols-[1.3fr_1fr]">
        <Card>
          <CardContent className="p-5">
            <p className="text-[0.65rem] uppercase tracking-[0.18em] text-muted-foreground">
              Menu engineering · margen %
            </p>
            <ul className="mt-3 space-y-1.5">
              {menuEng.slice(0, 12).map((m, i) => (
                <motion.li
                  key={m.id}
                  variants={fadeUp}
                  initial="initial"
                  animate="animate"
                  transition={{ delay: i * 0.02 }}
                  className="grid grid-cols-[1fr_60px_80px_80px] items-center gap-2 rounded-lg border border-border/60 bg-background/70 px-3 py-1.5 text-sm"
                >
                  <span className="truncate">{m.name}</span>
                  <span className="font-mono text-xs text-muted-foreground">
                    {m.complexity_factor}x
                  </span>
                  <span className="font-mono text-xs text-muted-foreground">{formatPrice(m.margin)}</span>
                  <span className={cn("font-mono text-xs", m.marginPct > 60 ? "text-signal-green" : m.marginPct > 40 ? "text-signal-amber" : "text-signal-red")}>
                    {m.marginPct.toFixed(0)}%
                  </span>
                </motion.li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <p className="text-[0.65rem] uppercase tracking-[0.18em] text-muted-foreground">Pedidos recientes</p>
            <ul className="mt-3 space-y-1.5">
              {orders.slice(0, 12).map((o) => (
                <li key={o.id} className="flex items-center justify-between gap-3 rounded-lg border border-border/60 bg-background/70 px-3 py-1.5 text-sm">
                  <div className="flex items-center gap-2">
                    <Badge tone="outline" className="font-mono">{o.channel}</Badge>
                    <span className="font-mono text-xs text-muted-foreground">#{o.order_code}</span>
                  </div>
                  <span className="font-mono text-frich-yellow">{formatPrice(o.total_cents)}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </section>

      <section>
        <Card>
          <CardContent className="p-5">
            <p className="text-[0.65rem] uppercase tracking-[0.18em] text-muted-foreground">
              Throughput por hora (últimas 24)
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Aparecen datos cuando pasa tráfico real. Mientras tanto, MV vacía es esperado.
            </p>
            <ul className="mt-3 space-y-1.5">
              {throughput.length === 0 ? (
                <li className="rounded-lg border border-dashed border-border/60 px-3 py-3 text-xs text-muted-foreground">
                  La materialized view se refresca cada 5 min vía pg_cron.
                </li>
              ) : (
                throughput.slice(0, 12).map((t) => (
                  <li key={t.hour} className="flex items-center justify-between gap-3 rounded-lg border border-border/60 bg-background/70 px-3 py-1.5 text-sm">
                    <span className="font-mono text-xs">
                      {new Date(t.hour).toLocaleString("es-AR", { hour: "2-digit", minute: "2-digit", day: "2-digit", month: "2-digit" })}
                    </span>
                    <span className="font-mono">{t.orders_count} pedidos</span>
                    <span className="font-mono text-frich-yellow">{formatPrice(t.revenue_cents ?? 0)}</span>
                  </li>
                ))
              )}
            </ul>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}

function FinTile({ label, value, icon, accent }: { label: string; value: string; icon: React.ReactNode; accent: "yellow" | "red" | "amber" | "green" }) {
  const color = { yellow: "text-frich-yellow", red: "text-signal-red", amber: "text-signal-amber", green: "text-signal-green" }[accent];
  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex items-center justify-between text-muted-foreground">
          <span className="text-[0.6rem] uppercase tracking-[0.18em]">{label}</span>
          <span className={cn("grid size-7 place-items-center rounded-md bg-card", color)}>{icon}</span>
        </div>
        <p className={cn("mt-3 font-mono text-2xl tabular", color)}>{value}</p>
      </CardContent>
    </Card>
  );
}
