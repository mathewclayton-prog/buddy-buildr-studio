-- Phase 1: Emotional Intelligence Enhancement
-- Add emotional state tracking to user_memory_profiles
ALTER TABLE user_memory_profiles ADD COLUMN current_emotional_state JSONB DEFAULT '{}'::jsonb;
ALTER TABLE user_memory_profiles ADD COLUMN emotional_history JSONB DEFAULT '[]'::jsonb;

-- Phase 2: Enhanced Conversation Threading  
-- Enhance conversation_contexts for advanced threading
ALTER TABLE conversation_contexts ADD COLUMN thread_priority INTEGER DEFAULT 5;
ALTER TABLE conversation_contexts ADD COLUMN revival_triggers JSONB DEFAULT '[]'::jsonb;
ALTER TABLE conversation_contexts ADD COLUMN thread_connections JSONB DEFAULT '[]'::jsonb;

-- Phase 3: Proactive Engagement System
-- Create table for spontaneous thoughts and observations
CREATE TABLE catbot_spontaneous_thoughts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  catbot_id UUID REFERENCES catbots(id),
  thought_category VARCHAR(50), -- 'observation', 'memory', 'question', 'story'
  thought_content TEXT,
  personality_match VARCHAR(20),
  trigger_conditions JSONB DEFAULT '{}'::jsonb,
  usage_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on new table
ALTER TABLE catbot_spontaneous_thoughts ENABLE ROW LEVEL SECURITY;

-- Create policies for spontaneous thoughts
CREATE POLICY "Catbot thoughts are viewable by all users" 
ON catbot_spontaneous_thoughts 
FOR SELECT 
USING (true);

CREATE POLICY "Catbot creators can manage thoughts" 
ON catbot_spontaneous_thoughts 
FOR ALL
USING (catbot_id IN (
  SELECT id FROM catbots WHERE user_id = auth.uid()
));

-- Add trigger for automatic timestamp updates
CREATE TRIGGER update_catbot_spontaneous_thoughts_updated_at
BEFORE UPDATE ON catbot_spontaneous_thoughts
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Add indexes for performance
CREATE INDEX idx_user_memory_emotional_state ON user_memory_profiles USING GIN(current_emotional_state);
CREATE INDEX idx_conversation_contexts_priority ON conversation_contexts(thread_priority);
CREATE INDEX idx_catbot_thoughts_category ON catbot_spontaneous_thoughts(catbot_id, thought_category);
CREATE INDEX idx_catbot_thoughts_personality ON catbot_spontaneous_thoughts(personality_match);