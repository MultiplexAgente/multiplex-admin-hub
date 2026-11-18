import { useState, useMemo } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { toast } from "sonner";
import {
  Building2,
  Plus,
  Search,
  ExternalLink,
  ShieldCheck,
  UserPlus,
  Trash2,
  Filter,
  CheckCircle2,
  AlertCircle,
  Copy,
  DollarSign,
  Receipt,
  Send,
  Ban,
  Calendar,
  Wallet,
  Share2,
} from "lucide-react";

import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  getEmpresas,
  salvarEmpresa,
  removerEmpresa,
  gerarConvitePainel,
  alternarStatusAssinatura,
  registrarPagamentoMensalidade,
  SEGMENTOS_LABELS,
  REPOSITORIOS_SEGMENTO,
  PRECOS_PLANOS,
  type HugEmpresa,
  type SegmentoEmpresa,
  type StatusAssinatura,
} from "@/lib/hug-tenants";

export const Route = createFileRoute("/_authenticated/companies")({
  head: () => ({
    meta: [
      { title: "Empresas, Convites & Cobranças — HUG Admin" },
      {
        name: "description",
        content:
          "Gestão de empresas multissegmento, links de convite por painel, assinaturas mensais e suspensão por inadimplência.",
      },
      { property: "og:title", content: "Empresas, Convites & Cobranças — HUG Admin" },
      {
        property: "og:description",
        content: "Gestão completa de empresas, links de convite e cobranças mensais.",
      },
    ],
  }),
  component: CompaniesPage,
});

