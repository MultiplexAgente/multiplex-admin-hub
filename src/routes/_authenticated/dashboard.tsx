import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import {
  Building2,
  TrendingUp,
  Receipt,
  Headphones,
  ShieldCheck,
  Store,
  Layers,
  ArrowUpRight,
} from "lucide-react";

import { PageHeader } from "@/components/page-header";
import { useAuth } from "@/hooks/use-auth";
import { channelLabel, fetchAgents, fetchConversations, formatDateTime } from "@/lib/db";
import { getEmpresas, SEGMENTOS_LABELS, type SegmentoEmpresa, type HugEmpresa } from "@/lib/hug-tenants";
import { HugKPICards, type HugKPICardData } from "@/components/analytics/HugKPICards";
import {
  HugAnalyticsCharts,
  type TimeSeriesPoint,
  type DistributionPoint,
} from "@/components/analytics/HugAnalyticsCharts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({
    meta: [
      { title: "Visão Geral — HUG Admin" },
      { name: "description", content: "Atendimentos, empresas ativas, conversas e desempenho do HUG AI." },
      { property: "og:title", content: "Visão Geral — HUG Admin" },
      { property: "og:description", content: "Atendimentos, empresas ativas, conversas e desempenho do HUG AI." },
    ],
  }),
  component: DashboardPage,
});

export function DashboardPage() {
  const { companyId } = useAuth();
  const empresas = useMemo(() => getEmpresas(), []);

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
  const openCount = rows.filter(
    (c) => (c.status ?? "").toLowerCase() !== "closed" && (c.status ?? "").toLowerCase() !== "encerrada",
  ).length;
  const activeAgents = (agents.data ?? []).filter((a) => a.active).length;

  // Série temporal dos últimos 14 dias (somente operações reais)
  const timeSeriesData: TimeSeriesPoint[] = useMemo(() => {
    const days = 14;
    const now = new Date();
    const result: TimeSeriesPoint[] = [];

    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const dayStr = d.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });
      const convsOnDay = rows.filter(
        (c) => c.created_at && new Date(c.created_at).toDateString() === d.toDateString(),
      ).length;

      result.push({
        date: dayStr,
        revenue: 0,
        count: convsOnDay,
      });
    }
    return result;
  }, [rows]);

  // Distribuição por segmento baseada estritamente nas empresas cadastradas reais
  const segmentData: DistributionPoint[] = useMemo(() => {
    if (empresas.length === 0) return [];
    const counts: Record<string, number> = {};
    empresas.forEach((e) => {
      counts[e.segmentoLabel] = (counts[e.segmentoLabel] ?? 0) + 1;
    });
    const total = empresas.length;
    return Object.entries(counts).map(([name, count]) => ({
      name,
      value: count,
      percentage: Number(((count / total) * 100).toFixed(1)),
    }));
  }, [empresas]);

  // Distribuição por canal baseada estritamente nas conversas reais
  const channelData: DistributionPoint[] = useMemo(() => {
    if (rows.length === 0) return [];
    const rawCounts: Record<string, number> = {};
    rows.forEach((c) => {
      const label = channelLabel(c.channel_type);
      rawCounts[label] = (rawCounts[label] ?? 0) + 1;
    });
    return Object.entries(rawCounts).map(([name, value]) => ({ name, value }));
  }, [rows]);

  // KPI Cards Executivos (Baseados estritamente em dados reais)
  const kpiCards: HugKPICardData[] = [
    {
      title: "Faturamento HUG Consolidado",
      value: 0,
      format: "currency",
      subtitle: "Aguardando primeiros pedidos",
      icon: Receipt,
      badge: "Início dos Testes",
    },
    {
      title: "Empresas & Unidades Ativas",
      value: empresas.length,
      format: "number",
      subtitle: empresas.length > 0 ? "Com código de acesso auditado" : "Nenhuma empresa cadastrada",
      icon: Store,
      badge: `${empresas.length} Cadastradas`,
    },
    {
      title: "Atendimentos HUG AI",
      value: rows.length,
      format: "number",
      subtitle: `${todayCount} atendimentos hoje`,
      icon: Headphones,
      badge: "Tempo Real",
    },
    {
      title: "Agentes HUG Especializados",
      value: activeAgents,
      format: "number",
      subtitle: "Modelos verticais sincronizados",
      icon: Layers,
      badge: "BonaSoft Core",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <PageHeader
          title="Visão Geral da Rede HUG"
          description="Consolidação operacional e comercial dos 6 segmentos verticais em tempo real."
        />
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="gap-1.5 border-emerald-500/30 bg-emerald-500/10 text-emerald-400 py-1 px-3">
            <span className="size-2 rounded-full bg-emerald-400 animate-pulse" />
            Sincronizado com BonaSoft Core
          </Badge>
        </div>
      </div>

      {/* KPI Cards responsivos em grade moderna */}
      <HugKPICards cards={kpiCards} isLoading={conversations.isLoading} columns={4} />

      {/* Gráficos de Alta Fidelidade (Área com gradiente esmeralda/ciano, Donut por segmento e Barras por canal) */}
      <HugAnalyticsCharts
        timeSeriesData={timeSeriesData}
        segmentData={segmentData}
        channelData={channelData}
        title="Fluxo Operacional e Distribuição Comercial"
        description="Acompanhamento diário consolidado com filtros dinâmicos de faturamento e volume de operações."
      />

      {/* Tabela de Empresas Ativas com seus Códigos de Acesso Isolados */}
      <Card className="border-border/70 bg-card/60 backdrop-blur-sm">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <div>
            <CardTitle className="text-base font-semibold text-foreground flex items-center gap-2">
              <Building2 className="size-4 text-primary" />
              Diretório de Empresas e Códigos de Acesso
            </CardTitle>
            <CardDescription className="text-xs text-muted-foreground">
              Cada empresa opera sob isolamento estrito de dados através de seu código exclusivo.
            </CardDescription>
          </div>
          <Badge variant="secondary" className="font-mono text-xs">
            {empresas.length} Empresas Credenciadas
          </Badge>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-border/60 text-xs uppercase text-muted-foreground bg-muted/20">
                <tr>
                  <th className="px-4 py-3 font-semibold">Código</th>
                  <th className="px-4 py-3 font-semibold">Empresa</th>
                  <th className="px-4 py-3 font-semibold">Segmento</th>
                  <th className="px-4 py-3 font-semibold">Plano</th>
                  <th className="px-4 py-3 font-semibold">Localização</th>
                  <th className="px-4 py-3 font-semibold text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40 font-normal">
                {empresas.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-xs text-muted-foreground">
                      Nenhuma empresa cadastrada no momento. Use a aba "Empresas & Códigos" para cadastrar a primeira loja.
                    </td>
                  </tr>
                ) : (
                  empresas.map((emp: HugEmpresa) => (
                    <tr key={emp.id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-3">
                        <span className="font-mono font-bold text-primary bg-primary/10 border border-primary/20 px-2.5 py-1 rounded-md text-xs">
                          {emp.codigo}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-medium text-foreground">{emp.nome}</td>
                      <td className="px-4 py-3 text-muted-foreground">
                        <span className="inline-flex items-center gap-1.5 text-xs">
                          {emp.segmentoLabel}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant="outline" className="text-[11px] border-border/80">
                          {emp.plano}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-xs text-muted-foreground">
                        {emp.cidade} - {emp.estado}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Badge className="bg-emerald-500/15 text-emerald-400 border-emerald-500/30 text-[11px]">
                          Ativo
                        </Badge>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
