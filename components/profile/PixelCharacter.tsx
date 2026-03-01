"use client"

import { useLevelProgress } from "@/hooks/useLevelProgress"

// ─── Types ────────────────────────────────────────────────────────

export type CharacterClass = 'knight' | 'mage' | 'ranger' | 'rogue'
export type CharacterBackground = 'void' | 'dungeon' | 'forest' | 'stars'

export interface CharacterConfig {
  class: CharacterClass
  armorColor: string | null  // null = use tier color
  background: CharacterBackground
}

export const DEFAULT_CHARACTER_CONFIG: CharacterConfig = {
  class: 'knight',
  armorColor: null,
  background: 'void',
}

const CHARACTER_CONFIG_KEY = "lifeos_character_config"

export function loadCharacterConfig(): CharacterConfig {
  if (typeof window === 'undefined') return DEFAULT_CHARACTER_CONFIG
  try {
    const raw = localStorage.getItem(CHARACTER_CONFIG_KEY)
    if (raw) return { ...DEFAULT_CHARACTER_CONFIG, ...JSON.parse(raw) }
  } catch {}
  return DEFAULT_CHARACTER_CONFIG
}

export function saveCharacterConfig(config: CharacterConfig) {
  try { localStorage.setItem(CHARACTER_CONFIG_KEY, JSON.stringify(config)) } catch {}
}

// ─── Ring constants ───────────────────────────────────────────────

const RING = 200
const STROKE = 12
const RADIUS = (RING - STROKE) / 2
const CX = RING / 2
const CY = RING / 2
const CIRCUMFERENCE = 2 * Math.PI * RADIUS

// ─── Background SVG layers ────────────────────────────────────────

function Background({ bg }: { bg: CharacterBackground }) {
  if (bg === 'dungeon') return (
    <>
      <rect x="0" y="0" width="80" height="92" fill="#1a1a2e" />
      {/* Stone wall blocks */}
      {[0,16,32,48,64,80].map(y =>
        [0,20,40,60].map(x => (
          <rect key={`${x}-${y}`} x={x+1} y={y+1} width="17" height="13" fill="#1e2030" stroke="#0f1020" strokeWidth="1" />
        ))
      )}
    </>
  )
  if (bg === 'forest') return (
    <>
      <rect x="0" y="0" width="80" height="92" fill="#0d1f0d" />
      {/* Ground */}
      <rect x="0" y="72" width="80" height="20" fill="#1a2e1a" />
      {/* Trees */}
      <rect x="2"  y="40" width="6" height="32" fill="#2d1b0e" />
      <rect x="0"  y="28" width="10" height="18" fill="#1a3d1a" />
      <rect x="64" y="44" width="6" height="28" fill="#2d1b0e" />
      <rect x="62" y="30" width="10" height="20" fill="#1a3d1a" />
      {/* Stars */}
      <rect x="20" y="8"  width="2" height="2" fill="#ffffff60" />
      <rect x="50" y="14" width="2" height="2" fill="#ffffff60" />
      <rect x="36" y="4"  width="2" height="2" fill="#ffffff60" />
    </>
  )
  if (bg === 'stars') return (
    <>
      <rect x="0" y="0" width="80" height="92" fill="#060612" />
      {/* Stars */}
      {[[8,6],[22,14],[45,4],[60,10],[14,30],[68,22],[30,40],[55,50],[10,55],[72,60],[40,18],[26,68]].map(([x,y], i) => (
        <rect key={i} x={x} y={y} width={i%3===0?2:1} height={i%3===0?2:1} fill={`rgba(255,255,255,${0.4+0.4*(i%3)/2})`} />
      ))}
      {/* Nebula glow */}
      <ellipse cx="40" cy="46" rx="30" ry="20" fill="rgba(100,60,200,0.08)" />
    </>
  )
  // void (default)
  return (
    <>
      <rect x="0" y="0" width="80" height="92" fill="#050510" />
      <ellipse cx="40" cy="46" rx="32" ry="22" fill="rgba(80,40,160,0.10)" />
    </>
  )
}

// ─── Knight ───────────────────────────────────────────────────────

