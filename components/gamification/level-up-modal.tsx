"use client"

import { motion, AnimatePresence } from "framer-motion"
import { Sparkles, Star, ChevronUp } from "lucide-react"
import type { LevelUpEvent } from "@/hooks/useLevelUp"

interface LevelUpModalProps {
  event: LevelUpEvent | null
  onDismiss: () => void
}

export function LevelUpModal({ event, onDismiss }: LevelUpModalProps) {
  return (
    <AnimatePresence>
      {event && (
        <>
          {/* Backdrop */}
          <motion.div
            key="level-up-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm"
            onClick={onDismiss}
          />

          {/* Modal */}
          <motion.div
            key="level-up-modal"
            initial={{ opacity: 0, scale: 0.6, y: 40 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            transition={{ type: "spring", stiffness: 300, damping: 22 }}
            className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none"
          >
            <div
              className="pointer-events-auto relative w-80 rounded-2xl border border-border bg-card p-8 text-center shadow-2xl overflow-hidden"
              style={{ boxShadow: `0 0 60px ${event.tierColor}33` }}
            >
              {/* Glow ring behind content */}
              <div
                className="absolute inset-0 rounded-2xl opacity-10"
                style={{ background: `radial-gradient(circle at 50% 50%, ${event.tierColor}, transparent 70%)` }}
              />

              {/* Floating stars */}
              <FloatingStar style={{ top: "12%", left: "10%", animationDelay: "0s" }} />
              <FloatingStar style={{ top: "8%", right: "14%", animationDelay: "0.3s" }} />
              <FloatingStar style={{ bottom: "14%", left: "16%", animationDelay: "0.6s" }} />
              <FloatingStar style={{ bottom: "10%", right: "10%", animationDelay: "0.15s" }} />

              {/* Level badge */}
              <motion.div
                initial={{ scale: 0, rotate: -20 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 0.15, type: "spring", stiffness: 260, damping: 18 }}
                className="relative mx-auto mb-5 flex size-24 items-center justify-center rounded-full border-2"
                style={{
                  background: `${event.tierColor}18`,
                  borderColor: `${event.tierColor}60`,
                  boxShadow: `0 0 24px ${event.tierColor}40`,
                }}
              >
                <span className="text-4xl font-extrabold font-mono" style={{ color: event.tierColor }}>
                  {event.newLevel}
                </span>
                <motion.div
                  animate={{ y: [0, -4, 0] }}
                  transition={{ repeat: Infinity, duration: 1.4, ease: "easeInOut" }}
                  className="absolute -top-3 -right-1 flex size-7 items-center justify-center rounded-full bg-[#7c3aed] shadow-lg"
                >
                  <ChevronUp className="size-4 text-white stroke-[3]" />
                </motion.div>
              </motion.div>

              {/* Text */}
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 }}
                className="space-y-1.5"
              >
                <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
                  Новый уровень!
                </p>
                <h2 className="text-2xl font-extrabold font-heading leading-tight">
                  Уровень {event.newLevel}
                </h2>

                {event.tierChanged && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.4 }}
                    className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold mt-2"
                    style={{
                      background: `${event.tierColor}22`,
                      color: event.tierColor,
                      border: `1px solid ${event.tierColor}44`,
                    }}
                  >
                    <Sparkles className="size-3" />
                    Новый ранг: {event.tierName}
                  </motion.div>
                )}

                {!event.tierChanged && (
                  <p className="text-sm text-muted-foreground mt-1">
                    Ты продолжаешь расти. Отличная работа!
                  </p>
                )}
              </motion.div>

              {/* Dismiss button */}
              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                onClick={onDismiss}
                className="mt-6 w-full rounded-xl py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90 active:scale-95"
                style={{ background: event.tierColor }}
              >
                Продолжить
              </motion.button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

function FloatingStar({ style }: { style: React.CSSProperties }) {
  return (
    <motion.div
      className="absolute size-4 text-yellow-400 opacity-60"
      style={style}
      animate={{ y: [0, -6, 0], opacity: [0.4, 0.8, 0.4] }}
      transition={{
        duration: 2,
        repeat: Infinity,
        ease: "easeInOut",
        delay: parseFloat((style.animationDelay as string) ?? "0"),
      }}
    >
      <Star className="size-full fill-yellow-400" />
    </motion.div>
  )
}
