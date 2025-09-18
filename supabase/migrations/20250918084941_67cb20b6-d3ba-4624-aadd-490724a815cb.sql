-- Create a separate table for sensitive catbot training data
CREATE TABLE public.catbot_training_data (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  catbot_id UUID NOT NULL UNIQUE,
  training_description TEXT,
  personality TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on the new table
ALTER TABLE public.catbot_training_data ENABLE ROW LEVEL SECURITY;

-- Create policies - only catbot owners can access training data
CREATE POLICY "Catbot owners can view training data" 
ON public.catbot_training_data 
FOR SELECT 
USING (catbot_id IN (
  SELECT id FROM public.catbots 
  WHERE user_id = auth.uid()
));

CREATE POLICY "Catbot owners can insert training data" 
ON public.catbot_training_data 
FOR INSERT 
WITH CHECK (catbot_id IN (
  SELECT id FROM public.catbots 
  WHERE user_id = auth.uid()
));

CREATE POLICY "Catbot owners can update training data" 
ON public.catbot_training_data 
FOR UPDATE 
USING (catbot_id IN (
  SELECT id FROM public.catbots 
  WHERE user_id = auth.uid()
));

CREATE POLICY "Catbot owners can delete training data" 
ON public.catbot_training_data 
FOR DELETE 
USING (catbot_id IN (
  SELECT id FROM public.catbots 
  WHERE user_id = auth.uid()
));

-- Migrate existing data to the new table
INSERT INTO public.catbot_training_data (catbot_id, training_description, personality)
SELECT id, training_description, personality 
FROM public.catbots 
WHERE training_description IS NOT NULL OR personality IS NOT NULL;

-- Add trigger for updated_at
CREATE TRIGGER update_catbot_training_data_updated_at
BEFORE UPDATE ON public.catbot_training_data
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Remove sensitive columns from the main catbots table
ALTER TABLE public.catbots DROP COLUMN IF EXISTS training_description;
ALTER TABLE public.catbots DROP COLUMN IF EXISTS personality;