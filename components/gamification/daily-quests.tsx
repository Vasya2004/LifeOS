"use client"

import { AnimatePresence, motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { CheckCircle2, Circle, Sword, Zap, Trophy, Coins } from "lucide-react"
import { useQuests } from "@/hooks"
import { cn } from "@/lib/utils"

const listVariants = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.07,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, x: -12 },
  show:   { opacity: 1, x: 0, transition: { type: "spring" as const, stiffness: 260, damping: 22 } },
}

export function DailyQuests() {
  const { quests, isLoading } = useQuests()

  if (isLoading || quests.length === 0) return null

  const allCompleted = quests.every(q => q.isCompleted)
  const completedCount = quests.filter(q => q.isCompleted).length

  return (
    <Card className={cn(
      "overflow-hidden transition-colors duration-500",
      allCompleted ? "border-emerald-500/40 bg-emerald-500/5 shadow-lg shadow-emerald-500/10" : ""
    )}>
      <CardHeader className="pb-3 flex flex-row items-center justify-between">
        <div className="space-y-0.5">
          <CardTitle className="text-base flex items-center gap-2 font-heading">
            <Sword className="size-4 text-[#8b5cf6]" />
            Ежедневные квесты
          </CardTitle>
          <CardDescription className="text-xs">
            {completedCount}/{quests.length} выполнено
          </CardDescription>
        </div>

        <AnimatePresence>
          {allCompleted && (
            <motion.div
              key="all-done-badge"
              initial={{ opacity: 0, scale: 0.7, x: 10 }}
              animate={{ opacity: 1, scale: 1, x: 0 }}
              exit={{ opacity: 0, scale: 0.7 }}
              transition={{ type: "spring", stiffness: 280, damping: 20 }}
              className="flex items-center gap-1.5 text-emerald-500"
            >
              <Trophy className="size-4" />
              <span className="text-xs font-bold uppercase tracking-wider">Готово!</span>
            </motion.div>
          )}
        </AnimatePresence>
      </CardHeader>

      <CardContent className="pt-0">
        <motion.div
          className="grid gap-2"
          variants={listVariants}
          initial="hidden"
          animate="show"
        >
          {quests.map((quest) => (
            <motion.div
              key={quest.id}
              variants={itemVariants}
              layout
              className={cn(
                "group relative p-3 rounded-lg border transition-colors",
                quest.isCompleted
                  ? "bg-emerald-500/5 border-emerald-500/20"
                  : "bg-slate-900/30 border-transparent hover:border-slate-700 hover:bg-slate-800/30"
              )}
            >
              <div className="flex items-start gap-3">
                {/* Check icon */}
                <div className="mt-0.5 shrink-0">
                  <AnimatePresence mode="wait">
                    {quest.isCompleted ? (
                      <motion.div
                        key="checked"
                        initial={{ scale: 0, rotate: -30 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{ type: "spring", stiffness: 300, damping: 18 }}
                      >
                        <CheckCircle2 className="size-5 text-emerald-500 fill-emerald-500/20" />
                      </motion.div>
                    ) : (
                      <motion.div key="unchecked" initial={{ scale: 1 }} animate={{ scale: 1 }}>
                        <Circle className="size-5 text-muted-foreground group-hover:text-indigo-400 transition-colors" />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <div className="flex-1 min-w-0 space-y-1.5">
                  <div className="flex items-center justify-between gap-2">
                    <h4 className={cn(
                      "text-sm font-medium leading-tight transition-colors",
                      quest.isCompleted ? "line-through text-muted-foreground" : ""
                    )}>
                      {quest.title}
                    </h4>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <span className="flex items-center gap-0.5 text-[10px] font-bold text-amber-400 bg-amber-400/10 px-1.5 py-0.5 rounded font-mono">
                        <Zap className="size-2.5" />
                        {quest.rewardXp} XP
                      </span>
                      <span className="flex items-center gap-0.5 text-[10px] font-bold text-yellow-500 bg-yellow-500/10 px-1.5 py-0.5 rounded font-mono">
                        <Coins className="size-2.5" />
                        {quest.rewardCoins}
                      </span>
                    </div>
                  </div>

                  <AnimatePresence>
                    {!quest.isCompleted && (
                      <motion.div
                        key="progress"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.25 }}
                        className="space-y-1 overflow-hidden"
                      >
                        <div className="flex justify-between text-[10px] text-muted-foreground font-mono">
                          <span>Прогресс</span>
                          <span>{quest.currentValue} / {quest.targetValue} {quest.unit}</span>
                        </div>
                        <Progress
                          value={(quest.currentValue / quest.targetValue) * 100}
                          className="h-1"
                        />
                      </motion.div>
                    )}
                    {quest.isCompleted && (
                      <motion.p
                        key="reward-msg"
                        initial={{ opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-[11px] text-emerald-500/80 font-medium"
                      >
                        Награда получена!
                      </motion.p>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* All-completed celebration banner */}
        <AnimatePresence>
          {allCompleted && (
            <motion.div
              key="all-complete-banner"
              initial={{ opacity: 0, y: 8, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 4 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 240, damping: 20 }}
              className="mt-3 flex items-center justify-center gap-2 rounded-lg bg-emerald-500/10 border border-emerald-500/25 py-2.5 text-sm font-semibold text-emerald-500"
            >
              <Trophy className="size-4" />
              Все квесты дня выполнены!
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  )
}
