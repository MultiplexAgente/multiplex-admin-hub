import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";

import { PageHeader, EmptyState } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { channelLabel, fetchChannels, formatDate } from "@/lib/db";

export const Route = createFileRoute("/_authenticated/settings")({
  head: () => ({
    meta: [
      { title: "Configurações — Painel IA Multiplex" },
      { name: "description", content: "Dados da conta, canais conectados e segurança do painel." },
      { property: "og:title", content: "Configurações — Painel IA Multiplex" },
      { property: "og:description", content: "Dados da conta, canais conectados e segurança do painel." },
    ],
  }),
  component: SettingsPage,
});

function SettingsPage() {
  const { user, company, role, companyId } = useAuth();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [busy, setBusy] = useState(false);

  const channels = useQuery({ queryKey: ["channels", companyId], queryFn: () => fetchChannels(companyId) });

  async function changePassword() {
    if (newPassword.length < 8) {
      toast.error("A nova senha precisa de pelo menos 8 caracteres.");
      return;
    }
    setBusy(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
        ...(currentPassword ? { current_password: currentPassword } : {}),
      });
      if (error) throw error;
      toast.success("Senha atualizada.");
      setCurrentPassword("");
      setNewPassword("");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Não foi possível atualizar a senha.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Configurações" description="Sua conta, a empresa e os canais conectados." />

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle className="text-sm font-medium">Conta</CardTitle></CardHeader>
          <CardContent className="space-y-3 text-sm">
            <Row label="E-mail" value={user?.email} />
            <Row label="Papel" value={role} />
            <Row label="Empresa" value={company?.name} />
            <Row label="Telefone da empresa" value={company?.phone} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-sm font-medium">Alterar senha</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-2">
              <Label htmlFor="current">Senha atual</Label>
              <Input
                id="current"
                type="password"
                autoComplete="current-password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="new">Nova senha</Label>
              <Input
                id="new"
                type="password"
                autoComplete="new-password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
            </div>
            <Button onClick={changePassword} disabled={busy || !newPassword}>
              {busy ? "Salvando..." : "Atualizar senha"}
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-sm font-medium">Canais conectados</CardTitle></CardHeader>
        <CardContent>
          {channels.isLoading ? (
            <Skeleton className="h-32 w-full" />
          ) : (channels.data ?? []).length === 0 ? (
            <EmptyState title="Nenhum canal conectado" description="Conecte o WhatsApp ou o Instagram para receber atendimentos." />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Criado em</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(channels.data ?? []).map((c) => (
                  <TableRow key={c.id}>
                    <TableCell>{c.name ?? "—"}</TableCell>
                    <TableCell>{channelLabel(c.type)}</TableCell>
                    <TableCell>
                      <Badge variant={c.active ? "default" : "secondary"}>{c.status ?? (c.active ? "ativo" : "inativo")}</Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">{formatDate(c.created_at)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function Row({ label, value }: { label: string; value?: string | null | undefined }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-border pb-2 last:border-0">
      <span className="text-muted-foreground">{label}</span>
      <span className="truncate font-medium">{value || "—"}</span>
    </div>
  );
}
