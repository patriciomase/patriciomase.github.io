"use client";

import posthog from "posthog-js";

/**
 * Inits PostHog once on the client, at module scope rather than inside an
 * effect: PostHogPageView is a child of this component, and React fires
 * child effects before parent effects on mount, so an effect-based init
 * here would still be unloaded when the pageview effect first runs --
 * silently dropping every initial pageview. Module scope runs before any
 * effects fire.
 *
 * Pageviews are captured manually by PostHogPageView -- App Router
 * navigations don't trigger a full page load, so PostHog's automatic
 * pageview capture would only see the very first one.
 */
if (typeof window !== "undefined") {
  const token = process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN;
  if (token && !posthog.__loaded) {
    posthog.init(token, {
      api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST,
      capture_pageview: false,
      person_profiles: "identified_only",
    });
  }
}

export function PostHogProvider({ children }: { children: React.ReactNode }) {
  return children;
}
