"use client";

import { useEffect, useRef } from "react";

/**
 * Records one view of `path` after mount.
 *
 * The guard ref matters in development, where React's strict mode mounts every
 * component twice and would otherwise double every count.
 */
export function TrackView({ path }: { path: string }) {
  const sent = useRef<string | null>(null);

  useEffect(() => {
    if (sent.current === path) return;
    sent.current = path;

    void fetch("/api/view", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ path }),
      keepalive: true,
    }).catch(() => {
      // Analytics must never surface an error to the reader.
    });
  }, [path]);

  return null;
}