function PixelKnight({ color }: { color: string }) {
  const dark     = "#0f172a"
  const metal    = "#94a3b8"
  const darkMetal = "#475569"
  const boot     = "#334155"
  const shield   = "#4f46e5"
  const shieldHL = "#818cf8"
  const blade    = "#e2e8f0"
  const hilt     = "#92400e"

  return (
    <svg viewBox="0 0 80 92" width={105} height={121} style={{ imageRendering: "pixelated" }}>
      <Background bg="void" />
      <rect x="70" y="0"  width="2" height="2"  fill={blade} />
      <rect x="69" y="2"  width="4" height="2"  fill={blade} />
      <rect x="68" y="4"  width="6" height="30" fill={blade} />
      <rect x="68" y="6"  width="2" height="26" fill="rgba(255,255,255,0.3)" />
      <rect x="2"  y="36" width="16" height="24" fill={shield} />
      <rect x="4"  y="38" width="12" height="20" fill={shieldHL} />
      <rect x="9"  y="38" width="2"  height="20" fill="rgba(255,255,255,0.35)" />
      <rect x="4"  y="47" width="12" height="2"  fill="rgba(255,255,255,0.35)" />
      <rect x="30" y="0"  width="20" height="4"  fill={color} />
      <rect x="24" y="4"  width="32" height="22" fill={color} />
      <rect x="26" y="12" width="10" height="8"  fill={dark} />
      <rect x="44" y="12" width="10" height="8"  fill={dark} />
      <rect x="36" y="13" width="8"  height="3"  fill={color} />
      <rect x="30" y="26" width="20" height="6"  fill={metal} />
      <rect x="12" y="28" width="18" height="7"  fill={color} />
      <rect x="50" y="28" width="18" height="7"  fill={color} />
      <rect x="6"  y="30" width="14" height="7"  fill={color} />
      <rect x="60" y="30" width="14" height="7"  fill={color} />
      <rect x="20" y="32" width="40" height="24" fill={color} />
      <rect x="26" y="36" width="28" height="3"  fill={`${color}80`} />
      <rect x="30" y="42" width="20" height="3"  fill={`${color}60`} />
      <rect x="62" y="34" width="18" height="5"  fill={darkMetal} />
      <rect x="68" y="39" width="6"  height="9"  fill={hilt} />
      <rect x="66" y="48" width="10" height="5"  fill={darkMetal} />
      <rect x="18" y="56" width="44" height="5"  fill={metal} />
      <rect x="36" y="56" width="8"  height="5"  fill={darkMetal} />
      <rect x="22" y="61" width="14" height="18" fill={color} />
      <rect x="44" y="61" width="14" height="18" fill={color} />
      <rect x="20" y="76" width="18" height="10" fill={boot} />
      <rect x="42" y="76" width="18" height="10" fill={boot} />
      <rect x="18" y="81" width="20" height="5"  fill={darkMetal} />
      <rect x="42" y="81" width="20" height="5"  fill={darkMetal} />
      <ellipse cx="40" cy="90" rx="22" ry="4" fill="rgba(0,0,0,0.25)" />
    </svg>
  )
}

// ─── Mage ─────────────────────────────────────────────────────────

