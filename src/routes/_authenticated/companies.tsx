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
} from "lucide-react";

import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
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
  SEGMENTOS_LABELS,
  REPOSITORIOS_SEGMENTO,
  type HugEmpresa,
  type SegmentoEmpresa,
} from "@/lib/hug-tenants";

export const Route = createFileRoute("/_authenticated/companies")({
  head: () => ({
    meta: [
      { title: "Empresas & Códigos — HUG Admin" },
      {
        name: "description",
        content:
          "Gerenciamento de empresas multissegmento, códigos exclusivos de isolamento e filiais no HUG.",
      },
      { property: "og:title", content: "Empresas & Códigos — HUG Admin" },
      {
        property: "og:description",
        content: "Gerenciamento de empresas e códigos de acesso do HUG.",
      },
    ],
  }),
  component: CompaniesPage,
});

function CompaniesPage() {
  const [empresas, setEmpresas] = useState<HugEmpresa[]>(() => getEmpresas());
  const [busca, setBusca] = useState("");
  const [filtroSegmento, setFiltroSegmento] = useState<string>("todos");

  // Modal / Formulário de Cadastro de Empresa
  const [mostrarModal, setMostrarModal] = useState(false);
  const [nome, setNome] = useState("");
  const [codigo, setCodigo] = useState("");
  const [segmento, setSegmento] = useState<SegmentoEmpresa>("farmacia");
  const [documento, setDocumento] = useState("");
  const [email, setEmail] = useState("");
  const [telefone, setTelefone] = useState("");
  const [cidade, setCidade] = useState("Primavera do Leste");
  const [estado, setEstado] = useState("MT");
  const [plano, setPlano] = useState<"Starter" | "Business" | "Premium">("Business");

  function recarregar() {
    setEmpresas(getEmpresas());
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
      });

      toast.success(
        `Empresa "${nova.nome}" cadastrada com sucesso! Código gerado: ${nova.codigo}`
      );
      setNome("");
      setCodigo("");
      setDocumento("");
      setEmail("");
      setTelefone("");
      setMostrarModal(false);
      recarregar();
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

  function copiarCodigo(cod: string) {
    navigator.clipboard.writeText(cod);
    toast.success(`Código ${cod} copiado para a área de transferência!`);
  }

  const filtradas = useMemo(() => {
    return empresas.filter((emp) => {
      const matchBusca =
        emp.nome.toLowerCase().includes(busca.toLowerCase()) ||
        emp.codigo.includes(busca) ||
        (emp.documento ?? "").includes(busca);
      const matchSeg = filtroSegmento === "todos" || emp.segmento === filtroSegmento;
      return matchBusca && matchSeg;
    });
  }, [empresas, busca, filtroSegmento]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <PageHeader
          title="Empresas & Códigos de Acesso"
          description="Controle de empresas multissegmento. Cada empresa possui um código exclusivo que impede acesso indevido entre organizações."
        />
        <Button
          onClick={() => setMostrarModal(true)}
          className="bg-primary text-primary-foreground hover:bg-primary/90 gap-1.5 shrink-0"
        >
          <Plus className="size-4" /> Cadastrar Empresa
        </Button>
      </div>

      {/* MODAL / FORMULÁRIO DE CADASTRO */}
      {mostrarModal && (
        <Card className="border-primary/40 bg-card shadow-lg">
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
                  onClick={() => setMostrarModal(false)}
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
                    Usado no login dos funcionários para isolamento total.
                  </p>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground">
                    Segmento Comercial *
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
                    Plano HUG
                  </label>
                  <Select
                    value={plano}
                    onValueChange={(v) => setPlano(v as "Starter" | "Business" | "Premium")}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Starter">Starter (R$ 299,00)</SelectItem>
                      <SelectItem value="Business">Business (R$ 499,00)</SelectItem>
                      <SelectItem value="Premium">Premium (R$ 899,00)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground">
                    E-mail Corporativo
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
                    Telefone / WhatsApp
                  </label>
                  <Input
                    placeholder="(66) 3498-0000"
                    value={telefone}
                    onChange={(e) => setTelefone(e.target.value)}
                  />
                </div>

                <div className="space-y-1.5">
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
                      className="w-16"
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
                  onClick={() => setMostrarModal(false)}
                >
                  Cancelar
                </Button>
                <Button type="submit" className="bg-primary text-primary-foreground font-semibold">
                  Salvar e Ativar Empresa
                </Button>
              </div>
            </form>
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

        <div className="flex items-center gap-2">
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
              <TableHead>Documento</TableHead>
              <TableHead>Plano</TableHead>
              <TableHead>Usuários</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtradas.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                  Nenhuma empresa encontrada com os filtros aplicados.
                </TableCell>
              </TableRow>
            ) : (
              filtradas.map((emp) => {
                const appUrl = REPOSITORIOS_SEGMENTO[emp.segmento]?.liveApp;
                return (
                  <TableRow key={emp.id}>
                    <TableCell>
                      <button
                        onClick={() => copiarCodigo(emp.codigo)}
                        className="group flex items-center gap-1.5 font-mono text-xs font-bold text-primary hover:underline"
                        title="Clique para copiar o código"
                      >
                        <span className="rounded bg-primary/10 px-2 py-0.5 border border-primary/20">
                          {emp.codigo}
                        </span>
                        <Copy className="size-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </button>
                    </TableCell>
                    <TableCell>
                      <div className="font-semibold text-foreground">{emp.nome}</div>
                      <div className="text-[11px] text-muted-foreground">
                        {emp.cidade} - {emp.estado}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-[11px]">
                        {emp.segmentoLabel}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-mono text-xs text-muted-foreground">
                      {emp.documento}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="secondary"
                        className={
                          emp.plano === "Premium"
                            ? "bg-amber-500/10 text-amber-600 border border-amber-500/30"
                            : "bg-muted"
                        }
                      >
                        {emp.plano}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs font-medium">
                      {emp.usuariosAtivos} ativos
                    </TableCell>
                    <TableCell>
                      <span className="inline-flex items-center gap-1 text-xs text-emerald-600 font-medium">
                        <CheckCircle2 className="size-3.5" /> Ativo
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Link
                          to="/users"
                          search={{ empresa: emp.codigo }}
                          className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline px-2 py-1"
                          title="Convidar usuário para esta empresa"
                        >
                          <UserPlus className="size-3.5" /> Convidar
                        </Link>
                        {appUrl && (
                          <a
                            href={`${appUrl}/?empresa=${emp.codigo}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center p-1.5 text-muted-foreground hover:text-foreground"
                            title="Abrir painel desta empresa"
                          >
                            <ExternalLink className="size-3.5" />
                          </a>
                        )}
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleExcluir(emp.id, emp.nome)}
                          className="h-7 w-7 text-destructive hover:bg-destructive/10"
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
