"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Trash2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { formatCurrency } from "@/lib/utils/finance"
import { ACCOUNT_TYPES } from "@/lib/constants/finance"
import type { Account } from "@/lib/types"

interface AccountCardProps {
  account: Account
  onDelete: () => void
}

export function AccountCard({ account, onDelete }: AccountCardProps) {
  const typeInfo = ACCOUNT_TYPES.find(t => t.value === account.type)
  const isDebt = account.type === "debt"
  
  return (
    <Card className="overflow-hidden group">
      <div className="h-1.5" style={{ backgroundColor: typeInfo?.color || "#6366f1" }} />
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center gap-2">
            {typeInfo && <typeInfo.icon className="size-4 text-muted-foreground" />}
            <span className="font-medium">{account.name}</span>
          </div>
          <Button 
            variant="ghost" 
            size="icon" 
            className="size-8 opacity-0 group-hover:opacity-100 transition-opacity" 
            onClick={onDelete}
          >
            <Trash2 className="size-4 text-destructive" />
          </Button>
        </div>
        <p className={cn("text-2xl font-bold", isDebt ? "text-destructive" : "text-foreground")}>
          {isDebt ? "-" : ""}{formatCurrency(account.balance)}
        </p>
        <p className="text-xs text-muted-foreground">{typeInfo?.label}</p>
      </CardContent>
    </Card>
  )
}
