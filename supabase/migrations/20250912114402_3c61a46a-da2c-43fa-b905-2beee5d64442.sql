-- Create user memory profiles table
CREATE TABLE public.user_memory_profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  catbot_id UUID NOT NULL REFERENCES public.catbots(id) ON DELETE CASCADE,
  interests JSONB DEFAULT '[]'::jsonb,
  mentioned_problems JSONB DEFAULT '[]'::jsonb,
  personality_traits JSONB DEFAULT '[]'::jsonb,
  relationship_depth INTEGER DEFAULT 1,
  inside_jokes JSONB DEFAULT '[]'::jsonb,
  important_events JSONB DEFAULT '[]'::jsonb,
  last_interaction_summary TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, catbot_id)
);

-- Create conversation contexts table
CREATE TABLE public.conversation_contexts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  catbot_id UUID NOT NULL REFERENCES public.catbots(id) ON DELETE CASCADE,
  context_type VARCHAR(50) NOT NULL,
  context_data JSONB DEFAULT '{}'::jsonb,
  status VARCHAR(20) DEFAULT 'active',
  mentioned_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  last_referenced TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Add memory processing columns to chat_messages
ALTER TABLE public.chat_messages ADD COLUMN extracted_insights JSONB DEFAULT '{}'::jsonb;
ALTER TABLE public.chat_messages ADD COLUMN memory_processed BOOLEAN DEFAULT FALSE;

-- Enable RLS on new tables
ALTER TABLE public.user_memory_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversation_contexts ENABLE ROW LEVEL SECURITY;

-- RLS policies for user_memory_profiles
CREATE POLICY "Users can view their own memory profiles"
ON public.user_memory_profiles
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own memory profiles"
ON public.user_memory_profiles
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own memory profiles"
ON public.user_memory_profiles
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own memory profiles"
ON public.user_memory_profiles
FOR DELETE
USING (auth.uid() = user_id);

-- RLS policies for conversation_contexts
CREATE POLICY "Users can view their own conversation contexts"
ON public.conversation_contexts
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own conversation contexts"
ON public.conversation_contexts
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own conversation contexts"
ON public.conversation_contexts
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own conversation contexts"
ON public.conversation_contexts
FOR DELETE
USING (auth.uid() = user_id);

-- Create trigger for updating user_memory_profiles updated_at
CREATE TRIGGER update_user_memory_profiles_updated_at
BEFORE UPDATE ON public.user_memory_profiles
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX idx_user_memory_profiles_user_catbot ON public.user_memory_profiles(user_id, catbot_id);
CREATE INDEX idx_conversation_contexts_user_catbot ON public.conversation_contexts(user_id, catbot_id);
CREATE INDEX idx_conversation_contexts_status ON public.conversation_contexts(status);
CREATE INDEX idx_chat_messages_memory_processed ON public.chat_messages(memory_processed);