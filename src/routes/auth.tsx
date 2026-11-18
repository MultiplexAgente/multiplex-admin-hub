import { useEffect, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { Lock, Mail, ArrowRight } from "lucide-react";

import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import hugLogo from "@/assets/hug-icon.jpg";

export const Route = createFileRoute("/auth")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Entrar — HUG Admin" },
      { name: "description", content: "Acesso ao painel administrativo central do HUG." },
      { name: "robots", content: "noindex" },
      { property: "og:title", content: "Entrar — HUG Admin" },
      { property: "og:description", content: "Acesso ao painel administrativo central do HUG." },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: "/dashboard", replace: true });
    });
  }, [navigate]);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });
      if (error) throw error;
      navigate({ to: "/dashboard", replace: true });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Não foi possível entrar no HUG.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4 py-8">
      <div className="w-full max-w-sm">
        {/* Header com logo oficial da íris quântica */}
        <div className="mb-6 flex items-center gap-3.5">
          <img
            src={hugLogo}
            alt="HUG Logo"
            className="size-14 rounded-full object-cover shadow-xl ring-2 ring-primary/40 shrink-0"
          />
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-display text-2xl font-bold tracking-tight text-foreground">HUG Admin</h1>
              <span className="rounded-md bg-primary/15 px-2 py-0.5 text-[11px] font-semibold text-primary">
                PRO
              </span>
            </div>
            <p className="text-xs text-muted-foreground">Painel Central de Gestão Multissegmento</p>
          </div>
        </div>

        {/* Card de Login Administrativo */}
        <form onSubmit={handleSubmit} className="space-y-4 rounded-2xl border border-border/80 bg-card/90 backdrop-blur-sm p-6 shadow-xl">
          <div className="space-y-1.5">
            <Label htmlFor="email" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              E-mail
            </Label>
            <div className="relative">
              <Mail className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="voce@empresa.com"
                className="pl-9 text-sm bg-background/50"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="password" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Senha
            </Label>
            <div className="relative">
              <Lock className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
              <Input
                id="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="pl-9 text-sm bg-background/50"
              />
            </div>
          </div>

          <Button type="submit" className="w-full font-semibold shadow-lg shadow-primary/20" disabled={busy}>
            {busy ? "Acessando..." : "Entrar"}
            {!busy && <ArrowRight className="ml-2 size-4" />}
          </Button>
        </form>

        <p className="mt-6 text-center text-xs text-muted-foreground/70">
          HUG Operações Integradas &copy; 2026{" "}
          <a
            href="https://bonasoftmt.com"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-primary transition-colors underline-offset-4 hover:underline"
          >
            BonaSoft
          </a>
        </p>
      </div>
    </main>
  );
}
