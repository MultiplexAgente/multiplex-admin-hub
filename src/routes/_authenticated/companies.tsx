import { useState, useMemo } from "react";
import { createFileRoute } from "@tanstack/react-router";
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
  RefreshCw,
  Hash,
  Store,
  Globe,
  ArrowRight,
  ArrowLeft,
  Check,
  Lock,
  Smartphone,
  ChevronRight,
  CreditCard,
  History,
} from "lucide-react";

import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
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
  gerarNovoCodigoEmpresa,
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
      { title: "Empresas, Portais & Gestão de Assinaturas — HUG Admin" },
      {
        name: "description",
        content:
          "Gestão centralizada de empresas multissegmento, credenciais de acesso, links dedicados e controle financeiro de assinaturas.",
      },
      { property: "og:title", content: "Empresas & Assinaturas — HUG Admin" },
      {
        property: "og:description",
        content: "Gestão completa de filiais e controle de mensalidades com suspensão imediata.",
      },
    ],
  }),
  component: CompaniesPage,
});

interface PainelConfig {
  segmento: SegmentoEmpresa;
  titulo: string;
  tagline: string;
  recursos: string[];
  liveUrl: string;
  faixaCodigo: string;
  accentColor: string;
  borderActive: string;
  bgLight: string;
}

const PAINEIS_DISPONIVEIS: PainelConfig[] = [
  {
    segmento: "farmacia",
    titulo: "HUG Farmácias & Drogarias",
    tagline: "Receituário, genéricos, perfumaria e balcão farmacêutico",
    recursos: ["Controle de Lotes", "SNGPC & Receitas", "Validade de Medicamentos"],
    liveUrl: REPOSITORIOS_SEGMENTO.farmacia.liveApp,
    faixaCodigo: "1000 - 2999",
    accentColor: "text-emerald-400",
    borderActive: "border-emerald-500 ring-2 ring-emerald-500/30",
    bgLight: "bg-emerald-500/10",
  },
  {
    segmento: "mercado",
    titulo: "HUG Supermercados & Mercearias",
    tagline: "Frente de caixa, pesagem, gôndolas, hortifrúti e açougue",
    recursos: ["Frente de Caixa PDV", "Balanças Integradas", "Gestão de Ruptura"],
    liveUrl: REPOSITORIOS_SEGMENTO.mercado.liveApp,
    faixaCodigo: "3000 - 3999",
    accentColor: "text-amber-400",
    borderActive: "border-amber-500 ring-2 ring-amber-500/30",
    bgLight: "bg-amber-500/10",
  },
  {
    segmento: "moda",
    titulo: "HUG Moda & Vestuário",
    tagline: "Grade de cor/tamanho, vitrine digital, provadores e condicional",
    recursos: ["Grade Tamanho/Cor", "Controle de Condicional", "Vitrine no WhatsApp"],
    liveUrl: REPOSITORIOS_SEGMENTO.moda.liveApp,
    faixaCodigo: "4000 - 4999",
    accentColor: "text-rose-400",
    borderActive: "border-rose-500 ring-2 ring-rose-500/30",
    bgLight: "bg-rose-500/10",
  },
  {
    segmento: "gastronomia",
    titulo: "HUG Restaurantes & Gastronomia",
    tagline: "Mesas, comandas digitais, KDS de cozinha, delivery e pedidos",
    recursos: ["Mapa de Mesas", "Comandas Mobile", "KDS Cozinha em Tempo Real"],
    liveUrl: REPOSITORIOS_SEGMENTO.gastronomia.liveApp,
    faixaCodigo: "5000 - 5999",
    accentColor: "text-orange-400",
    borderActive: "border-orange-500 ring-2 ring-orange-500/30",
    bgLight: "bg-orange-500/10",
  },
  {
    segmento: "beleza",
    titulo: "HUG Salões & Estética",
    tagline: "Agendamentos, comissões de profissionais, estética e barbearias",
    recursos: ["Agenda Digital", "Comissão por Profissional", "Ficha de Atendimento"],
    liveUrl: REPOSITORIOS_SEGMENTO.beleza.liveApp,
    faixaCodigo: "6000 - 6999",
    accentColor: "text-purple-400",
    borderActive: "border-purple-500 ring-2 ring-purple-500/30",
    bgLight: "bg-purple-500/10",
  },
  {
    segmento: "construcao",
    titulo: "HUG Materiais, Papelarias & Ferramentas",
    tagline: "Orçamentos de obra, faturamento fracionado, tintas e entregas",
    recursos: ["Orçamentos de Obra", "Venda Fracionada / Metros", "Controle de Cargas"],
    liveUrl: REPOSITORIOS_SEGMENTO.construcao.liveApp,
    faixaCodigo: "7000 - 8999",
    accentColor: "text-blue-400",
    borderActive: "border-blue-500 ring-2 ring-blue-500/30",
    bgLight: "bg-blue-500/10",
  },
];

