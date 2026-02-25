"use client"

import { Suspense, lazy } from "react"
import { AppShell } from "@/components/app-shell"
import { Card, CardContent } from "@/components/ui/card"
import { Loader2 } from "lucide-react"

// Lazy load the heavy health content
const HealthContent = lazy(() => import("./health-content"))

function HealthLoading() {
  return (
    <AppShell>
      <div className="flex flex-col gap-6 p-4 md:p-6 lg:p-8">
        <div className="flex items-center justify-between">
          <div>
            <div className="h-8 w-32 bg-muted rounded animate-pulse" />
            <div className="h-4 w-48 bg-muted rounded mt-2 animate-pulse" />
          </div>
        </div>
        <div className="grid grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <div className="h-32 bg-muted rounded animate-pulse" />
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="flex items-center justify-center py-12">
          <Loader2 className="size-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    </AppShell>
  )
}

export default function HealthPage() {
  return (
    <Suspense fallback={<HealthLoading />}>
      <HealthContent />
    </Suspense>
  )
}
