"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Trash2 } from "lucide-react"
import { formatCurrency } from "@/lib/utils/finance"
import { GOAL_CATEGORIES } from "@/lib/constants/finance"
import type { FinancialGoal } from "@/lib/types"

interface GoalCardProps {
  goal: FinancialGoal
  onContribute: (amount: number) => void
  onDelete: () => void
}

export function GoalCard({ goal, onContribute, onDelete }: GoalCardProps) {
  const progress = Math.min(100, (goal.currentAmount / goal.targetAmount) * 100)
  const categoryInfo = GOAL_CATEGORIES.find(c => c.value === goal.category)
  const [contributeAmount, setContributeAmount] = useState(1000)
  
  return (
    <Card className="overflow-hidden">
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            {categoryInfo && <categoryInfo.icon className="size-5 text-primary" />}
            <div>
              <h3 className="font-semibold">{goal.title}</h3>
              {goal.deadline && (
                <p className="text-xs text-muted-foreground">
                  Дедлайн: {new Date(goal.deadline).toLocaleDateString('ru-RU')}
                </p>
              )}
            </div>
          </div>
          <Button variant="ghost" size="icon" className="size-8" onClick={onDelete}>
            <Trash2 className="size-4 text-destructive" />
          </Button>
        </div>
        
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Прогресс</span>
            <span className="font-medium">{progress.toFixed(0)}%</span>
          </div>
          <Progress value={progress} className="h-2" />
          <div className="flex justify-between text-sm">
            <span>{formatCurrency(goal.currentAmount)}</span>
            <span className="text-muted-foreground">{formatCurrency(goal.targetAmount)}</span>
          </div>
        </div>
        
        {!goal.isCompleted && (
          <div className="flex gap-2 mt-4 pt-3 border-t">
            <Input
              type="number"
              value={contributeAmount}
              onChange={(e) => setContributeAmount(Number(e.target.value))}
              className="w-24"
              min={1}
            />
            <Button onClick={() => onContribute(contributeAmount)} className="flex-1">
              Внести
            </Button>
          </div>
        )}
        
        {goal.isCompleted && (
          <div className="mt-4 pt-3 border-t">
            <Badge className="bg-success text-success-foreground">Цель достигнута! 🎉</Badge>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
