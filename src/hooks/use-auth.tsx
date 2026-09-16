import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { fetchCompany, fetchMyAccess, type Company, type CompanyUser } from "@/lib/db";

type AuthValue = {
  session: Session | null;
  user: User | null;
  loading: boolean;
  access: CompanyUser | null;
  company: Company | null;
  companyId: string | null;
  role: string | null;
  isAdmin: boolean;
};

const AuthContext = createContext<AuthValue>({
  session: null,
  user: null,
  loading: true,
  access: null,
  company: null,
  companyId: null,
  role: null,
  isAdmin: false,
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((_event, next) => {
      setSession(next);
      setLoading(false);
    });
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  const userId = session?.user?.id ?? null;

  const { data: access } = useQuery({
    queryKey: ["access", userId],
    queryFn: () => fetchMyAccess(userId as string),
    enabled: Boolean(userId),
  });

  const companyId = access?.company_id ?? null;

  const { data: company } = useQuery({
    queryKey: ["company", companyId],
    queryFn: () => fetchCompany(companyId as string),
    enabled: Boolean(companyId),
  });

  const value = useMemo<AuthValue>(
    () => ({
      session,
      user: session?.user ?? null,
      loading,
      access: access ?? null,
      company: company ?? null,
      companyId,
      role: access?.role ?? null,
      isAdmin: (access?.role ?? "").toLowerCase().includes("admin"),
    }),
    [session, loading, access, company, companyId],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
