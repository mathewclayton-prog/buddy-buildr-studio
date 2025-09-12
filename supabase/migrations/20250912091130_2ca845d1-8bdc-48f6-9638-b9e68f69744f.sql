-- Add new columns to catbots table
ALTER TABLE public.catbots 
ADD COLUMN public_profile VARCHAR(250),
ADD COLUMN training_description TEXT;

-- Migrate existing description data to new columns
UPDATE public.catbots 
SET 
  public_profile = LEFT(description, 250),
  training_description = description
WHERE description IS NOT NULL;

-- Update records where description is null
UPDATE public.catbots 
SET 
  public_profile = '',
  training_description = ''
WHERE description IS NULL;