function CompaniesPage() {
  const [empresas, setEmpresas] = useState<HugEmpresa[]>(() => getEmpresas());
  const [busca, setBusca] = useState("");
  const [filtroSegmento, setFiltroSegmento] = useState<string>("todos");
  const [filtroStatus, setFiltroStatus] = useState<string>("todos");

  // Modal de Cadastro de Empresa
  const [mostrarModalCadastro, setMostrarModalCadastro] = useState(false);
  const [nome, setNome] = useState("");
  const [codigo, setCodigo] = useState("");
  const [segmento, setSegmento] = useState<SegmentoEmpresa>("farmacia");
  const [documento, setDocumento] = useState("");
  const [email, setEmail] = useState("");
  const [telefone, setTelefone] = useState("");
  const [cidade, setCidade] = useState("Primavera do Leste");
  const [estado, setEstado] = useState("MT");
  const [plano, setPlano] = useState<"Starter" | "Business" | "Premium">("Business");
  const [valorMensalidade, setValorMensalidade] = useState<number>(499);
  const [diaVencimento, setDiaVencimento] = useState<number>(10);

  // Modal de Convite de Painel Específico
  const [empresaConvite, setEmpresaConvite] = useState<HugEmpresa | null>(null);

  // Modal de Gestão de Assinatura & Cobrança
  const [empresaCobranca, setEmpresaCobranca] = useState<HugEmpresa | null>(null);

  function recarregar() {
    setEmpresas(getEmpresas());
  }

  function handlePlanoChange(novoPlano: "Starter" | "Business" | "Premium") {
    setPlano(novoPlano);
    setValorMensalidade(PRECOS_PLANOS[novoPlano] || 499);
  }

  function handleCadastrar(e: React.FormEvent) {
    e.preventDefault();
    if (!nome.trim()) {
      toast.error("Informe a Razão Social ou Nome Fantasia da empresa.");
      return;
    }

    try {
      const nova = salvarEmpresa({
        nome,
        ...(codigo.trim() ? { codigo: codigo.trim() } : {}),
        segmento,
        documento,
        email,
        telefone,
        cidade,
        estado,
        plano,
        valorMensalidade: Number(valorMensalidade) || 499,
        diaVencimento: Number(diaVencimento) || 10,
        statusAssinatura: "em_dia",
        status: "ativo",
      });

      toast.success(
        `Empresa "${nova.nome}" cadastrada com sucesso! Código: ${nova.codigo}`
      );
      setNome("");
      setCodigo("");
      setDocumento("");
      setEmail("");
      setTelefone("");
      setMostrarModalCadastro(false);
      recarregar();

      // Já abre o modal de convite com o link do painel pronto
      setEmpresaConvite(nova);
    } catch (err: any) {
      toast.error(err.message || "Erro ao cadastrar empresa.");
    }
  }

  function handleExcluir(id: string, nomeEmpresa: string) {
    if (confirm(`Tem certeza que deseja excluir a empresa "${nomeEmpresa}"?`)) {
      removerEmpresa(id);
      toast.success("Empresa removida.");
      recarregar();
    }
  }

  function copiarTexto(texto: string, mensagem: string) {
    navigator.clipboard.writeText(texto);
    toast.success(mensagem);
  }

  function handleAlternarStatusRapido(emp: HugEmpresa) {
    const proximoStatus: StatusAssinatura =
      emp.statusAssinatura === "suspenso" ? "em_dia" : "suspenso";
    try {
      const atualizada = alternarStatusAssinatura(
        emp.id,
        proximoStatus,
        proximoStatus === "suspenso"
          ? "Assinatura mensal pendente / não paga. Sistema temporariamente suspenso."
          : undefined
      );
      if (proximoStatus === "suspenso") {
        toast.error(
          `Sistema da empresa "${emp.nome}" foi SUSPENSO por falta de pagamento.`
        );
      } else {
        toast.success(
          `Pagamento confirmado! Sistema da empresa "${emp.nome}" foi REATIVADO.`
        );
      }
      recarregar();
      if (empresaCobranca?.id === emp.id) {
        setEmpresaCobranca(atualizada);
      }
    } catch (err: any) {
      toast.error(err.message || "Erro ao alterar status da assinatura.");
    }
  }

  function handleRegistrarPagamento(emp: HugEmpresa) {
    try {
      const atualizada = registrarPagamentoMensalidade(emp.id);
      toast.success(
        `Pagamento da mensalidade de R$ ${atualizada.valorMensalidade} registrado com sucesso para "${atualizada.nome}"!`
      );
      recarregar();
      setEmpresaCobranca(atualizada);
    } catch (err: any) {
      toast.error(err.message || "Erro ao registrar pagamento.");
    }
  }

  // Estatísticas de Gestão de Assinaturas
  const metricas = useMemo(() => {
    const total = empresas.length;
    const emDia = empresas.filter((e) => e.statusAssinatura !== "suspenso");
    const suspensas = empresas.filter((e) => e.statusAssinatura === "suspenso");
    const mrr = emDia.reduce((acc, curr) => acc + (curr.valorMensalidade || 0), 0);
    const mrrAtrasado = suspensas.reduce(
      (acc, curr) => acc + (curr.valorMensalidade || 0),
      0
    );

    return {
      total,
      emDiaCount: emDia.length,
      suspensasCount: suspensas.length,
      mrr,
      mrrAtrasado,
    };
  }, [empresas]);

  // Filtragem da tabela
  const filtradas = useMemo(() => {
    return empresas.filter((emp) => {
      const matchBusca =
        emp.nome.toLowerCase().includes(busca.toLowerCase()) ||
        emp.codigo.includes(busca) ||
        (emp.documento ?? "").includes(busca);
      const matchSeg = filtroSegmento === "todos" || emp.segmento === filtroSegmento;
      const matchStatus =
        filtroStatus === "todos" ||
        (filtroStatus === "em_dia" && emp.statusAssinatura !== "suspenso") ||
        (filtroStatus === "suspenso" && emp.statusAssinatura === "suspenso");

      return matchBusca && matchSeg && matchStatus;
    });
  }, [empresas, busca, filtroSegmento, filtroStatus]);

  return (
    <div className="space-y-6">
      {/* CABEÇALHO */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <PageHeader
          title="Empresas, Convites & Gestão de Assinaturas"
          description="Controle de filiais por segmento, links de convite dedicados e controle mensal de pagamentos com suspensão imediata de inadimplentes."
        />
        <Button
          onClick={() => setMostrarModalCadastro(true)}
          className="bg-primary text-primary-foreground hover:bg-primary/90 gap-1.5 shrink-0"
        >
          <Plus className="size-4" /> Cadastrar Nova Empresa
        </Button>
      </div>

      {/* CARDS EXECUTIVOS DE COBRANÇAS & ASSINATURAS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-border/70 bg-card/60 backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Receita Recorrente (MRR)
            </span>
            <div className="flex size-8 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400">
              <DollarSign className="size-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-mono text-emerald-400">
              R$ {metricas.mrr.toLocaleString("pt-BR")},00
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Assinaturas ativas no mês
            </p>
          </CardContent>
        </Card>

        <Card className="border-border/70 bg-card/60 backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Empresas em Dia
            </span>
            <div className="flex size-8 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400">
              <CheckCircle2 className="size-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-mono text-foreground">
              {metricas.emDiaCount} / {metricas.total}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Acesso total liberado aos painéis
            </p>
          </CardContent>
        </Card>

        <Card className="border-border/70 bg-card/60 backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Suspensas / Bloqueadas
            </span>
            <div className="flex size-8 items-center justify-center rounded-lg bg-destructive/10 text-destructive">
              <Ban className="size-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-mono text-destructive">
              {metricas.suspensasCount}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              R$ {metricas.mrrAtrasado.toLocaleString("pt-BR")},00 em atraso
            </p>
          </CardContent>
        </Card>

        <Card className="border-border/70 bg-card/60 backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Segmentos Ativos
            </span>
            <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Building2 className="size-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-mono text-foreground">
              6 Verticais
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Painéis dedicados com link exclusivo
            </p>
          </CardContent>
        </Card>
      </div>

      {/* MODAL / FORMULÁRIO DE CADASTRO */}
      {mostrarModalCadastro && (
        <Card className="border-primary/40 bg-card shadow-xl">
          <CardContent className="pt-6">
            <form onSubmit={handleCadastrar} className="space-y-4">
              <div className="flex items-center justify-between border-b pb-3">
                <div className="flex items-center gap-2">
                  <Building2 className="size-5 text-primary" />
                  <h3 className="font-semibold text-base">Nova Empresa no HUG</h3>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setMostrarModalCadastro(false)}
                >
                  Cancelar
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1.5 md:col-span-2">
                  <label className="text-xs font-semibold text-muted-foreground">
                    Nome da Empresa / Razão Social *
                  </label>
                  <Input
                    required
                    placeholder="Ex: Farmácia Machadão Matriz"
                    value={nome}
                    onChange={(e) => setNome(e.target.value)}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground">
                    Código Exclusivo (4 dígitos)
                  </label>
                  <Input
                    placeholder="Ex: 1056 (deixe vazio p/ gerar)"
                    value={codigo}
                    onChange={(e) => setCodigo(e.target.value)}
                  />
                  <p className="text-[10px] text-muted-foreground">
                    Gerado automaticamente se deixado em branco.
                  </p>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground">
                    Segmento Comercial (Define o Painel) *
                  </label>
                  <Select
                    value={segmento}
                    onValueChange={(v) => setSegmento(v as SegmentoEmpresa)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(SEGMENTOS_LABELS).map(([k, label]) => (
                        <SelectItem key={k} value={k}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground">
                    Plano de Assinatura
                  </label>
                  <Select
                    value={plano}
                    onValueChange={(v) =>
                      handlePlanoChange(v as "Starter" | "Business" | "Premium")
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Starter">Starter (R$ 299,00/mês)</SelectItem>
                      <SelectItem value="Business">Business (R$ 499,00/mês)</SelectItem>
                      <SelectItem value="Premium">Premium (R$ 899,00/mês)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground">
                    Valor Mensalidade (R$)
                  </label>
                  <Input
                    type="number"
                    value={valorMensalidade}
                    onChange={(e) => setValorMensalidade(Number(e.target.value))}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground">
                    Dia de Vencimento Mensal
                  </label>
                  <Select
                    value={String(diaVencimento)}
                    onValueChange={(v) => setDiaVencimento(Number(v))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="5">Dia 05 de cada mês</SelectItem>
                      <SelectItem value="10">Dia 10 de cada mês</SelectItem>
                      <SelectItem value="15">Dia 15 de cada mês</SelectItem>
                      <SelectItem value="20">Dia 20 de cada mês</SelectItem>
                      <SelectItem value="25">Dia 25 de cada mês</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground">
                    CNPJ / Documento
                  </label>
                  <Input
                    placeholder="00.000.000/0001-00"
                    value={documento}
                    onChange={(e) => setDocumento(e.target.value)}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground">
                    E-mail de Contato
                  </label>
                  <Input
                    type="email"
                    placeholder="contato@empresa.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground">
                    Telefone / WhatsApp (P/ Convite)
                  </label>
                  <Input
                    placeholder="(66) 99999-0000"
                    value={telefone}
                    onChange={(e) => setTelefone(e.target.value)}
                  />
                </div>

                <div className="space-y-1.5 md:col-span-2">
                  <label className="text-xs font-semibold text-muted-foreground">
                    Cidade / UF
                  </label>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Cidade"
                      value={cidade}
                      onChange={(e) => setCidade(e.target.value)}
                    />
                    <Input
                      className="w-20"
                      placeholder="UF"
                      value={estado}
                      onChange={(e) => setEstado(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setMostrarModalCadastro(false)}
                >
                  Cancelar
                </Button>
                <Button type="submit" className="bg-primary text-primary-foreground font-semibold">
                  Salvar Empresa e Gerar Link do Painel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* MODAL DE CONVITE ESPECÍFICO DO SEGMENTO */}
      {empresaConvite && (
        <Card className="border-primary/50 bg-card shadow-2xl">
          <CardHeader className="border-b pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Send className="size-5 text-primary" />
                <div>
                  <CardTitle className="text-base font-bold">
                    Convite de Acesso Exclusivo — {empresaConvite.nome}
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Link oficial direcionado para o painel específico de {empresaConvite.segmentoLabel}.
                  </CardDescription>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setEmpresaConvite(null)}
              >
                Fechar
              </Button>
            </div>
          </CardHeader>
          <CardContent className="pt-4 space-y-4">
            {(() => {
              const dadosConvite = gerarConvitePainel(empresaConvite);
              return (
                <>
                  <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 space-y-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <Badge className="bg-primary/20 text-primary border-primary/40 font-mono text-xs">
                          CÓDIGO: {empresaConvite.codigo}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          Painel: {dadosConvite.nomePainel}
                        </Badge>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {empresaConvite.cidade} - {empresaConvite.estado}
                      </span>
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-muted-foreground">
                        Link de Acesso Direto da Empresa
                      </label>
                      <div className="flex gap-2">
                        <Input
                          readOnly
                          value={dadosConvite.url}
                          className="font-mono text-xs bg-background"
                        />
                        <Button
                          type="button"
                          onClick={() =>
                            copiarTexto(
                              dadosConvite.url,
                              "Link de acesso copiado para a área de transferência!"
                            )
                          }
                          className="bg-primary text-primary-foreground text-xs gap-1.5 shrink-0"
                        >
                          <Copy className="size-3.5" /> Copiar Link
                        </Button>
                      </div>
                    </div>

                    <div className="pt-2 flex flex-wrap gap-2">
                      <a
                        href={dadosConvite.linkWhatsApp}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 rounded-md bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-1.5 text-xs font-semibold shadow transition-colors"
                      >
                        <Share2 className="size-3.5" /> Enviar Convite via WhatsApp
                      </a>
                      <a
                        href={dadosConvite.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 rounded-md border border-border hover:bg-muted text-foreground px-3 py-1.5 text-xs font-medium transition-colors"
                      >
                        <ExternalLink className="size-3.5" /> Abrir Painel da Loja
                      </a>
                    </div>
                  </div>

                  <div className="rounded-lg border border-border p-3 bg-muted/20 text-xs text-muted-foreground space-y-1">
                    <p className="font-semibold text-foreground">Mensagem pronta gerada:</p>
                    <p className="whitespace-pre-line font-mono text-[11px] bg-background/50 p-2 rounded border border-border/40">
                      {dadosConvite.textoWhatsApp}
                    </p>
                  </div>
                </>
              );
            })()}
          </CardContent>
        </Card>
      )}

      {/* MODAL DE GESTÃO DE COBRANÇAS, ASSINATURA E SUSPENSÃO */}
      {empresaCobranca && (
        <Card className="border-border bg-card shadow-2xl">
          <CardHeader className="border-b pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Receipt className="size-5 text-emerald-400" />
                <div>
                  <CardTitle className="text-base font-bold">
                    Gestão de Assinatura — {empresaCobranca.nome}
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Plano, faturamento mensal e controle de suspensão do sistema por inadimplência.
                  </CardDescription>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setEmpresaCobranca(null)}
              >
                Fechar
              </Button>
            </div>
          </CardHeader>
          <CardContent className="pt-4 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="rounded-lg border border-border p-3 bg-muted/10 space-y-1">
                <span className="text-[11px] text-muted-foreground uppercase font-semibold">
                  Plano Contratado
                </span>
                <p className="text-sm font-bold text-foreground">
                  {empresaCobranca.plano}
                </p>
                <p className="text-xs text-muted-foreground">
                  Mensalidade: R$ {empresaCobranca.valorMensalidade},00
                </p>
              </div>

              <div className="rounded-lg border border-border p-3 bg-muted/10 space-y-1">
                <span className="text-[11px] text-muted-foreground uppercase font-semibold">
                  Vencimento
                </span>
                <p className="text-sm font-bold text-foreground">
                  Dia {empresaCobranca.diaVencimento} de cada mês
                </p>
                <p className="text-xs text-muted-foreground">
                  Último Pgto:{" "}
                  {empresaCobranca.dataUltimoPagamento
                    ? new Date(empresaCobranca.dataUltimoPagamento).toLocaleDateString(
                        "pt-BR"
                      )
                    : "Pendente"}
                </p>
              </div>

              <div className="rounded-lg border border-border p-3 bg-muted/10 space-y-1">
                <span className="text-[11px] text-muted-foreground uppercase font-semibold">
                  Status Atual
                </span>
                <div>
                  {empresaCobranca.statusAssinatura === "suspenso" ? (
                    <Badge className="bg-destructive text-destructive-foreground font-semibold text-xs">
                      SUSPENSO (BLOQUEADO)
                    </Badge>
                  ) : (
                    <Badge className="bg-emerald-600 text-white font-semibold text-xs">
                      EM DIA (ATIVO)
                    </Badge>
                  )}
                </div>
                <p className="text-[11px] text-muted-foreground">
                  {empresaCobranca.statusAssinatura === "suspenso"
                    ? "Acesso bloqueado por falta de pagamento"
                    : "Sistema liberado normalmente"}
                </p>
              </div>
            </div>

            {/* AÇÃO PRINCIPAL DE SUSPENSÃO / ATIVAÇÃO */}
            <div className="rounded-xl border p-4 bg-muted/20 space-y-3">
              <h4 className="font-semibold text-xs uppercase tracking-wider text-muted-foreground">
                Ações de Cobrança Imediata
              </h4>
              <div className="flex flex-wrap gap-3">
                {empresaCobranca.statusAssinatura === "suspenso" ? (
                  <Button
                    onClick={() => handleRegistrarPagamento(empresaCobranca)}
                    className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs gap-1.5"
                  >
                    <CheckCircle2 className="size-4" /> Registrar Pagamento & Reativar Sistema
                  </Button>
                ) : (
                  <>
                    <Button
                      onClick={() => handleRegistrarPagamento(empresaCobranca)}
                      className="bg-primary text-primary-foreground font-semibold text-xs gap-1.5"
                    >
                      <DollarSign className="size-4" /> Dar Baixa na Mensalidade deste Mês
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={() => handleAlternarStatusRapido(empresaCobranca)}
                      className="font-semibold text-xs gap-1.5"
                    >
                      <Ban className="size-4" /> Suspender Sistema (Não Pago)
                    </Button>
                  </>
                )}
              </div>
            </div>

            {/* HISTÓRICO DE FATURAS */}
            <div className="space-y-2">
              <h4 className="font-semibold text-xs uppercase tracking-wider text-muted-foreground">
                Histórico de Faturas & Recibos
              </h4>
              <div className="rounded-lg border border-border overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-muted/40 border-b border-border text-muted-foreground">
                    <tr>
                      <th className="p-2.5">Referência</th>
                      <th className="p-2.5">Valor</th>
                      <th className="p-2.5">Vencimento</th>
                      <th className="p-2.5">Data Pagamento</th>
                      <th className="p-2.5 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60">
                    {empresaCobranca.faturas && empresaCobranca.faturas.length > 0 ? (
                      empresaCobranca.faturas.map((fat) => (
                        <tr key={fat.id}>
                          <td className="p-2.5 font-medium">{fat.mesReferencia}</td>
                          <td className="p-2.5 font-mono">
                            R$ {fat.valor.toLocaleString("pt-BR")},00
                          </td>
                          <td className="p-2.5">{fat.vencimento}</td>
                          <td className="p-2.5">{fat.pagoEm || "—"}</td>
                          <td className="p-2.5 text-right">
                            {fat.status === "pago" ? (
                              <Badge className="bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 text-[10px]">
                                Pago
                              </Badge>
                            ) : (
                              <Badge className="bg-destructive/15 text-destructive border border-destructive/30 text-[10px]">
                                Atrasado
                              </Badge>
                            )}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td
                          colSpan={5}
                          className="p-4 text-center text-muted-foreground"
                        >
                          Nenhuma fatura registrada ainda.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* FILTROS E BUSCA */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nome, código (ex: 1056) ou CNPJ..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            className="pl-9 text-xs"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* FILTRO STATUS FINANCEIRO */}
          <Select value={filtroStatus} onValueChange={setFiltroStatus}>
            <SelectTrigger className="w-44 text-xs">
              <SelectValue placeholder="Status financeiro" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos os Status</SelectItem>
              <SelectItem value="em_dia">Em Dia (Ativos)</SelectItem>
              <SelectItem value="suspenso">Suspensos (Não Pago)</SelectItem>
            </SelectContent>
          </Select>

          {/* FILTRO SEGMENTO */}
          <Select value={filtroSegmento} onValueChange={setFiltroSegmento}>
            <SelectTrigger className="w-56 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos os Segmentos</SelectItem>
              {Object.entries(SEGMENTOS_LABELS).map(([k, label]) => (
                <SelectItem key={k} value={k}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* TABELA DE EMPRESAS CADASTRADAS */}
      <div className="rounded-xl border border-border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Código</TableHead>
              <TableHead>Empresa</TableHead>
              <TableHead>Segmento</TableHead>
              <TableHead>Plano / Valor</TableHead>
              <TableHead>Vencimento</TableHead>
              <TableHead>Status Assinatura</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtradas.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="text-center py-10 text-muted-foreground text-xs"
                >
                  Nenhuma empresa encontrada com os filtros aplicados.
                </TableCell>
              </TableRow>
            ) : (
              filtradas.map((emp) => {
                const isSuspenso = emp.statusAssinatura === "suspenso";
                const dadosConvite = gerarConvitePainel(emp);

                return (
                  <TableRow
                    key={emp.id}
                    className={isSuspenso ? "bg-destructive/5 hover:bg-destructive/10" : ""}
                  >
                    {/* CÓDIGO */}
                    <TableCell>
                      <button
                        onClick={() =>
                          copiarTexto(
                            emp.codigo,
                            `Código ${emp.codigo} copiado com sucesso!`
                          )
                        }
                        className="group flex items-center gap-1.5 font-mono text-xs font-bold text-primary hover:underline"
                        title="Clique para copiar o código"
                      >
                        <span className="rounded bg-primary/10 px-2 py-0.5 border border-primary/20">
                          {emp.codigo}
                        </span>
                        <Copy className="size-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </button>
                    </TableCell>

                    {/* EMPRESA & CIDADE */}
                    <TableCell>
                      <div className="font-semibold text-foreground">{emp.nome}</div>
                      <div className="text-[11px] text-muted-foreground">
                        {emp.cidade} - {emp.estado} • {emp.documento}
                      </div>
                    </TableCell>

                    {/* SEGMENTO */}
                    <TableCell>
                      <Badge variant="outline" className="text-[11px]">
                        {emp.segmentoLabel}
                      </Badge>
                    </TableCell>

                    {/* PLANO & MENSALIDADE */}
                    <TableCell>
                      <div className="font-semibold text-xs text-foreground">
                        {emp.plano}
                      </div>
                      <div className="font-mono text-[11px] text-muted-foreground">
                        R$ {emp.valorMensalidade},00/mês
                      </div>
                    </TableCell>

                    {/* VENCIMENTO */}
                    <TableCell className="text-xs text-muted-foreground">
                      Dia {emp.diaVencimento}
                    </TableCell>

                    {/* STATUS DE ASSINATURA / PAGAMENTO */}
                    <TableCell>
                      {isSuspenso ? (
                        <div className="space-y-0.5">
                          <span className="inline-flex items-center gap-1 text-[11px] text-destructive font-bold bg-destructive/10 px-2 py-0.5 rounded-full border border-destructive/20">
                            <Ban className="size-3" /> Suspenso (Não Pago)
                          </span>
                          <p className="text-[10px] text-destructive/80 truncate max-w-[140px]">
                            {emp.motivoBloqueio || "Inadimplente"}
                          </p>
                        </div>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] text-emerald-600 font-semibold bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                          <CheckCircle2 className="size-3" /> Em dia (Ativo)
                        </span>
                      )}
                    </TableCell>

                    {/* AÇÕES */}
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        {/* BOTÃO GERAR CONVITE DO PAINEL */}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setEmpresaConvite(emp)}
                          className="h-8 text-primary hover:bg-primary/10 text-xs gap-1 px-2"
                          title="Gerar link de convite para o painel deste segmento"
                        >
                          <Send className="size-3.5" /> Convidar
                        </Button>

                        {/* BOTÃO GESTÃO DE COBRANÇA */}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setEmpresaCobranca(emp)}
                          className="h-8 text-muted-foreground hover:text-foreground text-xs gap-1 px-2"
                          title="Gerenciar assinatura, faturas e pagamentos"
                        >
                          <Receipt className="size-3.5" /> Cobrança
                        </Button>

                        {/* BOTÃO RÁPIDO: SUSPENDER / REATIVAR */}
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleAlternarStatusRapido(emp)}
                          className={`h-8 w-8 ${
                            isSuspenso
                              ? "text-emerald-500 hover:bg-emerald-500/10"
                              : "text-amber-500 hover:bg-amber-500/10"
                          }`}
                          title={
                            isSuspenso
                              ? "Reativar sistema (Confirmar Pagamento)"
                              : "Suspender sistema (Marcar como Não Pago)"
                          }
                        >
                          {isSuspenso ? (
                            <CheckCircle2 className="size-4" />
                          ) : (
                            <Ban className="size-4" />
                          )}
                        </Button>

                        {/* BOTÃO ABRIR PAINEL */}
                        <a
                          href={dadosConvite.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center justify-center h-8 w-8 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted"
                          title={`Abrir ${dadosConvite.nomePainel}`}
                        >
                          <ExternalLink className="size-3.5" />
                        </a>

                        {/* EXCLUIR */}
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleExcluir(emp.id, emp.nome)}
                          className="h-8 w-8 text-destructive hover:bg-destructive/10"
                          title="Excluir empresa"
                        >
                          <Trash2 className="size-3.5" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
