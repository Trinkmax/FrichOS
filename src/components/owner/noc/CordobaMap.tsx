"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "motion/react";
import { MapPin } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { attentionBandColor, attentionBandLabel, type LocationAttention } from "@/lib/kpis/network-health";

type Pin = {
  id: string;
  slug: string;
  name: string;
  shortName: string;
  lat: number;
  lng: number;
  attention: LocationAttention;
};

type Props = {
  chainSlug: string;
  pins: Pin[];
};

// Bounding box plausible para los 4 locales en provincia de Córdoba.
// Lat decrece hacia el sur, lng decrece hacia el oeste — invertimos para coords SVG.
const BBOX = {
  minLat: -31.55,
  maxLat: -30.85,
  minLng: -64.4,
  maxLng: -63.95,
};
const VIEW_W = 360;
const VIEW_H = 280;
const PAD = 18;

function project(lat: number, lng: number): { x: number; y: number } {
  const xFrac = (lng - BBOX.minLng) / (BBOX.maxLng - BBOX.minLng);
  const yFrac = 1 - (lat - BBOX.minLat) / (BBOX.maxLat - BBOX.minLat);
  return {
    x: PAD + xFrac * (VIEW_W - PAD * 2),
    y: PAD + yFrac * (VIEW_H - PAD * 2),
  };
}

const ATTENTION_FILL: Record<LocationAttention["band"], string> = {
  urgent: "#EF3E3E",
  attend: "#F59E0B",
  watch: "#F59E0B",
  calm: "#22C55E",
};

