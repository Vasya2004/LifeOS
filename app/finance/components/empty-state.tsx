"use client"

import { Card } from "@/components/ui/card"

interface EmptyStateProps {
  icon: React.ComponentType<{ className?: string }>
  title: string
  description: string
  action: React.ReactNode
}

export function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  return (
    <Card className="p-12 text-center">
      <Icon className="size-12 mx-auto mb-4 text-muted-foreground/50" />
      <h3 className="text-lg font-medium mb-2">{title}</h3>
      <p className="text-muted-foreground mb-4 max-w-sm mx-auto">{description}</p>
      {action}
    </Card>
  )
}
