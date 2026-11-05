"use client";

import { chair, type ChairConfig } from "@/data/catalog";
import { getChoice } from "@/lib/configurator/choice";
import { useConfigurator } from "@/components/configurator/configurator-provider";

// Front view, viewBox 400x560. Also the no-WebGL fallback from Phase 3 on.
const BACK_SHELL =
  "M112 46Q112 18 140 16L260 16Q288 18 288 46L298 128Q300 146 286 156L278 304Q276 336 250 342L150 342Q124 336 122 304L114 156Q100 146 102 128Z";
const BACK_PAD =
  "M122 50Q122 26 144 25L256 25Q278 26 278 50L287 128Q288 141 277 149L269 302Q267 328 247 333L153 333Q133 328 131 302L123 149Q112 141 113 128Z";
const SEAT_SHELL = "M100 350Q200 334 300 350L312 392Q200 414 88 392Z";
const SEAT_PAD = "M108 352Q200 338 292 352L302 388Q200 406 98 388Z";
const SEAT_INSERT = "M160 349Q200 345 240 349L244 391Q200 397 156 391Z";
const HUB = { x: 200, y: 470 };
const LEGS = [
  { x: 98, y: 486 },
  { x: 302, y: 486 },
  { x: 128, y: 516 },
  { x: 272, y: 516 },
  { x: 200, y: 526 },
];

const SHEEN = { fabric: 0.05, leather: 0.16, premium: 0.24 } as const;

export function describeChair(config: ChairConfig): string {
  const c = (id: keyof ChairConfig) => getChoice(chair, id, String(config[id])).label;
  const parts = [
    `${c("frame")} frame`,
    `${c("material")} in ${c("color")}`,
    `${c("stitching")} stitching`,
    `${c("base")} base`,
    ...(config.lumbar ? ["lumbar pillow"] : []),
    ...(config.rgb ? [`${c("rgbColor")} RGB strip`] : []),
  ];
  return `${chair.name} preview: ${parts.join(", ")}`;
}

