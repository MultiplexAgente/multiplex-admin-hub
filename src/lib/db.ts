import { supabase } from "@/integrations/supabase/client";
import type { Database, Json } from "@/integrations/supabase/types";

export type Agent = {
  id: string;
  name: string;
  description: string | null;
  active: boolean | null;
  model: string | null;
  system_prompt: string | null;
  temperature: number | null;
  company_id: string | null;
  created_at: string | null;
  updated_at: string | null;
};

export type Customer = {
  id: string;
  name: string | null;
  phone: string | null;
  email: string | null;
  avatar_url: string | null;
  notes: string | null;
  company_id: string | null;
  created_at: string | null;
};

export type Conversation = {
  id: string;
  status: string | null;
  channel_type: string | null;
  agent_id: string | null;
  customer_id: string | null;
  company_id: string | null;
  tags: string[] | null;
  metadata: Json;
  last_message_at: string | null;
  created_at: string | null;
  updated_at: string | null;
};

export type Message = {
  id: string;
  conversation_id: string | null;
  text: string | null;
  sender_type: string | null;
  media_url: string | null;
  media_type: string | null;
  status: string | null;
  created_at: string | null;
};

export type Channel = {
  id: string;
  name: string | null;
  type: string | null;
  status: string | null;
  active: boolean | null;
  company_id: string | null;
  created_at: string | null;
};

export type CompanyUser = Database["public"]["Tables"]["company_users"]["Row"];

export type Company = {
  id: string;
  name: string | null;
  active: boolean | null;
  phone: string | null;
  email: string | null;
};

const AGENT_COLS = "id,name,description,active,model,system_prompt,temperature,company_id,created_at,updated_at";
const CONV_COLS =
  "id,status,channel_type,agent_id,customer_id,company_id,tags,metadata,last_message_at,created_at,updated_at";
const MSG_COLS = "id,conversation_id,text,sender_type,media_url,media_type,status,created_at";

function unwrap<T>(res: { data: T | null; error: { message: string } | null }): T {
  if (res.error) throw new Error(res.error.message);
  return (res.data ?? []) as T;
}

export async function fetchMyAccess(userId: string) {
  const res = await supabase
    .from("company_users")
    .select("id,user_id,company_id,role,active,email,created_at")
    .eq("user_id", userId)
    .limit(1)
    .maybeSingle();
  if (res.error) return null;
  return (res.data as CompanyUser | null) ?? null;
}

export async function fetchCompany(companyId: string) {
  const res = await supabase
    .from("companies")
    .select("id,name,active,phone,email")
    .eq("id", companyId)
    .maybeSingle();
  if (res.error) return null;
  return (res.data as Company | null) ?? null;
}

export async function fetchAgents(companyId?: string | null) {
  let q = supabase.from("agents").select(AGENT_COLS).order("created_at", { ascending: false });
  if (companyId) q = q.eq("company_id", companyId);
  return unwrap<Agent[]>(await q);
}

export async function fetchAgent(id: string) {
  const res = await supabase.from("agents").select(AGENT_COLS).eq("id", id).maybeSingle();
  if (res.error) throw new Error(res.error.message);
  return res.data as Agent | null;
}

export async function saveAgent(agent: Partial<Agent> & { id?: string }, companyId?: string | null) {
  const payload: Database["public"]["Tables"]["agents"]["Update"] = {
    ...(agent.name !== undefined ? { name: agent.name } : {}),
    ...(agent.description !== undefined ? { description: agent.description } : {}),
    ...(agent.active !== undefined ? { active: agent.active } : {}),
    ...(agent.model !== undefined ? { model: agent.model } : {}),
    ...(agent.system_prompt !== undefined ? { system_prompt: agent.system_prompt } : {}),
    ...(agent.temperature !== undefined ? { temperature: agent.temperature } : {}),
  };
  let res;
  if (agent.id) {
    res = await supabase.from("agents").update(payload).eq("id", agent.id).select(AGENT_COLS).maybeSingle();
  } else {
    if (!companyId) throw new Error("Selecione uma empresa antes de criar um agente.");
    if (!agent.name?.trim()) throw new Error("Informe o nome do agente.");
    res = await supabase.from("agents").insert({ ...payload, name: agent.name, company_id: companyId }).select(AGENT_COLS).maybeSingle();
  }
  if (res.error) throw new Error(res.error.message);
  return res.data as Agent;
}

