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
  construcao: "Materiais de Construção & Ferramentas",
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
    nome: "HUG Construção",
    liveApp: "https://hug-construcao-connect.lovable.app",
  },
};

// Catálogo Inicial Oficial com os Códigos Reais Solicitados
export const EMPRESAS_INICIAIS: HugEmpresa[] = [
  {
    id: "emp-1056",
    codigo: "1056",
    nome: "Farmácia Machadão",
    segmento: "farmacia",
    segmentoLabel: "Farmácias & Drogarias",
    documento: "14.288.991/0001-05",
    email: "contato@farmaciamachadao.com.br",
    telefone: "(66) 3498-1056",
    cidade: "Primavera do Leste",
    estado: "MT",
    plano: "Business",
    status: "ativo",
    usuariosAtivos: 6,
    criadoEm: "2026-01-10T10:00:00.000Z",
  },
  {
    id: "emp-2030",
    codigo: "2030",
    nome: "Farmácia Americanas",
    segmento: "farmacia",
    segmentoLabel: "Farmácias & Drogarias",
    documento: "22.145.882/0001-33",
    email: "gestao@farmaciaamericanas.com.br",
    telefone: "(66) 3498-2030",
    cidade: "Cuiabá",
    estado: "MT",
    plano: "Premium",
    status: "ativo",
    usuariosAtivos: 12,
    criadoEm: "2026-02-14T11:30:00.000Z",
  },
  {
    id: "emp-3010",
    codigo: "3010",
    nome: "Supermercado Compre Bem",
    segmento: "mercado",
    segmentoLabel: "Supermercados & Mercearias",
    documento: "33.882.110/0001-92",
    email: "financeiro@comprebem.com.br",
    telefone: "(66) 3512-3010",
    cidade: "Rondonópolis",
    estado: "MT",
    plano: "Premium",
    status: "ativo",
    usuariosAtivos: 18,
    criadoEm: "2026-02-20T08:00:00.000Z",
  },
  {
    id: "emp-3020",
    codigo: "3020",
    nome: "Hipermercado Alvorada",
    segmento: "mercado",
    segmentoLabel: "Supermercados & Mercearias",
    documento: "41.902.331/0001-44",
    email: "operacao@alvorada.com.br",
    telefone: "(66) 3512-3020",
    cidade: "Sinop",
    estado: "MT",
    plano: "Business",
    status: "ativo",
    usuariosAtivos: 10,
    criadoEm: "2026-03-01T09:15:00.000Z",
  },
  {
    id: "emp-4010",
    codigo: "4010",
    nome: "Moda Elegance Boutique",
    segmento: "moda",
    segmentoLabel: "Moda & Vestuário",
    documento: "19.330.129/0001-88",
    email: "loja@modaelegance.com.br",
    telefone: "(66) 3498-4010",
    cidade: "Primavera do Leste",
    estado: "MT",
    plano: "Business",
    status: "ativo",
    usuariosAtivos: 5,
    criadoEm: "2026-03-15T14:00:00.000Z",
  },
  {
    id: "emp-4020",
    codigo: "4020",
    nome: "Confecções & Estilo Sul",
    segmento: "moda",
    segmentoLabel: "Moda & Vestuário",
    documento: "28.119.554/0001-71",
    email: "contato@estilosul.com.br",
    telefone: "(66) 3498-4020",
    cidade: "Campo Verde",
    estado: "MT",
    plano: "Starter",
    status: "ativo",
    usuariosAtivos: 3,
    criadoEm: "2026-03-22T16:20:00.000Z",
  },
  {
    id: "emp-5010",
    codigo: "5010",
    nome: "Restaurante Sabor & Brasa",
    segmento: "gastronomia",
    segmentoLabel: "Restaurantes & Gastronomia",
    documento: "31.772.441/0001-20",
    email: "adm@saborebrasa.com.br",
    telefone: "(66) 3498-5010",
    cidade: "Primavera do Leste",
    estado: "MT",
    plano: "Business",
    status: "ativo",
    usuariosAtivos: 8,
    criadoEm: "2026-04-05T12:00:00.000Z",
  },
  {
    id: "emp-5020",
    codigo: "5020",
    nome: "Bistrô da Praça Gourmet",
    segmento: "gastronomia",
    segmentoLabel: "Restaurantes & Gastronomia",
    documento: "38.220.998/0001-63",
    email: "chef@bistrodapraca.com.br",
    telefone: "(66) 3498-5020",
    cidade: "Cuiabá",
    estado: "MT",
    plano: "Starter",
    status: "ativo",
    usuariosAtivos: 4,
    criadoEm: "2026-04-18T17:45:00.000Z",
  },
  {
    id: "emp-6010",
    codigo: "6010",
    nome: "Espaço Beleza VIP",
    segmento: "beleza",
    segmentoLabel: "Salões & Estética",
    documento: "29.441.332/0001-57",
    email: "agenda@belezavip.com.br",
    telefone: "(66) 3498-6010",
    cidade: "Primavera do Leste",
    estado: "MT",
    plano: "Business",
    status: "ativo",
    usuariosAtivos: 7,
    criadoEm: "2026-05-02T10:30:00.000Z",
  },
  {
    id: "emp-6020",
    codigo: "6020",
    nome: "Salão & Barbearia Imperial",
    segmento: "beleza",
    segmentoLabel: "Salões & Estética",
    documento: "36.881.009/0001-14",
    email: "contato@barbeariaimperial.com.br",
    telefone: "(66) 3498-6020",
    cidade: "Rondonópolis",
    estado: "MT",
    plano: "Starter",
    status: "ativo",
    usuariosAtivos: 4,
    criadoEm: "2026-05-19T13:10:00.000Z",
  },
  {
    id: "emp-7010",
    codigo: "7010",
    nome: "ConstruMais Materiais & Ferramentas",
    segmento: "construcao",
    segmentoLabel: "Materiais de Construção & Ferramentas",
    documento: "18.552.771/0001-99",
    email: "vendas@construmais.com.br",
    telefone: "(66) 3498-7010",
    cidade: "Primavera do Leste",
    estado: "MT",
    plano: "Premium",
    status: "ativo",
    usuariosAtivos: 14,
    criadoEm: "2026-06-01T07:30:00.000Z",
  },
  {
    id: "emp-7020",
    codigo: "7020",
    nome: "Depósito Fortaleza Materiais",
    segmento: "construcao",
    segmentoLabel: "Materiais de Construção & Ferramentas",
    documento: "25.990.412/0001-38",
    email: "atendimento@fortalezamateriais.com.br",
    telefone: "(66) 3498-7020",
    cidade: "Campo Verde",
    estado: "MT",
    plano: "Business",
    status: "ativo",
    usuariosAtivos: 8,
    criadoEm: "2026-06-15T08:40:00.000Z",
  },
];

