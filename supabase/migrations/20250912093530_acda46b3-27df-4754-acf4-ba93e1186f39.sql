-- Add interaction_count column to catbots table
ALTER TABLE public.catbots 
ADD COLUMN interaction_count integer NOT NULL DEFAULT 0;

-- Add index for better performance when sorting by interaction count
CREATE INDEX idx_catbots_interaction_count ON public.catbots(interaction_count DESC);