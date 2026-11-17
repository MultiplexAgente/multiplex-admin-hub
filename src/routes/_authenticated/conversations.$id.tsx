import { createFileRoute, useNavigate, useParams } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft } from "lucide-react";

import { PageHeader, EmptyState } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
import {
  channelLabel,
  fetchConversation,
  fetchMessages,
  formatDateTime,
} from "@/lib/db";

export const Route = createFileRoute("/_authenticated/conversations/$id")({
  head: () => ({
    meta: [
      { title: "Conversa — HUG Admin" },
      { name: "description", content: "Transcrição completa do atendimento e dados do contato no HUG AI." },
      { property: "og:title", content: "Conversa — HUG Admin" },
      { property: "og:description", content: "Transcrição completa do atendimento e dados do contato no HUG AI." },
    ],
  }),
  component: ConversationDetailPage,
});

function ConversationDetailPage() {
  const { id } = useParams({ from: "/_authenticated/conversations/$id" });
  const navigate = useNavigate();

  const conversation = useQuery({ queryKey: ["conversation", id], queryFn: () => fetchConversation(id) });
  const messages = useQuery({ queryKey: ["messages", id], queryFn: () => fetchMessages(id) });

  const customerId = conversation.data?.customer_id ?? null;
  const customer = useQuery({
    queryKey: ["customer", customerId],
    enabled: Boolean(customerId),
    queryFn: async () => {
      if (!customerId) return null;
      const res = await supabase
        .from("customers")
        .select("id,name,phone,email,avatar_url,notes,company_id,created_at")
        .eq("id", customerId)
        .maybeSingle();
      if (res.error) throw new Error(res.error.message);
      return res.data;
    },
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title={customer.data?.name ?? "Atendimento"}
        description={`${channelLabel(conversation.data?.channel_type)} · ${conversation.data?.status ?? "sem status"}`}
        actions={
          <Button variant="outline" onClick={() => navigate({ to: "/conversations" })}>
            <ArrowLeft className="size-4" /> Voltar
          </Button>
        }
      />

      <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Transcrição</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {messages.isLoading ? (
              <Skeleton className="h-64 w-full" />
            ) : (messages.data ?? []).length === 0 ? (
              <EmptyState title="Sem mensagens nesta conversa" />
            ) : (
              (messages.data ?? []).map((m) => {
                const fromCustomer = (m.sender_type ?? "").toLowerCase().includes("customer") ||
                  (m.sender_type ?? "").toLowerCase().includes("user") ||
                  (m.sender_type ?? "").toLowerCase().includes("cliente");
                return (
                  <div key={m.id} className={fromCustomer ? "flex" : "flex justify-end"}>
                    <div className={`max-w-[80%] rounded-xl px-3 py-2 text-sm ${fromCustomer ? "border border-border" : "bg-primary text-primary-foreground"}`}>
                      <p className="whitespace-pre-wrap break-words">{m.text ?? "(mídia)"}</p>
                      {m.media_url ? (
                        <a href={m.media_url} target="_blank" rel="noreferrer" className="mt-1 block text-xs underline">
                          Ver anexo ({m.media_type ?? "arquivo"})
                        </a>
                      ) : null}
                      <p className={`mt-1 text-[10px] ${fromCustomer ? "text-muted-foreground" : "opacity-70"}`}>
                        {m.sender_type ?? "—"} · {formatDateTime(m.created_at)}
                      </p>
                    </div>
                  </div>
                );
              })
            )}
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">Contato</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <Info label="Nome" value={customer.data?.name} />
              <Info label="Telefone" value={customer.data?.phone} />
              <Info label="E-mail" value={customer.data?.email} />
              <Info label="Observações" value={customer.data?.notes} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">Conversa</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <Info label="Canal" value={channelLabel(conversation.data?.channel_type)} />
              <Info label="Status" value={conversation.data?.status} />
              <Info label="Início" value={formatDateTime(conversation.data?.created_at)} />
              <Info label="Última mensagem" value={formatDateTime(conversation.data?.last_message_at)} />
              <div>
                <p className="text-xs text-muted-foreground">Etiquetas</p>
                <div className="mt-1 flex flex-wrap gap-1">
                  {(conversation.data?.tags ?? []).length === 0 ? (
                    <span className="text-sm">—</span>
                  ) : (
                    (conversation.data?.tags ?? []).map((tag) => (
                      <Badge key={tag} variant="secondary">{tag}</Badge>
                    ))
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function Info({ label, value }: { label: string; value?: string | null | undefined }) {
  return (
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="break-words">{value || "—"}</p>
    </div>
  );
}
