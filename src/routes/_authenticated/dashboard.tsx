import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { PageHeader, EmptyState } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/use-auth";
import { channelLabel, fetchAgents, fetchConversations, formatDateTime } from "@/lib/db";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({
    meta: [
      { title: "Visão geral — Painel IA Multiplex" },
      { name: "description", content: "Atendimentos, conversas ativas e desempenho da IA Multiplex." },
      { property: "og:title", content: "Visão geral — Painel IA Multiplex" },
      { property: "og:description", content: "Atendimentos, conversas ativas e desempenho da IA Multiplex." },
    ],
  }),
  component: DashboardPage,
});

function DashboardPage() {
  const { companyId } = useAuth();

  const conversations = useQuery({
    queryKey: ["conversations", companyId, "dashboard"],
    queryFn: () => fetchConversations(companyId),
  });
  const agents = useQuery({
    queryKey: ["agents", companyId],
    queryFn: () => fetchAgents(companyId),
  });

  const rows = conversations.data ?? [];
  const today = new Date().toDateString();
  const todayCount = rows.filter((c) => c.created_at && new Date(c.created_at).toDateString() === today).length;
  const openCount = rows.filter((c) => (c.status ?? "").toLowerCase() !== "closed" && (c.status ?? "").toLowerCase() !== "encerrada").length;
  const activeAgents = (agents.data ?? []).filter((a) => a.active).length;

  const byDay = lastDays(14).map((day) => ({
    dia: day.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" }),
    conversas: rows.filter((c) => c.created_at && new Date(c.created_at).toDateString() === day.toDateString()).length,
  }));

  const byChannel = Object.entries(
    rows.reduce<Record<string, number>>((acc, c) => {
      const key = channelLabel(c.channel_type);
      acc[key] = (acc[key] ?? 0) + 1;
      return acc;
    }, {}),
  ).map(([name, value]) => ({ name, value }));

  const palette = ["var(--chart-1)", "var(--chart-2)", "var(--chart-3)", "var(--chart-4)", "var(--chart-5)"];

  return (
    <div className="space-y-6">
      <PageHeader title="Visão geral" description="Resumo dos atendimentos da sua IA nos canais conectados." />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Metric label="Atendimentos hoje" value={todayCount} loading={conversations.isLoading} />
        <Metric label="Conversas abertas" value={openCount} loading={conversations.isLoading} />
        <Metric label="Total de conversas" value={rows.length} loading={conversations.isLoading} />
        <Metric label="Agentes ativos" value={activeAgents} loading={agents.isLoading} />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-sm font-medium">Conversas por dia (14 dias)</CardTitle>
          </CardHeader>
          <CardContent className="h-72">
            {rows.length === 0 && !conversations.isLoading ? (
              <EmptyState title="Ainda sem conversas registradas" />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={byDay}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                  <XAxis dataKey="dia" tickLine={false} axisLine={false} fontSize={11} />
                  <YAxis allowDecimals={false} tickLine={false} axisLine={false} fontSize={11} width={28} />
                  <Tooltip
                    contentStyle={{
                      background: "var(--popover)",
                      border: "1px solid var(--border)",
                      borderRadius: 10,
                      fontSize: 12,
                    }}
                  />
                  <Bar dataKey="conversas" fill="var(--chart-1)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Por canal</CardTitle>
          </CardHeader>
          <CardContent className="h-72">
            {byChannel.length === 0 ? (
              <EmptyState title="Sem dados de canal" />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={byChannel} dataKey="value" nameKey="name" innerRadius={55} outerRadius={85} paddingAngle={3}>
                    {byChannel.map((entry, index) => (
                      <Cell key={entry.name} fill={palette[index % palette.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      background: "var(--popover)",
                      border: "1px solid var(--border)",
                      borderRadius: 10,
                      fontSize: 12,
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">Últimos atendimentos</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {conversations.isLoading ? (
            <Skeleton className="h-24 w-full" />
          ) : rows.length === 0 ? (
            <EmptyState title="Nenhum atendimento ainda" />
          ) : (
            rows.slice(0, 6).map((c) => (
              <div key={c.id} className="flex items-center justify-between rounded-lg border border-border px-3 py-2 text-sm">
                <span className="truncate">{channelLabel(c.channel_type)} · {c.status ?? "sem status"}</span>
                <span className="text-xs text-muted-foreground">{formatDateTime(c.last_message_at ?? c.created_at)}</span>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function Metric({ label, value, loading }: { label: string; value: number; loading: boolean }) {
  return (
    <Card>
      <CardContent className="pt-6">
        <p className="text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
        {loading ? (
          <Skeleton className="mt-2 h-8 w-16" />
        ) : (
          <p className="mt-1 font-display text-3xl font-semibold tabular-nums">{value}</p>
        )}
      </CardContent>
    </Card>
  );
}

function lastDays(n: number) {
  const out: Date[] = [];
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    out.push(d);
  }
  return out;
}
