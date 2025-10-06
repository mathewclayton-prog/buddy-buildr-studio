-- Function to calculate session duration statistics
CREATE OR REPLACE FUNCTION public.calculate_session_duration(
  p_start_date DATE DEFAULT NOW() - INTERVAL '30 days',
  p_end_date DATE DEFAULT NOW()
)
RETURNS TABLE (
  avg_duration_minutes NUMERIC,
  median_duration_minutes NUMERIC,
  total_sessions INTEGER
) 
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    ROUND(AVG(EXTRACT(EPOCH FROM (last_activity_at - started_at)) / 60), 2) as avg_duration_minutes,
    ROUND(PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY EXTRACT(EPOCH FROM (last_activity_at - started_at)) / 60), 2) as median_duration_minutes,
    COUNT(*)::INTEGER as total_sessions
  FROM public.user_sessions
  WHERE started_at >= p_start_date
    AND started_at <= p_end_date
    AND last_activity_at > started_at;
END;
$$;

-- Function to calculate bounce rate
CREATE OR REPLACE FUNCTION public.calculate_bounce_rate(
  p_start_date DATE DEFAULT NOW() - INTERVAL '30 days',
  p_end_date DATE DEFAULT NOW()
)
RETURNS TABLE (
  bounce_rate NUMERIC,
  bounced_sessions INTEGER,
  total_sessions INTEGER
) 
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  RETURN QUERY
  WITH session_stats AS (
    SELECT 
      session_id,
      page_count,
      EXTRACT(EPOCH FROM (last_activity_at - started_at)) as duration_seconds
    FROM public.user_sessions
    WHERE started_at >= p_start_date
      AND started_at <= p_end_date
  )
  SELECT 
    ROUND(
      100.0 * COUNT(*) FILTER (WHERE page_count = 1 AND duration_seconds < 30) / 
      NULLIF(COUNT(*), 0), 
      2
    ) as bounce_rate,
    COUNT(*) FILTER (WHERE page_count = 1 AND duration_seconds < 30)::INTEGER as bounced_sessions,
    COUNT(*)::INTEGER as total_sessions
  FROM session_stats;
END;
$$;

-- Function to get session duration distribution for histogram
CREATE OR REPLACE FUNCTION public.get_session_duration_distribution(
  p_start_date DATE DEFAULT NOW() - INTERVAL '30 days',
  p_end_date DATE DEFAULT NOW()
)
RETURNS TABLE (
  duration_bucket TEXT,
  session_count INTEGER
) 
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  RETURN QUERY
  WITH duration_data AS (
    SELECT 
      EXTRACT(EPOCH FROM (last_activity_at - started_at)) / 60 as duration_minutes
    FROM public.user_sessions
    WHERE started_at >= p_start_date
      AND started_at <= p_end_date
      AND last_activity_at > started_at
  )
  SELECT 
    bucket,
    COUNT(*)::INTEGER as session_count
  FROM (
    SELECT 
      CASE 
        WHEN duration_minutes < 1 THEN '0-1 min'
        WHEN duration_minutes < 5 THEN '1-5 min'
        WHEN duration_minutes < 10 THEN '5-10 min'
        WHEN duration_minutes < 30 THEN '10-30 min'
        ELSE '30+ min'
      END as bucket
    FROM duration_data
  ) bucketed
  GROUP BY bucket
  ORDER BY 
    CASE bucket
      WHEN '0-1 min' THEN 1
      WHEN '1-5 min' THEN 2
      WHEN '5-10 min' THEN 3
      WHEN '10-30 min' THEN 4
      WHEN '30+ min' THEN 5
    END;
END;
$$;

-- Function to get daily bounce rate trend
CREATE OR REPLACE FUNCTION public.get_bounce_rate_trend(
  p_days_back INTEGER DEFAULT 30
)
RETURNS TABLE (
  date DATE,
  bounce_rate NUMERIC,
  total_sessions INTEGER
) 
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  RETURN QUERY
  WITH daily_sessions AS (
    SELECT 
      DATE(started_at) as session_date,
      page_count,
      EXTRACT(EPOCH FROM (last_activity_at - started_at)) as duration_seconds
    FROM public.user_sessions
    WHERE started_at >= CURRENT_DATE - (p_days_back || ' days')::INTERVAL
  )
  SELECT 
    session_date::DATE,
    ROUND(
      100.0 * COUNT(*) FILTER (WHERE page_count = 1 AND duration_seconds < 30) / 
      NULLIF(COUNT(*), 0), 
      2
    ) as bounce_rate,
    COUNT(*)::INTEGER as total_sessions
  FROM daily_sessions
  GROUP BY session_date
  ORDER BY session_date;
END;
$$;