export function FlatChair() {
  const config = useConfigurator((s) => s.config);
  const hex = (id: keyof ChairConfig) => getChoice(chair, id, String(config[id])).hex;

  const frame = hex("frame") ?? "#121214";
  const pad = hex("color") ?? "#1a1a1d";
  const stitch = hex("stitching") ?? `color-mix(in oklch, ${pad}, black 35%)`;
  const rgb = hex("rgbColor") ?? "#00e5ff";
  const racing = config.base === "racing";
  const premium = config.material === "premium";

  return (
    <svg
      viewBox="0 0 400 560"
      role="img"
      aria-label={describeChair(config)}
      className="chair-flat h-full max-h-full w-auto max-w-full"
    >
      <defs>
        <linearGradient id="cl-sheen" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#fff" stopOpacity={SHEEN[config.material]} />
          <stop offset="0.55" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="cl-metal" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#5d636b" />
          <stop offset="0.5" stopColor="#c9ced4" />
          <stop offset="1" stopColor="#5d636b" />
        </linearGradient>
        <pattern id="cl-mesh" width="6" height="6" patternUnits="userSpaceOnUse">
          <circle cx="3" cy="3" r="0.9" fill="#fff" opacity="0.1" />
        </pattern>
        <pattern id="cl-quilt" width="18" height="18" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <path d="M0 0H18M0 0V18" style={{ stroke: stitch }} strokeWidth="1" opacity="0.55" fill="none" />
        </pattern>
        <filter id="cl-glow" x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="9" />
        </filter>
        <filter id="cl-shadow" x="-20%" y="-200%" width="140%" height="500%">
          <feGaussianBlur stdDeviation="8" />
        </filter>
      </defs>

      <ellipse cx="200" cy="538" rx="150" ry="12" fill="#000" opacity="0.5" filter="url(#cl-shadow)" />

      {config.rgb && (
        <path d={BACK_SHELL} fill="none" stroke={rgb} strokeWidth="10" opacity="0.75" filter="url(#cl-glow)" />
      )}

      {/* Armrest posts sit behind the seat. */}
      <rect x="78" y="318" width="14" height="82" rx="4" fill={frame} />
      <rect x="308" y="318" width="14" height="82" rx="4" fill={frame} />

      {/* Backrest */}
      <path d={BACK_SHELL} fill={frame} />
      {config.rgb && <path d={BACK_SHELL} fill="none" stroke={rgb} strokeWidth="2.5" />}
      <path d={BACK_PAD} fill={pad} />
      <rect x="146" y="62" width="20" height="30" rx="8" fill="#0b0c10" stroke={frame} strokeWidth="2" />
      <rect x="234" y="62" width="20" height="30" rx="8" fill="#0b0c10" stroke={frame} strokeWidth="2" />
      <path d="M136 104Q200 94 264 104" fill="none" style={{ stroke: stitch }} strokeWidth="1.6" strokeDasharray="4 3" />
      <rect x="158" y="110" width="84" height="210" rx="18" fill={pad} />
      <rect x="158" y="110" width="84" height="210" rx="18" fill={premium ? "url(#cl-quilt)" : "url(#cl-mesh)"} />
      <rect
        x="162" y="114" width="76" height="202" rx="15"
        fill="none" style={{ stroke: stitch }} strokeWidth="1.6" strokeDasharray="4 3"
      />
      <path d={BACK_PAD} fill="url(#cl-sheen)" />

      {config.lumbar && (
        <g>
          <rect x="160" y="262" width="80" height="44" rx="16" fill={pad} stroke="#000" strokeOpacity="0.35" />
          <rect x="160" y="262" width="80" height="44" rx="16" fill="url(#cl-sheen)" />
          <rect
            x="165" y="267" width="70" height="34" rx="12"
            fill="none" style={{ stroke: stitch }} strokeWidth="1.4" strokeDasharray="4 3"
          />
        </g>
      )}

      {/* Seat */}
      <path d={SEAT_SHELL} fill={frame} />
      <path d={SEAT_PAD} fill={pad} />
      <path d={SEAT_INSERT} fill={premium ? "url(#cl-quilt)" : "url(#cl-mesh)"} />
      <path d={SEAT_INSERT} fill="none" style={{ stroke: stitch }} strokeWidth="1.6" strokeDasharray="4 3" />
      <path d={SEAT_PAD} fill="url(#cl-sheen)" />

      {/* Arm pads */}
      <rect x="64" y="306" width="42" height="14" rx="7" fill="#2a2c33" stroke={frame} strokeWidth="1.5" />
      <rect x="294" y="306" width="42" height="14" rx="7" fill="#2a2c33" stroke={frame} strokeWidth="1.5" />

      {/* Gas lift */}
      <rect x="170" y="398" width="60" height="12" rx="3" fill="#1d1e24" />
      <rect x="193" y="408" width="14" height="52" fill="url(#cl-metal)" />
      <rect x="190" y="430" width="20" height="32" rx="3" fill="#1a1b20" />

      {/* Base */}
      {LEGS.map((leg) => (
        <line
          key={`${leg.x}-${leg.y}`}
          x1={HUB.x} y1={HUB.y} x2={leg.x} y2={leg.y}
          stroke={racing ? "url(#cl-metal)" : "#34363e"}
          strokeWidth={racing ? 15 : 11}
          strokeLinecap={racing ? "butt" : "round"}
        />
      ))}
      {racing &&
        LEGS.map((leg) => (
          <line
            key={`hl-${leg.x}-${leg.y}`}
            x1={HUB.x} y1={HUB.y - 5} x2={leg.x} y2={leg.y - 5}
            stroke="#eef1f4" strokeOpacity="0.6" strokeWidth="1.5"
          />
        ))}
      <circle cx={HUB.x} cy={HUB.y} r="14" fill={racing ? "url(#cl-metal)" : "#34363e"} />
      {LEGS.map((leg) => (
        <g key={`c-${leg.x}-${leg.y}`}>
          <circle cx={leg.x} cy={leg.y + 9} r="9" fill="#111216" stroke="#2a2b31" />
          <circle cx={leg.x} cy={leg.y + 9} r="3" fill={frame} />
        </g>
      ))}
    </svg>
  );
}
