-- Function to analyze onboarding funnel
CREATE OR REPLACE FUNCTION public.analyze_onboarding_funnel(
  p_start_date DATE DEFAULT NOW() - INTERVAL '30 days',
  p_end_date DATE DEFAULT NOW()
)
RETURNS TABLE (
  step TEXT,
  user_count INTEGER,
  conversion_rate NUMERIC,
  drop_off_rate NUMERIC
) 
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  RETURN QUERY
  WITH funnel_steps AS (
    SELECT 
      u.user_id,
      u.created_at,
      -- Step 1: Signed up (100% by definition)
      TRUE as step_1_signup,
      -- Step 2: Viewed home page
      EXISTS(
        SELECT 1 FROM public.page_views pv 
        WHERE pv.user_id = u.user_id 
        AND pv.page_path = '/'
        AND pv.created_at >= u.created_at
      ) as step_2_view_directory,
      -- Step 3: Started first chat
      EXISTS(
        SELECT 1 FROM public.analytics_events ae 
        WHERE ae.user_id = u.user_id 
        AND ae.event_type = 'chat_started'
        AND ae.created_at >= u.created_at
      ) as step_3_chat_started,
      -- Step 4: Sent first message
      EXISTS(
        SELECT 1 FROM public.analytics_events ae 
        WHERE ae.user_id = u.user_id 
        AND ae.event_type = 'message_sent'
        AND ae.created_at >= u.created_at
      ) as step_4_message_sent,
      -- Step 5: Created catbot
      EXISTS(
        SELECT 1 FROM public.analytics_events ae 
        WHERE ae.user_id = u.user_id 
        AND ae.event_type = 'catbot_created'
        AND ae.created_at >= u.created_at
      ) as step_5_catbot_created
    FROM public.profiles u
    WHERE u.created_at >= p_start_date
      AND u.created_at <= p_end_date
  ),
  step_counts AS (
    SELECT 
      COUNT(*) as total_users,
      COUNT(*) FILTER (WHERE step_1_signup) as step_1_count,
      COUNT(*) FILTER (WHERE step_2_view_directory) as step_2_count,
      COUNT(*) FILTER (WHERE step_3_chat_started) as step_3_count,
      COUNT(*) FILTER (WHERE step_4_message_sent) as step_4_count,
      COUNT(*) FILTER (WHERE step_5_catbot_created) as step_5_count
    FROM funnel_steps
  )
  SELECT * FROM (
    VALUES 
      ('1. Signed Up', (SELECT step_1_count FROM step_counts), 100.00, 0.00),
      ('2. Viewed Directory', (SELECT step_2_count FROM step_counts), 
       ROUND(100.0 * (SELECT step_2_count FROM step_counts) / NULLIF((SELECT total_users FROM step_counts), 0), 2),
       ROUND(100.0 * ((SELECT step_1_count FROM step_counts) - (SELECT step_2_count FROM step_counts)) / NULLIF((SELECT step_1_count FROM step_counts), 0), 2)),
      ('3. Started Chat', (SELECT step_3_count FROM step_counts), 
       ROUND(100.0 * (SELECT step_3_count FROM step_counts) / NULLIF((SELECT total_users FROM step_counts), 0), 2),
       ROUND(100.0 * ((SELECT step_2_count FROM step_counts) - (SELECT step_3_count FROM step_counts)) / NULLIF((SELECT step_2_count FROM step_counts), 0), 2)),
      ('4. Sent Message', (SELECT step_4_count FROM step_counts), 
       ROUND(100.0 * (SELECT step_4_count FROM step_counts) / NULLIF((SELECT total_users FROM step_counts), 0), 2),
       ROUND(100.0 * ((SELECT step_3_count FROM step_counts) - (SELECT step_4_count FROM step_counts)) / NULLIF((SELECT step_3_count FROM step_counts), 0), 2)),
      ('5. Created Catbot', (SELECT step_5_count FROM step_counts), 
       ROUND(100.0 * (SELECT step_5_count FROM step_counts) / NULLIF((SELECT total_users FROM step_counts), 0), 2),
       ROUND(100.0 * ((SELECT step_4_count FROM step_counts) - (SELECT step_5_count FROM step_counts)) / NULLIF((SELECT step_4_count FROM step_counts), 0), 2))
  ) as t(step, user_count, conversion_rate, drop_off_rate);
END;
$$;

-- Function to calculate time to first message (activation metric)
CREATE OR REPLACE FUNCTION public.get_time_to_first_message()
RETURNS TABLE (
  avg_hours NUMERIC,
  median_hours NUMERIC,
  total_users INTEGER
) 
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  RETURN QUERY
  WITH first_messages AS (
    SELECT 
      p.user_id,
      p.created_at as signup_time,
      MIN(ae.created_at) as first_message_time
    FROM public.profiles p
    JOIN public.analytics_events ae ON p.user_id = ae.user_id
    WHERE ae.event_type = 'message_sent'
    GROUP BY p.user_id, p.created_at
  )
  SELECT 
    ROUND(AVG(EXTRACT(EPOCH FROM (first_message_time - signup_time)) / 3600), 2) as avg_hours,
    ROUND(PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY EXTRACT(EPOCH FROM (first_message_time - signup_time)) / 3600), 2) as median_hours,
    COUNT(*)::INTEGER as total_users
  FROM first_messages;
END;
$$;

-- Function to get messages per session statistics
CREATE OR REPLACE FUNCTION public.get_messages_per_session_stats()
RETURNS TABLE (
  avg_messages NUMERIC,
  median_messages NUMERIC,
  total_sessions_with_messages INTEGER
) 
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  RETURN QUERY
  WITH session_message_counts AS (
    SELECT 
      ae.session_id,
      COUNT(*) as message_count
    FROM public.analytics_events ae
    WHERE ae.event_type = 'message_sent'
    AND ae.session_id IS NOT NULL
    GROUP BY ae.session_id
  )
  SELECT 
    ROUND(AVG(message_count), 2) as avg_messages,
    PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY message_count) as median_messages,
    COUNT(*)::INTEGER as total_sessions_with_messages
  FROM session_message_counts;
END;
$$;