export const USUARIOS_CONVITES_INICIAIS: HugUsuarioConvite[] = [
  {
    id: "usr-01",
    nome: "Carlos Eduardo Silva",
    email: "carlos.balcao@farmaciamachadao.com.br",
    codigoEmpresa: "1056",
    nomeEmpresa: "Farmácia Machadão",
    papel: "funcionario",
    papelLabel: "Funcionário / Balcão",
    status: "ativo",
    convidadoEm: "2026-01-12T14:20:00.000Z",
    chaveConvite: "HUG-1056-A82F",
    linkAcesso: "https://six-project-domain-garden.lovable.app/?empresa=1056",
  },
  {
    id: "usr-02",
    nome: "Dra. Juliana Prado (Farmacêutica RT)",
    email: "juliana.rt@farmaciamachadao.com.br",
    codigoEmpresa: "1056",
    nomeEmpresa: "Farmácia Machadão",
    papel: "gestor",
    papelLabel: "Gestor Operacional",
    status: "ativo",
    convidadoEm: "2026-01-11T09:00:00.000Z",
    chaveConvite: "HUG-1056-B11C",
    linkAcesso: "https://six-project-domain-garden.lovable.app/?empresa=1056",
  },
  {
    id: "usr-03",
    nome: "Roberto Mendes",
    email: "roberto@farmaciaamericanas.com.br",
    codigoEmpresa: "2030",
    nomeEmpresa: "Farmácia Americanas",
    papel: "admin",
    papelLabel: "Administrador da Empresa",
    status: "ativo",
    convidadoEm: "2026-02-15T10:15:00.000Z",
    chaveConvite: "HUG-2030-C90X",
    linkAcesso: "https://six-project-domain-garden.lovable.app/?empresa=2030",
  },
  {
    id: "usr-04",
    nome: "Fernanda Souza",
    email: "fernanda.caixa@comprebem.com.br",
    codigoEmpresa: "3010",
    nomeEmpresa: "Supermercado Compre Bem",
    papel: "caixa",
    papelLabel: "Operador de Caixa",
    status: "ativo",
    convidadoEm: "2026-02-22T08:30:00.000Z",
    chaveConvite: "HUG-3010-F44D",
    linkAcesso: "https://hug-mercados-bridge.lovable.app/?empresa=3010",
  },
  {
    id: "usr-05",
    nome: "Marcos Vinicius Vendas",
    email: "marcos@construmais.com.br",
    codigoEmpresa: "7010",
    nomeEmpresa: "ConstruMais Materiais & Ferramentas",
    papel: "funcionario",
    papelLabel: "Funcionário / Balcão",
    status: "ativo",
    convidadoEm: "2026-06-03T11:00:00.000Z",
    chaveConvite: "HUG-7010-Z77Q",
    linkAcesso: "https://hug-construcao-connect.lovable.app/?empresa=7010",
  },
];

const STORAGE_KEY_EMPRESAS = "hug_admin_empresas";
const STORAGE_KEY_CONVITES = "hug_admin_convites";

/**
 * Obtém a lista de empresas cadastradas
 */
export function getEmpresas(): HugEmpresa[] {
  if (typeof window === "undefined") return EMPRESAS_INICIAIS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY_EMPRESAS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY_EMPRESAS, JSON.stringify(EMPRESAS_INICIAIS));
      return EMPRESAS_INICIAIS;
    }
    return JSON.parse(raw);
  } catch {
    return EMPRESAS_INICIAIS;
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
  if (typeof window === "undefined") return USUARIOS_CONVITES_INICIAIS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY_CONVITES);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY_CONVITES, JSON.stringify(USUARIOS_CONVITES_INICIAIS));
      return USUARIOS_CONVITES_INICIAIS;
    }
    return JSON.parse(raw);
  } catch {
    return USUARIOS_CONVITES_INICIAIS;
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
