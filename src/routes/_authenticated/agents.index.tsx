import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Plus, Trash2, Pencil } from "lucide-react";

import { PageHeader, EmptyState } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useAuth } from "@/hooks/use-auth";
import { deleteAgent, fetchAgents, formatDate, saveAgent, type Agent } from "@/lib/db";

export const Route = createFileRoute("/_authenticated/agents/")({
  head: () => ({
    meta: [
      { title: "Agentes HUG AI — HUG Admin" },
      { name: "description", content: "Crie, edite e ative os agentes HUG AI que atendem seus clientes." },
      { property: "og:title", content: "Agentes HUG AI — HUG Admin" },
      { property: "og:description", content: "Crie, edite e ative os agentes HUG AI que atendem seus clientes." },
    ],
  }),
  component: AgentsPage,
});

function AgentsPage() {
  const { companyId } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const agents = useQuery({
    queryKey: ["agents", companyId],
    queryFn: () => fetchAgents(companyId),
  });

  const toggle = useMutation({
    mutationFn: (agent: Agent) => saveAgent({ id: agent.id, active: !agent.active }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["agents"] });
      toast.success("Agente atualizado.");
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const remove = useMutation({
    mutationFn: (id: string) => deleteAgent(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["agents"] });
      toast.success("Agente excluído.");
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const rows = agents.data ?? [];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Agentes de IA"
        description="Cada agente responde com suas próprias instruções e modelo."
        actions={
          <Button onClick={() => navigate({ to: "/agents/$id", params: { id: "novo" } })}>
            <Plus className="size-4" /> Novo agente
          </Button>
        }
      />

      {agents.isLoading ? (
        <Skeleton className="h-48 w-full" />
      ) : agents.isError ? (
        <EmptyState title="Não foi possível carregar os agentes" description={(agents.error as Error).message} />
      ) : rows.length === 0 ? (
        <EmptyState title="Nenhum agente cadastrado" description="Crie o primeiro agente para começar a atender." />
      ) : (
        <div className="rounded-xl border border-border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Modelo</TableHead>
                <TableHead>Criado em</TableHead>
                <TableHead>Ativo</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((agent) => (
                <TableRow key={agent.id}>
                  <TableCell>
                    <Link
                      to="/agents/$id"
                      params={{ id: agent.id }}
                      className="font-medium underline-offset-4 hover:underline"
                    >
                      {agent.name ?? "Sem nome"}
                    </Link>
                    <p className="max-w-md truncate text-xs text-muted-foreground">{agent.description ?? "—"}</p>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">{agent.model ?? "padrão"}</Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">{formatDate(agent.created_at)}</TableCell>
                  <TableCell>
                    <Switch checked={Boolean(agent.active)} onCheckedChange={() => toggle.mutate(agent)} />
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button variant="ghost" size="icon" asChild>
                        <Link to="/agents/$id" params={{ id: agent.id }}>
                          <Pencil className="size-4" />
                        </Link>
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          if (confirm(`Excluir o agente "${agent.name ?? ""}"?`)) remove.mutate(agent.id);
                        }}
                      >
                        <Trash2 className="size-4 text-destructive" />
                      </Button>
                    </div>
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
