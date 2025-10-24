-- Migrate all existing catbots to use the enhanced prompt system
UPDATE catbots
SET use_new_prompt = true
WHERE use_new_prompt = false OR use_new_prompt IS NULL;