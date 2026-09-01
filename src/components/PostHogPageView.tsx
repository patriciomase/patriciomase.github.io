"use client";

import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import posthog from "posthog-js";

/** Captures a $pageview on every App Router navigation, initial load included. */
export function PostHogPageView() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (!pathname || !posthog.__loaded) return;

    const url = searchParams.size
      ? `${pathname}?${searchParams.toString()}`
      : pathname;

    posthog.capture("$pageview", { $current_url: url });
  }, [pathname, searchParams]);

  return null;
}
