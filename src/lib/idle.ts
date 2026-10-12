/**
 * Runs `task` once the browser is idle (or after `timeout` ms at the latest),
 * so heavy optional work never competes with the first render. Returns a
 * cancel function. Safari has no requestIdleCallback; it gets a short timeout.
 */
export function whenIdle(task: () => void, timeout = 2000): () => void {
  if (typeof window.requestIdleCallback === "function") {
    const id = window.requestIdleCallback(task, { timeout });
    return () => window.cancelIdleCallback(id);
  }
  const id = window.setTimeout(task, 300);
  return () => window.clearTimeout(id);
}
