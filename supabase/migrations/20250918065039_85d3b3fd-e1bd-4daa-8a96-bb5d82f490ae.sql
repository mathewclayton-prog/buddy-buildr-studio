-- Fix privacy issue: Restrict catbot_likes table access
-- Users should only see their own likes, not other people's likes

-- Drop the existing overly permissive policy
DROP POLICY IF EXISTS "Users can view all likes" ON public.catbot_likes;

-- Create a new policy that only allows users to see their own likes
CREATE POLICY "Users can view their own likes" 
ON public.catbot_likes 
FOR SELECT 
USING (auth.uid() = user_id);

-- Add a policy for catbot creators to see like counts (but not user IDs)
-- This is handled by the update_catbot_like_count trigger, so we don't need a separate policy

-- The existing policies for INSERT and DELETE are already secure:
-- "Users can create their own likes" - only allows inserting with their own user_id
-- "Users can delete their own likes" - only allows deleting their own likes