"use client";

import { motion, AnimatePresence } from "motion/react";
import { ChevronRight, Hand, LogOut, Megaphone, Sparkles } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState, useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LiveTicker } from "@/components/motion/LiveTicker";
import { StaggerList } from "@/components/motion/StaggerList";
import { fadeUp, springs } from "@/lib/design/motion";
import { signalClasses, slaLevel } from "@/lib/design/tokens";
import { cn } from "@/lib/utils/cn";
import { startTask, completeTask, pullAndon } from "@/lib/actions/kds";
import { createClient } from "@/lib/supabase/client";

export type KdsTask = {
  task_id: string;
  order_id: string;
  order_code: string;
  channel: "rappi" | "pedidosya" | "salon" | "whatsapp" | "web" | "kiosk";
  station_slug: string;
  product_name: string;
  modifiers: string[] | null;
  qty: number;
  status: "queued" | "in_progress" | "completed" | "skipped";
  start_target_at: string;
  finish_target_at: string;
  target_seconds: number;
  customer_name: string | null;
  complexity_score: number | null;
  vip: boolean | null;
};

const STATION_LABEL: Record<string, string> = {
  armado: "Armado",
  plancha: "Plancha",
  freidora: "Freidora",
  despacho: "Despacho",
};

const CHANNEL_LABEL: Record<string, string> = {
  rappi: "RAPPI",
  pedidosya: "PEDIDOSYA",
  salon: "SALÓN",
  whatsapp: "WHATSAPP",
  web: "WEB",
  kiosk: "KIOSCO",
};

