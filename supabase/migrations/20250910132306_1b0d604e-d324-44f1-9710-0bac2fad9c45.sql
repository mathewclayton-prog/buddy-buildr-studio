-- Fix security issue: Replace overly permissive profile SELECT policy
-- Drop the existing policy that allows anyone to view all profiles
DROP POLICY IF EXISTS "Users can view all profiles" ON public.profiles;

-- Create a more secure policy that only allows users to view their own profiles
CREATE POLICY "Users can view their own profiles" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() = user_id);

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

-- Create a policy to allow viewing profiles of public catbot creators
-- This is more controlled than allowing all profile access
CREATE POLICY "Users can view public catbot creators' profiles"
ON public.profiles
FOR SELECT
USING (
  user_id IN (
    SELECT user_id 
    FROM catbots 
    WHERE is_public = true
  )
);