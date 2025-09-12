-- Add voice_id column to catbots table
ALTER TABLE public.catbots 
ADD COLUMN voice_id text DEFAULT 'XB0fDUnXU5powFXDhCwa';

-- Add index for better performance
CREATE INDEX idx_catbots_voice_id ON public.catbots(voice_id);

-- Update existing catbots with default voice based on personality
UPDATE public.catbots 
SET voice_id = CASE 
  WHEN personality ILIKE '%friendly%' THEN 'XB0fDUnXU5powFXDhCwa'  -- Charlotte
  WHEN personality ILIKE '%playful%' THEN 'EXAVITQu4vr4xnSDxMaL'   -- Sarah
  WHEN personality ILIKE '%mysterious%' THEN 'FGY2WhTYpPnrIDTdsKH5' -- Laura
  WHEN personality ILIKE '%serious%' THEN 'onwK4e9ZLuTAKqWW03F9'   -- Daniel
  WHEN personality ILIKE '%wise%' THEN 'nPczCjzI2devNBz1zQrb'      -- Brian
  ELSE 'XB0fDUnXU5powFXDhCwa'  -- Default to Charlotte
END
WHERE voice_id IS NULL;