export function KdsStationView({
  chainSlug,
  stationSlug,
  locationId,
  employeeId,
  employeeName,
  initialTasks,
}: {
  chainSlug: string;
  stationSlug: string;
  locationId: string;
  employeeId: string;
  employeeName: string;
  initialTasks: KdsTask[];
}) {
  const [tasks, setTasks] = useState<KdsTask[]>(initialTasks);
  const [isPending, startTransition] = useTransition();

  // Realtime subscription on order_station_tasks (filtered by station + location).
  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel(`kds:${locationId}:${stationSlug}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "order_station_tasks" },
        async () => {
          // Refresh via server roundtrip — simpler than CDC merging
          const res = await fetch(
            `/api/kds/refresh?location=${locationId}&station=${stationSlug}`,
            { cache: "no-store" },
          );
          if (res.ok) {
            const fresh = (await res.json()) as { tasks: KdsTask[] };
            setTasks(fresh.tasks);
          }
        },
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [locationId, stationSlug]);

  const queue = useMemo(
    () =>
      [...tasks].sort((a, b) => {
        // VIP first, then earliest start_target_at, then status
        if (a.vip && !b.vip) return -1;
        if (!a.vip && b.vip) return 1;
        return new Date(a.start_target_at).getTime() - new Date(b.start_target_at).getTime();
      }),
    [tasks],
  );

  const currentTask = queue.find((t) => t.status === "in_progress") ?? null;
  const pending = queue.filter((t) => t.status === "queued");

  const onStart = useCallback(
    (taskId: string) => {
      startTransition(async () => {
        const res = await startTask({ taskId, employeeId, locationId });
        if (!res.ok) toast.error(res.error);
      });
    },
    [employeeId, locationId],
  );

  const onComplete = useCallback(
    (taskId: string) => {
      startTransition(async () => {
        const res = await completeTask({ taskId, employeeId, locationId });
        if (!res.ok) toast.error(res.error);
        else toast.success("Listo. Avanza a la próxima estación.");
      });
    },
    [employeeId, locationId],
  );

  return (
    <div className="mx-auto flex min-h-screen max-w-[1800px] flex-col px-6 py-6">
      <Header
        chainSlug={chainSlug}
        stationSlug={stationSlug}
        employeeName={employeeName}
        pendingCount={pending.length}
        inProgress={!!currentTask}
      />

      <div className="mt-6 grid flex-1 gap-6 lg:grid-cols-[1.2fr_1fr]">
        <section>
          <SectionTitle>En curso</SectionTitle>
          <AnimatePresence mode="popLayout">
            {currentTask ? (
              <motion.div
                key={currentTask.task_id}
                layout
                variants={fadeUp}
                initial="initial"
                animate="animate"
                exit={{ opacity: 0, y: -12, transition: springs.ambient }}
              >
                <ActiveTaskCard
                  task={currentTask}
                  onComplete={onComplete}
                  isPending={isPending}
                />
              </motion.div>
            ) : (
              <EmptyState
                title="Sin pedidos en curso"
                body="Cuando arranques algo, aparece acá grande para no perder foco."
              />
            )}
          </AnimatePresence>
        </section>

        <section>
          <SectionTitle>Cola próxima · {pending.length}</SectionTitle>
          {pending.length === 0 ? (
            <EmptyState
              title="Cola limpia"
              body="Estación dentro de banda. Buen ritmo."
            />
          ) : (
            <StaggerList
              items={pending}
              getKey={(t) => t.task_id}
              className="space-y-3"
            >
              {(task) => (
                <QueueTaskCard
                  task={task}
                  onStart={onStart}
                  disabled={!!currentTask || isPending}
                />
              )}
            </StaggerList>
          )}
        </section>
      </div>

      <AndonBar
        locationId={locationId}
        stationSlug={stationSlug}
        employeeId={employeeId}
      />
    </div>
  );
}

function Header({
  chainSlug,
  stationSlug,
  employeeName,
  pendingCount,
  inProgress,
}: {
  chainSlug: string;
  stationSlug: string;
  employeeName: string;
  pendingCount: number;
  inProgress: boolean;
}) {
  return (
    <header className="flex items-center justify-between gap-4 rounded-2xl border border-border bg-card/95 px-5 py-4 backdrop-blur">
      <div className="flex items-center gap-4">
        <div className="grid size-12 place-items-center rounded-xl bg-frich-yellow text-frich-carbon">
          <Sparkles className="size-6" />
        </div>
        <div>
          <p className="text-[0.65rem] uppercase tracking-[0.18em] text-muted-foreground">
            Estación
          </p>
          <p className="font-sans font-bold text-2xl tracking-tight text-frich-yellow">
            {STATION_LABEL[stationSlug] ?? stationSlug}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <Badge tone={inProgress ? "yellow" : pendingCount > 6 ? "amber" : "green"}>
          {pendingCount} en cola
        </Badge>
        <span className="hidden md:inline text-sm text-muted-foreground">
          {employeeName}
        </span>
        <Link
          href={`/c/${chainSlug}/pin?station=${stationSlug}`}
          className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 text-xs uppercase tracking-wider text-foreground/80 transition hover:border-frich-yellow/40"
        >
          <LogOut className="size-3.5" /> Cambiar
        </Link>
      </div>
    </header>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="mb-3 inline-flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-muted-foreground">
      {children}
    </h2>
  );
}

function ActiveTaskCard({
  task,
  onComplete,
  isPending,
}: {
  task: KdsTask;
  onComplete: (taskId: string) => void;
  isPending: boolean;
}) {
  const startedAt = new Date(task.start_target_at);
  const elapsed = Math.max(0, (Date.now() - startedAt.getTime()) / 1000);
  const level = slaLevel(elapsed, task.target_seconds);

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-3xl border bg-card p-6 transition-colors",
        signalClasses.border[level],
        level === "red" && "animate-pulse_red",
      )}
    >
      <div
        className={cn(
          "absolute inset-y-0 left-0 w-1.5 rounded-r-full",
          signalClasses.leftBar[level].replace("before:", ""),
        )}
      />
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Badge tone="yellow" className="font-mono">
              {CHANNEL_LABEL[task.channel] ?? task.channel}
            </Badge>
            <Badge tone="outline" className="font-mono">
              #{task.order_code}
            </Badge>
            {task.vip ? <Badge tone="yellow">VIP</Badge> : null}
          </div>
          <h3 className="mt-3 font-display text-4xl text-foreground">
            {task.qty > 1 ? `${task.qty}× ` : ""}{task.product_name}
          </h3>
          {task.modifiers && task.modifiers.length > 0 ? (
            <ul className="mt-3 space-y-1">
              {task.modifiers.map((m, i) => (
                <li
                  key={i}
                  className="font-mono text-sm uppercase tracking-wider text-foreground/80"
                >
                  · {m}
                </li>
              ))}
            </ul>
          ) : null}
        </div>
        <div className="text-right">
          <p className="text-[0.65rem] uppercase tracking-widest text-muted-foreground">
            Tiempo objetivo
          </p>
          <LiveTicker
            startedAt={startedAt}
            targetSeconds={task.target_seconds}
            className={cn(
              "block text-kds-timer",
              level === "green" && "text-signal-green",
              level === "amber" && "text-signal-amber",
              level === "red" && "text-signal-red",
            )}
            showSign
          />
          <p className="mt-1 font-mono text-xs text-muted-foreground">
            target {Math.round(task.target_seconds)}s
          </p>
        </div>
      </div>

      <div className="mt-6 flex flex-wrap gap-3">
        <Button
          size="kds"
          variant="success"
          disabled={isPending}
          onClick={() => onComplete(task.task_id)}
        >
          Listo · avanzar <ChevronRight />
        </Button>
      </div>
    </div>
  );
}

function QueueTaskCard({
  task,
  onStart,
  disabled,
}: {
  task: KdsTask;
  onStart: (taskId: string) => void;
  disabled: boolean;
}) {
  const targetStart = new Date(task.start_target_at);
  const lateBy = Math.max(0, Math.floor((Date.now() - targetStart.getTime()) / 1000));
  const level = lateBy > 30 ? "amber" : "green";

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl border bg-card/95 p-4 backdrop-blur transition-colors",
        signalClasses.border[level],
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <Badge tone="yellow" className="font-mono">
              {CHANNEL_LABEL[task.channel] ?? task.channel}
            </Badge>
            <Badge tone="outline" className="font-mono">
              #{task.order_code}
            </Badge>
            {task.vip ? <Badge tone="yellow">VIP</Badge> : null}
          </div>
          <p className="mt-2 text-kds-item">
            {task.qty > 1 ? `${task.qty}× ` : ""}{task.product_name}
          </p>
          {task.modifiers && task.modifiers.length > 0 ? (
            <p className="mt-1 text-kds-mod text-muted-foreground">
              {task.modifiers.join(" · ")}
            </p>
          ) : null}
        </div>
        <div className="text-right">
          <p className="text-[0.65rem] uppercase tracking-widest text-muted-foreground">
            target {Math.round(task.target_seconds)}s
          </p>
          {lateBy > 0 ? (
            <p
              className={cn(
                "mt-1 font-mono text-xs",
                level === "amber" ? "text-signal-amber" : "text-muted-foreground",
              )}
            >
              espera +{lateBy}s
            </p>
          ) : null}
        </div>
      </div>
      <div className="mt-3">
        <Button
          size="md"
          variant="primary"
          className="w-full"
          disabled={disabled}
          onClick={() => onStart(task.task_id)}
        >
          Arrancar <ChevronRight />
        </Button>
      </div>
    </div>
  );
}

function EmptyState({ title, body }: { title: string; body: string }) {
  return (
    <div className="grid place-items-center rounded-2xl border border-dashed border-border bg-muted/30 p-12 text-center">
      <p className="font-sans font-bold text-2xl tracking-tight text-foreground/80">{title}</p>
      <p className="mt-2 max-w-xs text-sm text-muted-foreground">{body}</p>
    </div>
  );
}

function AndonBar({
  locationId,
  stationSlug,
  employeeId,
}: {
  locationId: string;
  stationSlug: string;
  employeeId: string;
}) {
  const [pulled, setPulled] = useState(false);
  return (
    <div className="sticky bottom-4 mt-6 flex justify-center">
      <motion.button
        type="button"
        whileTap={{ scale: 0.96 }}
        whileHover={{ scale: 1.02 }}
        transition={springs.snap}
        onClick={async () => {
          setPulled(true);
          const res = await pullAndon({
            locationId,
            stationSlug,
            employeeId,
            categorySlug: "otro",
            note: "Andon disparado desde KDS",
          });
          if (res.ok) {
            toast.warning("Línea pausada · encargado notificado");
          } else {
            toast.error(res.error);
          }
          setTimeout(() => setPulled(false), 1500);
        }}
        className={cn(
          "group inline-flex items-center gap-3 rounded-full border px-6 py-3 text-sm font-semibold uppercase tracking-wider backdrop-blur transition-colors",
          pulled
            ? "border-signal-red bg-signal-red/30 text-signal-red"
            : "border-signal-red/50 bg-card/95 text-foreground hover:border-signal-red hover:text-signal-red",
        )}
      >
        {pulled ? <Megaphone className="size-4" /> : <Hand className="size-4" />}
        {pulled ? "Línea pausada" : "Andon — parar línea"}
      </motion.button>
    </div>
  );
}
