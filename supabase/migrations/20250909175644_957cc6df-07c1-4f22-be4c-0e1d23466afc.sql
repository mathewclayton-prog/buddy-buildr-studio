-- Create catbots table for storing user's AI characters
CREATE TABLE public.catbots (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  personality TEXT,
  avatar_url TEXT,
  is_public BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.catbots ENABLE ROW LEVEL SECURITY;

-- Create policies for catbot access
CREATE POLICY "Users can view their own catbots" 
ON public.catbots 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can view public catbots" 
ON public.catbots 
FOR SELECT 
USING (is_public = true);

CREATE POLICY "Users can create their own catbots" 
ON public.catbots 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own catbots" 
ON public.catbots 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own catbots" 
ON public.catbots 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_catbots_updated_at
BEFORE UPDATE ON public.catbots
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();