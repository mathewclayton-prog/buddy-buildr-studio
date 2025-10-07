-- Fix User Profile Data Exposure
-- Drop overly permissive policies on profiles table
DROP POLICY IF EXISTS "Users can view public catbot creators' profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can view their own profiles" ON public.profiles;

-- Create new restrictive policies that require authentication
CREATE POLICY "Authenticated users can view their own profile"
ON public.profiles
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Authenticated users can view catbot creator profiles"
ON public.profiles
FOR SELECT
TO authenticated
USING (
  user_id IN (
    SELECT user_id FROM public.catbots WHERE is_public = true
  )
);

-- Fix User Session Data Modification Vulnerability
-- Drop the overly permissive update policy
DROP POLICY IF EXISTS "Anyone can update sessions" ON public.user_sessions;

-- Create a restrictive policy - users can only update their own sessions
CREATE POLICY "Users can update their own sessions"
ON public.user_sessions
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);