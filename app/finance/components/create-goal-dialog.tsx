"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { SelectField, NumberField, FormError, SubmitButton } from "@/components/form-field"
import { addFinancialGoal } from "@/lib/store"
import { toast } from "sonner"
import { Dialog } from "./dialog"
import { GOAL_CATEGORIES } from "@/lib/constants/finance"
import type { FinancialGoal } from "@/lib/types"

interface CreateGoalDialogProps {
  onClose: () => void
  onSuccess: () => void
}

export function CreateGoalDialog({ onClose, onSuccess }: CreateGoalDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  
  const [title, setTitle] = useState("")
  const [category, setCategory] = useState<FinancialGoal['category']>("savings")
  const [targetAmount, setTargetAmount] = useState(100000)
  const [deadline, setDeadline] = useState("")
  const [description, setDescription] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitError(null)
    
    if (!title.trim()) {
      setSubmitError("Название обязательно")
      return
    }
    if (targetAmount <= 0) {
      setSubmitError("Введите целевую сумму")
      return
    }
    
    setIsSubmitting(true)
    try {
      addFinancialGoal({
        title,
        description,
        targetAmount,
        deadline: deadline || undefined,
        category,
      })
      toast.success("Финансовая цель создана! +50 XP")
      onSuccess()
    } catch (error) {
      setSubmitError("Ошибка при создании цели")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog onClose={onClose} title="Новая финансовая цель">
      <form onSubmit={handleSubmit} className="space-y-4">
        <FormError error={submitError} />
        
        <div className="space-y-2">
          <label className="text-sm font-medium">Название цели *</label>
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="например, Купить машину"
          />
        </div>

        <SelectField
          label="Тип цели"
          name="category"
          value={category}
          onValueChange={(v) => setCategory(v as FinancialGoal['category'])}
          options={GOAL_CATEGORIES.map(c => ({ value: c.value, label: c.label }))}
        />

        <NumberField
          label="Целевая сумма"
          name="targetAmount"
          value={targetAmount}
          onChange={setTargetAmount}
          min={1}
          required
        />

        <div className="space-y-2">
          <label className="text-sm font-medium">Дедлайн (опционально)</label>
          <input
            type="date"
            value={deadline}
            onChange={(e) => setDeadline(e.target.value)}
            className="w-full px-3 py-2 border rounded-md bg-background"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Описание (опционально)</label>
          <Input
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Подробнее о цели..."
          />
        </div>

        <div className="flex gap-2 pt-2">
          <Button type="button" variant="outline" className="flex-1" onClick={onClose}>
            Отмена
          </Button>
          <SubmitButton isSubmitting={isSubmitting} className="flex-1">
            Создать
          </SubmitButton>
        </div>
      </form>
    </Dialog>
  )
}
