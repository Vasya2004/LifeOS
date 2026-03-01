"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ArrowUpRight, ArrowDownRight, Trash2, Minus } from "lucide-react"
import { cn } from "@/lib/utils"
import { formatCurrency } from "@/lib/utils/finance"
import { CATEGORY_ICONS } from "@/lib/constants/finance"
import { FINANCE_CATEGORIES } from "@/lib/types"
import type { Account, Transaction } from "@/lib/types"

interface TransactionRowProps {
  transaction: Transaction
  account?: Account
  showDelete?: boolean
  onDelete?: () => void
}

export function TransactionRow({ transaction, account, showDelete, onDelete }: TransactionRowProps) {
  const isIncome = transaction.type === "income"
  const categoryInfo = [...FINANCE_CATEGORIES.income, ...FINANCE_CATEGORIES.expense]
    .find(c => c.id === transaction.category)
  const CategoryIcon = categoryInfo ? CATEGORY_ICONS[categoryInfo.id] || Minus : Minus
  
  return (
    <div className="flex items-center gap-3 p-3 rounded-lg border hover:border-primary/50 transition-colors">
      <div className={cn(
        "p-2 rounded-lg",
        isIncome ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive"
      )}>
        {isIncome ? <ArrowUpRight className="size-4" /> : <ArrowDownRight className="size-4" />}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-medium truncate">
            {transaction.description || categoryInfo?.name || transaction.category}
          </span>
          <Badge variant="outline" className="text-xs">
            <CategoryIcon className="size-3 mr-1" />
            {categoryInfo?.name || transaction.category}
          </Badge>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span>{account?.name || "Неизвестный счёт"}</span>
          <span>•</span>
          <span>{new Date(transaction.transactionDate).toLocaleDateString('ru-RU')}</span>
        </div>
      </div>
      <div className={cn("font-bold", isIncome ? "text-success" : "text-destructive")}>
        {isIncome ? "+" : "-"}{formatCurrency(transaction.amount)}
      </div>
      {showDelete && onDelete && (
        <Button variant="ghost" size="icon" className="size-8" onClick={onDelete}>
          <Trash2 className="size-4 text-destructive" />
        </Button>
      )}
    </div>
  )
}
