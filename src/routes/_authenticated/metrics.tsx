import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Bar, BarChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Download } from "lucide-react";

import { PageHeader, EmptyState } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useAuth } from "@/hooks/use-auth";
import { channelLabel, fetchAgents, fetchConversations } from "@/lib/db";

export const Route = createFileRoute("/_authenticated/metrics")({
  head: () => ({
    meta: [
      { title: "Métricas — Painel IA Multiplex" },
      { name: "description", content: "Desempenho dos agentes de IA por canal e por período." },
      { property: "og:title", content: "Métricas — Painel IA Multiplex" },
      { property: "og:description", content: "Desempenho dos agentes de IA por canal e por período." },
    ],
  }),
  component: MetricsPage,
});

const RANGES = [
  { value: "7", label: "Últimos 7 dias" },
  { value: "30", label: "Últimos 30 dias" },
  { value: "90", label: "Últimos 90 dias" },
];

function MetricsPage() {
  const { companyId } = useAuth();
  const [range, setRange] = useState("30");

  const since = new Date();
  since.setDate(since.getDate() - Number(range));

  const agents = useQuery({ queryKey: ["agents", companyId], queryFn: () => fetchAgents(companyId) });
  const conversations = useQuery({
    queryKey: ["conversations", companyId, "metrics", range],
    queryFn: () => fetchConversations(companyId, { since: since.toISOString() }),
  });

  const rows = conversations.data ?? [];
  const agentById = new Map((agents.data ?? []).map((a) => [a.id, a]));

  const byAgent = Object.entries(
    rows.reduce<Record<string, number>>((acc, c) => {
      const key = (c.agent_id && agentById.get(c.agent_id)?.name) || "Sem agente";
      acc[key] = (acc[key] ?? 0) + 1;
      return acc;
    }, {}),
  ).map(([agente, conversas]) => ({ agente, conversas }));

  const byChannel = Object.entries(
    rows.reduce<Record<string, number>>((acc, c) => {
      const key = channelLabel(c.channel_type);
      acc[key] = (acc[key] ?? 0) + 1;
      return acc;
    }, {}),
  ).map(([canal, conversas]) => ({ canal, conversas }));

  const daily = buildDaily(rows, Number(range));

  function exportCsv() {
    const header = "data,conversas\n";
    const body = daily.map((d) => `${d.dia},${d.conversas}`).join("\n");
    const blob = new Blob([header + body], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `metricas-${range}-dias.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Métricas"
        description="Volume de atendimentos por período, canal e agente."
        actions={
          <div className="flex gap-2">
            <Select value={range} onValueChange={setRange}>
              <SelectTrigger className="w-44"><SelectValue /></SelectTrigger>
              <SelectContent>
                {RANGES.map((r) => (
                  <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button variant="outline" onClick={exportCsv}>
              <Download className="size-4" /> CSV
            </Button>
          </div>
        }
      />

      {conversations.isLoading ? (
        <Skeleton className="h-96 w-full" />
      ) : rows.length === 0 ? (
        <EmptyState title="Sem dados no período" description="Selecione outro intervalo de datas." />
      ) : (
        <>
          <Card>
            <CardHeader><CardTitle className="text-sm font-medium">Conversas por dia</CardTitle></CardHeader>
            <CardContent className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={daily}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                  <XAxis dataKey="dia" tickLine={false} axisLine={false} fontSize={11} />
                  <YAxis allowDecimals={false} tickLine={false} axisLine={false} fontSize={11} width={28} />
                  <Tooltip contentStyle={{ background: "var(--popover)", border: "1px solid var(--border)", borderRadius: 10, fontSize: 12 }} />
                  <Line type="monotone" dataKey="conversas" stroke="var(--chart-1)" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <div className="grid gap-4 lg:grid-cols-2">
            <Card>
              <CardHeader><CardTitle className="text-sm font-medium">Por canal</CardTitle></CardHeader>
              <CardContent className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={byChannel}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                    <XAxis dataKey="canal" tickLine={false} axisLine={false} fontSize={11} />
                    <YAxis allowDecimals={false} tickLine={false} axisLine={false} fontSize={11} width={28} />
                    <Tooltip contentStyle={{ background: "var(--popover)", border: "1px solid var(--border)", borderRadius: 10, fontSize: 12 }} />
                    <Bar dataKey="conversas" fill="var(--chart-2)" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle className="text-sm font-medium">Por agente</CardTitle></CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Agente</TableHead>
                      <TableHead className="text-right">Conversas</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {byAgent.map((row) => (
                      <TableRow key={row.agente}>
                        <TableCell>{row.agente}</TableCell>
                        <TableCell className="text-right tabular-nums">{row.conversas}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}

function buildDaily(rows: { created_at: string | null }[], days: number) {
  const out: { dia: string; conversas: number }[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    out.push({
      dia: d.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" }),
      conversas: rows.filter((r) => r.created_at && new Date(r.created_at).toDateString() === d.toDateString()).length,
    });
  }
  return out;
}