function PixelMage({ color }: { color: string }) {
  const skin   = "#f5c9a0"
  const dark   = "#0f172a"
  const robe   = color
  const hat    = "#1e0a3c"
  const hatHL  = "#3b1278"
  const staff  = "#6b4c1e"
  const orb    = "#a78bfa"
  const orbHL  = "#ede9fe"

  return (
    <svg viewBox="0 0 80 92" width={105} height={121} style={{ imageRendering: "pixelated" }}>
      {/* Staff (behind) */}
      <rect x="66" y="4"  width="4" height="70" fill={staff} />
      {/* Orb */}
      <rect x="62" y="2"  width="12" height="12" fill={orb} />
      <rect x="64" y="2"  width="4"  height="4"  fill={orbHL} />

      {/* Hat brim */}
      <rect x="20" y="16" width="40" height="5"  fill={hat} />
      <rect x="22" y="14" width="36" height="3"  fill={hatHL} />
      {/* Hat body */}
      <rect x="26" y="10" width="28" height="7"  fill={hat} />
      <rect x="30" y="5"  width="20" height="6"  fill={hat} />
      <rect x="33" y="1"  width="14" height="5"  fill={hat} />
      <rect x="36" y="0"  width="8"  height="2"  fill={hat} />
      {/* Hat highlight */}
      <rect x="28" y="6"  width="4"  height="14" fill={hatHL} />

      {/* Face */}
      <rect x="28" y="20" width="24" height="18" fill={skin} />
      {/* Eyes */}
      <rect x="30" y="25" width="6" height="5" fill={dark} />
      <rect x="44" y="25" width="6" height="5" fill={dark} />
      {/* Pupils glow */}
      <rect x="31" y="26" width="2" height="2" fill={orb} />
      <rect x="45" y="26" width="2" height="2" fill={orb} />

      {/* Robe body */}
      <rect x="18" y="36" width="44" height="40" fill={robe} />
      {/* Robe sides (wider at bottom) */}
      <rect x="14" y="46" width="6"  height="30" fill={robe} />
      <rect x="60" y="46" width="6"  height="30" fill={robe} />
      {/* Robe trim */}
      <rect x="36" y="36" width="8"  height="40" fill={`${robe}50`} />
      {/* Belt */}
      <rect x="20" y="54" width="40" height="4"  fill={`${robe}90`} />
      <rect x="36" y="54" width="8"  height="4"  fill={orbHL} />

      {/* Sleeves */}
      <rect x="6"  y="36" width="14" height="8"  fill={robe} />
      <rect x="60" y="36" width="14" height="8"  fill={robe} />
      {/* Hands */}
      <rect x="6"  y="44" width="10" height="6"  fill={skin} />
      <rect x="64" y="44" width="10" height="6"  fill={skin} />

      {/* Bottom of robe / feet hint */}
      <rect x="22" y="76" width="12" height="10" fill={`${robe}80`} />
      <rect x="46" y="76" width="12" height="10" fill={`${robe}80`} />

      <ellipse cx="40" cy="90" rx="22" ry="4" fill="rgba(0,0,0,0.25)" />
    </svg>
  )
}

// ─── Ranger ───────────────────────────────────────────────────────

function PixelRanger({ color }: { color: string }) {
  const skin     = "#e8b89a"
  const dark     = "#0f172a"
  const cloak    = color
  const hood     = "#1a2e1a"
  const leather  = "#5c3d1e"
  const bow      = "#6b4c1e"
  const arrow    = "#c0a060"
  const metal    = "#94a3b8"
  const boot     = "#2d1b0e"

  return (
    <svg viewBox="0 0 80 92" width={105} height={121} style={{ imageRendering: "pixelated" }}>
      {/* Cloak/cape (behind) */}
      <rect x="8"  y="32" width="12" height="50" fill={`${cloak}90`} />
      <rect x="60" y="32" width="12" height="50" fill={`${cloak}90`} />

      {/* Bow (left side, behind body) */}
      <rect x="2" y="20" width="4" height="4"  fill={bow} />
      <rect x="4" y="16" width="4" height="6"  fill={bow} />
      <rect x="6" y="12" width="4" height="6"  fill={bow} />
      <rect x="4" y="52" width="4" height="6"  fill={bow} />
      <rect x="2" y="56" width="4" height="6"  fill={bow} />
      <rect x="2" y="20" width="2" height="38" fill={bow} />
      {/* Bowstring */}
      <rect x="4" y="20" width="2" height="38" fill="#c0c0c080" />
      {/* Arrow */}
      <rect x="6" y="28" width="16" height="2" fill={arrow} />
      <rect x="20" y="26" width="4"  height="6" fill={metal} />

      {/* Hood */}
      <rect x="24" y="2"  width="32" height="6"  fill={hood} />
      <rect x="20" y="6"  width="40" height="18" fill={hood} />
      {/* Hood shadow on face */}
      <rect x="22" y="8"  width="36" height="6"  fill="#000000a0" />
      {/* Face */}
      <rect x="26" y="12" width="28" height="16" fill={skin} />
      {/* Eyes (half-shadow) */}
      <rect x="28" y="16" width="8"  height="5"  fill={dark} />
      <rect x="44" y="16" width="8"  height="5"  fill={dark} />
      {/* Eye glint */}
      <rect x="29" y="17" width="2" height="2"  fill="#60e060" />
      <rect x="45" y="17" width="2" height="2"  fill="#60e060" />

      {/* Neck */}
      <rect x="30" y="26" width="20" height="4"  fill={skin} />

      {/* Body */}
      <rect x="20" y="30" width="40" height="28" fill={leather} />
      {/* Cloak over body */}
      <rect x="16" y="30" width="6"  height="28" fill={cloak} />
      <rect x="58" y="30" width="6"  height="28" fill={cloak} />
      {/* Chest strap */}
      <rect x="34" y="30" width="4"  height="28" fill={`${leather}80`} />
      <rect x="20" y="42" width="40" height="4"  fill={`${leather}80`} />

      {/* Arms */}
      <rect x="8"  y="32" width="14" height="8"  fill={cloak} />
      <rect x="58" y="32" width="14" height="8"  fill={cloak} />
      {/* Hands */}
      <rect x="6"  y="40" width="10" height="6"  fill={skin} />
      <rect x="64" y="40" width="10" height="6"  fill={skin} />

      {/* Legs */}
      <rect x="22" y="58" width="14" height="22" fill={leather} />
      <rect x="44" y="58" width="14" height="22" fill={leather} />
      {/* Boots */}
      <rect x="20" y="74" width="18" height="12" fill={boot} />
      <rect x="42" y="74" width="18" height="12" fill={boot} />

      <ellipse cx="40" cy="90" rx="22" ry="4" fill="rgba(0,0,0,0.25)" />
    </svg>
  )
}

