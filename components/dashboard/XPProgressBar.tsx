"use client"

import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

interface XPProgressBarProps {
  xp: number
  xpToNext: number
  xpPercent: number
  tierColor: string
  tierGradient: string
  className?: string
}

export function XPProgressBar({
  xp,
  xpToNext,
  xpPercent,
  tierGradient,
  className,
}: XPProgressBarProps) {
  return (
    <div className={cn("space-y-1", className)}>
      <div className="flex justify-between items-center">
        <span className="text-[11px] text-muted-foreground font-medium uppercase tracking-wider">
          XP
        </span>
        <span className="text-[11px] text-muted-foreground font-mono">
          {xp.toLocaleString()} / {xpToNext.toLocaleString()}
        </span>
      </div>

      {/* Track */}
      <div className="relative h-2.5 w-full rounded-full bg-white/10 overflow-hidden">
        {/* Fill */}
        <motion.div
          className={cn("absolute left-0 top-0 h-full rounded-full bg-gradient-to-r", tierGradient)}
          initial={{ width: 0 }}
          animate={{ width: `${xpPercent}%` }}
          transition={{ duration: 1, ease: "easeOut", delay: 0.3 }}
        />
        {/* Shimmer */}
        <motion.div
          className="absolute top-0 h-full w-8 bg-gradient-to-r from-transparent via-white/30 to-transparent"
          initial={{ left: "-10%" }}
          animate={{ left: "110%" }}
          transition={{ duration: 2, ease: "linear", repeat: Infinity, repeatDelay: 3 }}
        />
      </div>

      <div className="flex justify-end">
        <span className="text-[11px] font-bold text-primary">{xpPercent}%</span>
      </div>
    </div>
  )
}
