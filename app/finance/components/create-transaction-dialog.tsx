"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { SelectField, NumberField, FormError, SubmitButton } from "@/components/form-field"
import { addTransaction } from "@/lib/store"
import { FINANCE_CATEGORIES } from "@/lib/types"
import { toast } from "sonner"
import { Dialog } from "./dialog"
import type { Account } from "@/lib/types"

interface CreateTransactionDialogProps {
  accounts: Account[]
  onClose: () => void
  onSuccess: () => void
}

export function CreateTransactionDialog({ accounts, onClose, onSuccess }: CreateTransactionDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  
  const [type, setType] = useState<"income" | "expense">("expense")
  const [accountId, setAccountId] = useState("")
  const [amount, setAmount] = useState(0)
  const [category, setCategory] = useState("")
  const [description, setDescription] = useState("")
  const [date, setDate] = useState(new Date().toISOString().split("T")[0])

  const categories = type === "income" ? FINANCE_CATEGORIES.income : FINANCE_CATEGORIES.expense

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitError(null)
    
    if (!accountId) {
      setSubmitError("Выберите счёт")
      return
    }
    if (!category) {
      setSubmitError("Выберите категорию")
      return
    }
    if (amount <= 0) {
      setSubmitError("Введите сумму")
      return
    }
    
    setIsSubmitting(true)
    try {
      addTransaction({
        accountId,
        type,
        amount,
        category,
        description,
        transactionDate: date,
      })
      const xpReward = type === "expense" ? 5 : 10
      toast.success(`Транзакция добавлена! +${xpReward} XP`)
      onSuccess()
    } catch (error) {
      setSubmitError("Ошибка при создании транзакции")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog onClose={onClose} title="Новая транзакция">
      <form onSubmit={handleSubmit} className="space-y-4">
        <FormError error={submitError} />
        
        <div className="flex gap-2">
          <Button
            type="button"
            variant={type === "expense" ? "default" : "outline"}
            className="flex-1"
            onClick={() => setType("expense")}
          >
            Расход
          </Button>
          <Button
            type="button"
            variant={type === "income" ? "default" : "outline"}
            className="flex-1"
            onClick={() => setType("income")}
          >
            Доход
          </Button>
        </div>

        <SelectField
          label="Счёт"
          name="accountId"
          value={accountId}
          onValueChange={setAccountId}
          options={accounts.map(a => ({ value: a.id, label: a.name }))}
          placeholder="Выберите счёт"
          required
        />

        <NumberField
          label="Сумма"
          name="amount"
          value={amount}
          onChange={setAmount}
          min={1}
          required
        />

        <SelectField
          label="Категория"
          name="category"
          value={category}
          onValueChange={setCategory}
          options={categories.map(c => ({ value: c.id, label: c.name }))}
          placeholder="Выберите категорию"
          required
        />

        <div className="space-y-2">
          <label className="text-sm font-medium">Описание (опционально)</label>
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="например, Продукты на неделю"
            className="w-full px-3 py-2 border rounded-md bg-background"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Дата *</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full px-3 py-2 border rounded-md bg-background"
          />
        </div>

        <div className="flex gap-2 pt-2">
          <Button type="button" variant="outline" className="flex-1" onClick={onClose}>
            Отмена
          </Button>
          <SubmitButton isSubmitting={isSubmitting} className="flex-1">
            Добавить
          </SubmitButton>
        </div>
      </form>
    </Dialog>
  )
}
