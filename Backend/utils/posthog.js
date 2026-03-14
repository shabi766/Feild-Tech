import { PostHog } from 'posthog-node';
import dotenv from 'dotenv';
dotenv.config();

let posthogClient = null;

if (process.env.POSTHOG_KEY && process.env.POSTHOG_HOST) {
  posthogClient = new PostHog(
    process.env.POSTHOG_KEY,
    { host: process.env.POSTHOG_HOST || 'https://us.i.posthog.com' }
  );
} else {
  console.warn('PostHog environment variables are missing. Analytics will not be sent.');
}

export const posthog = posthogClient;

export const captureEvent = (distinctId, eventName, properties = {}) => {
  if (posthog) {
    try {
      posthog.capture({
        distinctId: distinctId || 'anonymous_backend_user',
        event: eventName,
        properties
      });
    } catch (error) {
      console.error('PostHog capture error:', error);
    }
  }
};
