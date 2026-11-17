import { useState, useMemo } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import {
  UserPlus,
  Trash2,
  Copy,
  CheckCircle2,
  Clock,
  Ban,
  Building2,
  Search,
  ExternalLink,
  Shield,
  KeyRound,
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
  getUsuariosConvites,
  convidarUsuario,
  atualizarStatusUsuario,
  removerUsuario,
  PAPEIS_LABELS,
  type HugUsuarioConvite,
  type PapelUsuario,
} from "@/lib/hug-tenants";

export const Route = createFileRoute("/_authenticated/users")({
  head: () => ({
    meta: [
      { title: "Usuários & Convites — HUG Admin" },
      {
        name: "description",
        content:
          "Convite de usuários e gestão de acessos por Código de Empresa no HUG.",
      },
      { property: "og:title", content: "Usuários & Convites — HUG Admin" },
      {
        property: "og:description",
        content:
          "Convite e controle de permissões por empresa e filial no HUG.",
      },
    ],
  }),
  component: UsersPage,
});

function UsersPage() {
  const empresas = useMemo(() => getEmpresas(), []);
  const [usuarios, setUsuarios] = useState<HugUsuarioConvite[]>(() =>
    getUsuariosConvites()
  );

  // Formulário de Convite
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [codigoEmpresa, setCodigoEmpresa] = useState<string>(
    empresas[0]?.codigo || "1056"
  );
  const [papel, setPapel] = useState<PapelUsuario>("funcionario");

  // Filtros
  const [busca, setBusca] = useState("");
  const [filtroEmpresa, setFiltroEmpresa] = useState<string>("todas");

  function recarregar() {
    setUsuarios(getUsuariosConvites());
  }

  function handleEnviarConvite(e: React.FormEvent) {
    e.preventDefault();
    if (!nome.trim() || !email.trim()) {
      toast.error("Informe o nome e e-mail do usuário para enviar o convite.");
      return;
    }

    try {
      const convite = convidarUsuario({
        nome,
        email,
        codigoEmpresa,
        papel,
      });

      toast.success(
        `Convite criado para ${convite.nome}! Chave: ${convite.chaveConvite}`
      );
      setNome("");
      setEmail("");
      recarregar();
    } catch (err: any) {
      toast.error(err.message || "Erro ao convidar usuário.");
    }
  }

  function copiarLink(link: string) {
    navigator.clipboard.writeText(link);
    toast.success("Link exclusivo de acesso copiado!");
  }

  function handleAlterarStatus(
    id: string,
    novoStatus: "ativo" | "pendente" | "bloqueado"
  ) {
    atualizarStatusUsuario(id, { status: novoStatus });
    toast.success(`Status do usuário atualizado para ${novoStatus}.`);
    recarregar();
  }

  function handleExcluir(id: string, nomeUsr: string) {
    if (confirm(`Revogar o acesso de "${nomeUsr}"?`)) {
      removerUsuario(id);
      toast.success("Acesso revogado.");
      recarregar();
    }
  }

  const filtrados = useMemo(() => {
    return usuarios.filter((u) => {
      const matchBusca =
        u.nome.toLowerCase().includes(busca.toLowerCase()) ||
        u.email.toLowerCase().includes(busca.toLowerCase()) ||
        u.codigoEmpresa.includes(busca) ||
        u.nomeEmpresa.toLowerCase().includes(busca.toLowerCase());
      const matchEmp =
        filtroEmpresa === "todas" || u.codigoEmpresa === filtroEmpresa;
      return matchBusca && matchEmp;
    });
  }, [usuarios, busca, filtroEmpresa]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Usuários & Convites por Empresa"
        description="Convide novos colaboradores e defina permissões. Todo usuário fica restrito exclusivamente ao Código da Empresa a que foi vinculado."
      />

      {/* FORMULÁRIO DE CONVITE PELO ADMIN */}
      <Card className="border-primary/30 bg-card shadow-sm">
        <CardContent className="pt-6">
          <form onSubmit={handleEnviarConvite} className="space-y-4">
            <div className="flex items-center gap-2 border-b pb-3">
              <UserPlus className="size-4 text-primary" />
              <h3 className="font-semibold text-sm">
                Convidar Novo Usuário para uma Empresa
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground">
                  Empresa de Destino *
                </label>
                <Select
                  value={codigoEmpresa}
                  onValueChange={setCodigoEmpresa}
                >
                  <SelectTrigger className="text-xs font-medium">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {empresas.map((emp) => (
                      <SelectItem key={emp.id} value={emp.codigo}>
                        [{emp.codigo}] {emp.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground">
                  Nome Completo *
                </label>
                <Input
                  required
                  placeholder="Ex: Carlos Eduardo"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  className="h-9 text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground">
                  E-mail do Usuário *
                </label>
                <Input
                  required
                  type="email"
                  placeholder="usuario@empresa.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-9 text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground">
                  Nível de Acesso *
                </label>
                <Select
                  value={papel}
                  onValueChange={(v) => setPapel(v as PapelUsuario)}
                >
                  <SelectTrigger className="text-xs font-medium">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(PAPEIS_LABELS).map(([k, label]) => (
                      <SelectItem key={k} value={k}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <Button
                type="submit"
                className="bg-primary text-primary-foreground font-semibold gap-1.5 text-xs"
              >
                <UserPlus className="size-3.5" /> Enviar Convite & Gerar Acesso
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* FILTROS E BUSCA */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nome, e-mail, código ou empresa..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            className="pl-9 text-xs"
          />
        </div>

        <div className="flex items-center gap-2">
          <Select value={filtroEmpresa} onValueChange={setFiltroEmpresa}>
            <SelectTrigger className="w-64 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todas">Todas as Empresas</SelectItem>
              {empresas.map((emp) => (
                <SelectItem key={emp.id} value={emp.codigo}>
                  [{emp.codigo}] {emp.nome}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* TABELA DE USUÁRIOS E CONVITES */}
      <div className="rounded-xl border border-border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Usuário</TableHead>
              <TableHead>Empresa Vinculada</TableHead>
              <TableHead>Papel</TableHead>
              <TableHead>Chave / Link de Acesso</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtrados.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="text-center py-8 text-muted-foreground"
                >
                  Nenhum usuário ou convite encontrado.
                </TableCell>
              </TableRow>
            ) : (
              filtrados.map((u) => (
                <TableRow key={u.id}>
                  <TableCell>
                    <div className="font-semibold text-foreground text-xs">
                      {u.nome}
                    </div>
                    <div className="text-[11px] text-muted-foreground font-mono">
                      {u.email}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono text-xs font-bold text-primary px-1.5 py-0.5 rounded bg-primary/10 border border-primary/20">
                        {u.codigoEmpresa}
                      </span>
                      <span className="text-xs font-medium text-foreground">
                        {u.nomeEmpresa}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-[11px]">
                      {u.papelLabel}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono text-[11px] text-muted-foreground bg-muted px-2 py-0.5 rounded border">
                        {u.chaveConvite}
                      </span>
                      <button
                        onClick={() => copiarLink(u.linkAcesso)}
                        className="text-primary hover:text-primary/80"
                        title="Copiar link de acesso"
                      >
                        <Copy className="size-3.5" />
                      </button>
                    </div>
                  </TableCell>
                  <TableCell>
                    {u.status === "ativo" ? (
                      <span className="inline-flex items-center gap-1 text-xs text-emerald-600 font-medium">
                        <CheckCircle2 className="size-3.5" /> Ativo
                      </span>
                    ) : u.status === "pendente" ? (
                      <span className="inline-flex items-center gap-1 text-xs text-amber-600 font-medium">
                        <Clock className="size-3.5" /> Convite Pendente
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-xs text-rose-600 font-medium">
                        <Ban className="size-3.5" /> Bloqueado
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      {u.status === "bloqueado" ? (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleAlterarStatus(u.id, "ativo")}
                          className="h-7 text-xs text-emerald-600 hover:bg-emerald-50"
                        >
                          Ativar
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() =>
                            handleAlterarStatus(
                              u.id,
                              u.status === "ativo" ? "bloqueado" : "ativo"
                            )
                          }
                          className="h-7 text-xs text-muted-foreground hover:bg-muted"
                        >
                          {u.status === "ativo" ? "Bloquear" : "Ativar"}
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleExcluir(u.id, u.nome)}
                        className="h-7 w-7 text-destructive hover:bg-destructive/10"
                      >
                        <Trash2 className="size-3.5" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
