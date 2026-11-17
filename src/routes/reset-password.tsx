import { useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";

import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import hugLogo from "@/assets/hug-icon.jpg";

export const Route = createFileRoute("/reset-password")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Nova senha — HUG Admin" },
      { name: "description", content: "Defina uma nova senha de acesso ao painel HUG Admin." },
      { name: "robots", content: "noindex" },
      { property: "og:title", content: "Nova senha — HUG Admin" },
      { property: "og:description", content: "Defina uma nova senha de acesso ao painel HUG Admin." },
    ],
  }),
  component: ResetPasswordPage,
});

function ResetPasswordPage() {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (password.length < 8) {
      toast.error("Use pelo menos 8 caracteres.");
      return;
    }
    if (password !== confirm) {
      toast.error("As senhas não coincidem.");
      return;
    }
    setBusy(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      toast.success("Senha atualizada.");
      navigate({ to: "/dashboard", replace: true });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Não foi possível atualizar a senha.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm">
        <div className="mb-6 flex items-center gap-3.5">
          <img
            src={hugLogo}
            alt="HUG Logo"
            className="size-12 rounded-2xl object-cover shadow-lg ring-1 ring-border shrink-0"
          />
          <div>
            <h1 className="font-display text-xl font-bold tracking-tight text-foreground">HUG Admin</h1>
            <p className="text-sm text-muted-foreground">Recuperação de Acesso</p>
          </div>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4 rounded-2xl border border-border bg-card p-6">
        <div>
          <h1 className="font-display text-lg font-semibold tracking-tight">Definir nova senha</h1>
          <p className="mt-1 text-sm text-muted-foreground">Escolha uma senha com pelo menos 8 caracteres.</p>
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Nova senha</Label>
          <Input
            id="password"
            type="password"
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="confirm">Confirmar senha</Label>
          <Input
            id="confirm"
            type="password"
            autoComplete="new-password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            required
          />
        </div>
        <Button type="submit" className="w-full" disabled={busy}>
          {busy ? "Salvando..." : "Salvar senha"}
        </Button>
      </form>
    </div>
  </main>
  );
}
