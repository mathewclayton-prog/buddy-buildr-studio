-- Add last_active_at column to track when bots were last chatted with
ALTER TABLE public.catbots 
ADD COLUMN last_active_at timestamp with time zone DEFAULT now();

-- Update existing bots with realistic recent activity times
UPDATE public.catbots 
SET last_active_at = created_at + (random() * interval '30 days') + interval '1 hour'
WHERE last_active_at IS NULL;