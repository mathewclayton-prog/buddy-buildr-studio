-- Create test_runs table to store test metadata
CREATE TABLE public.test_runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_by UUID NOT NULL,
  test_name TEXT NOT NULL,
  test_type TEXT NOT NULL CHECK (test_type IN ('multi-catbot', 'config-variation')),
  catbot_ids UUID[] NOT NULL,
  test_questions JSONB NOT NULL,
  prompt_version TEXT NOT NULL CHECK (prompt_version IN ('enhanced', 'legacy')),
  configuration_snapshots JSONB DEFAULT '{}'::JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  completed_at TIMESTAMP WITH TIME ZONE,
  status TEXT DEFAULT 'running' CHECK (status IN ('running', 'completed', 'failed'))
);

-- Create test_responses table to store individual test results
CREATE TABLE public.test_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  test_run_id UUID REFERENCES public.test_runs(id) ON DELETE CASCADE NOT NULL,
  catbot_id UUID NOT NULL,
  variant_name TEXT,
  question_index INTEGER NOT NULL,
  question_text TEXT NOT NULL,
  response_text TEXT NOT NULL,
  response_time_ms INTEGER,
  tokens_used INTEGER,
  metadata JSONB DEFAULT '{}'::JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Enable RLS
ALTER TABLE public.test_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.test_responses ENABLE ROW LEVEL SECURITY;

-- RLS Policies for test_runs
CREATE POLICY "Admins can view all test runs"
  ON public.test_runs FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can insert test runs"
  ON public.test_runs FOR INSERT
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update test runs"
  ON public.test_runs FOR UPDATE
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete test runs"
  ON public.test_runs FOR DELETE
  USING (has_role(auth.uid(), 'admin'::app_role));

-- RLS Policies for test_responses
CREATE POLICY "Admins can view all test responses"
  ON public.test_responses FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can insert test responses"
  ON public.test_responses FOR INSERT
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete test responses"
  ON public.test_responses FOR DELETE
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Indexes for performance
CREATE INDEX idx_test_responses_test_run ON public.test_responses(test_run_id);
CREATE INDEX idx_test_responses_catbot ON public.test_responses(catbot_id);
CREATE INDEX idx_test_runs_created_by ON public.test_runs(created_by);
CREATE INDEX idx_test_runs_created_at ON public.test_runs(created_at DESC);