import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";

import { PageHeader, EmptyState } from "@/components/page-header";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useAuth } from "@/hooks/use-auth";
import { channelLabel, fetchAgents, fetchConversations, fetchCustomers, formatDateTime } from "@/lib/db";

export const Route = createFileRoute("/_authenticated/conversations/")({
  head: () => ({
    meta: [
      { title: "Atendimentos — Painel IA Multiplex" },
      { name: "description", content: "Histórico de conversas de WhatsApp e Instagram atendidas pela IA." },
      { property: "og:title", content: "Atendimentos — Painel IA Multiplex" },
      { property: "og:description", content: "Histórico de conversas de WhatsApp e Instagram atendidas pela IA." },
    ],
  }),
  component: ConversationsPage,
});

function ConversationsPage() {
  const { companyId } = useAuth();
  const [channel, setChannel] = useState("todos");
  const [status, setStatus] = useState("todos");
  const [agentId, setAgentId] = useState("todos");
  const [search, setSearch] = useState("");

  const agents = useQuery({ queryKey: ["agents", companyId], queryFn: () => fetchAgents(companyId) });
  const customers = useQuery({ queryKey: ["customers", companyId], queryFn: () => fetchCustomers(companyId) });
  const conversations = useQuery({
    queryKey: ["conversations", companyId, channel, status, agentId],
    queryFn: () => fetchConversations(companyId, { channel, status, agentId }),
  });

  const customerById = new Map((customers.data ?? []).map((c) => [c.id, c]));
  const agentById = new Map((agents.data ?? []).map((a) => [a.id, a]));

  const statuses = Array.from(
    new Set((conversations.data ?? []).map((c) => c.status).filter(Boolean) as string[]),
  );

  const rows = (conversations.data ?? []).filter((c) => {
    if (!search.trim()) return true;
    const customer = c.customer_id ? customerById.get(c.customer_id) : undefined;
    const haystack = [customer?.name, customer?.phone, customer?.email, c.id].join(" ").toLowerCase();
    return haystack.includes(search.trim().toLowerCase());
  });

  return (
    <div className="space-y-6">
      <PageHeader title="Atendimentos" description="Todas as conversas recebidas nos canais conectados." />

      <div className="flex flex-wrap gap-3">
        <Input
          placeholder="Buscar por contato, telefone ou e-mail"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-xs"
        />
        <Select value={channel} onValueChange={setChannel}>
          <SelectTrigger className="w-40"><SelectValue placeholder="Canal" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos os canais</SelectItem>
            <SelectItem value="whatsapp">WhatsApp</SelectItem>
            <SelectItem value="instagram">Instagram</SelectItem>
          </SelectContent>
        </Select>
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger className="w-40"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos os status</SelectItem>
            {statuses.map((s) => (
              <SelectItem key={s} value={s}>{s}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={agentId} onValueChange={setAgentId}>
          <SelectTrigger className="w-48"><SelectValue placeholder="Agente" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos os agentes</SelectItem>
            {(agents.data ?? []).map((a) => (
              <SelectItem key={a.id} value={a.id}>{a.name ?? "Sem nome"}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {conversations.isLoading ? (
        <Skeleton className="h-64 w-full" />
      ) : conversations.isError ? (
        <EmptyState title="Não foi possível carregar os atendimentos" description={(conversations.error as Error).message} />
      ) : rows.length === 0 ? (
        <EmptyState title="Nenhum atendimento encontrado" description="Ajuste os filtros ou aguarde novas conversas." />
      ) : (
        <div className="rounded-xl border border-border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Contato</TableHead>
                <TableHead>Canal</TableHead>
                <TableHead>Agente</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Última mensagem</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((c) => {
                const customer = c.customer_id ? customerById.get(c.customer_id) : undefined;
                const agent = c.agent_id ? agentById.get(c.agent_id) : undefined;
                return (
                  <TableRow key={c.id}>
                    <TableCell>
                      <Link
                        to="/conversations/$id"
                        params={{ id: c.id }}
                        className="font-medium underline-offset-4 hover:underline"
                      >
                        {customer?.name ?? customer?.phone ?? "Contato sem nome"}
                      </Link>
                      <p className="text-xs text-muted-foreground">{customer?.phone ?? customer?.email ?? c.id.slice(0, 8)}</p>
                    </TableCell>
                    <TableCell><Badge variant="secondary">{channelLabel(c.channel_type)}</Badge></TableCell>
                    <TableCell className="text-sm">{agent?.name ?? "—"}</TableCell>
                    <TableCell className="text-sm">{c.status ?? "—"}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {formatDateTime(c.last_message_at ?? c.created_at)}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
