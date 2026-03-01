"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
    Lightbulb,
    TrendingUp,
    Zap,
    Target,
    AlertTriangle,
    Sparkles,
    Info,
    RotateCcw
} from "lucide-react"
import { cn } from "@/lib/utils"
import type { AIInsight } from "@/lib/api/ai-mentor"

const iconsMap: Record<string, any> = {
    'lightbulb': Lightbulb,
    'trending-up': TrendingUp,
    'zap': Zap,
    'target': Target,
    'alert-triangle': AlertTriangle,
    'sparkles': Sparkles,
    'info': Info,
    'rotate-ccw': RotateCcw,
}

const typeStyles = {
    positive: "border-green-500/20 bg-green-500/5 text-green-500 icon-green-500",
    warning: "border-yellow-500/20 bg-yellow-500/5 text-yellow-500 icon-yellow-500",
    tip: "border-[#8b5cf6]/20 bg-[#8b5cf6]/5 text-[#8b5cf6]",
}

interface AiInsightsCardProps {
    insights: AIInsight[]
}

export function AiInsightsCard({ insights }: AiInsightsCardProps) {
    if (insights.length === 0) return null

    return (
        <Card className="border-primary/20 bg-primary/5">
            <CardHeader className="flex flex-row items-center gap-3 pb-2">
                <div className="p-2 rounded-lg bg-primary/10">
                    <Sparkles className="size-5 text-primary" />
                </div>
                <div>
                    <CardTitle className="text-lg">AI Наставник</CardTitle>
                    <CardDescription>Персональные рекомендации на основе ваших данных</CardDescription>
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="grid gap-3">
                    {insights.map((insight) => {
                        const Icon = iconsMap[insight.icon] || Info
                        const style = typeStyles[insight.type]

                        return (
                            <div
                                key={insight.id}
                                className={cn(
                                    "flex gap-4 p-4 rounded-xl border transition-all hover:bg-muted/50",
                                    style.split(" ").slice(0, 2).join(" ")
                                )}
                            >
                                <div className={cn("p-2 rounded-lg h-fit", style.split(" ").slice(2).join(" "))}>
                                    <Icon className="size-5" />
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-center justify-between mb-1">
                                        <h4 className="font-semibold text-sm">{insight.title}</h4>
                                        <Badge variant="outline" className="text-[10px] uppercase tracking-wider">
                                            {insight.category === 'productivity' ? 'Эффективность' :
                                                insight.category === 'energy' ? 'Энергия' :
                                                    insight.category === 'balance' ? 'Баланс' : 'Развитие'}
                                        </Badge>
                                    </div>
                                    <p className="text-xs text-muted-foreground leading-relaxed">
                                        {insight.content}
                                    </p>
                                </div>
                            </div>
                        )
                    })}
                </div>
            </CardContent>
        </Card>
    )
}
