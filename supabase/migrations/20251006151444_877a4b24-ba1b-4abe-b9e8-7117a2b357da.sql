-- Function to calculate DAU/MAU stickiness ratio
CREATE OR REPLACE FUNCTION public.calculate_stickiness(
  p_date DATE DEFAULT CURRENT_DATE
)
RETURNS TABLE (
  dau INTEGER,
  mau INTEGER,
  stickiness_ratio NUMERIC
) 
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_dau INTEGER;
  v_mau INTEGER;
BEGIN
  -- DAU: Unique users in last 24 hours
  SELECT COUNT(DISTINCT user_id) INTO v_dau
  FROM public.analytics_events
  WHERE created_at >= p_date - INTERVAL '1 day'
    AND created_at < p_date
    AND user_id IS NOT NULL;
  
  -- MAU: Unique users in last 30 days
  SELECT COUNT(DISTINCT user_id) INTO v_mau
  FROM public.analytics_events
  WHERE created_at >= p_date - INTERVAL '30 days'
    AND created_at < p_date
    AND user_id IS NOT NULL;
  
  RETURN QUERY
  SELECT 
    v_dau,
    v_mau,
    ROUND(100.0 * v_dau / NULLIF(v_mau, 0), 2) as stickiness_ratio;
END;
$$;

-- Function to get cohort retention analysis
CREATE OR REPLACE FUNCTION public.get_cohort_retention(
  p_weeks_back INTEGER DEFAULT 12
)
RETURNS TABLE (
  cohort_week DATE,
  cohort_size INTEGER,
  week_0 NUMERIC,
  week_1 NUMERIC,
  week_2 NUMERIC,
  week_3 NUMERIC,
  week_4 NUMERIC
) 
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  RETURN QUERY
  WITH cohorts AS (
    SELECT 
      user_id,
      DATE_TRUNC('week', created_at)::DATE as cohort_week
    FROM public.profiles
    WHERE created_at >= NOW() - (p_weeks_back || ' weeks')::INTERVAL
  ),
  user_activity AS (
    SELECT DISTINCT
      user_id,
      DATE_TRUNC('week', created_at)::DATE as activity_week
    FROM public.analytics_events
    WHERE user_id IS NOT NULL
  )
  SELECT 
    c.cohort_week,
    COUNT(DISTINCT c.user_id)::INTEGER as cohort_size,
    100.00 as week_0,
    ROUND(100.0 * COUNT(DISTINCT CASE WHEN a.activity_week = c.cohort_week + INTERVAL '1 week' THEN c.user_id END) / 
          NULLIF(COUNT(DISTINCT c.user_id), 0), 2) as week_1,
    ROUND(100.0 * COUNT(DISTINCT CASE WHEN a.activity_week = c.cohort_week + INTERVAL '2 weeks' THEN c.user_id END) / 
          NULLIF(COUNT(DISTINCT c.user_id), 0), 2) as week_2,
    ROUND(100.0 * COUNT(DISTINCT CASE WHEN a.activity_week = c.cohort_week + INTERVAL '3 weeks' THEN c.user_id END) / 
          NULLIF(COUNT(DISTINCT c.user_id), 0), 2) as week_3,
    ROUND(100.0 * COUNT(DISTINCT CASE WHEN a.activity_week = c.cohort_week + INTERVAL '4 weeks' THEN c.user_id END) / 
          NULLIF(COUNT(DISTINCT c.user_id), 0), 2) as week_4
  FROM cohorts c
  LEFT JOIN user_activity a ON c.user_id = a.user_id
  GROUP BY c.cohort_week
  ORDER BY c.cohort_week DESC;
END;
$$;