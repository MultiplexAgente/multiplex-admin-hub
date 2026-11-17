import { createFileRoute, redirect } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Acesso ao painel — HUG Admin" },
      { name: "description", content: "Acesse sua área administrativa central do HUG." },
      { property: "og:title", content: "Acesso ao painel — HUG Admin" },
      { property: "og:description", content: "Acesse sua área administrativa central do HUG." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  ssr: false,
  beforeLoad: async () => {
    const { data } = await supabase.auth.getSession();
    throw redirect({ to: data.session ? "/dashboard" : "/auth" });
  },
  component: () => null,
});
