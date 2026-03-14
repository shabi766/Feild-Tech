import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import posthog from 'posthog-js';

export const usePageTracking = () => {
  const location = useLocation();

  useEffect(() => {
    // Only track if PostHog has been initialized
    if (typeof window !== 'undefined' && posthog.__loaded) {
      posthog.capture('$pageview');
    }
  }, [location]);
};

export default usePageTracking;
