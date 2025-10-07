-- Fix analytics_events unrestricted insert policy
-- Drop the overly permissive policy
DROP POLICY IF EXISTS "Authenticated users can insert analytics events" ON public.analytics_events;

-- Create a new policy that ensures users can only insert events for themselves
CREATE POLICY "Users can insert their own analytics events" 
ON public.analytics_events 
FOR INSERT 
WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

-- Remove duplicate SELECT policy on beta_signups
DROP POLICY IF EXISTS "Only admins can view beta signups" ON public.beta_signups;