-- Add columns to store token breakdown in test_responses table
ALTER TABLE public.test_responses 
ADD COLUMN IF NOT EXISTS prompt_tokens integer,
ADD COLUMN IF NOT EXISTS completion_tokens integer;