-- Fix Email Addresses Harvesting (beta_signups)
-- Add explicit policy to allow only admins to view beta signups
CREATE POLICY "Only admins can view beta signups"
ON public.beta_signups
FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

-- Fix Analytics Data Poisoning
-- Drop the overly permissive anonymous insert policy
DROP POLICY IF EXISTS "Anyone can insert analytics events" ON public.analytics_events;

-- Require authentication for analytics insertion
CREATE POLICY "Authenticated users can insert analytics events"
ON public.analytics_events
FOR INSERT
TO authenticated
WITH CHECK (true);