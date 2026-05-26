import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowRight, KeyRound, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Wordmark } from "@/components/brand/Logo";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

async function loginAction(formData: FormData) {
  "use server";
  const supabase = await createClient();
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");
  const chainSlug = String(formData.get("chainSlug") ?? "frich");

  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) {
    redirect(`/c/${chainSlug}/login?error=${encodeURIComponent(error.message)}`);
  }
  redirect(`/c/${chainSlug}/dashboard`);
}

export default async function LoginPage({
  params,
  searchParams,
}: {
  params: Promise<{ chainSlug: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const { chainSlug } = await params;
  const { error } = await searchParams;

  return (
    <main className="relative min-h-screen overflow-hidden bg-background">
      <div className="pointer-events-none absolute inset-0 bg-grid-frich [background-size:48px_48px] opacity-30" />
      <div className="pointer-events-none absolute -top-32 left-1/2 h-[40vh] w-[40vh] -translate-x-1/2 rounded-full bg-frich-yellow/12 blur-[100px]" />

      <header className="relative z-10 mx-auto flex max-w-5xl items-center justify-between px-6 py-6">
        <Link href="/">
          <Wordmark size="md" />
        </Link>
        <Link
          href={`/c/${chainSlug}/pin`}
          className="inline-flex items-center gap-2 rounded-lg border border-border bg-card/95 px-3 py-2 text-xs uppercase tracking-wider text-foreground/80 transition hover:border-frich-yellow/40 hover:text-foreground"
        >
          <KeyRound className="size-3.5" /> Ingreso por PIN
        </Link>
      </header>

      <section className="relative z-10 mx-auto grid max-w-5xl gap-8 px-6 py-16 md:grid-cols-2 md:py-24">
        <div className="space-y-4">
          <h1 className="font-display brand-headline-xl text-5xl leading-[0.95] tracking-tight text-frich-yellow">
            Consola gerencial
          </h1>
          <p className="max-w-md text-balance text-foreground/80">
            Acceso a dashboards de local, NOC virtual, Kaizen, modelo financiero
            y skills matrix. Solo email autorizado.
          </p>
          <p className="text-sm text-muted-foreground">
            ¿Sos personal de cocina? <Link href={`/c/${chainSlug}/pin`} className="text-frich-yellow underline">Ingresá con PIN</Link>.
          </p>
        </div>

        <Card className="border-border bg-card/95 backdrop-blur">
          <CardHeader>
            <CardTitle className="font-sans font-bold text-2xl tracking-tight">Ingresar</CardTitle>
            <CardDescription>Cadena · <span className="font-mono uppercase tracking-wider text-frich-yellow">{chainSlug}</span></CardDescription>
          </CardHeader>
          <CardContent>
            <form action={loginAction} className="space-y-4">
              <input type="hidden" name="chainSlug" value={chainSlug} />
              <div className="space-y-1.5">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="username"
                    required
                    className="pl-10"
                    placeholder="dueno@frich.com.ar"
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="password">Contraseña</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                />
              </div>
              {error ? (
                <p className="rounded-md border border-signal-red/40 bg-signal-red/10 px-3 py-2 text-sm text-signal-red">
                  {error}
                </p>
              ) : null}
              <Button type="submit" variant="primary" size="lg" className="w-full">
                Entrar <ArrowRight />
              </Button>
              <p className="pt-2 text-center text-xs text-muted-foreground">
                Demo: usá <span className="font-mono">demo@frich.com.ar</span> · creá la cuenta desde Supabase Auth.
              </p>
            </form>
          </CardContent>
        </Card>
      </section>
    </main>
  );
}
