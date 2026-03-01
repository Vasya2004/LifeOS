"use client"

import * as React from "react"
import { useValues, useCreateValue, useUpdateValue, useDeleteValue } from "@/hooks"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Plus, Trash2, Pencil, Check, X } from "lucide-react"
import { cn } from "@/lib/utils"
import type { CoreValue } from "@/lib/types"

const IMPORTANCE_LABELS = ['', 'Малая', 'Низкая', 'Средняя', 'Высокая', 'Критичная'] as const
const VALUE_COLORS = ['#8b5cf6', '#6366f1', '#ec4899', '#f59e0b', '#10b981', '#3b82f6', '#ef4444', '#f97316']

function ImportancePips({ value, onChange }: { value: number; onChange?: (v: number) => void }) {
  return (
    <div className="flex gap-1">
      {[1,2,3,4,5].map(i => (
        <button
          key={i}
          onClick={() => onChange?.(i as 1|2|3|4|5)}
          disabled={!onChange}
          className={cn(
            "size-3 rounded-full transition-all",
            i <= value ? "opacity-100 scale-110" : "opacity-25",
            onChange && "cursor-pointer hover:opacity-75"
          )}
          style={{ background: i <= value ? '#8b5cf6' : '#64748b' }}
          title={IMPORTANCE_LABELS[i]}
        />
      ))}
    </div>
  )
}

function ValueCard({
  value,
  onUpdate,
  onDelete,
}: {
  value: CoreValue
  onUpdate: (id: string, u: Partial<CoreValue>) => void
  onDelete: (id: string) => void
}) {
  const [editing, setEditing] = React.useState(false)
  const [name, setName] = React.useState(value.name)
  const [desc, setDesc] = React.useState(value.description)
  const [importance, setImportance] = React.useState<1|2|3|4|5>(value.importance)
  const [color, setColor] = React.useState(value.color)

  const save = () => {
    onUpdate(value.id, { name: name.trim(), description: desc.trim(), importance, color })
    setEditing(false)
  }

  if (editing) {
    return (
      <div className="rounded-xl border p-4 space-y-3" style={{ borderColor: `${color}50`, background: `${color}08` }}>
        <div className="flex gap-2 flex-wrap">
          {VALUE_COLORS.map(c => (
            <button
              key={c}
              onClick={() => setColor(c)}
              className={cn("size-6 rounded-full transition-all", color === c && "ring-2 ring-offset-2 ring-offset-background scale-110")}
              style={{ background: c, ringColor: c }}
            />
          ))}
        </div>
        <Input value={name} onChange={e => setName(e.target.value)} placeholder="Название ценности" className="bg-background" autoFocus />
        <Textarea value={desc} onChange={e => setDesc(e.target.value)} placeholder="Описание..." rows={2} className="bg-background resize-none" />
        <div className="flex items-center gap-3">
          <span className="text-xs text-muted-foreground">Важность:</span>
          <ImportancePips value={importance} onChange={v => setImportance(v as 1|2|3|4|5)} />
        </div>
        <div className="flex gap-2">
          <Button size="sm" onClick={save} className="flex-1"><Check className="size-3 mr-1" />Сохранить</Button>
          <Button size="sm" variant="ghost" onClick={() => setEditing(false)}><X className="size-3" /></Button>
        </div>
      </div>
    )
  }

  return (
    <div
      className="group relative rounded-xl border p-4 hover:shadow-md transition-all"
      style={{ borderColor: `${value.color}40`, background: `${value.color}0a` }}
    >
      <div className="flex items-start gap-3">
        <div className="size-3 rounded-full shrink-0 mt-1.5" style={{ background: value.color, boxShadow: `0 0 8px ${value.color}80` }} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <p className="font-semibold text-sm">{value.name}</p>
            <ImportancePips value={value.importance} />
          </div>
          {value.description && <p className="text-xs text-muted-foreground leading-relaxed">{value.description}</p>}
        </div>
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button size="icon" variant="ghost" className="size-7" onClick={() => setEditing(true)}><Pencil className="size-3" /></Button>
          <Button size="icon" variant="ghost" className="size-7 text-destructive hover:text-destructive" onClick={() => onDelete(value.id)}><Trash2 className="size-3" /></Button>
        </div>
      </div>
    </div>
  )
}

function AddValueForm({ onCreate }: { onCreate: (v: Omit<CoreValue, 'id'>) => void }) {
  const [open, setOpen] = React.useState(false)
  const [name, setName] = React.useState("")
  const [desc, setDesc] = React.useState("")
  const [importance, setImportance] = React.useState<1|2|3|4|5>(3)
  const [color, setColor] = React.useState(VALUE_COLORS[0])

  const submit = () => {
    if (!name.trim()) return
    onCreate({ name: name.trim(), description: desc.trim(), importance, color })
    setName(""); setDesc(""); setImportance(3); setColor(VALUE_COLORS[0]); setOpen(false)
  }

  if (!open) return (
    <button
      onClick={() => setOpen(true)}
      className="flex items-center gap-3 w-full rounded-xl border border-dashed border-border hover:border-primary/40 hover:bg-primary/5 p-4 text-sm text-muted-foreground hover:text-foreground transition-all group"
    >
      <Plus className="size-4 group-hover:text-primary transition-colors" />
      Добавить ценность
    </button>
  )

  return (
    <div className="rounded-xl border border-primary/30 bg-primary/5 p-4 space-y-3">
      <div className="flex gap-2 flex-wrap">
        {VALUE_COLORS.map(c => (
          <button key={c} onClick={() => setColor(c)} className={cn("size-6 rounded-full transition-all", color === c && "ring-2 ring-offset-2 ring-offset-background scale-110")} style={{ background: c }} />
        ))}
      </div>
      <Input value={name} onChange={e => setName(e.target.value)} placeholder="Название ценности" className="bg-background" autoFocus />
      <Textarea value={desc} onChange={e => setDesc(e.target.value)} placeholder="Что это значит для тебя?" rows={2} className="bg-background resize-none" />
      <div className="flex items-center gap-3">
        <span className="text-xs text-muted-foreground">Важность:</span>
        <ImportancePips value={importance} onChange={v => setImportance(v as 1|2|3|4|5)} />
        <span className="text-xs text-muted-foreground">{IMPORTANCE_LABELS[importance]}</span>
      </div>
      <div className="flex gap-2">
        <Button size="sm" onClick={submit} className="flex-1" disabled={!name.trim()}><Plus className="size-3 mr-1" />Добавить</Button>
        <Button size="sm" variant="ghost" onClick={() => setOpen(false)}><X className="size-3" /></Button>
      </div>
    </div>
  )
}

export function ValuesTab() {
  const { data: values } = useValues()
  const create = useCreateValue()
  const update = useUpdateValue()
  const remove = useDeleteValue()

  const sorted = [...(values ?? [])].sort((a, b) => b.importance - a.importance)

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-border bg-muted/30 px-4 py-3 text-sm text-muted-foreground leading-relaxed">
        Ценности — это то, что важно для тебя на глубинном уровне. Они формируют твои решения и определяют качество жизни.
      </div>

      <div className="space-y-2">
        {sorted.map(v => (
          <ValueCard key={v.id} value={v} onUpdate={update} onDelete={remove} />
        ))}
      </div>

      <AddValueForm onCreate={create} />

      {sorted.length === 0 && (
        <p className="text-center text-muted-foreground text-sm py-4">
          Добавь свои главные ценности жизни.
        </p>
      )}
    </div>
  )
}
