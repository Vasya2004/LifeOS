"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { Plus, Zap, Trophy, Star, Sparkles, Clock, ImageIcon } from "lucide-react"
import type { AchievementType, AchievementCategory, EmotionTag, CreateAchievementInput } from "@/lib/types/achievements"
import {
  ACHIEVEMENT_TYPE_CONFIG,
  ACHIEVEMENT_CATEGORY_CONFIG,
  EMOTION_TAG_CONFIG,
} from "@/lib/types/achievements"
import { cn } from "@/lib/utils"

interface AddAchievementDialogProps {
  onSubmit: (data: CreateAchievementInput) => void
  trigger?: React.ReactNode
}

export function AddAchievementDialog({ onSubmit, trigger }: AddAchievementDialogProps) {
  const [open, setOpen] = useState(false)
  const [step, setStep] = useState<"type" | "details">("type")
  const [selectedType, setSelectedType] = useState<AchievementType | null>(null)
  
  // Form state
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [category, setCategory] = useState<AchievementCategory | "">("")
  const [emotionTag, setEmotionTag] = useState<EmotionTag | "">("")
  const [lessonLearned, setLessonLearned] = useState("")
  const [achievementDate, setAchievementDate] = useState(new Date().toISOString().split("T")[0])
  const [isTimeCapsule, setIsTimeCapsule] = useState(false)
  const [unlockDate, setUnlockDate] = useState("")
  const [isFavorite, setIsFavorite] = useState(false)

  const handleTypeSelect = (type: AchievementType) => {
    setSelectedType(type)
    setStep("details")
  }

  const handleSubmit = () => {
    if (!selectedType || !title) return
    
    onSubmit({
      title,
      description,
      category: category || undefined,
      type: selectedType,
      achievementDate,
      emotionTag: emotionTag || undefined,
      lessonLearned: lessonLearned || undefined,
      isTimeCapsule,
      unlockDate: isTimeCapsule ? unlockDate : undefined,
      isFavorite,
    })
    
    // Reset form
    setTitle("")
    setDescription("")
    setCategory("")
    setEmotionTag("")
    setLessonLearned("")
    setAchievementDate(new Date().toISOString().split("T")[0])
    setIsTimeCapsule(false)
    setUnlockDate("")
    setIsFavorite(false)
    setSelectedType(null)
    setStep("type")
    setOpen(false)
  }

  const canSubmit = title.trim() !== ""

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button>
            <Plus className="mr-2 size-4" />
            Новое достижение
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {step === "type" ? "Выберите тип достижения" : "Детали достижения"}
          </DialogTitle>
        </DialogHeader>

        {step === "type" ? (
          <div className="grid grid-cols-2 gap-4 py-4">
            {(Object.keys(ACHIEVEMENT_TYPE_CONFIG) as AchievementType[]).map((type) => {
              const config = ACHIEVEMENT_TYPE_CONFIG[type]
              const Icon = type === "micro" ? Zap : type === "macro" ? Trophy : type === "breakthrough" ? Star : Sparkles
              
              return (
                <button
                  key={type}
                  onClick={() => handleTypeSelect(type)}
                  className={cn(
                    "flex flex-col items-center p-6 rounded-xl border-2 transition-all",
                    "hover:border-primary/50 hover:bg-muted/50"
                  )}
                  style={{ borderColor: `${config.color}30` }}
                >
                  <div 
                    className="flex size-16 items-center justify-center rounded-full mb-3"
                    style={{ backgroundColor: `${config.color}20`, color: config.color }}
                  >
                    <Icon className="size-8" />
                  </div>
                  <h3 className="font-semibold text-lg">{config.labelRu}</h3>
                  <p className="text-sm text-muted-foreground text-center mt-1">
                    {config.description}
                  </p>
                </button>
              )
            })}
          </div>
        ) : (
          <div className="space-y-6 py-4">
            {/* Selected Type Badge */}
            {selectedType && (
              <div 
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm"
                style={{ 
                  backgroundColor: `${ACHIEVEMENT_TYPE_CONFIG[selectedType].color}15`,
                  color: ACHIEVEMENT_TYPE_CONFIG[selectedType].color
                }}
              >
                {(() => {
                  const Icon = selectedType === "micro" ? Zap : selectedType === "macro" ? Trophy : selectedType === "breakthrough" ? Star : Sparkles
                  return <Icon className="size-4" />
                })()}
                {ACHIEVEMENT_TYPE_CONFIG[selectedType].labelRu}
                <button 
                  onClick={() => setStep("type")}
                  className="ml-1 text-xs underline opacity-70 hover:opacity-100"
                >
                  Изменить
                </button>
              </div>
            )}

            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="title">Название *</Label>
              <Input
                id="title"
                placeholder="Что вы достигли?"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Описание</Label>
              <Textarea
                id="description"
                placeholder="Расскажите подробнее о вашем достижении..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
              />
            </div>

            {/* Category & Date */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Категория</Label>
                <Select value={category} onValueChange={(v) => setCategory(v as AchievementCategory)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Выберите..." />
                  </SelectTrigger>
                  <SelectContent>
                    {(Object.keys(ACHIEVEMENT_CATEGORY_CONFIG) as AchievementCategory[]).map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {ACHIEVEMENT_CATEGORY_CONFIG[cat].labelRu}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="date">Дата</Label>
                <Input
                  id="date"
                  type="date"
                  value={achievementDate}
                  onChange={(e) => setAchievementDate(e.target.value)}
                />
              </div>
            </div>

            {/* Emotion */}
            <div className="space-y-2">
              <Label>Эмоция</Label>
              <div className="flex flex-wrap gap-2">
                {(Object.keys(EMOTION_TAG_CONFIG) as EmotionTag[]).map((emotion) => (
                  <button
                    key={emotion}
                    onClick={() => setEmotionTag(emotionTag === emotion ? "" : emotion)}
                    className={cn(
                      "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm transition-colors",
                      emotionTag === emotion 
                        ? "bg-primary text-primary-foreground" 
                        : "bg-muted hover:bg-muted/80"
                    )}
                  >
                    <span>{EMOTION_TAG_CONFIG[emotion].emoji}</span>
                    <span>{EMOTION_TAG_CONFIG[emotion].labelRu}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Lesson Learned */}
            <div className="space-y-2">
              <Label htmlFor="lesson">Чему я научился?</Label>
              <Textarea
                id="lesson"
                placeholder="Какой урок вы извлекли из этого опыта?"
                value={lessonLearned}
                onChange={(e) => setLessonLearned(e.target.value)}
                rows={2}
              />
            </div>

            {/* Time Capsule */}
            <div className="space-y-4 rounded-lg border p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock className="size-4 text-muted-foreground" />
                  <Label htmlFor="time-capsule" className="cursor-pointer">
                    Капсула времени
                  </Label>
                </div>
                <Switch
                  id="time-capsule"
                  checked={isTimeCapsule}
                  onCheckedChange={setIsTimeCapsule}
                />
              </div>
              
              {isTimeCapsule && (
                <div className="space-y-2">
                  <Label htmlFor="unlock-date">Дата открытия</Label>
                  <Input
                    id="unlock-date"
                    type="datetime-local"
                    value={unlockDate}
                    onChange={(e) => setUnlockDate(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    Это достижение будет скрыто до указанной даты
                  </p>
                </div>
              )}
            </div>

            {/* Favorite */}
            <div className="flex items-center justify-between rounded-lg border p-4">
              <div className="flex items-center gap-2">
                <span className="text-sm">Добавить в избранное</span>
              </div>
              <Switch
                checked={isFavorite}
                onCheckedChange={setIsFavorite}
              />
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setStep("type")}>
                Назад
              </Button>
              <Button onClick={handleSubmit} disabled={!canSubmit}>
                Сохранить достижение
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
