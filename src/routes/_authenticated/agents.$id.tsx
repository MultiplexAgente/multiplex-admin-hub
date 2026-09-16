import { useEffect, useState } from "react";
import { createFileRoute, useNavigate, useParams } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";

import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/use-auth";
import { fetchAgent, saveAgent } from "@/lib/db";

export const Route = createFileRoute("/_authenticated/agents/$id")({
  head: () => ({
    meta: [
      { title: "Editar agente — Painel IA Multiplex" },
      { name: "description", content: "Configure nome, modelo, temperatura e instruções do agente de IA." },
      { property: "og:title", content: "Editar agente — Painel IA Multiplex" },
      { property: "og:description", content: "Configure nome, modelo, temperatura e instruções do agente de IA." },
    ],
  }),
  component: AgentDetailPage,
});

function AgentDetailPage() {
  const { id } = useParams({ from: "/_authenticated/agents/$id" });
  const isNew = id === "novo";
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { companyId } = useAuth();

  const agent = useQuery({
    queryKey: ["agent", id],
    queryFn: () => fetchAgent(id),
    enabled: !isNew,
  });

  const [form, setForm] = useState({
    name: "",
    description: "",
    model: "",
    system_prompt: "",
    temperature: "0.7",
    active: true,
  });

  useEffect(() => {
    if (agent.data) {
      setForm({
        name: agent.data.name ?? "",
        description: agent.data.description ?? "",
        model: agent.data.model ?? "",
        system_prompt: agent.data.system_prompt ?? "",
        temperature: String(agent.data.temperature ?? 0.7),
        active: Boolean(agent.data.active),
      });
    }
  }, [agent.data]);

  const save = useMutation({
    mutationFn: () =>
      saveAgent(
        {
          ...(isNew ? {} : { id }),
          name: form.name.trim(),
          description: form.description.trim() || null,
          model: form.model.trim() || null,
          system_prompt: form.system_prompt.trim() || null,
          temperature: Number(form.temperature) || 0,
          active: form.active,
        },
        companyId,
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["agents"] });
      queryClient.invalidateQueries({ queryKey: ["agent", id] });
      toast.success("Agente salvo.");
      navigate({ to: "/agents" });
    },
    onError: (error: Error) => toast.error(error.message),
  });

  if (!isNew && agent.isLoading) return <Skeleton className="h-96 w-full" />;

  return (
    <div className="space-y-6">
      <PageHeader
        title={isNew ? "Novo agente" : form.name || "Agente"}
        description="Instruções, modelo e comportamento deste agente."
        actions={
          <Button variant="outline" onClick={() => navigate({ to: "/agents" })}>
            <ArrowLeft className="size-4" /> Voltar
          </Button>
        }
      />

      <Card>
        <CardContent className="space-y-5 pt-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">Nome</Label>
              <Input id="name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="model">Modelo</Label>
              <Input
                id="model"
                placeholder="ex.: gpt-4o-mini"
                value={form.model}
                onChange={(e) => setForm({ ...form, model: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descrição</Label>
            <Input
              id="description"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="prompt">Instruções do agente</Label>
            <Textarea
              id="prompt"
              rows={10}
              value={form.system_prompt}
              onChange={(e) => setForm({ ...form, system_prompt: e.target.value })}
              placeholder="Como o agente deve se comportar, tom de voz, limites, informações da empresa..."
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="temp">Temperatura</Label>
              <Input
                id="temp"
                type="number"
                step="0.1"
                min="0"
                max="2"
                value={form.temperature}
                onChange={(e) => setForm({ ...form, temperature: e.target.value })}
              />
            </div>
            <div className="flex items-end gap-3">
              <Switch
                id="active"
                checked={form.active}
                onCheckedChange={(v) => setForm({ ...form, active: v })}
              />
              <Label htmlFor="active">Agente ativo</Label>
            </div>
          </div>

          <div className="flex justify-end">
            <Button onClick={() => save.mutate()} disabled={save.isPending || !form.name.trim()}>
              {save.isPending ? "Salvando..." : "Salvar agente"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