// ─── Rogue ────────────────────────────────────────────────────────

function PixelRogue({ color }: { color: string }) {
  const skin     = "#c89070"
  const dark     = "#0f172a"
  const outfit   = color
  const hood     = "#1a1a2e"
  const leather  = "#2d1b1b"
  const blade    = "#c8d8e8"
  const darkBlade = "#607080"
  const metal    = "#60708080"

  return (
    <svg viewBox="0 0 80 92" width={105} height={121} style={{ imageRendering: "pixelated" }}>
      {/* Left dagger (behind) */}
      <rect x="8"  y="36" width="3"  height="24" fill={blade} />
      <rect x="6"  y="34" width="7"  height="4"  fill={darkBlade} />
      <rect x="8"  y="30" width="3"  height="6"  fill={leather} />
      {/* Right dagger */}
      <rect x="69" y="36" width="3"  height="24" fill={blade} />
      <rect x="67" y="34" width="7"  height="4"  fill={darkBlade} />
      <rect x="69" y="30" width="3"  height="6"  fill={leather} />

      {/* Hood */}
      <rect x="22" y="0"  width="36" height="4"  fill={hood} />
      <rect x="18" y="4"  width="44" height="20" fill={hood} />
      {/* Hood shadow */}
      <rect x="20" y="4"  width="40" height="10" fill="#00000080" />
      {/* Face (half in shadow) */}
      <rect x="26" y="10" width="28" height="18" fill={skin} />
      <rect x="26" y="10" width="28" height="8"  fill="#00000060" />
      {/* Mask/scarf */}
      <rect x="24" y="20" width="32" height="8"  fill={hood} />
      {/* Eyes (glowing) */}
      <rect x="28" y="14" width="8"  height="5"  fill={dark} />
      <rect x="44" y="14" width="8"  height="5"  fill={dark} />
      <rect x="30" y="15" width="2"  height="2"  fill="#ff4060" />
      <rect x="46" y="15" width="2"  height="2"  fill="#ff4060" />

      {/* Neck */}
      <rect x="30" y="26" width="20" height="4"  fill={leather} />

      {/* Body */}
      <rect x="20" y="30" width="40" height="28" fill={outfit} />
      {/* Dark overlay / shadow details */}
      <rect x="20" y="30" width="8"  height="28" fill="#00000030" />
      <rect x="52" y="30" width="8"  height="28" fill="#00000030" />
      {/* Chest emblem */}
      <rect x="36" y="36" width="8"  height="8"  fill={metal} />
      <rect x="38" y="38" width="4"  height="4"  fill={blade} />

      {/* Arms */}
      <rect x="8"  y="32" width="14" height="8"  fill={outfit} />
      <rect x="58" y="32" width="14" height="8"  fill={outfit} />
      {/* Gloves */}
      <rect x="6"  y="38" width="10" height="8"  fill={leather} />
      <rect x="64" y="38" width="10" height="8"  fill={leather} />

      {/* Belt */}
      <rect x="18" y="58" width="44" height="4"  fill={leather} />
      <rect x="37" y="57" width="6"  height="6"  fill={darkBlade} />
      {/* Pouches */}
      <rect x="20" y="57" width="8"  height="7"  fill="#3d2a1a" />
      <rect x="52" y="57" width="8"  height="7"  fill="#3d2a1a" />

      {/* Legs */}
      <rect x="22" y="62" width="14" height="20" fill={outfit} />
      <rect x="44" y="62" width="14" height="20" fill={outfit} />
      {/* Boot tops */}
      <rect x="20" y="74" width="18" height="12" fill={leather} />
      <rect x="42" y="74" width="18" height="12" fill={leather} />

      <ellipse cx="40" cy="90" rx="22" ry="4" fill="rgba(0,0,0,0.25)" />
    </svg>
  )
}

