"use client"

import * as React from "react"
import { usePrinciples, useCreatePrinciple, useUpdatePrinciple, useDeletePrinciple, type Principle } from "@/hooks/modules/use-principles"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Plus, Trash2, Pencil, Check, X } from "lucide-react"

const EMOJI_PRESETS = ["💎", "⚡", "🔥", "🌊", "🎯", "🛡️", "⚔️", "🌟", "🏔️", "🦅", "🌱", "💡", "🤝", "🧠", "❤️", "🚀"]

function PrincipleCard({
  principle,
  onUpdate,
  onDelete,
}: {
  principle: Principle
  onUpdate: (id: string, updates: Partial<Pick<Principle, 'text' | 'emoji'>>) => void
  onDelete: (id: string) => void
}) {
  const [editing, setEditing] = React.useState(false)
  const [text, setText] = React.useState(principle.text)
  const [emoji, setEmoji] = React.useState(principle.emoji)

  const save = () => {
    if (!text.trim()) return
    onUpdate(principle.id, { text: text.trim(), emoji })
    setEditing(false)
  }

  const cancel = () => {
    setText(principle.text)
    setEmoji(principle.emoji)
    setEditing(false)
  }

  if (editing) {
    return (
      <div className="rounded-xl border border-primary/30 bg-primary/5 p-4 space-y-3">
        <div className="flex gap-2 flex-wrap">
          {EMOJI_PRESETS.map(e => (
            <button
              key={e}
              onClick={() => setEmoji(e)}
              className={`text-lg rounded-lg p-1 transition-all ${emoji === e ? 'bg-primary/20 ring-1 ring-primary/50 scale-110' : 'hover:bg-accent'}`}
            >
              {e}
            </button>
          ))}
        </div>
        <Input
          value={text}
          onChange={e => setText(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') save(); if (e.key === 'Escape') cancel() }}
          className="bg-background"
          autoFocus
        />
        <div className="flex gap-2">
          <Button size="sm" onClick={save} className="flex-1"><Check className="size-3 mr-1" />Сохранить</Button>
          <Button size="sm" variant="ghost" onClick={cancel}><X className="size-3" /></Button>
        </div>
      </div>
    )
  }

  return (
    <div className="group flex items-start gap-4 rounded-xl border border-border bg-card p-4 hover:border-primary/30 transition-all">
      <span className="text-2xl shrink-0 mt-0.5">{principle.emoji}</span>
      <p className="flex-1 text-sm font-medium leading-relaxed">{principle.text}</p>
      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
        <Button size="icon" variant="ghost" className="size-7" onClick={() => setEditing(true)}>
          <Pencil className="size-3" />
        </Button>
        <Button size="icon" variant="ghost" className="size-7 text-destructive hover:text-destructive" onClick={() => onDelete(principle.id)}>
          <Trash2 className="size-3" />
        </Button>
      </div>
    </div>
  )
}

function AddPrincipleForm({ onCreate }: { onCreate: (p: Pick<Principle, 'text' | 'emoji'>) => void }) {
  const [open, setOpen] = React.useState(false)
  const [text, setText] = React.useState("")
  const [emoji, setEmoji] = React.useState("💎")

  const submit = () => {
    if (!text.trim()) return
    onCreate({ text: text.trim(), emoji })
    setText("")
    setEmoji("💎")
    setOpen(false)
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-3 w-full rounded-xl border border-dashed border-border hover:border-primary/40 hover:bg-primary/5 p-4 text-sm text-muted-foreground hover:text-foreground transition-all group"
      >
        <Plus className="size-4 group-hover:text-primary transition-colors" />
        Добавить принцип
      </button>
    )
  }

  return (
    <div className="rounded-xl border border-primary/30 bg-primary/5 p-4 space-y-3">
      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Выбери эмодзи</p>
      <div className="flex gap-2 flex-wrap">
        {EMOJI_PRESETS.map(e => (
          <button
            key={e}
            onClick={() => setEmoji(e)}
            className={`text-lg rounded-lg p-1 transition-all ${emoji === e ? 'bg-primary/20 ring-1 ring-primary/50 scale-110' : 'hover:bg-accent'}`}
          >
            {e}
          </button>
        ))}
      </div>
      <Input
        value={text}
        onChange={e => setText(e.target.value)}
        onKeyDown={e => { if (e.key === 'Enter') submit(); if (e.key === 'Escape') setOpen(false) }}
        placeholder="Мой принцип жизни..."
        className="bg-background"
        autoFocus
      />
      <div className="flex gap-2">
        <Button size="sm" onClick={submit} className="flex-1" disabled={!text.trim()}>
          <Plus className="size-3 mr-1" />Добавить
        </Button>
        <Button size="sm" variant="ghost" onClick={() => setOpen(false)}><X className="size-3" /></Button>
      </div>
    </div>
  )
}

export function PrinciplesTab() {
  const { data: principles } = usePrinciples()
  const create = useCreatePrinciple()
  const update = useUpdatePrinciple()
  const remove = useDeletePrinciple()

  const sorted = [...(principles ?? [])].sort((a, b) => a.order - b.order)

  return (
    <div className="space-y-4">
      {/* Header hint */}
      <div className="rounded-xl border border-border bg-muted/30 px-4 py-3 text-sm text-muted-foreground leading-relaxed">
        Принципы — это правила, по которым ты живёшь. Они помогают принимать решения и оставаться верным себе.
      </div>

      {/* Principles list */}
      <div className="space-y-2">
        {sorted.map(p => (
          <PrincipleCard key={p.id} principle={p} onUpdate={update} onDelete={remove} />
        ))}
      </div>

      {/* Add form */}
      <AddPrincipleForm onCreate={create} />

      {sorted.length === 0 && (
        <p className="text-center text-muted-foreground text-sm py-4">
          У тебя пока нет принципов. Добавь первый!
        </p>
      )}
    </div>
  )
}
