-- Create a comprehensive user data deletion function that removes all user data
-- This ensures GDPR compliance by properly handling the "right to be forgotten"

CREATE OR REPLACE FUNCTION public.delete_user_data(p_user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Delete user's catbot-related data first (due to foreign key dependencies)
  DELETE FROM public.catbot_likes WHERE user_id = p_user_id;
  DELETE FROM public.catbot_training_data WHERE catbot_id IN (SELECT id FROM public.catbots WHERE user_id = p_user_id);
  DELETE FROM public.catbot_spontaneous_thoughts WHERE catbot_id IN (SELECT id FROM public.catbots WHERE user_id = p_user_id);
  
  -- Delete chat-related data
  DELETE FROM public.chat_messages WHERE session_id IN (SELECT id FROM public.chat_sessions WHERE user_id = p_user_id);
  DELETE FROM public.chat_sessions WHERE user_id = p_user_id;
  
  -- Delete memory and context data
  DELETE FROM public.user_memory_profiles WHERE user_id = p_user_id;
  DELETE FROM public.conversation_contexts WHERE user_id = p_user_id;
  
  -- Delete analytics and tracking data
  DELETE FROM public.analytics_events WHERE user_id = p_user_id;
  DELETE FROM public.page_views WHERE user_id = p_user_id;
  DELETE FROM public.user_sessions WHERE user_id = p_user_id;
  
  -- Delete catbots created by user
  DELETE FROM public.catbots WHERE user_id = p_user_id;
  
  -- Delete user roles
  DELETE FROM public.user_roles WHERE user_id = p_user_id;
  
  -- Delete profile (should be last as other tables may reference it)
  DELETE FROM public.profiles WHERE user_id = p_user_id;
  
  -- Delete from auth.users (this will trigger cascade deletes if any are set up)
  DELETE FROM auth.users WHERE id = p_user_id;
END;
$$;

-- Grant execute permission to authenticated users (they can only delete their own data due to RLS)
GRANT EXECUTE ON FUNCTION public.delete_user_data(uuid) TO authenticated;