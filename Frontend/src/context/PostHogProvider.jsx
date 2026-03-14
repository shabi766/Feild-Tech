import posthog from 'posthog-js'
import { PostHogProvider as Provider } from 'posthog-js/react'

export const PostHogProvider = ({ children }) => {
  // Check if we have the environment variables, only init once
  if (typeof window !== 'undefined' && import.meta.env.VITE_POSTHOG_KEY && import.meta.env.VITE_POSTHOG_HOST) {
    if (!posthog.__loaded) {
      posthog.init(import.meta.env.VITE_POSTHOG_KEY, {
        api_host: import.meta.env.VITE_POSTHOG_HOST,
        // Disable in development if you prefer, or leave active to test
        // loaded: (posthog) => {
        //   if (import.meta.env.DEV) posthog.opt_out_capturing()
        // }
      })
    }
  }

  return <Provider client={posthog}>{children}</Provider>
}
