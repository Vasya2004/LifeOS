"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { SKILL_CATEGORIES } from "@/lib/types"
import { addSkill } from "@/lib/store"
import { mutate } from "swr"
import { KEYS } from "@/lib/store"
import { Plus, Sparkles } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

const SKILL_ICONS = [
  { emoji: "💻", name: "Компьютер" },
  { emoji: "🎨", name: "Творчество" },
  { emoji: "🏋️", name: "Спорт" },
  { emoji: "🧠", name: "Мозг" },
  { emoji: "🗣️", name: "Коммуникация" },
  { emoji: "💼", name: "Работа" },
  { emoji: "🌐", name: "Языки" },
  { emoji: "🎵", name: "Музыка" },
  { emoji: "📚", name: "Учёба" },
  { emoji: "⚡", name: "Энергия" },
  { emoji: "🎯", name: "Цель" },
  { emoji: "🔥", name: "Огонь" },
  { emoji: "⭐", name: "Звезда" },
  { emoji: "🚀", name: "Ракета" },
  { emoji: "💡", name: "Идея" },
  { emoji: "🔧", name: "Инструмент" },
]

export function AddSkillDialog() {
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category: "",
    icon: "💻",
    color: "#3b82f6",
  })

  const handleSubmit = async () => {
    if (!formData.name || !formData.category) return

    setIsLoading(true)
    
    try {
      addSkill({
        name: formData.name,
        description: formData.description,
        category: formData.category,
        icon: formData.icon,
        color: formData.color,
      })
      
      // Refresh skills data
      mutate(KEYS.skills)
      
      setOpen(false)
      setStep(1)
      setFormData({
        name: "",
        description: "",
        category: "",
        icon: "💻",
        color: "#3b82f6",
      })
    } catch (error) {
      console.error("Failed to create skill:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const selectedCategory = SKILL_CATEGORIES.find(c => c.id === formData.category)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Новый навык
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            Создать новый навык
          </DialogTitle>
          <DialogDescription>
            Определи навык, который хочешь прокачать. Каждый уровень требует всё больше опыта.
          </DialogDescription>
        </DialogHeader>

        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4 py-4"
            >
              <div className="space-y-2">
                <Label htmlFor="name">Название навыка</Label>
                <Input
                  id="name"
                  placeholder="Например: JavaScript, Английский, Гитара..."
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Описание (опционально)</Label>
                <Textarea
                  id="description"
                  placeholder="Что ты хочешь достичь? Как будешь тренироваться?"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Категория</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => {
                    setFormData({ ...formData, category: value })
                    const cat = SKILL_CATEGORIES.find(c => c.id === value)
                    if (cat) {
                      setFormData(prev => ({ ...prev, category: value, color: cat.color }))
                    }
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Выбери категорию" />
                  </SelectTrigger>
                  <SelectContent>
                    {SKILL_CATEGORIES.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>
                        <div className="flex items-center gap-2">
                          <span>{cat.name}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4 py-4"
            >
              <div className="space-y-2">
                <Label>Выбери иконку</Label>
                <div className="grid grid-cols-8 gap-2">
                  {SKILL_ICONS.map((icon) => (
                    <button
                      key={icon.emoji}
                      onClick={() => setFormData({ ...formData, icon: icon.emoji })}
                      className={`w-10 h-10 rounded-lg text-xl flex items-center justify-center transition-all ${
                        formData.icon === icon.emoji
                          ? "bg-primary text-primary-foreground ring-2 ring-primary ring-offset-2"
                          : "bg-muted hover:bg-muted/80"
                      }`}
                      title={icon.name}
                    >
                      {icon.emoji}
                    </button>
                  ))}
                </div>
              </div>

              {/* Preview */}
              <div className="space-y-2">
                <Label>Превью карточки</Label>
                <div className="p-4 rounded-lg border-2 border-dashed border-gray-600 bg-gray-500/5">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-lg bg-gray-500/20 flex items-center justify-center text-2xl">
                      {formData.icon}
                    </div>
                    <div>
                      <p className="font-medium">{formData.name || "Название навыка"}</p>
                      <p className="text-sm text-gray-400">Новичок • Уровень 1</p>
                    </div>
                  </div>
                  <div className="mt-3">
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-muted-foreground">XP прогресс</span>
                      <span className="text-gray-400">0 / 3 XP</span>
                    </div>
                    <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                      <div className="h-full w-0 bg-gray-500" />
                    </div>
                  </div>
                </div>
              </div>

              <div className="text-sm text-muted-foreground bg-muted p-3 rounded-lg">
                <p className="font-medium mb-1">💡 Как прокачивать:</p>
                <ul className="space-y-1 text-xs">
                  <li>• Теория (чтение, видео) = 1-3 XP</li>
                  <li>• Практика (упражнения) = 2-6 XP</li>
                  <li>• Результат (проект, реальное применение) = 3-9 XP</li>
                </ul>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <DialogFooter className="gap-2">
          {step === 2 && (
            <Button variant="outline" onClick={() => setStep(1)}>
              Назад
            </Button>
          )}
          {step === 1 ? (
            <Button 
              onClick={() => setStep(2)}
              disabled={!formData.name || !formData.category}
            >
              Далее
            </Button>
          ) : (
            <Button 
              onClick={handleSubmit}
              disabled={isLoading}
            >
              {isLoading ? "Создание..." : "Создать навык"}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
