-- Create table to track bulk catbot generation jobs
CREATE TABLE IF NOT EXISTS public.catbot_generation_jobs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  status text NOT NULL DEFAULT 'queued', -- queued | running | completed | failed
  total_count integer NOT NULL DEFAULT 0,
  completed_count integer NOT NULL DEFAULT 0,
  error text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.catbot_generation_jobs ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can create their own jobs"
ON public.catbot_generation_jobs
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own jobs"
ON public.catbot_generation_jobs
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own jobs"
ON public.catbot_generation_jobs
FOR UPDATE
USING (auth.uid() = user_id);

-- Trigger to keep updated_at fresh
DROP TRIGGER IF EXISTS trg_update_catbot_generation_jobs_updated_at ON public.catbot_generation_jobs;
CREATE TRIGGER trg_update_catbot_generation_jobs_updated_at
BEFORE UPDATE ON public.catbot_generation_jobs
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
