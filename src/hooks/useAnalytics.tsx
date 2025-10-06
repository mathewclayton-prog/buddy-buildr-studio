import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

// Generate or retrieve session ID from sessionStorage
const getSessionId = () => {
  let sessionId = sessionStorage.getItem('analytics_session_id');
  if (!sessionId) {
    sessionId = crypto.randomUUID();
    sessionStorage.setItem('analytics_session_id', sessionId);
  }
  return sessionId;
};

// Get device type based on screen width
const getDeviceType = () => {
  const width = window.innerWidth;
  if (width < 768) return 'mobile';
  if (width < 1024) return 'tablet';
  return 'desktop';
};

// Get browser name from user agent
const getBrowser = () => {
  const ua = navigator.userAgent;
  if (ua.includes('Firefox')) return 'Firefox';
  if (ua.includes('Chrome')) return 'Chrome';
  if (ua.includes('Safari')) return 'Safari';
  if (ua.includes('Edge')) return 'Edge';
  return 'Other';
};

export const useAnalytics = () => {
  const { user } = useAuth();

  // Track page view
  const trackPageView = async (pagePath: string) => {
    const sessionId = getSessionId();
    const urlParams = new URLSearchParams(window.location.search);
    
    try {
      await supabase.from('page_views').insert({
        user_id: user?.id || null,
        page_path: pagePath,
        referrer: document.referrer || null,
        utm_source: urlParams.get('utm_source'),
        utm_medium: urlParams.get('utm_medium'),
        utm_campaign: urlParams.get('utm_campaign'),
        session_id: sessionId,
        device_type: getDeviceType(),
        browser: getBrowser()
      });

      // Update session activity if user is logged in
      if (user) {
        await supabase.rpc('update_session_activity', {
          p_session_id: sessionId,
          p_user_id: user.id
        });
      }
    } catch (error) {
      // Silently fail - don't disrupt user experience
      console.debug('Analytics tracking failed:', error);
    }
  };

  // Track custom event
  const trackEvent = async (
    eventType: string,
    metadata?: Record<string, any>,
    catbotId?: string
  ) => {
    try {
      await supabase.from('analytics_events').insert({
        event_type: eventType,
        user_id: user?.id || null,
        catbot_id: catbotId || null,
        session_id: getSessionId(),
        metadata: metadata || {}
      });
    } catch (error) {
      // Silently fail - don't disrupt user experience
      console.debug('Event tracking failed:', error);
    }
  };

  return { trackPageView, trackEvent };
};
