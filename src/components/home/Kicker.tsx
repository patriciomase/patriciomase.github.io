/** "02 — THE PROCESS": the small mono label that carries the forge metaphor. */
export function Kicker({ index, children }: { index: string; children: React.ReactNode }) {
  return (
    <p className="kicker">
      <span className="kicker-index">{index}</span>
      <span className="kicker-dash" aria-hidden="true" />
      {children}
    </p>
  );
}