// ─── Character with background ────────────────────────────────────

function CharacterSVG({ config, tierColor }: { config: CharacterConfig; tierColor: string }) {
  const color = config.armorColor ?? tierColor

  return (
    <div className="relative" style={{ width: 105, height: 121 }}>
      {/* Background layer */}
      <svg
        viewBox="0 0 80 92"
        width={105}
        height={121}
        className="absolute inset-0"
        style={{ imageRendering: "pixelated" }}
      >
        <Background bg={config.background} />
      </svg>

      {/* Character on top */}
      <div className="absolute inset-0">
        {config.class === 'knight' && <PixelKnight color={color} />}
        {config.class === 'mage'   && <PixelMage   color={color} />}
        {config.class === 'ranger' && <PixelRanger color={color} />}
        {config.class === 'rogue'  && <PixelRogue  color={color} />}
      </div>
    </div>
  )
}

// ─── Main export (with XP ring) ───────────────────────────────────

interface PixelCharacterProps {
  config: CharacterConfig
  size?: number  // ring diameter, default 200
}

export function PixelCharacter({ config, size = 200 }: PixelCharacterProps) {
  const lp = useLevelProgress()
  const RING = size
  const STROKE = Math.round(size * 0.06)
  const RADIUS = (RING - STROKE) / 2
  const circ   = 2 * Math.PI * RADIUS
  const offset = circ * (1 - lp.xpPercent / 100)
  const color  = config.armorColor ?? lp.tierColor

  return (
    <div className="flex flex-col items-center gap-1.5">
      <div className="relative shrink-0" style={{ width: RING, height: RING }}>
        {/* XP ring */}
        <svg
          width={RING}
          height={RING}
          className="absolute inset-0"
          style={{ transform: "rotate(-90deg)" }}
        >
          <circle cx={RING/2} cy={RING/2} r={RADIUS} fill="none" stroke="currentColor" strokeWidth={STROKE} className="text-muted/20" />
          <circle
            cx={RING/2} cy={RING/2} r={RADIUS}
            fill="none"
            stroke={color}
            strokeWidth={STROKE}
            strokeDasharray={circ}
            strokeDashoffset={offset}
            strokeLinecap="round"
            style={{ transition: "stroke-dashoffset 0.8s ease", filter: `drop-shadow(0 0 8px ${color}90)` }}
          />
        </svg>

        {/* Character centered */}
        <div className="absolute inset-0 flex items-center justify-center">
          <CharacterSVG config={config} tierColor={lp.tierColor} />
        </div>

        {/* Level badge */}
        <div
          className="absolute bottom-5 left-1/2 -translate-x-1/2 flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold whitespace-nowrap"
          style={{ background: `${color}20`, border: `1.5px solid ${color}60`, color }}
        >
          Ур. {lp.level} · {lp.tierName}
        </div>
      </div>

      <p className="text-xs text-muted-foreground font-mono text-center -mt-2">
        {lp.xp.toLocaleString()} / {lp.xpToNext.toLocaleString()} XP
        {" → "}
        <span className="font-semibold" style={{ color }}>Уровень {lp.level + 1}</span>
      </p>
    </div>
  )
}
