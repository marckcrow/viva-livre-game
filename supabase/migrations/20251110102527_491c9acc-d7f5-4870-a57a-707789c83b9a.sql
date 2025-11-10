-- Create table for alcohol reduction plan tracking
CREATE TABLE public.alcohol_reduction_plan (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  current_phase INTEGER NOT NULL DEFAULT 1 CHECK (current_phase IN (1, 2, 3)),
  phase_start_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  plan_start_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.alcohol_reduction_plan ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own plan"
ON public.alcohol_reduction_plan
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own plan"
ON public.alcohol_reduction_plan
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own plan"
ON public.alcohol_reduction_plan
FOR UPDATE
USING (auth.uid() = user_id);

-- Create table for logging alcohol consumption
CREATE TABLE public.alcohol_consumption_log (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  consumption_date DATE NOT NULL DEFAULT CURRENT_DATE,
  drink_type TEXT NOT NULL CHECK (drink_type IN ('wine', 'beer', 'spirits')),
  quantity DECIMAL NOT NULL CHECK (quantity > 0),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.alcohol_consumption_log ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own consumption logs"
ON public.alcohol_consumption_log
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own consumption logs"
ON public.alcohol_consumption_log
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own consumption logs"
ON public.alcohol_consumption_log
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own consumption logs"
ON public.alcohol_consumption_log
FOR DELETE
USING (auth.uid() = user_id);

-- Create trigger for automatic timestamp updates on alcohol_reduction_plan
CREATE TRIGGER update_alcohol_reduction_plan_updated_at
BEFORE UPDATE ON public.alcohol_reduction_plan
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();