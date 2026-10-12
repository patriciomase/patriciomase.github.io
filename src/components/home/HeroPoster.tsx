import {
  HERO_TRAIN,
  gearHoles,
  gearOutline,
  outlinePath,
  round,
  type SpurGear,
} from "@/lib/gear";

/** A circle as two arcs, so evenodd fill cuts it out of the gear. */
function circlePath(cx: number, cy: number, r: number): string {
  const [x0, x1, y, rr] = [round(cx + r), round(cx - r), round(cy), round(r)];
  return `M${x0} ${y} A${rr} ${rr} 0 1 0 ${x1} ${y} A${rr} ${rr} 0 1 0 ${x0} ${y} Z`;
}

function gearPath(gear: SpurGear): string {
  const holes = gearHoles(gear).map(({ x, y, r }) => circlePath(x, y, r));
  return [outlinePath(gearOutline(gear)), ...holes].join(" ");
}

const DRIVER = gearPath(HERO_TRAIN.driver);
const DRIVEN = gearPath(HERO_TRAIN.driven);
const DRIVEN_TRANSFORM = `translate(${round(HERO_TRAIN.drivenOffset[0])} ${round(
  HERO_TRAIN.drivenOffset[1],
)}) rotate(${round((HERO_TRAIN.drivenPhase * 180) / Math.PI)})`;

/**
 * The hero's static stage: a forge glow and the same two-gear train the
 * three.js scene renders, drawn as SVG. It is the whole hero visual on the
 * static motion tier, and what the canvas fades in over on the full one.
 */
export function HeroPoster() {
  return (
    <div className="hero-poster">
      <svg className="hero-gears" viewBox="-3.8 -2.7 5.9 4.8" focusable="false">
        <defs>
          <linearGradient id="poster-steel" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#6b737e" />
            <stop offset="0.45" stopColor="#30343a" />
            <stop offset="1" stopColor="#15171a" />
          </linearGradient>
        </defs>
        {/* The geometry is y-up, like the three.js scene; SVG is y-down. */}
        <g transform="scale(1 -1)">
          <path
            d={DRIVER}
            fill="url(#poster-steel)"
            fillRule="evenodd"
            stroke="#ff5500"
            strokeOpacity="0.55"
            strokeWidth="0.02"
          />
          <g transform={DRIVEN_TRANSFORM}>
            <path
              d={DRIVEN}
              fill="url(#poster-steel)"
              fillRule="evenodd"
              stroke="#ff5500"
              strokeOpacity="0.55"
              strokeWidth="0.02"
            />
          </g>
        </g>
      </svg>
    </div>
  );
}