export function CordobaMap({ chainSlug, pins }: Props) {
  const [hovered, setHovered] = useState<string | null>(null);

  const projected = useMemo(
    () =>
      pins.map((p) => ({
        ...p,
        ...project(p.lat, p.lng),
      })),
    [pins],
  );

  return (
    <div className="relative overflow-hidden rounded-2xl border border-border bg-card/95">
      <div className="flex items-start justify-between gap-3 px-5 pt-5">
        <div>
          <p className="text-[0.6rem] uppercase tracking-[0.22em] text-muted-foreground">Geografía de red</p>
          <h3 className="mt-1 font-sans text-2xl font-bold tracking-tight">Córdoba</h3>
          <p className="mt-1 text-xs text-muted-foreground">
            Hover sobre cada punto para ver el estado.
          </p>
        </div>
        <span className="rounded-full border border-border/60 bg-background/40 px-2.5 py-1 text-[0.55rem] uppercase tracking-[0.22em] text-muted-foreground">
          {pins.length} locales
        </span>
      </div>

      <div className="relative mt-3 px-3 pb-3">
        <svg
          viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
          className="h-auto w-full"
          role="img"
          aria-label="Mapa de Córdoba con los locales"
        >
          <defs>
            <pattern id="cba-grid" width="20" height="20" patternUnits="userSpaceOnUse">
              <path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(252,211,59,0.06)" strokeWidth="0.5" />
            </pattern>
            <radialGradient id="cba-glow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="rgba(252,211,59,0.16)" />
              <stop offset="100%" stopColor="rgba(252,211,59,0)" />
            </radialGradient>
            <radialGradient id="cba-light-glow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="rgba(252,211,59,0.32)" />
              <stop offset="100%" stopColor="rgba(252,211,59,0)" />
            </radialGradient>
            <linearGradient id="cba-river" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="rgba(34,197,94,0.0)" />
              <stop offset="40%" stopColor="rgba(34,197,94,0.18)" />
              <stop offset="100%" stopColor="rgba(34,197,94,0.0)" />
            </linearGradient>
          </defs>

          <rect width={VIEW_W} height={VIEW_H} fill="url(#cba-grid)" />
          <rect width={VIEW_W} height={VIEW_H} fill="url(#cba-glow)" />

          {/* "Anillo de circunvalación" estilizado — un óvalo central */}
          <ellipse
            cx={project(-31.4263, -64.188).x}
            cy={project(-31.4263, -64.188).y}
            rx={62}
            ry={42}
            fill="none"
            stroke="rgba(252,211,59,0.18)"
            strokeWidth="0.8"
            strokeDasharray="3 3"
          />
          {/* Río Suquía — una línea curva */}
          <path
            d={`M ${project(-31.45, -64.4).x} ${project(-31.45, -64.4).y} Q ${project(-31.42, -64.18).x} ${
              project(-31.42, -64.18).y - 8
            } ${project(-31.38, -63.95).x} ${project(-31.38, -63.95).y}`}
            fill="none"
            stroke="url(#cba-river)"
            strokeWidth="1.2"
          />

          {/* Etiqueta central "CÓRDOBA" */}
          <text
            x={project(-31.42, -64.19).x + 2}
            y={project(-31.42, -64.19).y - 50}
            textAnchor="middle"
            fontSize="9"
            letterSpacing="3"
            fill="rgba(252,211,59,0.35)"
            fontFamily="var(--font-geist-mono, monospace)"
            style={{ textTransform: "uppercase" }}
          >
            CÓRDOBA CAPITAL
          </text>
          <text
            x={project(-30.98, -64.09).x}
            y={project(-30.98, -64.09).y - 18}
            textAnchor="middle"
            fontSize="7"
            letterSpacing="2"
            fill="rgba(252,211,59,0.30)"
            fontFamily="var(--font-geist-mono, monospace)"
            style={{ textTransform: "uppercase" }}
          >
            JESÚS MARÍA
          </text>

          {/* Pins */}
          {projected.map((p) => {
            const color = ATTENTION_FILL[p.attention.band];
            const isUrgent = p.attention.band === "urgent" || p.attention.band === "attend";
            return (
              <g
                key={p.id}
                transform={`translate(${p.x}, ${p.y})`}
                className="cursor-pointer"
                onMouseEnter={() => setHovered(p.id)}
                onMouseLeave={() => setHovered(null)}
                onFocus={() => setHovered(p.id)}
                onBlur={() => setHovered(null)}
                role="link"
                tabIndex={0}
                aria-label={`${p.name}: ${attentionBandLabel(p.attention.band)}`}
              >
                {/* outer halo */}
                <motion.circle
                  r={14}
                  fill={color}
                  opacity={isUrgent ? 0.18 : 0.12}
                  animate={isUrgent ? { r: [12, 22, 12], opacity: [0.22, 0, 0.22] } : {}}
                  transition={isUrgent ? { duration: 1.6, repeat: Infinity } : {}}
                />
                <circle r={9} fill={color} opacity={0.32} />
                <circle r={5} fill={color} />
                <circle r={2} fill="#fff" opacity={0.95} />
              </g>
            );
          })}
        </svg>

        <AnimatePresence>
          {hovered ? (
            <PinTooltip
              chainSlug={chainSlug}
              pin={projected.find((p) => p.id === hovered)!}
            />
          ) : null}
        </AnimatePresence>
      </div>

      <div className="grid grid-cols-2 gap-2 border-t border-border/60 bg-background/30 px-5 py-3 md:grid-cols-4">
        {projected.map((p) => {
          const tone = attentionBandColor(p.attention.band);
          return (
            <Link
              key={p.id}
              href={`/c/${chainSlug}/dashboard?loc=${p.slug}`}
              className="group inline-flex items-center gap-1.5 text-xs"
              onMouseEnter={() => setHovered(p.id)}
              onMouseLeave={() => setHovered(null)}
            >
              <span
                className={cn(
                  "size-2 rounded-full",
                  tone === "red" && "bg-signal-red",
                  tone === "amber" && "bg-signal-amber",
                  tone === "green" && "bg-signal-green",
                  tone === "neutral" && "bg-foreground/40",
                )}
              />
              <span className="truncate text-foreground/85 group-hover:text-frich-yellow">{p.shortName}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

function PinTooltip({
  chainSlug,
  pin,
}: {
  chainSlug: string;
  pin: { id: string; slug: string; name: string; shortName: string; x: number; y: number; attention: LocationAttention };
}) {
  const tone = attentionBandColor(pin.attention.band);
  return (
    <motion.div
      initial={{ opacity: 0, y: 6, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.98 }}
      transition={{ duration: 0.15 }}
      style={{
        left: `${(pin.x / VIEW_W) * 100}%`,
        top: `calc(${(pin.y / VIEW_H) * 100}% - 6.5rem)`,
      }}
      className="pointer-events-none absolute z-10 -translate-x-1/2"
    >
      <Link
        href={`/c/${chainSlug}/dashboard?loc=${pin.slug}`}
        className="pointer-events-auto block w-56 rounded-xl border border-border bg-popover/95 px-3 py-2 backdrop-blur-md"
      >
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold">{pin.shortName}</p>
          <MapPin className="size-3 text-muted-foreground" />
        </div>
        <p className="text-[0.65rem] text-muted-foreground">{pin.name}</p>
        <div
          className={cn(
            "mt-1.5 inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 text-[0.6rem] uppercase tracking-wider",
            tone === "red" && "border-signal-red/40 bg-signal-red/8 text-signal-red",
            tone === "amber" && "border-signal-amber/45 bg-signal-amber/8 text-signal-amber",
            tone === "green" && "border-signal-green/40 bg-signal-green/8 text-signal-green",
            tone === "neutral" && "border-border bg-muted/40 text-muted-foreground",
          )}
        >
          {attentionBandLabel(pin.attention.band)}
        </div>
        <p className="mt-1.5 text-[0.7rem] leading-snug text-foreground/85">
          {pin.attention.primaryReason}
        </p>
      </Link>
    </motion.div>
  );
}
