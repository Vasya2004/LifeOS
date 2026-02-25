"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useAIAdvice } from "@/hooks/useAIAdvice"
import { FadeIn } from "@/components/animations"
import { motion, AnimatePresence } from "framer-motion"
import { Sparkles, X, Check, ArrowRight, Zap, AlertTriangle, Lightbulb, TrendingUp } from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"
import type { AIAdvice, AIAdviceType } from "@/lib/types/dashboard.types"

const TYPE_CONFIG: Record<
  AIAdviceType,
  { icon: React.ComponentType<{ className?: string }>; cardClass: string; iconClass: string; badgeLabel: string }
> = {
  urgent: {
    icon: AlertTriangle,
    cardClass: "border-red-500/20 bg-red-500/5",
    iconClass: "text-red-500",
    badgeLabel: "Срочно",
  },
  warning: {
    icon: AlertTriangle,
    cardClass: "border-yellow-500/20 bg-yellow-500/5",
    iconClass: "text-yellow-500",
    badgeLabel: "Внимание",
  },
  tip: {
    icon: Lightbulb,
    cardClass: "border-blue-500/20 bg-blue-500/5",
    iconClass: "text-blue-500",
    badgeLabel: "Совет",
  },
  positive: {
    icon: TrendingUp,
    cardClass: "border-green-500/20 bg-green-500/5",
    iconClass: "text-green-500",
    badgeLabel: "Отлично",
  },
}

function AdviceCard({
  advice,
  onDismiss,
}: {
  advice: AIAdvice
  onDismiss: (id: string) => void
}) {
  const config = TYPE_CONFIG[advice.type]
  const Icon = config.icon

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: -10, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, x: 20, scale: 0.95 }}
      transition={{ duration: 0.25 }}
      className={cn("rounded-xl border p-4 flex gap-3", config.cardClass)}
    >
      {/* Icon */}
      <div className="shrink-0 mt-0.5">
        <Icon className={cn("size-4", config.iconClass)} />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 space-y-1.5">
        <div className="flex items-start justify-between gap-2">
          <h4 className="text-sm font-semibold leading-tight">{advice.title}</h4>
          <Badge variant="outline" className="text-[10px] shrink-0">
            {config.badgeLabel}
          </Badge>
        </div>
        <p className="text-xs text-muted-foreground leading-relaxed">{advice.message}</p>

        {/* Action row */}
        <div className="flex items-center gap-2 pt-1">
          {advice.actionHref && advice.actionLabel && (
            <Link href={advice.actionHref}>
              <Button size="sm" variant="outline" className="h-7 text-xs gap-1 px-3">
                {advice.actionLabel}
                <ArrowRight className="size-3" />
              </Button>
            </Link>
          )}
          {advice.dismissible && (
            <Button
              size="sm"
              variant="ghost"
              className="h-7 text-xs text-muted-foreground hover:text-foreground gap-1 px-2 ml-auto"
              onClick={() => onDismiss(advice.id)}
            >
              <X className="size-3" />
              Позже
            </Button>
          )}
          {!advice.dismissible && (
            <Button
              size="sm"
              variant="ghost"
              className="h-7 text-xs gap-1 px-2 ml-auto text-primary"
              onClick={() => onDismiss(advice.id)}
            >
              <Check className="size-3" />
              Понятно
            </Button>
          )}
        </div>
      </div>
    </motion.div>
  )
}

export function AIAdvisor() {
  const adviceList = useAIAdvice()
  const [dismissed, setDismissed] = useState<Set<string>>(new Set())

  const visible = adviceList.filter((a) => !dismissed.has(a.id))

  const handleDismiss = (id: string) => {
    setDismissed((prev) => new Set([...prev, id]))
  }

  if (visible.length === 0) return null

  return (
    <FadeIn delay={0.3}>
      <Card className="border-primary/15">
        <CardHeader className="pb-3 flex flex-row items-center gap-3">
          <div className="p-1.5 rounded-lg bg-primary/10">
            <Sparkles className="size-4 text-primary" />
          </div>
          <div>
            <CardTitle className="text-base">AI Наставник</CardTitle>
            <p className="text-xs text-muted-foreground">
              Персональные рекомендации на основе ваших данных
            </p>
          </div>
          <div className="ml-auto">
            <Zap className="size-3.5 text-muted-foreground/40" />
          </div>
        </CardHeader>

        <CardContent className="space-y-3">
          <AnimatePresence mode="popLayout">
            {visible.map((advice) => (
              <AdviceCard key={advice.id} advice={advice} onDismiss={handleDismiss} />
            ))}
          </AnimatePresence>
        </CardContent>
      </Card>
    </FadeIn>
  )
}
