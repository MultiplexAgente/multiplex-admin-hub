import { createClient } from "@supabase/supabase-js";

// Projeto Supabase externo (IA Multiplex) — chave publicável, segura no código.
export const SUPABASE_URL = "https://mbjqzjipiuwtgmoxsqfu.supabase.co";
export const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_duQTjrfk1tUtgKer2tMy2g_Xvymgq1x";

export const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});
