# Painel administrativo — IA Multiplex

Painel interno conectado exclusivamente ao Supabase existente (projeto `mbjqzjipiuwtgmoxsqfu`). Sem Lovable Cloud.

## Acesso

- Tela de login com e-mail e senha (usuários criados por você no Supabase).
- Todo o painel fica atrás do login; ao sair, o usuário volta para a tela de entrada.
- Página de recuperação de senha por e-mail.

## Telas

1. **Visão geral** — cartões com atendimentos do dia, conversas ativas, tempo médio de resposta e taxa de resolução; gráfico de volume por dia e divisão WhatsApp × Instagram.
2. **Agentes de IA** — lista de agentes com status (ativo/inativo), canal, modelo e instruções. Criar, editar, duplicar, ativar/desativar e excluir.
3. **Atendimentos** — lista de conversas com filtros por canal (WhatsApp/Instagram), status, agente, período e busca por contato. Ao abrir, mostra a transcrição completa da conversa, dados do contato e etiquetas.
4. **Métricas** — desempenho por agente e por canal, mensagens por período, tempo de resposta, conversas encerradas por IA × transferidas para humano; filtro de intervalo de datas e exportação em CSV.
5. **Configurações** — dados da conta, preferências gerais do painel e parâmetros padrão dos agentes.
6. **Usuários** — lista de quem tem acesso ao painel, com papéis (administrador / operador / somente leitura), convite e remoção. Papéis ficam em tabela própria, nunca no perfil, para evitar escalonamento de privilégios.

## Visual

Tema escuro por padrão, layout com barra lateral fixa, tipografia e cores próprias (nada de gradiente roxo genérico), tabelas densas e legíveis, estados de carregamento e vazio em todas as listas.

## Detalhes técnicos

- Cliente Supabase em `src/integrations/supabase/client.ts` usando a URL `https://mbjqzjipiuwtgmoxsqfu.supabase.co` e a chave publicável `sb_publishable_duQTjrfk1tUtgKer2tMy2g_Xvymgq1x` (chave pública, pode ficar no código). Sessão persistida no navegador.
- Rotas TanStack: `/auth`, `/reset-password` públicas; `_authenticated/` com `dashboard`, `agents`, `agents/$id`, `conversations`, `conversations/$id`, `metrics`, `settings`, `users`.
- Leitura de dados via TanStack Query nos componentes (não em loaders públicos), respeitando RLS como usuário autenticado.
- Primeiro passo da implementação: inspecionar o schema atual do projeto Supabase (tabelas de agentes, conversas, mensagens, perfis, papéis) e mapear os campos existentes. O que faltar é entregue como um arquivo SQL em `supabase/migrations/` para você aplicar no painel do Supabase — incluindo RLS, GRANTs e a função `has_role`.
- Nenhum recurso do Lovable Cloud é habilitado; nenhuma chave de serviço é usada no app.

## O que preciso de você

- Confirmar se posso criar as tabelas que faltarem via script SQL para você rodar (não tenho acesso administrativo ao seu Supabase).
