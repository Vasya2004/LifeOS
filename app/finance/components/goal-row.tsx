"use client"

import { Progress } from "@/components/ui/progress"
import { formatCurrency } from "@/lib/utils/finance"
import { GOAL_CATEGORIES } from "@/lib/constants/finance"
import type { FinancialGoal } from "@/lib/types"

interface GoalRowProps {
  goal: FinancialGoal
}

export function GoalRow({ goal }: GoalRowProps) {
  const progress = Math.min(100, (goal.currentAmount / goal.targetAmount) * 100)
  const categoryInfo = GOAL_CATEGORIES.find(c => c.value === goal.category)
  
  return (
    <div className="flex items-center gap-4 p-3 rounded-lg border">
      <div className="p-2 rounded-lg bg-primary/10">
        {categoryInfo && <categoryInfo.icon className="size-5 text-primary" />}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium truncate">{goal.title}</p>
        <Progress value={progress} className="h-2 mt-1" />
      </div>
      <div className="text-right">
        <p className="font-bold">{formatCurrency(goal.currentAmount)}</p>
        <p className="text-xs text-muted-foreground">из {formatCurrency(goal.targetAmount)}</p>
      </div>
    </div>
  )
}
