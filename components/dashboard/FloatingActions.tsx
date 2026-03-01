"use client"

import { useState } from "react"
import Link from "next/link"
import { AnimatePresence, motion } from "framer-motion"
import { Plus, CheckSquare, Target, Repeat } from "lucide-react"
import { cn } from "@/lib/utils"

const ACTIONS = [
  { label: "Задача", href: "/tasks", icon: CheckSquare, color: "bg-[#8b5cf6] hover:bg-[#7c3aed]" },
  { label: "Цель",   href: "/goals",  icon: Target,      color: "bg-[#a78bfa] hover:bg-[#8b5cf6]" },
  { label: "Привычка", href: "/habits", icon: Repeat,    color: "bg-emerald-500 hover:bg-emerald-400" },
]

export function FloatingActions() {
  const [open, setOpen] = useState(false)

  return (
    // Bottom-right, above mobile nav (pb-20 on mobile = 80px nav height)
    <div className="fixed bottom-6 right-4 md:bottom-6 md:right-6 z-50 flex flex-col items-end gap-2 pb-16 md:pb-0">
      {/* Action buttons — slide up when open */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.15 }}
            className="flex flex-col items-end gap-2"
          >
            {ACTIONS.map((action, i) => {
              const Icon = action.icon
              return (
                <motion.div
                  key={action.href}
                  initial={{ opacity: 0, x: 8, scale: 0.9 }}
                  animate={{ opacity: 1, x: 0, scale: 1 }}
                  exit={{ opacity: 0, x: 8, scale: 0.9 }}
                  transition={{ delay: (ACTIONS.length - 1 - i) * 0.05, duration: 0.15 }}
                >
                  <Link
                    href={action.href}
                    onClick={() => setOpen(false)}
                    className={cn(
                      "flex items-center gap-2.5 rounded-full py-2 pl-3 pr-4 text-sm font-medium text-white shadow-lg transition-all",
                      action.color
                    )}
                  >
                    <Icon className="size-4" />
                    {action.label}
                  </Link>
                </motion.div>
              )
            })}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main "+" toggle button */}
      <button
        onClick={() => setOpen(v => !v)}
        className={cn(
          "flex size-13 items-center justify-center rounded-full shadow-lg transition-all duration-200",
          "bg-[#8b5cf6] hover:bg-[#7c3aed] active:scale-95 text-white",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8b5cf6] focus-visible:ring-offset-2",
          open && "rotate-45"
        )}
        style={{ width: 52, height: 52 }}
        aria-label={open ? "Закрыть меню" : "Быстрое добавление"}
        aria-expanded={open}
      >
        <motion.div
          animate={{ rotate: open ? 45 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <Plus className="size-6" />
        </motion.div>
      </button>
    </div>
  )
}
