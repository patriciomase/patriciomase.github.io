"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { detectTierEnv, resolveMotionTier, type MotionTier } from "@/lib/motionTier";
import { startSparks, type AmbientSource, type SparksController } from "./sparks";

type MotionContextValue = {
  tier: MotionTier;
  /** Throws a spray of sparks from a viewport point. A no-op on the static tier. */
  burst: (x: number, y: number, intensity?: number) => void;
  /** Where ambient embers rise from, or null for none. */
  setAmbientSource: (source: AmbientSource | null) => void;
};

const MotionContext = createContext<MotionContextValue>({
  tier: "static",
  burst: () => {},
  setAmbientSource: () => {},
});

/**
 * Decides the motion tier once on mount and owns the sparks overlay.
 *
 * Every render before that effect -- the server's included -- is "static", so
 * the server markup always matches the first client render; the tier upgrades
 * a moment later. Children's effects run before this one, so an ambient
 * source set before the sparks exist is remembered and handed over when they
 * start.
 */
export function MotionProvider({ children }: { children: React.ReactNode }) {
  const [tier, setTier] = useState<MotionTier>("static");
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sparksRef = useRef<SparksController | null>(null);
  const ambientRef = useRef<AmbientSource | null>(null);

  useEffect(() => {
    setTier(resolveMotionTier(detectTierEnv()));
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (tier !== "full" || !canvas) return;
    const sparks = startSparks(canvas);
    sparksRef.current = sparks;
    if (ambientRef.current) sparks.setAmbientSource(ambientRef.current);
    return () => {
      sparks.destroy();
      sparksRef.current = null;
    };
  }, [tier]);

  const burst = useCallback((x: number, y: number, intensity?: number) => {
    sparksRef.current?.burst(x, y, intensity);
  }, []);

  const setAmbientSource = useCallback((source: AmbientSource | null) => {
    ambientRef.current = source;
    sparksRef.current?.setAmbientSource(source);
  }, []);

  const value = useMemo(
    () => ({ tier, burst, setAmbientSource }),
    [tier, burst, setAmbientSource],
  );

  return (
    <MotionContext.Provider value={value}>
      {children}
      {tier === "full" ? (
        <canvas ref={canvasRef} className="sparks-canvas" aria-hidden="true" />
      ) : null}
    </MotionContext.Provider>
  );
}

export function useMotion(): MotionContextValue {
  return useContext(MotionContext);
}
