import { ReactNode } from "react";

export function PageHeader({
  ring,
  title,
  subtitle,
  right,
}: {
  ring: "Anillo 1" | "Anillo 2" | "Anillo 3";
  title: string;
  subtitle?: string;
  right?: ReactNode;
}) {
  return (
    <header className="flex flex-wrap items-end justify-between gap-3">
      <div>
        <p className="text-[0.65rem] uppercase tracking-[0.18em] text-muted-foreground">{ring}</p>
        <h1 className="font-display brand-headline-lg text-4xl text-frich-yellow md:text-5xl">{title}</h1>
        {subtitle ? <p className="mt-2 max-w-2xl text-sm text-muted-foreground">{subtitle}</p> : null}
      </div>
      {right}
    </header>
  );
}
