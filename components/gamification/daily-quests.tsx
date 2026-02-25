"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { CheckCircle2, Circle, Sword, Zap, Trophy, Coins } from "lucide-react"
import { useQuests } from "@/hooks"
import { cn } from "@/lib/utils"

export function DailyQuests() {
    const { quests, isLoading } = useQuests()

    if (isLoading || quests.length === 0) return null

    const allCompleted = quests.every(q => q.isCompleted)

    return (
        <Card className={cn(
            "overflow-hidden transition-all duration-300",
            allCompleted ? "border-success/50 bg-success/5 shadow-lg shadow-success/10" : ""
        )}>
            <CardHeader className="pb-3 flex flex-row items-center justify-between">
                <div className="space-y-1">
                    <CardTitle className="text-lg flex items-center gap-2">
                        <Sword className="size-5 text-primary" />
                        Ежедневные квесты
                    </CardTitle>
                    <CardDescription>
                        Завершите все задания, чтобы получить бонус
                    </CardDescription>
                </div>
                {allCompleted && (
                    <div className="flex items-center gap-2 text-success animate-in fade-in zoom-in">
                        <Trophy className="size-5" />
                        <span className="text-sm font-bold uppercase tracking-wider">Все выполнено!</span>
                    </div>
                )}
            </CardHeader>
            <CardContent className="grid gap-4">
                {quests.map((quest) => (
                    <div
                        key={quest.id}
                        className={cn(
                            "group relative p-3 rounded-lg border transition-all hover:bg-muted/50",
                            quest.isCompleted ? "bg-success/5 border-success/20" : ""
                        )}
                    >
                        <div className="flex items-start gap-3">
                            <div className="mt-1">
                                {quest.isCompleted ? (
                                    <CheckCircle2 className="size-5 text-success fill-success/10" />
                                ) : (
                                    <Circle className="size-5 text-muted-foreground group-hover:text-primary transition-colors" />
                                )}
                            </div>
                            <div className="flex-1 space-y-2">
                                <div className="flex items-center justify-between">
                                    <h4 className={cn(
                                        "font-semibold text-sm transition-colors",
                                        quest.isCompleted ? "text-success line-through opacity-70" : ""
                                    )}>
                                        {quest.title}
                                    </h4>
                                    <div className="flex items-center gap-2">
                                        <div className="flex items-center gap-1 text-[10px] font-bold text-warning-foreground bg-warning/20 px-1.5 py-0.5 rounded font-mono">
                                            <Zap className="size-3" />
                                            {quest.rewardXp} XP
                                        </div>
                                        <div className="flex items-center gap-1 text-[10px] font-bold text-chart-4 bg-chart-4/10 px-1.5 py-0.5 rounded font-mono">
                                            <Coins className="size-3" />
                                            {quest.rewardCoins}
                                        </div>
                                    </div>
                                </div>
                                {!quest.isCompleted && (
                                    <div className="space-y-1">
                                        <div className="flex justify-between text-[10px] text-muted-foreground uppercase tracking-tight font-mono">
                                            <span>Прогресс</span>
                                            <span>{quest.currentValue} / {quest.targetValue} {quest.unit}</span>
                                        </div>
                                        <Progress
                                            value={(quest.currentValue / quest.targetValue) * 100}
                                            className="h-1.5"
                                        />
                                    </div>
                                )}
                                {quest.isCompleted && (
                                    <p className="text-xs text-success/70 font-medium">Награда получена!</p>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </CardContent>
        </Card>
    )
}
