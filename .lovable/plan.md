# Jornada Estoica — Viva com Direção

Módulo grande e transversal. Vou entregar em **5 fases sequenciais**, cada uma testável e revisável antes de seguir. Nada existente é removido — apenas somamos rotas, tabelas e um item de menu.

## Princípios de execução
- Reusar identidade visual atual (teal, grafite, dourado suave, oliva; Cormorant + Inter).
- Reusar `useAuth`, cliente Supabase, componentes shadcn, toasts, PWA.
- Modo híbrido: **funciona offline em `localStorage`** e, quando o usuário está logado, **sincroniza com Supabase** (mesmo padrão já usado no app).
- Textos 100% pt-BR, sem promessas terapêuticas. Aviso educativo fixo no rodapé do módulo: *"Conteúdo educativo. Não substitui acompanhamento profissional."*
- Sem preços, rankings ou pressão. Mensagens acolhedoras nas falhas.
- Todas as telas responsivas (mobile-first, menu recolhível).

## Arquitetura proposta

Nova rota-raiz `/jornada` com layout próprio e sub-rotas:

```text
/jornada                → Meu Dia (default)
/jornada/45-dias        → Jornada de 45 dias
/jornada/diario         → Diário estoico (manhã/noite/rápido)
/jornada/habitos        → Hábitos e virtudes
/jornada/painel-vida    → Painel da Vida (mensal)
/jornada/biblioteca     → Biblioteca prática
/jornada/evolucao       → Minha evolução + revisão semanal
/jornada/materiais      → Exportação PDF
/jornada/admin          → Painel admin (role=admin)
```

Item novo no header do Dashboard e link na landing: **"Jornada Estoica"** (ícone `Compass`).
Botão flutuante global **"Pausa Estoica"** dentro do layout `/jornada`.

## Fases

### Fase 1 — Fundação (esta entrega, se aprovada)
- Rota `/jornada` com layout + menu lateral (desktop) / drawer (mobile).
- Tela **Meu Dia** completa: check-in emocional, círculo de controle, 3 prioridades, virtude do dia, missão diária (rotativa determinística por data, banco local de missões originais).
- **Pausa Estoica** (botão flutuante + modal 4 passos com animação de respiração).
- Persistência local + sync opcional Supabase (quando logado).
- Item no menu do Dashboard e card de entrada na landing.
- Aviso educativo no rodapé do módulo.

### Fase 2 — Diário + Hábitos
- Diário estoico (manhã, noite, rápido 1min) com humor, tags, favoritos, busca por data.
- Hábitos semanais com sequência, % semanal/mensal, mensagens acolhedoras.
- Acompanhamento de virtudes.

### Fase 3 — Jornada 45 dias + Painel da Vida
- 45 dias em 6 etapas, conteúdo original curto por dia, sem punição por ausência.
- Painel da Vida mensal (12 áreas, 0–10, evolução mês a mês).
- Revisão semanal (domingos) + Revisão mensal.

### Fase 4 — Biblioteca + Notificações + PDF + Admin
- Biblioteca prática (conteúdos curtos originais por categoria).
- Notificações configuráveis (Notification API já usada no app).
- Exportação PDF (`jsPDF` — rotina, diário, hábitos, jornada, painel).
- Painel admin (role `admin` via tabela `user_roles` + `has_role`): CRUD de missões/dias/biblioteca/virtudes + métricas agregadas anônimas.

### Fase 5 — QA
- Testes em desktop/mobile, auth, RLS, sync, retomada, impressão.
- Relatório final: arquivos, tabelas, políticas, riscos, próximos passos.

## Banco de dados (criado em fases conforme necessário)

Migração da Fase 1 criará apenas:
- `stoic_profiles`, `stoic_daily_checkins`, `stoic_control_items`, `stoic_priorities`, `stoic_virtues` (seed com 10 virtudes), `stoic_user_virtues`.

Fases 2–4 adicionam: `stoic_journal_entries`, `stoic_habits`, `stoic_habit_logs`, `stoic_journey_days` (+ seed 45 dias), `stoic_user_progress`, `stoic_life_scores`, `stoic_weekly_reviews`, `stoic_monthly_reviews`, `stoic_library_items`, `user_roles` (+ enum `app_role` + função `has_role`).

Padrão de toda tabela:
1. `CREATE TABLE public.<t>` com `user_id uuid` (quando aplicável), `created_at`, `updated_at`.
2. `GRANT SELECT, INSERT, UPDATE, DELETE ... TO authenticated; GRANT ALL ... TO service_role;`
3. `ENABLE ROW LEVEL SECURITY`.
4. Policies: usuário só lê/escreve `auth.uid() = user_id`. Conteúdo público autenticado (`stoic_virtues`, `stoic_journey_days`, `stoic_library_items`) = SELECT para `authenticated`; escrita apenas via `has_role(auth.uid(),'admin')`.
5. Trigger `update_updated_at_column` já existente.

## Identidade visual
Reaproveita tokens atuais (`--primary`, `--accent`, etc.). Cards arredondados, ícones discretos (`Compass`, `Shield`, `Feather`, `Flame`, `Scale`, `Sparkles`), sem estátuas/estética sombria. Modo claro/escuro herdado.

## Riscos e mitigações
- **Escopo grande** → entregar em fases, cada uma isolada.
- **Sync offline↔online** → escrita otimista no `localStorage`, upsert Supabase quando logado; conflitos resolvidos por `updated_at` mais recente.
- **Admin** → gate estrito por `has_role` server-side; UI só aparece se checagem passar.
- **PDF** → `jspdf` + `jspdf-autotable`, versão P&B via CSS media print como alternativa.

## Próximo passo
Se aprovado, executo **Fase 1** agora: migração inicial + rota `/jornada` + Meu Dia + Pausa Estoica + entradas no menu. Depois peço sua validação antes de seguir para a Fase 2.
