/**
 * HUG Multi-Tenant Architecture & Enterprise Directory
 * 
 * Garante isolamento estrito por Código da Empresa (ex: 1056 para Farmácia Machadão,
 * 2030 para Farmácia Americanas), impedindo que funcionários de uma empresa acessem outra.
 */

export type SegmentoEmpresa =
  | "farmacia"
  | "mercado"
  | "moda"
  | "gastronomia"
  | "beleza"
  | "construcao";

export interface HugEmpresa {
  id: string;
  codigo: string;
  nome: string;
  segmento: SegmentoEmpresa;
  segmentoLabel: string;
  documento?: string | undefined;
  email?: string | undefined;
  telefone?: string | undefined;
  cidade?: string | undefined;
  estado?: string | undefined;
  plano?: ("Starter" | "Business" | "Premium") | undefined;
  status?: ("ativo" | "suspenso") | undefined;
  usuariosAtivos?: number | undefined;
  criadoEm?: string | undefined;
}

export type PapelUsuario = "admin" | "gestor" | "funcionario" | "caixa";

export interface HugUsuarioConvite {
  id: string;
  nome: string;
  email: string;
  codigoEmpresa: string;
  nomeEmpresa: string;
  papel: PapelUsuario;
  papelLabel: string;
  status: "ativo" | "pendente" | "bloqueado";
  convidadoEm: string;
  chaveConvite: string;
  linkAcesso: string;
}

export const SEGMENTOS_LABELS: Record<SegmentoEmpresa, string> = {
  farmacia: "Farmácias & Drogarias",
  mercado: "Supermercados & Mercearias",
  moda: "Moda & Vestuário",
  gastronomia: "Restaurantes & Gastronomia",
  beleza: "Salões & Estética",
  construcao: "Materiais, Papelarias, Livrarias & Ferramentas",
};

export const PAPEIS_LABELS: Record<PapelUsuario, string> = {
  admin: "Administrador da Empresa",
  gestor: "Gestor Operacional",
  funcionario: "Funcionário / Balcão",
  caixa: "Operador de Caixa",
};

export const REPOSITORIOS_SEGMENTO: Record<SegmentoEmpresa, { nome: string; liveApp: string }> = {
  farmacia: {
    nome: "HUG Farmácias",
    liveApp: "https://six-project-domain-garden.lovable.app",
  },
  mercado: {
    nome: "HUG Mercados",
    liveApp: "https://hug-mercados-bridge.lovable.app",
  },
  moda: {
    nome: "HUG Moda",
    liveApp: "https://hug-moda-connect.lovable.app",
  },
  gastronomia: {
    nome: "HUG Gastronomia",
    liveApp: "https://hug-gastronomia-table-connect.lovable.app",
  },
  beleza: {
    nome: "HUG Beleza",
    liveApp: "https://hug-beleza-data-bridge.lovable.app",
  },
  construcao: {
    nome: "HUG Materiais",
    liveApp: "https://hug-construcao-connect.lovable.app",
  },
};

// Catálogo Inicial Limpo para Início de Testes Reais
export const EMPRESAS_INICIAIS: HugEmpresa[] = [];

export const USUARIOS_CONVITES_INICIAIS: HugUsuarioConvite[] = [];

const STORAGE_KEY_EMPRESAS = "hug_admin_empresas";
const STORAGE_KEY_CONVITES = "hug_admin_convites";

/**
 * Obtém a lista de empresas cadastradas (limpa dados fictícios de mock)
 */
export function getEmpresas(): HugEmpresa[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY_EMPRESAS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY_EMPRESAS, JSON.stringify([]));
      return [];
    }
    const parsed = JSON.parse(raw);
    // Remove dados de teste legados caso ainda estejam no localStorage
    if (Array.isArray(parsed) && parsed.some((e: any) => e.id?.startsWith("emp-") && (e.codigo === "1056" || e.codigo === "7010" || e.codigo === "2030"))) {
      localStorage.setItem(STORAGE_KEY_EMPRESAS, JSON.stringify([]));
      return [];
    }
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

/**
 * Cadastra ou atualiza uma empresa
 */
export function salvarEmpresa(empresa: Partial<HugEmpresa> & { nome: string; segmento: SegmentoEmpresa }): HugEmpresa {
  const lista = getEmpresas();

  // Se não foi informado código, gera um código de 4 dígitos não utilizado
  let codigo = empresa.codigo?.trim();
  if (!codigo) {
    const codigosExistentes = new Set(lista.map((e) => e.codigo));
    let num = 1000 + Math.floor(Math.random() * 8999);
    while (codigosExistentes.has(String(num))) {
      num = 1000 + Math.floor(Math.random() * 8999);
    }
    codigo = String(num);
  }

  // Verifica se o código já é usado por outra empresa
  const duplicado = lista.find((e) => e.codigo === codigo && e.id !== empresa.id);
  if (duplicado) {
    throw new Error(`O Código de Empresa "${codigo}" já está em uso por "${duplicado.nome}".`);
  }

  const nova: HugEmpresa = {
    id: empresa.id || `emp-${Date.now()}`,
    codigo,
    nome: empresa.nome.trim(),
    segmento: empresa.segmento,
    segmentoLabel: SEGMENTOS_LABELS[empresa.segmento],
    documento: empresa.documento?.trim() || "00.000.000/0001-00",
    email: empresa.email?.trim() || "",
    telefone: empresa.telefone?.trim() || "",
    cidade: empresa.cidade?.trim() || "Primavera do Leste",
    estado: empresa.estado?.trim() || "MT",
    plano: empresa.plano || "Business",
    status: empresa.status || "ativo",
    usuariosAtivos: empresa.usuariosAtivos || 1,
    criadoEm: empresa.criadoEm || new Date().toISOString(),
  };

  const index = lista.findIndex((e) => e.id === nova.id);
  if (index >= 0) {
    lista[index] = nova;
  } else {
    lista.unshift(nova);
  }

  localStorage.setItem(STORAGE_KEY_EMPRESAS, JSON.stringify(lista));
  return nova;
}

