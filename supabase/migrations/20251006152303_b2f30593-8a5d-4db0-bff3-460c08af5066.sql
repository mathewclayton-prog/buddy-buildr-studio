-- Function to get live statistics
CREATE OR REPLACE FUNCTION public.get_live_stats()
RETURNS TABLE (
  active_now INTEGER,
  messages_last_hour INTEGER,
  signups_today INTEGER,
  sessions_today INTEGER
) 
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    (SELECT COUNT(DISTINCT user_id) FROM public.analytics_events 
     WHERE created_at >= NOW() - INTERVAL '5 minutes' AND user_id IS NOT NULL)::INTEGER,
    (SELECT COUNT(*) FROM public.analytics_events 
     WHERE event_type = 'message_sent' AND created_at >= NOW() - INTERVAL '1 hour')::INTEGER,
    (SELECT COUNT(*) FROM public.profiles 
     WHERE created_at >= CURRENT_DATE)::INTEGER,
    (SELECT COUNT(DISTINCT session_id) FROM public.user_sessions 
     WHERE started_at >= CURRENT_DATE)::INTEGER;
END;
$$;

-- Function to get recent activity feed
CREATE OR REPLACE FUNCTION public.get_recent_activity(
  p_limit INTEGER DEFAULT 10
)
RETURNS TABLE (
  event_type TEXT,
  created_at TIMESTAMP WITH TIME ZONE,
  user_id UUID,
  catbot_name TEXT,
  metadata JSONB
) 
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    ae.event_type,
    ae.created_at,
    ae.user_id,
    c.name as catbot_name,
    ae.metadata
  FROM public.analytics_events ae
  LEFT JOIN public.catbots c ON ae.catbot_id = c.id
  WHERE ae.created_at >= NOW() - INTERVAL '24 hours'
  ORDER BY ae.created_at DESC
  LIMIT p_limit;
END;
$$;

-- Function to get most active hours heatmap data
CREATE OR REPLACE FUNCTION public.get_active_hours_heatmap()
RETURNS TABLE (
  day_of_week INTEGER,
  hour_of_day INTEGER,
  activity_count INTEGER
) 
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    EXTRACT(DOW FROM created_at)::INTEGER as day_of_week,
    EXTRACT(HOUR FROM created_at)::INTEGER as hour_of_day,
    COUNT(*)::INTEGER as activity_count
  FROM public.analytics_events
  WHERE created_at >= NOW() - INTERVAL '30 days'
  GROUP BY day_of_week, hour_of_day
  ORDER BY day_of_week, hour_of_day;
END;
$$;