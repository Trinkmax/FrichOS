"use client";

import { useLocale } from "next-intl";
import { useTransition } from "react";
import { Globe } from "lucide-react";
import { setLocale } from "@/lib/actions/locale";
import { cn } from "@/lib/utils/cn";

const LANGUAGES = [
  { code: "es-AR", label: "ES" },
  { code: "en", label: "EN" },
] as const;

export function LocaleSwitcher({ className }: { className?: string }) {
  const current = useLocale();
  const [isPending, startTransition] = useTransition();

  function switchTo(code: string) {
    startTransition(() => {
      const fd = new FormData();
      fd.set("locale", code);
      void setLocale(fd);
    });
  }

  return (
    <div
      className={cn(
        "inline-flex items-center gap-1 rounded-lg border border-border bg-card/80 p-0.5 text-[0.65rem] font-mono",
        className,
      )}
    >
      <Globe className="ml-1.5 size-3 text-muted-foreground" />
      {LANGUAGES.map((l) => (
        <button
          key={l.code}
          type="button"
          disabled={isPending}
          onClick={() => switchTo(l.code)}
          className={cn(
            "rounded-md px-2 py-1 transition-colors",
            current === l.code
              ? "bg-frich-yellow text-frich-carbon"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          {l.label}
        </button>
      ))}
    </div>
  );
}
