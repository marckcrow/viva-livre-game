
-- Fase 1: Jornada Estoica — tabelas base

-- 1) stoic_virtues (conteúdo público autenticado)
CREATE TABLE public.stoic_virtues (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  description text NOT NULL,
  is_active boolean NOT NULL DEFAULT true,
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.stoic_virtues TO authenticated;
GRANT ALL ON public.stoic_virtues TO service_role;
ALTER TABLE public.stoic_virtues ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Virtues readable by authenticated" ON public.stoic_virtues
  FOR SELECT TO authenticated USING (is_active = true);
CREATE TRIGGER trg_stoic_virtues_updated
  BEFORE UPDATE ON public.stoic_virtues
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

INSERT INTO public.stoic_virtues (name, description, sort_order) VALUES
  ('Sabedoria', 'Discernir o que importa e agir com clareza.', 1),
  ('Coragem', 'Enfrentar o necessário mesmo com receio.', 2),
  ('Justiça', 'Tratar os outros com equidade e respeito.', 3),
  ('Temperança', 'Manter medida nas ações e nos apetites.', 4),
  ('Paciência', 'Sustentar-se sem pressa diante das provas.', 5),
  ('Disciplina', 'Cumprir o combinado com você mesmo.', 6),
  ('Responsabilidade', 'Assumir o que é seu e responder por isso.', 7),
  ('Serenidade', 'Permanecer firme diante do que não controla.', 8),
  ('Honestidade', 'Falar e agir de acordo com o que é verdadeiro.', 9),
  ('Generosidade', 'Oferecer sem exigir retorno.', 10);

-- 2) stoic_profiles
CREATE TABLE public.stoic_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE,
  preferred_morning_time time,
  preferred_evening_time time,
  current_day int NOT NULL DEFAULT 0,
  journey_started_at timestamptz,
  journey_completed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.stoic_profiles TO authenticated;
GRANT ALL ON public.stoic_profiles TO service_role;
ALTER TABLE public.stoic_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Own stoic profile" ON public.stoic_profiles
  FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER trg_stoic_profiles_updated
  BEFORE UPDATE ON public.stoic_profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 3) stoic_daily_checkins
CREATE TABLE public.stoic_daily_checkins (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  entry_date date NOT NULL,
  mood text NOT NULL,
  mood_intensity int NOT NULL CHECK (mood_intensity BETWEEN 1 AND 5),
  control_level text NOT NULL CHECK (control_level IN ('sim','parcialmente','nao','ainda_nao_sei')),
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, entry_date)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.stoic_daily_checkins TO authenticated;
GRANT ALL ON public.stoic_daily_checkins TO service_role;
ALTER TABLE public.stoic_daily_checkins ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Own checkins" ON public.stoic_daily_checkins
  FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER trg_stoic_checkins_updated
  BEFORE UPDATE ON public.stoic_daily_checkins
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 4) stoic_control_items
CREATE TABLE public.stoic_control_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  entry_date date NOT NULL,
  description text NOT NULL,
  control_type text NOT NULL CHECK (control_type IN ('controllable','partial','uncontrollable')),
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.stoic_control_items TO authenticated;
GRANT ALL ON public.stoic_control_items TO service_role;
ALTER TABLE public.stoic_control_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Own control items" ON public.stoic_control_items
  FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE INDEX idx_stoic_control_items_user_date ON public.stoic_control_items(user_id, entry_date);

-- 5) stoic_priorities
CREATE TABLE public.stoic_priorities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  entry_date date NOT NULL,
  priority_level text NOT NULL CHECK (priority_level IN ('essential','important','desirable')),
  description text NOT NULL,
  completed boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.stoic_priorities TO authenticated;
GRANT ALL ON public.stoic_priorities TO service_role;
ALTER TABLE public.stoic_priorities ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Own priorities" ON public.stoic_priorities
  FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE INDEX idx_stoic_priorities_user_date ON public.stoic_priorities(user_id, entry_date);
CREATE TRIGGER trg_stoic_priorities_updated
  BEFORE UPDATE ON public.stoic_priorities
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 6) stoic_user_virtues
CREATE TABLE public.stoic_user_virtues (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  virtue_id uuid NOT NULL REFERENCES public.stoic_virtues(id) ON DELETE RESTRICT,
  entry_date date NOT NULL,
  intended_action text,
  reflection text,
  rating int CHECK (rating BETWEEN 1 AND 5),
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.stoic_user_virtues TO authenticated;
GRANT ALL ON public.stoic_user_virtues TO service_role;
ALTER TABLE public.stoic_user_virtues ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Own virtue records" ON public.stoic_user_virtues
  FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE INDEX idx_stoic_user_virtues_user_date ON public.stoic_user_virtues(user_id, entry_date);
