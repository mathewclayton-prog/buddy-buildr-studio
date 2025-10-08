-- Drop personality column from catbot_training_data table
-- This column is no longer used as personality is now derived from training_description

ALTER TABLE catbot_training_data 
DROP COLUMN IF EXISTS personality;