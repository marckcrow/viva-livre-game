-- Create profiles table for user data
CREATE TABLE public.profiles (
  id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email text,
  full_name text,
  avatar_url text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Create function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    new.id,
    new.email,
    new.raw_user_meta_data->>'full_name'
  );
  RETURN new;
END;
$$;

-- Trigger to create profile on signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create progress_tracking table
CREATE TABLE public.progress_tracking (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  start_date timestamptz NOT NULL DEFAULT now(),
  days_clean integer NOT NULL DEFAULT 0,
  last_check_in timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.progress_tracking ENABLE ROW LEVEL SECURITY;

-- Progress tracking policies
CREATE POLICY "Users can view their own progress"
  ON public.progress_tracking FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own progress"
  ON public.progress_tracking FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own progress"
  ON public.progress_tracking FOR UPDATE
  USING (auth.uid() = user_id);

-- Create achievements table
CREATE TABLE public.achievements (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  description text NOT NULL,
  days_required integer NOT NULL,
  icon text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Seed achievements
INSERT INTO public.achievements (name, description, days_required, icon) VALUES
  ('Primeiro Passo', 'Você deu o primeiro passo rumo à liberdade!', 1, '🌱'),
  ('Uma Semana Forte', '7 dias de vitória e determinação', 7, '💪'),
  ('Força Inabalável', '15 dias mantendo o foco e a força', 15, '⭐'),
  ('Mês de Conquista', '30 dias de liberdade e superação', 30, '🏆'),
  ('Transformação Real', '60 dias de mudança verdadeira', 60, '🎯'),
  ('Liberdade Total', '100 dias de uma nova vida', 100, '👑');

-- Enable RLS (achievements are public readable)
ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Achievements are viewable by everyone"
  ON public.achievements FOR SELECT
  USING (true);

-- Create user_achievements junction table
CREATE TABLE public.user_achievements (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  achievement_id uuid NOT NULL REFERENCES public.achievements(id) ON DELETE CASCADE,
  unlocked_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, achievement_id)
);

-- Enable RLS
ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;

-- User achievements policies
CREATE POLICY "Users can view their own achievements"
  ON public.user_achievements FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can unlock their own achievements"
  ON public.user_achievements FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for timestamp updates
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_progress_tracking_updated_at
  BEFORE UPDATE ON public.progress_tracking
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();