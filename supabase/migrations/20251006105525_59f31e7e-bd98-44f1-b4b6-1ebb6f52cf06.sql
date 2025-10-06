-- Create beta_signups table for holding page email collection
CREATE TABLE public.beta_signups (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  notified BOOLEAN NOT NULL DEFAULT false
);

-- Enable Row Level Security
ALTER TABLE public.beta_signups ENABLE ROW LEVEL SECURITY;

-- Only admins can view beta signups
CREATE POLICY "Admins can view all beta signups" 
ON public.beta_signups 
FOR SELECT 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Allow public inserts (for the signup form)
CREATE POLICY "Anyone can sign up for beta" 
ON public.beta_signups 
FOR INSERT 
WITH CHECK (true);

-- Create index on email for faster lookups
CREATE INDEX idx_beta_signups_email ON public.beta_signups(email);