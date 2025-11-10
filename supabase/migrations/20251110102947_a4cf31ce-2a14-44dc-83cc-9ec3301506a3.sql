-- Add tobacco tracking columns to alcohol_reduction_plan table
ALTER TABLE public.alcohol_reduction_plan 
ADD COLUMN initial_cigarettes_per_day INTEGER DEFAULT 0 CHECK (initial_cigarettes_per_day >= 0),
ADD COLUMN current_cigarettes_per_day INTEGER DEFAULT 0 CHECK (current_cigarettes_per_day >= 0),
ADD COLUMN tobacco_start_date TIMESTAMP WITH TIME ZONE DEFAULT now();

-- Rename table to reflect integrated approach
ALTER TABLE public.alcohol_reduction_plan RENAME TO reduction_plan;

-- Rename alcohol_consumption_log to consumption_log and add tobacco tracking
ALTER TABLE public.alcohol_consumption_log RENAME TO consumption_log;

ALTER TABLE public.consumption_log
ADD COLUMN consumption_type TEXT NOT NULL DEFAULT 'alcohol' CHECK (consumption_type IN ('alcohol', 'tobacco')),
ALTER COLUMN drink_type DROP NOT NULL,
ADD COLUMN cigarette_count INTEGER CHECK (cigarette_count >= 0 OR cigarette_count IS NULL);

-- Update existing records to have consumption_type set
UPDATE public.consumption_log SET consumption_type = 'alcohol' WHERE consumption_type IS NULL;