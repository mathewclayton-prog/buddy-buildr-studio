-- Add new fields for enhanced character creation system
-- Phase 2: Database Schema for Character.ai Features

-- Add greeting field for custom scenario openings (4,000 chars)
ALTER TABLE public.catbots 
ADD COLUMN greeting TEXT;

-- Add advanced_definition field for dialog examples (32,000 chars)  
ALTER TABLE public.catbots
ADD COLUMN advanced_definition TEXT;

-- Add creation_mode field ('standard' or 'enhanced')
ALTER TABLE public.catbots
ADD COLUMN creation_mode TEXT DEFAULT 'standard' CHECK (creation_mode IN ('standard', 'enhanced'));

-- Add suggested_starters array field (3 conversation starters, 200 chars each)
ALTER TABLE public.catbots
ADD COLUMN suggested_starters TEXT[] DEFAULT '{}';

-- Add long_description field (500 chars)
ALTER TABLE public.catbots
ADD COLUMN long_description TEXT;