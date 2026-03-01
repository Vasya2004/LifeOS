"use client"

import { useLevelProgress } from "@/hooks/useLevelProgress"

// ─── Ring constants ──────────────────────────────────────────────
const RING = 200
const STROKE = 12
const RADIUS = (RING - STROKE) / 2    // 94
const CX = RING / 2                    // 100
const CY = RING / 2                    // 100
const CIRCUMFERENCE = 2 * Math.PI * RADIUS  // ≈ 590.6

// ─── Pixel-art knight SVG ────────────────────────────────────────
function PixelKnight({ tierColor }: { tierColor: string }) {
  const dark     = "#0f172a"
  const metal    = "#94a3b8"
  const darkMetal = "#475569"
  const boot     = "#334155"
  const shield   = "#4f46e5"
  const shieldHL = "#818cf8"
  const blade    = "#e2e8f0"
  const hilt     = "#92400e"

  return (
    // imageRendering: pixelated gives crisp pixel-art scaling
    <svg viewBox="0 0 80 92" width={105} height={121} style={{ imageRendering: "pixelated" }}>

      {/* === SWORD (drawn behind body) === */}
      {/* Tip */}
      <rect x="70" y="0" width="2" height="2" fill={blade} />
      <rect x="69" y="2" width="4" height="2" fill={blade} />
      {/* Blade */}
      <rect x="68" y="4" width="6" height="30" fill={blade} />
      {/* Shine on blade */}
      <rect x="68" y="6" width="2" height="26" fill="rgba(255,255,255,0.3)" />

      {/* === SHIELD (drawn behind body) === */}
      <rect x="2"  y="36" width="16" height="24" fill={shield}   />
      <rect x="4"  y="38" width="12" height="20" fill={shieldHL} />
      {/* Cross */}
      <rect x="9"  y="38" width="2"  height="20" fill="rgba(255,255,255,0.35)" />
      <rect x="4"  y="47" width="12" height="2"  fill="rgba(255,255,255,0.35)" />

      {/* === HELMET === */}
      {/* Crest / top fin */}
      <rect x="30" y="0"  width="20" height="4"  fill={tierColor} />
      {/* Main helmet */}
      <rect x="24" y="4"  width="32" height="22" fill={tierColor} />
      {/* Left visor (eye) */}
      <rect x="26" y="12" width="10" height="8"  fill={dark} />
      {/* Right visor (eye) */}
      <rect x="44" y="12" width="10" height="8"  fill={dark} />
      {/* Visor bridge */}
      <rect x="36" y="13" width="8"  height="3"  fill={tierColor} />

      {/* === NECK === */}
      <rect x="30" y="26" width="20" height="6" fill={metal} />

      {/* === PAULDRONS (shoulder plates) === */}
      <rect x="12" y="28" width="18" height="7" fill={tierColor} />
      <rect x="50" y="28" width="18" height="7" fill={tierColor} />

      {/* === ARMS === */}
      <rect x="6"  y="30" width="14" height="7" fill={tierColor} />
      <rect x="60" y="30" width="14" height="7" fill={tierColor} />

      {/* === CHEST === */}
      <rect x="20" y="32" width="40" height="24" fill={tierColor} />
      {/* Chest engraving lines */}
      <rect x="26" y="36" width="28" height="3"  fill={`${tierColor}80`} />
      <rect x="30" y="42" width="20" height="3"  fill={`${tierColor}60`} />

      {/* === SWORD GUARD + HANDLE (over arm) === */}
      <rect x="62" y="34" width="18" height="5" fill={darkMetal} />
      <rect x="68" y="39" width="6"  height="9" fill={hilt}      />
      <rect x="66" y="48" width="10" height="5" fill={darkMetal} />

      {/* === BELT === */}
      <rect x="18" y="56" width="44" height="5" fill={metal}     />
      {/* Buckle */}
      <rect x="36" y="56" width="8"  height="5" fill={darkMetal} />

      {/* === LEGS === */}
      <rect x="22" y="61" width="14" height="18" fill={tierColor} />
      <rect x="44" y="61" width="14" height="18" fill={tierColor} />

      {/* === BOOTS === */}
      <rect x="20" y="76" width="18" height="10" fill={boot}     />
      <rect x="42" y="76" width="18" height="10" fill={boot}     />
      {/* Boot sole detail */}
      <rect x="18" y="81" width="20" height="5"  fill={darkMetal} />
      <rect x="42" y="81" width="20" height="5"  fill={darkMetal} />

      {/* Ground shadow */}
      <ellipse cx="40" cy="90" rx="22" ry="4" fill="rgba(0,0,0,0.25)" />
    </svg>
  )
}

// ─── Main export ─────────────────────────────────────────────────
export function CharacterWidget() {
  const lp = useLevelProgress()
  const offset = CIRCUMFERENCE * (1 - lp.xpPercent / 100)

  return (
    <div className="flex flex-col items-center gap-1.5">
      {/* Ring + knight */}
      <div className="relative shrink-0" style={{ width: RING, height: RING }}>

        {/* XP progress ring */}
        <svg
          width={RING}
          height={RING}
          className="absolute inset-0"
          style={{ transform: "rotate(-90deg)" }}
        >
          {/* Track */}
          <circle
            cx={CX} cy={CY} r={RADIUS}
            fill="none"
            stroke="currentColor"
            strokeWidth={STROKE}
            className="text-muted/20"
          />
          {/* Progress arc */}
          <circle
            cx={CX} cy={CY} r={RADIUS}
            fill="none"
            stroke={lp.tierColor}
            strokeWidth={STROKE}
            strokeDasharray={CIRCUMFERENCE}
            strokeDashoffset={offset}
            strokeLinecap="round"
            style={{
              transition: "stroke-dashoffset 0.8s ease",
              filter: `drop-shadow(0 0 8px ${lp.tierColor}90)`,
            }}
          />
        </svg>

        {/* Knight centered inside ring */}
        <div className="absolute inset-0 flex items-center justify-center">
          <PixelKnight tierColor={lp.tierColor} />
        </div>

        {/* Level badge pinned to bottom of ring */}
        <div
          className="absolute bottom-5 left-1/2 -translate-x-1/2 flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold whitespace-nowrap"
          style={{
            background: `${lp.tierColor}20`,
            border: `1.5px solid ${lp.tierColor}60`,
            color: lp.tierColor,
          }}
        >
          Ур. {lp.level} · {lp.tierName}
        </div>
      </div>

      {/* XP caption */}
      <p className="text-xs text-muted-foreground font-mono text-center -mt-2">
        {lp.xp.toLocaleString()} / {lp.xpToNext.toLocaleString()} XP
        {" → "}
        <span className="font-semibold" style={{ color: lp.tierColor }}>
          Уровень {lp.level + 1}
        </span>
      </p>
    </div>
  )
}
