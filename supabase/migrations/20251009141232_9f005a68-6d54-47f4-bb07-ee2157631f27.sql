-- Add openai_params column to test_responses for tracking API parameters used in tests
ALTER TABLE public.test_responses 
ADD COLUMN openai_params JSONB;