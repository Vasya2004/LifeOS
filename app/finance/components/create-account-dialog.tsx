"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { SelectField, NumberField, FormError, SubmitButton } from "@/components/form-field"
import { addAccount } from "@/lib/store"
import { toast } from "sonner"
import { Dialog } from "./dialog"
import { ACCOUNT_TYPES } from "@/lib/constants/finance"
import type { AccountType } from "@/lib/types"

interface CreateAccountDialogProps {
  onClose: () => void
  onSuccess: () => void
}

export function CreateAccountDialog({ onClose, onSuccess }: CreateAccountDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  
  const [name, setName] = useState("")
  const [type, setType] = useState<AccountType>("cash")
  const [balance, setBalance] = useState(0)
  const [currency, setCurrency] = useState("RUB")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitError(null)
    
    if (!name.trim()) {
      setSubmitError("Название обязательно")
      return
    }
    
    setIsSubmitting(true)
    try {
      addAccount({
        name,
        type,
        balance,
        currency,
        isActive: true,
      })
      toast.success("Счёт создан! +20 XP")
      onSuccess()
    } catch (error) {
      setSubmitError("Ошибка при создании счёта")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog onClose={onClose} title="Новый счёт">
      <form onSubmit={handleSubmit} className="space-y-4">
        <FormError error={submitError} />
        <div className="space-y-2">
          <Label>Название *</Label>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="например, Основной счёт"
          />
        </div>
        <SelectField
          label="Тип"
          name="type"
          value={type}
          onValueChange={(v) => setType(v as AccountType)}
          options={ACCOUNT_TYPES.map(t => ({ value: t.value, label: t.label }))}
        />
        <NumberField
          label="Начальный баланс"
          name="balance"
          value={balance}
          onChange={setBalance}
          min={0}
        />
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
