import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Plus, Trash2, Pencil, Cpu, Zap, MessagesSquare, CheckCircle2 } from "lucide-react";

import { PageHeader, EmptyState } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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

function ModelBadge({ model }: { model: string | null }) {
  const m = (model ?? "").toLowerCase();
  if (m.includes("gpt") || m.includes("openai")) {
    return (
      <Badge className="bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-medium text-xs">
        ChatGPT (OpenAI) · {model}
      </Badge>
    );
  }
  if (m.includes("deepseek")) {
    return (
      <Badge className="bg-cyan-500/15 text-cyan-400 border border-cyan-500/30 font-medium text-xs">
        DeepSeek · {model}
      </Badge>
    );
  }
  if (m.includes("claude") || m.includes("anthropic")) {
    return (
      <Badge className="bg-purple-500/15 text-purple-400 border border-purple-500/30 font-medium text-xs">
        Claude · {model}
      </Badge>
    );
  }
  return <Badge variant="secondary">{model ?? "Padrão"}</Badge>;
}

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

  const createQuickAgent = useMutation({
    mutationFn: (preset: {
      name: string;
      model: string;
      description: string;
      system_prompt: string;
      temperature: number;
    }) =>
      saveAgent(
        {
          name: preset.name,
          model: preset.model,
          description: preset.description,
          system_prompt: preset.system_prompt,
          temperature: preset.temperature,
          active: true,
        },
        companyId,
      ),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["agents"] });
      toast.success(`Agente "${data.name}" ativado com sucesso!`);
    },
    onError: (err: Error) => toast.error(err.message),
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
        <div className="space-y-6">
          <Card className="border-border/80 bg-card/60 backdrop-blur-sm">
            <CardHeader className="text-center pb-2">
              <div className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary mb-2">
                <Cpu className="size-6" />
              </div>
              <CardTitle className="text-lg font-bold">Motores HUG AI Disponíveis</CardTitle>
              <CardDescription className="text-xs max-w-md mx-auto">
                Integrações nativas com ChatGPT (OpenAI) e DeepSeek. Escolha um motor abaixo para ativar o atendimento inteligente com 1 clique:
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="grid gap-4 md:grid-cols-2">
                {/* CARD CHATGPT */}
                <Card className="border-emerald-500/30 bg-emerald-500/5 hover:border-emerald-500/50 transition-colors">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/40">
                        OpenAI · ChatGPT 4o
                      </Badge>
                      <span className="text-[11px] font-mono text-muted-foreground">gpt-4o</span>
                    </div>
                    <CardTitle className="text-base font-semibold mt-2">
                      Agente Comercial & Vendas (ChatGPT)
                    </CardTitle>
                    <CardDescription className="text-xs">
                      Atendimento humanizado, negociação comercial, suporte a clientes e recomendação de produtos com ChatGPT 4o.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <Button
                      onClick={() =>
                        createQuickAgent.mutate({
                          name: "HUG AI — Comercial & Vendas (ChatGPT)",
                          model: "gpt-4o",
                          description: "Atendimento consultivo e negociação com clientes via ChatGPT.",
                          system_prompt:
                            "Você é o especialista comercial e consultor da empresa na rede HUG. Seu objetivo é atender os clientes com cordialidade, esclarecer dúvidas, recomendar produtos e fechar pedidos com agilidade.",
                          temperature: 0.7,
                        })
                      }
                      disabled={createQuickAgent.isPending}
                      className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs"
                    >
                      {createQuickAgent.isPending ? "Ativando..." : "Ativar Agente ChatGPT"}
                    </Button>
                  </CardContent>
                </Card>

                {/* CARD DEEPSEEK */}
                <Card className="border-cyan-500/30 bg-cyan-500/5 hover:border-cyan-500/50 transition-colors">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <Badge className="bg-cyan-500/20 text-cyan-400 border-cyan-500/40">
                        DeepSeek · V4 Pro
                      </Badge>
                      <span className="text-[11px] font-mono text-muted-foreground">deepseek-chat</span>
                    </div>
                    <CardTitle className="text-base font-semibold mt-2">
                      Agente Analítico & Orçamentos (DeepSeek)
                    </CardTitle>
                    <CardDescription className="text-xs">
                      Triagem ultra-rápida, cálculo de pedidos fracionados (m², kg, unidades), orçamentos rápidos e lógica analítica.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <Button
                      onClick={() =>
                        createQuickAgent.mutate({
                          name: "HUG AI — Operações & Orçamentos (DeepSeek)",
                          model: "deepseek-chat",
                          description: "Triagem ágil de pedidos e raciocínio analítico com DeepSeek.",
                          system_prompt:
                            "Você é o assistente analítico e operacional da empresa na rede HUG. Seu foco é processar pedidos, calcular orçamentos com itens fracionados e conferir estoque com máxima rapidez e precisão lógica.",
                          temperature: 0.5,
                        })
                      }
                      disabled={createQuickAgent.isPending}
                      className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-xs"
                    >
                      {createQuickAgent.isPending ? "Ativando..." : "Ativar Agente DeepSeek"}
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </div>
      ) : (
        <div className="rounded-xl border border-border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Motor de IA Integrado</TableHead>
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
                    <ModelBadge model={agent.model} />
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
