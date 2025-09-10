-- Create a security definer function to get profile info for catbot creators
-- This allows controlled access to profile data when viewing public catbots
CREATE OR REPLACE FUNCTION public.get_catbot_creator_profile(catbot_id uuid)
RETURNS TABLE(display_name text, avatar_url text) 
LANGUAGE sql 
SECURITY DEFINER 
STABLE 
SET search_path = public
AS $$
  SELECT p.display_name, p.avatar_url
  FROM profiles p
  JOIN catbots c ON p.user_id = c.user_id
  WHERE c.id = catbot_id AND c.is_public = true;
$$;