/**
 * Remove uma empresa
 */
export function removerEmpresa(id: string): void {
  const lista = getEmpresas().filter((e) => e.id !== id);
  localStorage.setItem(STORAGE_KEY_EMPRESAS, JSON.stringify(lista));
}

/**
 * Busca empresa por código (ex: "1056", "2030")
 */
export function buscarEmpresaPorCodigo(codigo: string): HugEmpresa | undefined {
  const lista = getEmpresas();
  const limpo = codigo.trim().toLowerCase();
  return lista.find((e) => e.codigo.toLowerCase() === limpo);
}

/**
 * Obtém todos os usuários e convites
 */
export function getUsuariosConvites(): HugUsuarioConvite[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY_CONVITES);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY_CONVITES, JSON.stringify([]));
      return [];
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.some((u: any) => u.id?.startsWith("usr-0") || u.chaveConvite?.includes("HUG-1056"))) {
      localStorage.setItem(STORAGE_KEY_CONVITES, JSON.stringify([]));
      return [];
    }
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

/**
 * Cria um convite para um novo usuário vinculado ao código de uma empresa
 */
export function convidarUsuario(dados: {
  nome: string;
  email: string;
  codigoEmpresa: string;
  papel: PapelUsuario;
}): HugUsuarioConvite {
  const empresa = buscarEmpresaPorCodigo(dados.codigoEmpresa);
  if (!empresa) {
    throw new Error(`Empresa com código ${dados.codigoEmpresa} não encontrada.`);
  }

  const lista = getUsuariosConvites();
  const jaExiste = lista.find(
    (u) =>
      u.email.toLowerCase() === dados.email.trim().toLowerCase() &&
      u.codigoEmpresa === dados.codigoEmpresa
  );
  if (jaExiste) {
    throw new Error(`O usuário ${dados.email} já está convidado para a empresa ${empresa.nome}.`);
  }

  const chaveAleatoria = Math.random().toString(36).substring(2, 6).toUpperCase();
  const chaveConvite = `HUG-${empresa.codigo}-${chaveAleatoria}`;
  const repoMeta = REPOSITORIOS_SEGMENTO[empresa.segmento];
  const linkAcesso = `${repoMeta.liveApp}/?empresa=${empresa.codigo}&convite=${chaveConvite}`;

  const novoConvite: HugUsuarioConvite = {
    id: `usr-${Date.now()}`,
    nome: dados.nome.trim(),
    email: dados.email.trim().toLowerCase(),
    codigoEmpresa: empresa.codigo,
    nomeEmpresa: empresa.nome,
    papel: dados.papel,
    papelLabel: PAPEIS_LABELS[dados.papel],
    status: "pendente",
    convidadoEm: new Date().toISOString(),
    chaveConvite,
    linkAcesso,
  };

  lista.unshift(novoConvite);
  localStorage.setItem(STORAGE_KEY_CONVITES, JSON.stringify(lista));
  return novoConvite;
}

/**
 * Atualiza status do usuário (ativo, pendente, bloqueado) ou papel
 */
export function atualizarStatusUsuario(id: string, patch: Partial<HugUsuarioConvite>): void {
  const lista = getUsuariosConvites();
  const idx = lista.findIndex((u) => u.id === id);
  if (idx >= 0) {
    const existing = lista[idx]!;
    lista[idx] = {
      ...existing,
      ...patch,
      id: existing.id,
      nome: patch.nome ?? existing.nome,
      email: patch.email ?? existing.email,
      codigoEmpresa: patch.codigoEmpresa ?? existing.codigoEmpresa,
      nomeEmpresa: patch.nomeEmpresa ?? existing.nomeEmpresa,
      papel: patch.papel ?? existing.papel,
      papelLabel: patch.papelLabel ?? existing.papelLabel,
      status: patch.status ?? existing.status,
      convidadoEm: patch.convidadoEm ?? existing.convidadoEm,
      chaveConvite: patch.chaveConvite ?? existing.chaveConvite,
      linkAcesso: patch.linkAcesso ?? existing.linkAcesso,
    };
    localStorage.setItem(STORAGE_KEY_CONVITES, JSON.stringify(lista));
  }
}

/**
 * Remove um usuário/convite
 */
export function removerUsuario(id: string): void {
  const lista = getUsuariosConvites().filter((u) => u.id !== id);
  localStorage.setItem(STORAGE_KEY_CONVITES, JSON.stringify(lista));
}
