-- Add feature flag for new prompt system to catbots table
ALTER TABLE public.catbots 
ADD COLUMN IF NOT EXISTS use_new_prompt boolean DEFAULT false;

COMMENT ON COLUMN public.catbots.use_new_prompt IS 'Enable enhanced prompt system with improved context selection and emotional awareness';