function CompaniesPage() {
  const [empresas, setEmpresas] = useState<HugEmpresa[]>(() => getEmpresas());
  const [busca, setBusca] = useState("");
  const [filtroSegmento, setFiltroSegmento] = useState<string>("todos");
  const [filtroStatus, setFiltroStatus] = useState<string>("todos");

  // Modal de Cadastro
  const [mostrarModalCadastro, setMostrarModalCadastro] = useState(false);
  const [etapaCadastro, setEtapaCadastro] = useState<1 | 2 | 3>(1);
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

  // Modal de Convite
  const [empresaConvite, setEmpresaConvite] = useState<HugEmpresa | null>(null);

  // Modal de Cobrança
  const [empresaCobranca, setEmpresaCobranca] = useState<HugEmpresa | null>(null);

  function recarregar() {
    setEmpresas(getEmpresas());
  }

  function handlePlanoChange(novoPlano: "Starter" | "Business" | "Premium") {
    setPlano(novoPlano);
    setValorMensalidade(PRECOS_PLANOS[novoPlano] || 499);
  }

  function handleAbrirModalCadastro() {
    const segPadrao: SegmentoEmpresa = "farmacia";
    setSegmento(segPadrao);
    const codSugerido = gerarNovoCodigoEmpresa(segPadrao);
    setCodigo(codSugerido);
    setPlano("Business");
    setValorMensalidade(PRECOS_PLANOS.Business);
    setDiaVencimento(10);
    setEtapaCadastro(1);
    setMostrarModalCadastro(true);
  }

  function handleGerarNovoCodigo() {
    const novo = gerarNovoCodigoEmpresa(segmento);
    setCodigo(novo);
    toast.success(`Código exclusivo ${novo} gerado com sucesso!`);
  }

  function handleSelecionarPainel(novoSeg: SegmentoEmpresa) {
    setSegmento(novoSeg);
    const novo = gerarNovoCodigoEmpresa(novoSeg);
    setCodigo(novo);
    toast.info(`Painel selecionado: ${REPOSITORIOS_SEGMENTO[novoSeg].nome}. Novo código ${novo} sugerido.`);
  }

  function handleCadastrar(e: React.FormEvent) {
    e.preventDefault();
    if (!nome.trim()) {
      toast.error("Informe a Razão Social ou Nome Fantasia da empresa.");
      setEtapaCadastro(2);
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

  const painelAtivo = PAINEIS_DISPONIVEIS.find((p) => p.segmento === segmento) || PAINEIS_DISPONIVEIS[0]!;

  return (
    <div className="space-y-6">
      {/* CABEÇALHO EXECUTIVO */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/50 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Badge className="bg-primary/10 text-primary border-primary/30 text-[11px] font-mono uppercase tracking-wider">
              BonaSoft Enterprise Hub
            </Badge>
            <span className="text-xs text-muted-foreground">• 6 Portais Verticais Integrados</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Empresas, Portais & Gestão de Assinaturas
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Controle de filiais por segmento, credenciais exclusivas e faturamento recorrente com suspensão imediata de inadimplentes.
          </p>
        </div>

        <Button
          onClick={handleAbrirModalCadastro}
          className="bg-primary text-primary-foreground hover:bg-primary/90 font-semibold gap-2 shadow-lg shadow-primary/20 shrink-0 h-10 px-4"
        >
          <Plus className="size-4" /> Cadastrar Nova Empresa
        </Button>
      </div>

      {/* CARDS EXECUTIVOS DE COBRANÇAS & ASSINATURAS (DESIGN PREMIUM) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* MRR */}
        <div className="relative overflow-hidden rounded-xl border border-emerald-500/30 bg-gradient-to-b from-emerald-500/10 via-card to-card p-4 transition-all hover:border-emerald-500/50">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">
              Receita Recorrente (MRR)
            </span>
            <div className="flex size-8 items-center justify-center rounded-lg bg-emerald-500/20 text-emerald-400">
              <DollarSign className="size-4" />
            </div>
          </div>
          <div className="text-2xl font-bold font-mono text-emerald-400 mt-2">
            R$ {metricas.mrr.toLocaleString("pt-BR")},00
          </div>
          <div className="flex items-center justify-between text-[11px] text-muted-foreground mt-1">
            <span>Mensalidades em dia</span>
            <span className="text-emerald-400 font-medium">100% auditado</span>
          </div>
        </div>

        {/* LOJAS EM DIA */}
        <div className="relative overflow-hidden rounded-xl border border-border/70 bg-gradient-to-b from-card to-card/60 p-4 transition-all hover:border-primary/40">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Lojas em Operação
            </span>
            <div className="flex size-8 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400">
              <CheckCircle2 className="size-4" />
            </div>
          </div>
          <div className="text-2xl font-bold font-mono text-foreground mt-2">
            {metricas.emDiaCount}{" "}
            <span className="text-sm font-normal text-muted-foreground">
              / {metricas.total}
            </span>
          </div>
          <div className="text-[11px] text-muted-foreground mt-1 flex items-center gap-1">
            <span className="size-1.5 rounded-full bg-emerald-400 inline-block animate-pulse" />
            Acesso total liberado aos portais
          </div>
        </div>

        {/* SUSPENSAS */}
        <div className="relative overflow-hidden rounded-xl border border-destructive/30 bg-gradient-to-b from-destructive/10 via-card to-card p-4 transition-all hover:border-destructive/50">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-destructive uppercase tracking-wider">
              Suspensas / Bloqueadas
            </span>
            <div className="flex size-8 items-center justify-center rounded-lg bg-destructive/20 text-destructive">
              <Ban className="size-4" />
            </div>
          </div>
          <div className="text-2xl font-bold font-mono text-destructive mt-2">
            {metricas.suspensasCount}
          </div>
          <div className="text-[11px] text-destructive/80 mt-1">
            R$ {metricas.mrrAtrasado.toLocaleString("pt-BR")},00 em inadimplência
          </div>
        </div>

        {/* VERTICAIS */}
        <div className="relative overflow-hidden rounded-xl border border-border/70 bg-gradient-to-b from-card to-card/60 p-4 transition-all hover:border-primary/40">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Rede de Portais
            </span>
            <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Building2 className="size-4" />
            </div>
          </div>
          <div className="text-2xl font-bold font-mono text-foreground mt-2">
            6 Verticais
          </div>
          <div className="text-[11px] text-muted-foreground mt-1 truncate">
            Farma • Mercado • Moda • Gastro • Beleza • Mat
          </div>
        </div>
      </div>

      {/* BARRA DE FILTROS & BUSCA */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-card/60 p-3 rounded-xl border border-border/60">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nome da empresa, código exclusivo ou CNPJ..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            className="pl-9 text-xs bg-background"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* FILTRO STATUS */}
          <Select value={filtroStatus} onValueChange={setFiltroStatus}>
            <SelectTrigger className="w-44 text-xs bg-background">
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
            <SelectTrigger className="w-56 text-xs bg-background">
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

          {(busca || filtroSegmento !== "todos" || filtroStatus !== "todos") && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setBusca("");
                setFiltroSegmento("todos");
                setFiltroStatus("todos");
              }}
              className="text-xs text-muted-foreground hover:text-foreground h-9"
            >
              Limpar Filtros
            </Button>
          )}
        </div>
      </div>

      {/* TABELA DE EMPRESAS CADASTRADAS */}
      <div className="rounded-xl border border-border/80 bg-card overflow-hidden shadow-sm">
        <Table>
          <TableHeader className="bg-muted/30">
            <TableRow>
              <TableHead className="w-24 font-bold text-xs">CÓDIGO</TableHead>
              <TableHead className="font-bold text-xs">EMPRESA / RAZÃO SOCIAL</TableHead>
              <TableHead className="font-bold text-xs">PORTAL / SEGMENTO</TableHead>
              <TableHead className="font-bold text-xs">PLANO / MENSALIDADE</TableHead>
              <TableHead className="font-bold text-xs">VENCIMENTO</TableHead>
              <TableHead className="font-bold text-xs">SITUAÇÃO FINANCEIRA</TableHead>
              <TableHead className="text-right font-bold text-xs">AÇÕES</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtradas.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="py-16 text-center">
                  <div className="max-w-sm mx-auto space-y-3">
                    <div className="size-12 rounded-2xl bg-primary/10 text-primary mx-auto flex items-center justify-center border border-primary/20">
                      <Store className="size-6" />
                    </div>
                    <div>
                      <h4 className="text-base font-bold text-foreground">
                        Nenhuma empresa encontrada
                      </h4>
                      <p className="text-xs text-muted-foreground mt-1">
                        Cadastre a sua primeira empresa para gerar o portal dedicado e o código exclusivo de acesso.
                      </p>
                    </div>
                    <Button
                      onClick={handleAbrirModalCadastro}
                      className="bg-primary text-primary-foreground font-semibold text-xs gap-1.5"
                    >
                      <Plus className="size-3.5" /> Cadastrar Primeira Loja
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              filtradas.map((emp) => {
                const isSuspenso = emp.statusAssinatura === "suspenso";
                const dadosConvite = gerarConvitePainel(emp);

                return (
                  <TableRow
                    key={emp.id}
                    className={`transition-colors ${
                      isSuspenso
                        ? "bg-destructive/5 hover:bg-destructive/10"
                        : "hover:bg-muted/40"
                    }`}
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
                        <span className="rounded-md bg-neutral-900 border border-neutral-700/80 px-2 py-1 text-primary shadow-inner">
                          {emp.codigo}
                        </span>
                        <Copy className="size-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </button>
                    </TableCell>

                    {/* EMPRESA & CIDADE */}
                    <TableCell>
                      <div className="font-semibold text-foreground text-sm flex items-center gap-1.5">
                        {emp.nome}
                      </div>
                      <div className="text-[11px] text-muted-foreground flex items-center gap-1.5 mt-0.5">
                        <span>{emp.cidade} - {emp.estado}</span>
                        <span>•</span>
                        <span className="font-mono">{emp.documento || "Doc não inf."}</span>
                      </div>
                    </TableCell>

                    {/* SEGMENTO & PORTAL */}
                    <TableCell>
                      <div className="space-y-0.5">
                        <Badge variant="outline" className="text-[11px] font-medium bg-background">
                          {emp.segmentoLabel}
                        </Badge>
                        <div className="text-[10px] text-muted-foreground font-mono truncate max-w-[170px] flex items-center gap-1">
                          <Globe className="size-2.5 text-primary shrink-0" />
                          {dadosConvite.url.replace("https://", "").split("?")[0]}
                        </div>
                      </div>
                    </TableCell>

                    {/* PLANO & MENSALIDADE */}
                    <TableCell>
                      <div className="font-semibold text-xs text-foreground">
                        {emp.plano}
                      </div>
                      <div className="font-mono text-xs font-bold text-emerald-400">
                        R$ {emp.valorMensalidade},00
                        <span className="text-[10px] font-normal text-muted-foreground">/mês</span>
                      </div>
                    </TableCell>

                    {/* VENCIMENTO */}
                    <TableCell className="text-xs text-muted-foreground">
                      <span className="rounded bg-muted px-2 py-0.5 font-mono text-[11px]">
                        Dia {emp.diaVencimento}
                      </span>
                    </TableCell>

                    {/* STATUS DE ASSINATURA */}
                    <TableCell>
                      {isSuspenso ? (
                        <div className="space-y-0.5">
                          <span className="inline-flex items-center gap-1 text-[11px] text-destructive font-bold bg-destructive/10 px-2.5 py-0.5 rounded-full border border-destructive/30">
                            <Ban className="size-3" /> Suspenso (Não Pago)
                          </span>
                          <p className="text-[10px] text-destructive/80 truncate max-w-[150px]">
                            {emp.motivoBloqueio || "Inadimplente"}
                          </p>
                        </div>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] text-emerald-400 font-semibold bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/30">
                          <CheckCircle2 className="size-3" /> Em dia (Ativo)
                        </span>
                      )}
                    </TableCell>

                    {/* AÇÕES */}
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        {/* CONVITE */}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setEmpresaConvite(emp)}
                          className="h-8 text-primary hover:bg-primary/10 text-xs gap-1 px-2.5 font-medium"
                          title="Gerar link de convite oficial para o portal"
                        >
                          <Send className="size-3.5" /> Convidar
                        </Button>

                        {/* COBRANÇA */}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setEmpresaCobranca(emp)}
                          className="h-8 text-muted-foreground hover:text-foreground text-xs gap-1 px-2.5"
                          title="Gerenciar assinatura e histórico financeiro"
                        >
                          <Receipt className="size-3.5" /> Cobrança
                        </Button>

                        {/* TOGGLE RÁPIDO */}
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleAlternarStatusRapido(emp)}
                          className={`h-8 w-8 ${
                            isSuspenso
                              ? "text-emerald-400 hover:bg-emerald-500/10 hover:text-emerald-300"
                              : "text-amber-400 hover:bg-amber-500/10 hover:text-amber-300"
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

                        {/* ABRIR PORTAL */}
                        <a
                          href={dadosConvite.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center justify-center h-8 w-8 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                          title={`Abrir portal ${dadosConvite.nomePainel}`}
                        >
                          <ExternalLink className="size-3.5" />
                        </a>

                        {/* EXCLUIR */}
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleExcluir(emp.id, emp.nome)}
                          className="h-8 w-8 text-destructive/80 hover:text-destructive hover:bg-destructive/10"
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

      {/* ============================================================== */}
      {/* 1. DIALOG DE CADASTRO DE EMPRESA (EXPERIÊNCIA DE MILHÕES)        */}
      {/* ============================================================== */}
      <Dialog open={mostrarModalCadastro} onOpenChange={setMostrarModalCadastro}>
        <DialogContent className="max-w-4xl max-h-[92vh] overflow-y-auto p-0 border-border/80 bg-card/95 backdrop-blur-2xl shadow-2xl rounded-2xl">
          {/* TOPO DO MODAL */}
          <div className="border-b border-border/60 p-6 bg-gradient-to-r from-muted/30 via-background to-muted/20">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary border border-primary/20">
                  <Building2 className="size-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <DialogTitle className="text-lg font-bold text-foreground">
                      Cadastrar Nova Empresa no HUG
                    </DialogTitle>
                    <Badge className="bg-primary/20 text-primary border-primary/40 font-mono text-[11px]">
                      {painelAtivo.titulo}
                    </Badge>
                  </div>
                  <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                    Configure o portal vertical, o código exclusivo de isolamento de dados e o plano de faturamento.
                  </DialogDescription>
                </div>
              </div>
            </div>

            {/* STEPPER NAVEGAÇÃO DE MILHÕES */}
            <div className="grid grid-cols-3 gap-2 mt-5">
              <button
                type="button"
                onClick={() => setEtapaCadastro(1)}
                className={`flex items-center gap-2.5 p-2 rounded-lg border text-left transition-all ${
                  etapaCadastro === 1
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border/60 bg-muted/20 text-muted-foreground hover:bg-muted/40"
                }`}
              >
                <div className={`flex size-6 items-center justify-center rounded-full text-xs font-bold ${
                  etapaCadastro === 1 ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                }`}>
                  1
                </div>
                <div>
                  <div className="text-xs font-bold leading-none">Portal & Segmento</div>
                  <div className="text-[10px] text-muted-foreground">Qual o nicho da empresa</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setEtapaCadastro(2)}
                className={`flex items-center gap-2.5 p-2 rounded-lg border text-left transition-all ${
                  etapaCadastro === 2
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border/60 bg-muted/20 text-muted-foreground hover:bg-muted/40"
                }`}
              >
                <div className={`flex size-6 items-center justify-center rounded-full text-xs font-bold ${
                  etapaCadastro === 2 ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                }`}>
                  2
                </div>
                <div>
                  <div className="text-xs font-bold leading-none">Dados & Código</div>
                  <div className="text-[10px] text-muted-foreground">PIN exclusivo de acesso</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setEtapaCadastro(3)}
                className={`flex items-center gap-2.5 p-2 rounded-lg border text-left transition-all ${
                  etapaCadastro === 3
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border/60 bg-muted/20 text-muted-foreground hover:bg-muted/40"
                }`}
              >
                <div className={`flex size-6 items-center justify-center rounded-full text-xs font-bold ${
                  etapaCadastro === 3 ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                }`}>
                  3
                </div>
                <div>
                  <div className="text-xs font-bold leading-none">Plano & Cobrança</div>
                  <div className="text-[10px] text-muted-foreground">Mensalidade e vencimento</div>
                </div>
              </button>
            </div>
          </div>

          <form onSubmit={handleCadastrar}>
            <div className="p-6 space-y-6">
              {/* ========================================= */}
              {/* ETAPA 1: ESCOLHA DO PORTAL VERTICAL       */}
              {/* ========================================= */}
              {etapaCadastro === 1 && (
                <div className="space-y-4 animate-in fade-in-50 duration-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                        <Store className="size-4 text-primary" />
                        Selecione o Portal de Destino do Sistema
                      </h3>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        O sistema configurará a loja com todas as regras, tributos e catálogo do segmento escolhido.
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {PAINEIS_DISPONIVEIS.map((p) => {
                      const ativo = segmento === p.segmento;
                      return (
                        <div
                          key={p.segmento}
                          onClick={() => handleSelecionarPainel(p.segmento)}
                          className={`cursor-pointer p-4 rounded-xl border text-left transition-all relative flex flex-col justify-between gap-3 ${
                            ativo
                              ? `${p.borderActive} ${p.bgLight} shadow-md`
                              : "border-border/70 hover:border-border bg-card/80 hover:bg-muted/30"
                          }`}
                        >
                          <div>
                            <div className="flex items-start justify-between gap-2">
                              <span className={`font-bold text-xs ${ativo ? "text-primary" : "text-foreground"}`}>
                                {p.titulo}
                              </span>
                              {ativo ? (
                                <CheckCircle2 className="size-4 text-primary shrink-0" />
                              ) : (
                                <div className="size-4 rounded-full border border-border shrink-0" />
                              )}
                            </div>
                            <p className="text-[11px] text-muted-foreground mt-1 leading-snug">
                              {p.tagline}
                            </p>
                          </div>

                          <div className="space-y-2">
                            <div className="flex flex-wrap gap-1">
                              {p.recursos.map((rec, i) => (
                                <span
                                  key={i}
                                  className="text-[9px] font-medium bg-background/80 px-1.5 py-0.5 rounded border border-border/50 text-muted-foreground"
                                >
                                  {rec}
                                </span>
                              ))}
                            </div>

                            <div className="pt-2 border-t border-border/40 flex items-center justify-between text-[10px] text-muted-foreground font-mono">
                              <span className="truncate flex items-center gap-1">
                                <Globe className="size-3 text-primary shrink-0" />
                                {p.liveUrl.replace("https://", "")}
                              </span>
                              <Badge variant="outline" className="text-[9px] px-1.5 py-0 h-4 shrink-0 font-mono">
                                Cód: {p.faixaCodigo}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* BANNER DO PORTAL ATIVO */}
                  <div className="rounded-xl p-3.5 bg-primary/5 border border-primary/20 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <Globe className="size-4 text-primary" />
                      <div>
                        <div className="text-xs font-bold text-foreground">
                          Portal Selecionado: {painelAtivo.titulo}
                        </div>
                        <div className="text-[11px] text-muted-foreground font-mono">
                          Link Oficial: {painelAtivo.liveUrl}
                        </div>
                      </div>
                    </div>
                    <Button
                      type="button"
                      size="sm"
                      onClick={() => setEtapaCadastro(2)}
                      className="bg-primary text-primary-foreground font-semibold text-xs gap-1 h-8"
                    >
                      Avançar para Identificação <ArrowRight className="size-3.5" />
                    </Button>
                  </div>
                </div>
              )}

              {/* ========================================= */}
              {/* ETAPA 2: IDENTIFICAÇÃO & CÓDIGO DE ACESSO */}
              {/* ========================================= */}
              {etapaCadastro === 2 && (
                <div className="space-y-5 animate-in fade-in-50 duration-200">
                  {/* CARTÃO DE SEGURANÇA E CÓDIGO EXCLUSIVO */}
                  <div className="rounded-2xl border border-emerald-500/30 bg-gradient-to-r from-emerald-950/40 via-neutral-950/80 to-card p-5 space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <Lock className="size-4 text-emerald-400" />
                          <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
                            Código Exclusivo de Isolamento de Dados (PIN 4 Dígitos)
                          </h4>
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          Este código garante que nenhum colaborador acesse dados de outras organizações no portal.
                        </p>
                      </div>

                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={handleGerarNovoCodigo}
                        className="h-8 text-xs gap-1.5 border-emerald-500/40 text-emerald-400 hover:bg-emerald-500/10 shrink-0"
                      >
                        <RefreshCw className="size-3.5" /> Gerar Outro Código
                      </Button>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center gap-4 pt-1">
                      <div className="w-full sm:w-56">
                        <Input
                          required
                          maxLength={6}
                          placeholder="Ex: 1056"
                          value={codigo}
                          onChange={(e) => setCodigo(e.target.value.replace(/\D/g, ""))}
                          className="font-mono text-3xl font-extrabold tracking-[0.25em] text-emerald-400 bg-black/60 border-emerald-500/40 text-center h-14"
                        />
                      </div>
                      <div className="text-xs text-muted-foreground space-y-1">
                        <div className="flex items-center gap-1.5 text-emerald-400 font-semibold">
                          <CheckCircle2 className="size-3.5" />
                          <span>Código verificado e pronto para o {painelAtivo.titulo}</span>
                        </div>
                        <p className="text-[11px] text-muted-foreground">
                          Faixa recomendada: {painelAtivo.faixaCodigo} • Isolamento multi-tenant garantido.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* CAMPOS DE IDENTIFICAÇÃO */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5 md:col-span-2">
                      <label className="text-xs font-bold text-foreground">
                        Razão Social / Nome Fantasia da Empresa *
                      </label>
                      <Input
                        required
                        placeholder="Ex: Farmácia Popular Central Matriz"
                        value={nome}
                        onChange={(e) => setNome(e.target.value)}
                        className="bg-background text-sm font-medium"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-foreground">
                        CNPJ ou Documento da Empresa
                      </label>
                      <Input
                        placeholder="00.000.000/0001-00"
                        value={documento}
                        onChange={(e) => setDocumento(e.target.value)}
                        className="bg-background"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-foreground flex items-center justify-between">
                        <span>Telefone / WhatsApp (P/ Convite Oficial)</span>
                        <span className="text-[10px] text-muted-foreground font-normal">Recomendado</span>
                      </label>
                      <Input
                        placeholder="(66) 99999-0000"
                        value={telefone}
                        onChange={(e) => setTelefone(e.target.value)}
                        className="bg-background"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-foreground">
                        E-mail Corporativo
                      </label>
                      <Input
                        type="email"
                        placeholder="gestao@empresa.com.br"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="bg-background"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-foreground">
                        Cidade / UF
                      </label>
                      <div className="flex gap-2">
                        <Input
                          placeholder="Cidade"
                          value={cidade}
                          onChange={(e) => setCidade(e.target.value)}
                          className="bg-background"
                        />
                        <Input
                          className="w-20 text-center font-bold bg-background"
                          placeholder="UF"
                          maxLength={2}
                          value={estado}
                          onChange={(e) => setEstado(e.target.value.toUpperCase())}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ========================================= */}
              {/* ETAPA 3: PLANO & GESTÃO DE MENSALIDADE     */}
              {/* ========================================= */}
              {etapaCadastro === 3 && (
                <div className="space-y-5 animate-in fade-in-50 duration-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                        <Receipt className="size-4 text-emerald-400" />
                        Escolha o Plano de Assinatura & Condições Financeiras
                      </h3>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Defina o valor da mensalidade e o dia de corte para controle automático de suspensão por inadimplência.
                      </p>
                    </div>
                  </div>

                  {/* 3 PLANOS EM CARDS DE DESTAQUE */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {/* STARTER */}
                    <div
                      onClick={() => handlePlanoChange("Starter")}
                      className={`cursor-pointer p-4 rounded-xl border text-left transition-all ${
                        plano === "Starter"
                          ? "border-primary bg-primary/10 ring-2 ring-primary/40 shadow-sm"
                          : "border-border/70 hover:border-border bg-card/80"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs text-foreground">Starter</span>
                        {plano === "Starter" && <CheckCircle2 className="size-4 text-primary" />}
                      </div>
                      <div className="text-xl font-bold font-mono text-foreground mt-2">
                        R$ 299<span className="text-xs font-normal text-muted-foreground">/mês</span>
                      </div>
                      <p className="text-[11px] text-muted-foreground mt-1">
                        1 Terminal de operação • Gestão básica de produtos e vendas diárias.
                      </p>
                    </div>

                    {/* BUSINESS (POPULAR) */}
                    <div
                      onClick={() => handlePlanoChange("Business")}
                      className={`cursor-pointer p-4 rounded-xl border text-left transition-all relative ${
                        plano === "Business"
                          ? "border-emerald-500 bg-emerald-500/10 ring-2 ring-emerald-500/40 shadow-md"
                          : "border-border/70 hover:border-border bg-card/80"
                      }`}
                    >
                      <Badge className="absolute -top-2.5 right-3 bg-emerald-500 text-neutral-950 font-bold text-[9px] px-2 py-0">
                        RECOMENDADO
                      </Badge>
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs text-emerald-400">Business</span>
                        {plano === "Business" && <CheckCircle2 className="size-4 text-emerald-400" />}
                      </div>
                      <div className="text-xl font-bold font-mono text-emerald-400 mt-2">
                        R$ 499<span className="text-xs font-normal text-muted-foreground">/mês</span>
                      </div>
                      <p className="text-[11px] text-muted-foreground mt-1">
                        Até 5 Terminais • Backup contínuo • Gestão multiusuário e suporte prioritário.
                      </p>
                    </div>

                    {/* PREMIUM */}
                    <div
                      onClick={() => handlePlanoChange("Premium")}
                      className={`cursor-pointer p-4 rounded-xl border text-left transition-all ${
                        plano === "Premium"
                          ? "border-primary bg-primary/10 ring-2 ring-primary/40 shadow-sm"
                          : "border-border/70 hover:border-border bg-card/80"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs text-foreground">Premium</span>
                        {plano === "Premium" && <CheckCircle2 className="size-4 text-primary" />}
                      </div>
                      <div className="text-xl font-bold font-mono text-foreground mt-2">
                        R$ 899<span className="text-xs font-normal text-muted-foreground">/mês</span>
                      </div>
                      <p className="text-[11px] text-muted-foreground mt-1">
                        Terminais Ilimitados • APIs Dedicadas • Treinamento e gerente de conta.
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-foreground">
                        Valor Personalizado da Mensalidade (R$)
                      </label>
                      <Input
                        type="number"
                        value={valorMensalidade}
                        onChange={(e) => setValorMensalidade(Number(e.target.value))}
                        className="font-mono font-bold text-base bg-background"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-foreground">
                        Dia de Vencimento Mensal
                      </label>
                      <Select
                        value={String(diaVencimento)}
                        onValueChange={(v) => setDiaVencimento(Number(v))}
                      >
                        <SelectTrigger className="bg-background">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="5">Todo dia 05 de cada mês</SelectItem>
                          <SelectItem value="10">Todo dia 10 de cada mês</SelectItem>
                          <SelectItem value="15">Todo dia 15 de cada mês</SelectItem>
                          <SelectItem value="20">Todo dia 20 de cada mês</SelectItem>
                          <SelectItem value="25">Todo dia 25 de cada mês</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* RESUMO PRÉ-CADASTRO */}
                  <div className="rounded-xl border border-border/80 bg-muted/20 p-4 space-y-2 text-xs">
                    <div className="font-bold text-foreground flex items-center gap-1.5">
                      <ShieldCheck className="size-4 text-primary" />
                      Resumo da Ativação da Loja
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-muted-foreground">
                      <div>
                        <span className="block text-[10px]">Portal:</span>
                        <strong className="text-foreground">{painelAtivo.titulo}</strong>
                      </div>
                      <div>
                        <span className="block text-[10px]">Código de Acesso:</span>
                        <strong className="text-emerald-400 font-mono">{codigo}</strong>
                      </div>
                      <div>
                        <span className="block text-[10px]">Empresa:</span>
                        <strong className="text-foreground truncate block">{nome || "Não preenchido"}</strong>
                      </div>
                      <div>
                        <span className="block text-[10px]">Mensalidade:</span>
                        <strong className="text-foreground font-mono">R$ {valorMensalidade},00 (Dia {diaVencimento})</strong>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* RODAPÉ DE NAVEGAÇÃO ENTRE ETAPAS */}
            <div className="border-t border-border/60 p-4 bg-muted/10 flex items-center justify-between">
              <div>
                {etapaCadastro > 1 ? (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setEtapaCadastro((prev) => (prev - 1) as 1 | 2)}
                    className="text-xs gap-1.5"
                  >
                    <ArrowLeft className="size-3.5" /> Voltar
                  </Button>
                ) : (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setMostrarModalCadastro(false)}
                    className="text-xs"
                  >
                    Cancelar
                  </Button>
                )}
              </div>

              <div className="flex items-center gap-2">
                {etapaCadastro < 3 ? (
                  <Button
                    type="button"
                    size="sm"
                    onClick={() => setEtapaCadastro((prev) => (prev + 1) as 2 | 3)}
                    className="bg-primary text-primary-foreground font-semibold text-xs gap-1.5"
                  >
                    Próximo Passo <ArrowRight className="size-3.5" />
                  </Button>
                ) : (
                  <Button
                    type="submit"
                    className="bg-emerald-500 hover:bg-emerald-600 text-neutral-950 font-bold text-xs gap-1.5 shadow-lg shadow-emerald-500/20"
                  >
                    <CheckCircle2 className="size-4" /> Finalizar e Gerar Convite
                  </Button>
                )}
              </div>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* ============================================================== */}
      {/* 2. DIALOG DE CONVITE OFICIAL ESPECÍFICO DO SEGMENTO              */}
      {/* ============================================================== */}
      <Dialog
        open={!!empresaConvite}
        onOpenChange={(open) => !open && setEmpresaConvite(null)}
      >
        <DialogContent className="max-w-2xl p-0 border-primary/40 bg-card/95 backdrop-blur-2xl shadow-2xl rounded-2xl overflow-hidden">
          {empresaConvite && (() => {
            const dadosConvite = gerarConvitePainel(empresaConvite);
            return (
              <>
                <div className="p-6 bg-gradient-to-r from-primary/10 via-background to-muted/30 border-b border-border/60">
                  <div className="flex items-center gap-3">
                    <div className="flex size-11 items-center justify-center rounded-xl bg-primary/20 text-primary border border-primary/30">
                      <Send className="size-5" />
                    </div>
                    <div>
                      <DialogTitle className="text-base font-bold text-foreground">
                        Convite de Acesso Exclusivo Gerado
                      </DialogTitle>
                      <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                        Envie este link para os colaboradores de <strong>{empresaConvite.nome}</strong>.
                      </DialogDescription>
                    </div>
                  </div>
                </div>

                <div className="p-6 space-y-4">
                  {/* CARTÃO VIP DE ACESSO */}
                  <div className="rounded-2xl border border-primary/30 bg-primary/5 p-4 space-y-3">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <div className="flex items-center gap-2">
                        <Badge className="bg-primary text-primary-foreground font-mono text-xs px-2.5">
                          CÓDIGO: {empresaConvite.codigo}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {dadosConvite.nomePainel}
                        </Badge>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {empresaConvite.cidade} - {empresaConvite.estado}
                      </span>
                    </div>

                    <div className="space-y-1.5 pt-1">
                      <label className="text-xs font-bold text-foreground">
                        Link de Acesso Oficial da Empresa
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
                              "Link oficial de acesso copiado com sucesso!"
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
                        className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white px-3.5 py-2 text-xs font-semibold shadow-md transition-all"
                      >
                        <Share2 className="size-3.5" /> Enviar Convite via WhatsApp
                      </a>
                      <a
                        href={dadosConvite.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 rounded-lg border border-border hover:bg-muted text-foreground px-3.5 py-2 text-xs font-medium transition-all"
                      >
                        <ExternalLink className="size-3.5" /> Abrir Portal Agora
                      </a>
                    </div>
                  </div>

                  {/* PREVIEW DA MENSAGEM */}
                  <div className="rounded-xl border border-border p-3.5 bg-muted/20 text-xs text-muted-foreground space-y-1.5">
                    <p className="font-semibold text-foreground text-xs">
                      Texto do convite pronto para envio:
                    </p>
                    <p className="whitespace-pre-line font-mono text-[11px] bg-background p-3 rounded-lg border border-border/40 text-foreground/90 leading-relaxed">
                      {dadosConvite.textoWhatsApp}
                    </p>
                  </div>
                </div>

                <div className="border-t border-border/60 p-4 bg-muted/10 flex justify-end">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setEmpresaConvite(null)}
                    className="text-xs"
                  >
                    Fechar
                  </Button>
                </div>
              </>
            );
          })()}
        </DialogContent>
      </Dialog>

      {/* ============================================================== */}
      {/* 3. DIALOG DE GESTÃO DE COBRANÇAS & SUSPENSÃO DE SISTEMA         */}
      {/* ============================================================== */}
      <Dialog
        open={!!empresaCobranca}
        onOpenChange={(open) => !open && setEmpresaCobranca(null)}
      >
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto p-0 border-border/80 bg-card/95 backdrop-blur-2xl shadow-2xl rounded-2xl">
          {empresaCobranca && (
            <>
              <div className="p-6 bg-gradient-to-r from-muted/30 via-background to-muted/20 border-b border-border/60">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-3">
                    <div className="flex size-11 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      <Receipt className="size-5" />
                    </div>
                    <div>
                      <DialogTitle className="text-base font-bold text-foreground">
                        Gestão de Assinatura & Cobrança — {empresaCobranca.nome}
                      </DialogTitle>
                      <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                        Plano {empresaCobranca.plano} • Vencimento todo dia {empresaCobranca.diaVencimento}
                      </DialogDescription>
                    </div>
                  </div>

                  <Badge
                    className={
                      empresaCobranca.statusAssinatura === "suspenso"
                        ? "bg-destructive/20 text-destructive border-destructive/40"
                        : "bg-emerald-500/20 text-emerald-400 border-emerald-500/40"
                    }
                  >
                    {empresaCobranca.statusAssinatura === "suspenso"
                      ? "SUSPENSO (NÃO PAGO)"
                      : "EM DIA (ATIVO)"}
                  </Badge>
                </div>
              </div>

              <div className="p-6 space-y-5">
                {/* BANNER DE CONTROLE DE SUSPENSÃO IMEDIATA */}
                <div
                  className={`rounded-2xl p-4 border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${
                    empresaCobranca.statusAssinatura === "suspenso"
                      ? "bg-destructive/10 border-destructive/30"
                      : "bg-emerald-500/10 border-emerald-500/30"
                  }`}
                >
                  <div className="space-y-1">
                    <div className="text-xs font-bold text-foreground flex items-center gap-1.5">
                      {empresaCobranca.statusAssinatura === "suspenso" ? (
                        <Ban className="size-4 text-destructive" />
                      ) : (
                        <CheckCircle2 className="size-4 text-emerald-400" />
                      )}
                      <span>
                        Status Operacional do Sistema:{" "}
                        <strong className="uppercase">
                          {empresaCobranca.statusAssinatura === "suspenso"
                            ? "Bloqueado / Suspenso"
                            : "Liberado & Ativo"}
                        </strong>
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {empresaCobranca.statusAssinatura === "suspenso"
                        ? "O acesso dos funcionários a este portal está suspenso devido a pendência de pagamento."
                        : "Todas as funcionalidades e terminais desta organização estão ativos e operando normalmente."}
                    </p>
                  </div>

                  <Button
                    type="button"
                    onClick={() => handleAlternarStatusRapido(empresaCobranca)}
                    className={
                      empresaCobranca.statusAssinatura === "suspenso"
                        ? "bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs gap-1.5 shrink-0"
                        : "bg-destructive hover:bg-destructive/90 text-destructive-foreground font-semibold text-xs gap-1.5 shrink-0"
                    }
                  >
                    {empresaCobranca.statusAssinatura === "suspenso" ? (
                      <>
                        <CheckCircle2 className="size-3.5" /> Reativar Sistema (Confirmar Pagamento)
                      </>
                    ) : (
                      <>
                        <Ban className="size-3.5" /> Suspender Sistema (Não Pago)
                      </>
                    )}
                  </Button>
                </div>

                {/* BOTÃO RÁPIDO DE REGISTRO DE PAGAMENTO */}
                <div className="rounded-xl border border-border p-4 bg-card flex items-center justify-between flex-wrap gap-2">
                  <div>
                    <div className="text-xs font-bold text-foreground">
                      Recebimento da Mensalidade Atual
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Valor mensal contratado: <strong className="text-foreground font-mono">R$ {empresaCobranca.valorMensalidade},00</strong>
                    </div>
                  </div>

                  <Button
                    type="button"
                    onClick={() => handleRegistrarPagamento(empresaCobranca)}
                    className="bg-primary text-primary-foreground font-semibold text-xs gap-1.5"
                  >
                    <DollarSign className="size-3.5" /> Registrar Pagamento Recebido
                  </Button>
                </div>

                {/* HISTÓRICO DE FATURAS */}
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-foreground flex items-center gap-1.5 uppercase tracking-wider">
                    <History className="size-3.5 text-muted-foreground" />
                    Histórico de Faturas & Liquidação
                  </h4>
                  <div className="rounded-xl border border-border overflow-hidden">
                    <Table>
                      <TableHeader className="bg-muted/30">
                        <TableRow>
                          <TableHead className="text-xs">Competência</TableHead>
                          <TableHead className="text-xs">Valor</TableHead>
                          <TableHead className="text-xs">Vencimento</TableHead>
                          <TableHead className="text-xs">Status</TableHead>
                          <TableHead className="text-xs text-right">Data Liquidação</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {(empresaCobranca.faturas || []).map((fat) => (
                          <TableRow key={fat.id}>
                            <TableCell className="font-semibold text-xs">
                              {fat.mesReferencia}
                            </TableCell>
                            <TableCell className="font-mono text-xs font-bold text-foreground">
                              R$ {fat.valor},00
                            </TableCell>
                            <TableCell className="text-xs text-muted-foreground font-mono">
                              {new Date(fat.vencimento).toLocaleDateString("pt-BR")}
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant="outline"
                                className={
                                  fat.status === "pago"
                                    ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30 text-[10px]"
                                    : "bg-destructive/10 text-destructive border-destructive/30 text-[10px]"
                                }
                              >
                                {fat.status === "pago" ? "PAGO" : "PENDENTE"}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-xs text-muted-foreground text-right font-mono">
                              {fat.pagoEm
                                ? new Date(fat.pagoEm).toLocaleDateString("pt-BR")
                                : "—"}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              </div>

              <div className="border-t border-border/60 p-4 bg-muted/10 flex justify-end">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setEmpresaCobranca(null)}
                  className="text-xs"
                >
                  Fechar
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
