import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Trash2, UserPlus } from "lucide-react";

import { PageHeader, EmptyState } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useAuth } from "@/hooks/use-auth";
import { fetchTeam, formatDate, inviteTeamMember, removeTeamMember, updateTeamMember } from "@/lib/db";

const ROLES = [
  { value: "admin", label: "Administrador" },
  { value: "operator", label: "Operador" },
  { value: "viewer", label: "Somente leitura" },
];

export const Route = createFileRoute("/_authenticated/users")({
  head: () => ({
    meta: [
      { title: "Usuários — Painel IA Multiplex" },
      { name: "description", content: "Controle quem acessa o painel e com qual nível de permissão." },
      { property: "og:title", content: "Usuários — Painel IA Multiplex" },
      { property: "og:description", content: "Controle quem acessa o painel e com qual nível de permissão." },
    ],
  }),
  component: UsersPage,
});

function UsersPage() {
  const { companyId, isAdmin, user } = useAuth();
  const queryClient = useQueryClient();
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("operator");

  const team = useQuery({ queryKey: ["team", companyId], queryFn: () => fetchTeam(companyId) });

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["team"] });

  const invite = useMutation({
    mutationFn: () => inviteTeamMember(email.trim(), role, companyId),
    onSuccess: () => {
      setEmail("");
      invalidate();
      toast.success("Usuário adicionado. Ele precisa criar a conta com esse mesmo e-mail.");
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const patch = useMutation({
    mutationFn: ({ id, ...rest }: { id: string; role?: string; active?: boolean }) => updateTeamMember(id, rest),
    onSuccess: () => {
      invalidate();
      toast.success("Acesso atualizado.");
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const remove = useMutation({
    mutationFn: (id: string) => removeTeamMember(id),
    onSuccess: () => {
      invalidate();
      toast.success("Acesso removido.");
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const rows = team.data ?? [];

  return (
    <div className="space-y-6">
      <PageHeader title="Usuários" description="Quem pode entrar no painel e o que cada um pode fazer." />

      {isAdmin ? (
        <Card>
          <CardContent className="flex flex-wrap items-end gap-3 pt-6">
            <div className="min-w-56 flex-1 space-y-2">
              <label className="text-xs text-muted-foreground" htmlFor="invite-email">E-mail</label>
              <Input
                id="invite-email"
                type="email"
                placeholder="pessoa@empresa.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs text-muted-foreground">Papel</label>
              <Select value={role} onValueChange={setRole}>
                <SelectTrigger className="w-48"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {ROLES.map((r) => (
                    <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button onClick={() => invite.mutate()} disabled={!email.trim() || invite.isPending}>
              <UserPlus className="size-4" /> Adicionar
            </Button>
          </CardContent>
        </Card>
      ) : null}

      {team.isLoading ? (
        <Skeleton className="h-48 w-full" />
      ) : team.isError ? (
        <EmptyState title="Não foi possível carregar os usuários" description={(team.error as Error).message} />
      ) : rows.length === 0 ? (
        <EmptyState title="Nenhum usuário cadastrado" />
      ) : (
        <div className="rounded-xl border border-border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>E-mail</TableHead>
                <TableHead>Papel</TableHead>
                <TableHead>Desde</TableHead>
                <TableHead>Ativo</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((member) => (
                <TableRow key={member.id}>
                  <TableCell>
                    {member.email ?? member.user_id ?? "—"}
                    {member.user_id && member.user_id === user?.id ? (
                      <Badge variant="secondary" className="ml-2">você</Badge>
                    ) : null}
                  </TableCell>
                  <TableCell>
                    {isAdmin ? (
                      <Select
                        value={member.role ?? "operator"}
                        onValueChange={(value) => patch.mutate({ id: member.id, role: value })}
                      >
                        <SelectTrigger className="w-44"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {ROLES.map((r) => (
                            <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>
                          ))}
                          {member.role && !ROLES.some((r) => r.value === member.role) ? (
                            <SelectItem value={member.role}>{member.role}</SelectItem>
                          ) : null}
                        </SelectContent>
                      </Select>
                    ) : (
                      <Badge variant="secondary">{member.role ?? "—"}</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">{formatDate(member.created_at)}</TableCell>
                  <TableCell>
                    <Switch
                      checked={Boolean(member.active)}
                      disabled={!isAdmin}
                      onCheckedChange={(value) => patch.mutate({ id: member.id, active: value })}
                    />
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      disabled={!isAdmin}
                      onClick={() => {
                        if (confirm("Remover o acesso deste usuário?")) remove.mutate(member.id);
                      }}
                    >
                      <Trash2 className="size-4 text-destructive" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