export async function deleteAgent(id: string) {
  const res = await supabase.from("agents").delete().eq("id", id);
  if (res.error) throw new Error(res.error.message);
}

export async function fetchChannels(companyId?: string | null) {
  let q = supabase
    .from("channels")
    .select("id,name,type,status,active,company_id,created_at")
    .order("created_at", { ascending: false });
  if (companyId) q = q.eq("company_id", companyId);
  return unwrap<Channel[]>(await q);
}

export async function fetchCustomers(companyId?: string | null) {
  let q = supabase
    .from("customers")
    .select("id,name,phone,email,avatar_url,notes,company_id,created_at")
    .limit(1000);
  if (companyId) q = q.eq("company_id", companyId);
  return unwrap<Customer[]>(await q);
}

export type ConversationFilters = {
  channel?: string;
  status?: string;
  agentId?: string;
  since?: string;
};

export async function fetchConversations(companyId?: string | null, filters: ConversationFilters = {}) {
  let q = supabase
    .from("conversations")
    .select(CONV_COLS)
    .order("last_message_at", { ascending: false, nullsFirst: false })
    .limit(500);
  if (companyId) q = q.eq("company_id", companyId);
  if (filters.channel && filters.channel !== "todos") q = q.eq("channel_type", filters.channel);
  if (filters.status && filters.status !== "todos") q = q.eq("status", filters.status);
  if (filters.agentId && filters.agentId !== "todos") q = q.eq("agent_id", filters.agentId);
  if (filters.since) q = q.gte("created_at", filters.since);
  return unwrap<Conversation[]>(await q);
}

export async function fetchConversation(id: string) {
  const res = await supabase.from("conversations").select(CONV_COLS).eq("id", id).maybeSingle();
  if (res.error) throw new Error(res.error.message);
  return res.data as Conversation | null;
}

export async function fetchMessages(conversationId: string) {
  const res = await supabase
    .from("messages")
    .select(MSG_COLS)
    .eq("conversation_id", conversationId)
    .order("created_at", { ascending: true })
    .limit(1000);
  if (res.error) throw new Error(res.error.message);
  return (res.data ?? []) as Message[];
}

export async function fetchTeam(companyId?: string | null) {
  let q = supabase
    .from("company_users")
    .select("id,user_id,company_id,role,active,email,created_at")
    .order("created_at", { ascending: false });
  if (companyId) q = q.eq("company_id", companyId);
  return unwrap<CompanyUser[]>(await q);
}

export async function updateTeamMember(id: string, patch: Database["public"]["Tables"]["company_users"]["Update"]) {
  const res = await supabase.from("company_users").update(patch).eq("id", id);
  if (res.error) throw new Error(res.error.message);
}

export async function removeTeamMember(id: string) {
  const res = await supabase.from("company_users").delete().eq("id", id);
  if (res.error) throw new Error(res.error.message);
}

export async function inviteTeamMember(email: string, role: string, companyId?: string | null) {
  if (!companyId) throw new Error("Selecione uma empresa antes de convidar um usuário.");
  const res = await supabase.from("company_users").insert({ email, role, active: true, company_id: companyId });
  if (res.error) throw new Error(res.error.message);
}

export const CHANNEL_LABEL: Record<string, string> = {
  whatsapp: "WhatsApp",
  instagram: "Instagram",
};

export function channelLabel(value?: string | null) {
  if (!value) return "Outro";
  return CHANNEL_LABEL[value.toLowerCase()] ?? value;
}

export function formatDateTime(value?: string | null) {
  if (!value) return "—";
  return new Date(value).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" });
}

export function formatDate(value?: string | null) {
  if (!value) return "—";
  return new Date(value).toLocaleDateString("pt-BR");
}
