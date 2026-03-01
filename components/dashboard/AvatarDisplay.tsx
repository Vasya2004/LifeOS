"use client"

// ============================================
// AVATAR DISPLAY — CSS/SVG placeholder avatars per tier
// TODO: swap SVG with real illustration from public/avatars/tier-{1-7}.png
//       <Image src={`/avatars/tier-${tierIndex}.png`} width={120} height={120} alt={tierName} />
// ============================================

import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"
import type { LevelTierIndex } from "@/lib/types/dashboard.types"
import {
  Star,
  Sword,
  Zap,
  Shield,
  Flame,
  Crown,
  Trophy,
} from "lucide-react"

interface AvatarDisplayProps {
  tierIndex: LevelTierIndex
  tierName: string
  level: number
  size?: number
  showLevelUpAnimation?: boolean
}

const TIER_STYLES: Record<
  LevelTierIndex,
  { bg: string; border: string; ring: string; icon: React.ComponentType<{ className?: string }>; glow: string }
> = {
  1: {
    bg: "from-slate-500 to-slate-700",
    border: "border-slate-400/50",
    ring: "ring-slate-400/30",
    icon: Star,
    glow: "",
  },
  2: {
    bg: "from-[#8b5cf6] to-[#6d28d9]",
    border: "border-[#a78bfa]/50",
    ring: "ring-[#a78bfa]/30",
    icon: Sword,
    glow: "shadow-[#8b5cf6]/20",
  },
  3: {
    bg: "from-purple-500 to-purple-700",
    border: "border-purple-400/50",
    ring: "ring-purple-400/30",
    icon: Zap,
    glow: "shadow-purple-500/25",
  },
  4: {
    bg: "from-orange-500 to-orange-700",
    border: "border-orange-400/50",
    ring: "ring-orange-400/30",
    icon: Shield,
    glow: "shadow-orange-500/25",
  },
  5: {
    bg: "from-red-500 to-red-700",
    border: "border-red-400/50",
    ring: "ring-red-400/30",
    icon: Flame,
    glow: "shadow-red-500/30",
  },
  6: {
    bg: "from-yellow-400 to-amber-600",
    border: "border-yellow-400/60",
    ring: "ring-yellow-400/40",
    icon: Crown,
    glow: "shadow-yellow-500/35",
  },
  7: {
    bg: "from-violet-500 via-pink-500 to-amber-500",
    border: "border-violet-400/60",
    ring: "ring-violet-400/40",
    icon: Trophy,
    glow: "shadow-violet-500/40",
  },
}

export function AvatarDisplay({
  tierIndex,
  tierName,
  level,
  size = 120,
  showLevelUpAnimation = false,
}: AvatarDisplayProps) {
  const style = TIER_STYLES[tierIndex]
  const Icon = style.icon

  return (
    <div className="relative" style={{ width: size, height: size }}>
      {/* Glow ring */}
      <div
        className={cn(
          "absolute inset-0 rounded-full ring-4 blur-sm",
          style.ring,
          style.glow && `shadow-2xl ${style.glow}`
        )}
      />

      {/* Avatar circle */}
      <div
        className={cn(
          "relative w-full h-full rounded-full bg-gradient-to-br border-2 flex items-center justify-center overflow-hidden",
          style.bg,
          style.border
        )}
      >
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-10">
          <svg width="100%" height="100%" viewBox="0 0 120 120">
            <defs>
              <pattern id="hexPattern" x="0" y="0" width="20" height="17.32" patternUnits="userSpaceOnUse">
                <polygon
                  points="10,0 20,5.77 20,11.54 10,17.32 0,11.54 0,5.77"
                  fill="none"
                  stroke="white"
                  strokeWidth="0.5"
                />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#hexPattern)" />
          </svg>
        </div>

        {/* Character silhouette */}
        <div className="relative z-10 flex flex-col items-center gap-1">
          <Icon className={cn("text-white drop-shadow-lg", size >= 100 ? "size-10" : "size-7")} />
          <span className="text-white/90 text-xs font-bold tracking-wider uppercase drop-shadow">
            {size >= 100 ? tierName : `L${level}`}
          </span>
        </div>

        {/* Tier index badge */}
        <div className="absolute bottom-1 right-1 w-5 h-5 rounded-full bg-black/40 flex items-center justify-center">
          <span className="text-white text-[10px] font-bold">{level}</span>
        </div>
      </div>

      {/* Level-up animation overlay */}
      <AnimatePresence>
        {showLevelUpAnimation && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1.3, opacity: 1 }}
            exit={{ scale: 2, opacity: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="absolute inset-0 rounded-full bg-white/30 ring-4 ring-white/60"
          />
        )}
      </AnimatePresence>
    </div>
  )
}
