-- Add like_count and tags to catbots table
ALTER TABLE public.catbots 
ADD COLUMN like_count integer DEFAULT 0 NOT NULL,
ADD COLUMN tags text[] DEFAULT '{}';

-- Create catbot_likes table for tracking user likes
CREATE TABLE public.catbot_likes (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  catbot_id uuid NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(user_id, catbot_id)
);

-- Enable RLS on catbot_likes
ALTER TABLE public.catbot_likes ENABLE ROW LEVEL SECURITY;

-- Create policies for catbot_likes
CREATE POLICY "Users can view all likes" 
ON public.catbot_likes 
FOR SELECT 
USING (true);

CREATE POLICY "Users can create their own likes" 
ON public.catbot_likes 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own likes" 
ON public.catbot_likes 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create function to update like count when likes are added/removed
CREATE OR REPLACE FUNCTION public.update_catbot_like_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.catbots 
    SET like_count = like_count + 1 
    WHERE id = NEW.catbot_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.catbots 
    SET like_count = like_count - 1 
    WHERE id = OLD.catbot_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create triggers to automatically update like count
CREATE TRIGGER update_like_count_on_insert
  AFTER INSERT ON public.catbot_likes
  FOR EACH ROW
  EXECUTE FUNCTION public.update_catbot_like_count();

CREATE TRIGGER update_like_count_on_delete
  AFTER DELETE ON public.catbot_likes
  FOR EACH ROW
  EXECUTE FUNCTION public.update_catbot_like_count();

-- Add index for better performance
CREATE INDEX idx_catbot_likes_catbot_id ON public.catbot_likes(catbot_id);
CREATE INDEX idx_catbot_likes_user_id ON public.catbot_likes(user_id);
CREATE INDEX idx_catbots_tags ON public.catbots USING GIN(tags);