"use client"

import { use } from "react"
import { useState } from "react"
import Link from "next/link"
import { AppShell } from "@/components/app-shell"
import { useSkill } from "@/hooks/use-data"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { FadeIn, ScaleIn } from "@/components/animations"
import { getSkillTier, SKILL_ACTIVITY_XP, type SkillActivityType } from "@/lib/types"
import { addSkillActivity } from "@/lib/store"
import { mutate } from "swr"
import { KEYS } from "@/lib/store"
import { 
  ArrowLeft, 
  Trophy, 
  Crown, 
  Flame, 
  Clock, 
  BookOpen, 
  Dumbbell, 
  Target,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Sparkles,
  Award
} from "lucide-react"
import { cn } from "@/lib/utils"
import { motion, AnimatePresence } from "framer-motion"

// XP Gain Animation Component
function XpGainAnimation({ amount, onComplete }: { amount: number; onComplete: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 0, scale: 0.5 }}
      animate={{ opacity: 1, y: -100, scale: 1.2 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 1.5, ease: "easeOut" }}
      onAnimationComplete={onComplete}
      className="fixed pointer-events-none z-50"
      style={{ left: "50%", top: "50%", transform: "translate(-50%, -50%)" }}
    >
      <div className="flex flex-col items-center">
        <motion.div
          animate={{ 
            scale: [1, 1.2, 1],
            rotate: [0, 10, -10, 0]
          }}
          transition={{ duration: 0.5, repeat: 2 }}
        >
          <Sparkles className="w-16 h-16 text-yellow-400" />
        </motion.div>
        <span className="text-3xl font-bold text-yellow-400">+{amount} XP</span>
      </div>
    </motion.div>
  )
}

// Level Up Animation
function LevelUpAnimation({ level, onComplete }: { level: number; onComplete: () => void }) {
  const tier = getSkillTier(level)
  
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.5 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 1.5 }}
      transition={{ duration: 0.5 }}
      onAnimationComplete={onComplete}
      className="fixed inset-0 flex items-center justify-center z-50 bg-black/80"
    >
      <motion.div
        initial={{ y: 50 }}
        animate={{ y: 0 }}
        transition={{ type: "spring", damping: 10 }}
        className="text-center"
      >
        <motion.div
          animate={{ 
            scale: [1, 1.2, 1],
            rotate: [0, 360]
          }}
          transition={{ duration: 1 }}
          className={cn(
            "w-32 h-32 mx-auto mb-6 rounded-full flex items-center justify-center",
            tier.bgColor,
            tier.borderColor,
            "border-4"
          )}
        >
          <Trophy className={cn("w-16 h-16", tier.color)} />
        </motion.div>
        <h2 className="text-4xl font-bold mb-2">Уровень повышен!</h2>
        <p className={cn("text-2xl font-semibold", tier.color)}>
          {tier.title} • Уровень {level}
        </p>
        {tier.requiresCertificate && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-yellow-400/20 to-orange-500/20 border border-yellow-500/50"
          >
            <Award className="w-5 h-5 text-yellow-500" />
            <span className="text-yellow-500 font-medium">Сертификат получен!</span>
          </motion.div>
        )}
      </motion.div>
    </motion.div>
  )
}

// Activity Type Badge
function ActivityTypeBadge({ type }: { type: SkillActivityType }) {
  const config = {
    theory: { icon: BookOpen, label: "Теория", color: "bg-blue-500/20 text-blue-500" },
    practice: { icon: Dumbbell, label: "Практика", color: "bg-green-500/20 text-green-500" },
    result: { icon: Target, label: "Результат", color: "bg-purple-500/20 text-purple-500" },
  }
  const { icon: Icon, label, color } = config[type]
  
  return (
    <Badge className={cn("gap-1", color)}>
      <Icon className="w-3 h-3" />
      {label}
    </Badge>
  )
}

// Certificate Card
function CertificateCard({ level, issuedAt }: { level: number; issuedAt: string }) {
  const tier = getSkillTier(level)
  const isLegend = level >= 10
  
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className={cn(
        "relative p-6 rounded-xl border-2 overflow-hidden",
        tier.borderColor,
        isLegend 
          ? "bg-gradient-to-br from-red-500/10 via-orange-500/10 to-yellow-500/10"
          : "bg-gradient-to-br from-orange-500/10 to-yellow-500/10"
      )}
    >
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-32 h-32 opacity-10">
        {isLegend ? <Flame className="w-full h-full" /> : <Trophy className="w-full h-full" />}
      </div>
      
      <div className="relative flex items-center gap-4">
        <div className={cn(
          "w-16 h-16 rounded-full flex items-center justify-center",
          tier.bgColor
        )}>
          {isLegend ? (
            <Crown className={cn("w-8 h-8", tier.color)} />
          ) : (
            <Trophy className={cn("w-8 h-8", tier.color)} />
          )}
        </div>
        <div>
          <p className="text-sm text-muted-foreground">Сертификат</p>
          <p className={cn("text-xl font-bold", tier.color)}>
            {isLegend ? "Легенда" : "Эксперт"} • Уровень {level}
          </p>
          <p className="text-xs text-muted-foreground">
            Получен {new Date(issuedAt).toLocaleDateString('ru-RU')}
          </p>
        </div>
      </div>
    </motion.div>
  )
}

export default function SkillDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const { data: skill, error } = useSkill(id)
  const [showXpAnimation, setShowXpAnimation] = useState(false)
  const [showLevelUp, setShowLevelUp] = useState(false)
  const [xpGained, setXpGained] = useState(0)
  const [newLevel, setNewLevel] = useState(0)
  
  // Activity form state
  const [activityForm, setActivityForm] = useState({
    description: "",
    activityType: "practice" as SkillActivityType,
    xpAmount: 2,
  })

  if (error) {
    return (
      <AppShell>
        <div className="p-8 text-center">
          <AlertTriangle className="w-16 h-16 mx-auto mb-4 text-destructive" />
          <h1 className="text-xl font-bold mb-2">Ошибка загрузки</h1>
          <p className="text-muted-foreground">Не удалось загрузить навык</p>
        </div>
      </AppShell>
    )
  }

  if (!skill) {
    return (
      <AppShell>
        <div className="p-8 text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted animate-pulse" />
          <p className="text-muted-foreground">Загрузка...</p>
        </div>
      </AppShell>
    )
  }

  const tier = getSkillTier(skill.currentLevel)
  const progressPercent = Math.min(100, (skill.currentXp / skill.xpNeeded) * 100)

  const handleAddActivity = () => {
    if (!activityForm.description) return

    const multiplier = SKILL_ACTIVITY_XP[activityForm.activityType]
    const totalXp = activityForm.xpAmount * multiplier

    const result = addSkillActivity(skill.id, {
      description: activityForm.description,
      xpAmount: activityForm.xpAmount,
      activityType: activityForm.activityType,
      proofRequired: false,
    })

    if (result.success) {
      setXpGained(totalXp)
      setShowXpAnimation(true)
      
      if (result.leveledUp && result.newLevel) {
        setNewLevel(result.newLevel)
        setTimeout(() => setShowLevelUp(true), 1500)
      }

      // Refresh data
      mutate(`${KEYS.skills}/${id}`)
      mutate(KEYS.skills)

      // Reset form
      setActivityForm({
        description: "",
        activityType: "practice",
        xpAmount: 2,
      })
    }
  }

  return (
    <AppShell>
      {/* Animations */}
      <AnimatePresence>
        {showXpAnimation && (
          <XpGainAnimation 
            amount={xpGained} 
            onComplete={() => setShowXpAnimation(false)} 
          />
        )}
        {showLevelUp && (
          <LevelUpAnimation 
            level={newLevel} 
            onComplete={() => setShowLevelUp(false)} 
          />
        )}
      </AnimatePresence>

      <div className="flex flex-col gap-6 p-4 md:p-6 lg:p-8">
        {/* Back Button */}
        <FadeIn>
          <Link href="/skills">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Назад к навыкам
            </Button>
          </Link>
        </FadeIn>

        {/* Skill Header */}
        <FadeIn delay={0.1}>
          <div className={cn(
            "relative p-6 rounded-xl border-2 overflow-hidden",
            tier.borderColor
          )}>
            {/* Tier Background Effect */}
            {tier.glowEffect === 'gold' && (
              <div className="absolute inset-0 bg-gradient-to-br from-yellow-400/10 via-orange-500/10 to-yellow-600/10" />
            )}
            {tier.glowEffect === 'fire' && (
              <>
                <div className="absolute inset-0 bg-gradient-to-br from-red-500/10 via-orange-500/10 to-yellow-500/10" />
                <motion.div
                  className="absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-red-500/20 to-transparent"
                  animate={{ opacity: [0.3, 0.6, 0.3] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
              </>
            )}

            <div className="relative flex flex-col md:flex-row md:items-center gap-6">
              <motion.div 
                className={cn(
                  "w-20 h-20 rounded-2xl flex items-center justify-center text-4xl shadow-xl",
                  tier.bgColor
                )}
                whileHover={{ rotate: [0, -10, 10, 0], scale: 1.05 }}
              >
                {skill.icon}
              </motion.div>

              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <Badge variant="outline" className={cn(tier.color, tier.borderColor)}>
                    {tier.title}
                  </Badge>
                  {skill.isDecaying && (
                    <Badge variant="destructive" className="gap-1">
                      <TrendingUp className="w-3 h-3 rotate-180" />
                      Декей
                    </Badge>
                  )}
                </div>
                <h1 className="text-3xl font-bold mb-2">{skill.name}</h1>
                {skill.description && (
                  <p className="text-muted-foreground">{skill.description}</p>
                )}
              </div>

              <div className="flex items-center gap-4">
                <div className={cn(
                  "w-24 h-24 rounded-full flex flex-col items-center justify-center border-4",
                  tier.borderColor,
                  tier.bgColor
                )}>
                  <span className="text-xs text-muted-foreground uppercase tracking-wider">Level</span>
                  <span className={cn("text-4xl font-bold", tier.color)}>
                    {skill.currentLevel}
                  </span>
                </div>
              </div>
            </div>

            {/* XP Progress */}
            <div className="relative mt-6 pt-6 border-t border-border/50">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-muted-foreground">XP до следующего уровня</span>
                <span className={cn("font-medium", tier.color)}>
                  {skill.currentXp} / {skill.xpNeeded} XP
                </span>
              </div>
              <div className="relative">
                <Progress value={progressPercent} className="h-3" />
                {tier.glowEffect === 'fire' && (
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-red-500/0 via-orange-500/50 to-red-500/0"
                    animate={{ x: ["-100%", "100%"] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                )}
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Всего заработано: {skill.totalXpEarned} XP
              </p>
            </div>
          </div>
        </FadeIn>

        {/* Content Tabs */}
        <FadeIn delay={0.2}>
          <Tabs defaultValue="activity" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="activity">Добавить активность</TabsTrigger>
              <TabsTrigger value="history">История ({skill.activities.length})</TabsTrigger>
              <TabsTrigger value="certificates">Сертификаты ({skill.certificates.length})</TabsTrigger>
            </TabsList>

            {/* Add Activity Tab */}
            <TabsContent value="activity" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-primary" />
                    Записать активность
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Тип активности</Label>
                    <div className="grid grid-cols-3 gap-2">
                      {([
                        { value: "theory", label: "Теория", icon: BookOpen, xp: "1-3 XP" },
                        { value: "practice", label: "Практика", icon: Dumbbell, xp: "2-6 XP" },
                        { value: "result", label: "Результат", icon: Target, xp: "3-9 XP" },
                      ] as const).map((type) => (
                        <button
                          key={type.value}
                          onClick={() => setActivityForm({ ...activityForm, activityType: type.value })}
                          className={cn(
                            "p-3 rounded-lg border-2 text-left transition-all",
                            activityForm.activityType === type.value
                              ? "border-primary bg-primary/10"
                              : "border-border hover:border-primary/50"
                          )}
                        >
                          <type.icon className={cn(
                            "w-5 h-5 mb-2",
                            activityForm.activityType === type.value ? "text-primary" : "text-muted-foreground"
                          )} />
                          <p className="font-medium text-sm">{type.label}</p>
                          <p className="text-xs text-muted-foreground">{type.xp}</p>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="xp-amount">Базовый XP (1-3)</Label>
                    <div className="flex items-center gap-4">
                      <input
                        type="range"
                        min="1"
                        max="3"
                        value={activityForm.xpAmount}
                        onChange={(e) => setActivityForm({ ...activityForm, xpAmount: parseInt(e.target.value) })}
                        className="flex-1"
                      />
                      <span className="w-12 text-center font-bold text-lg">
                        {activityForm.xpAmount}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Описание активности</Label>
                    <Textarea
                      id="description"
                      placeholder="Что ты сделал? Например: 'Прочитал главу о замыканиях' или 'Сыграл 30 минут на гитаре'"
                      value={activityForm.description}
                      onChange={(e) => setActivityForm({ ...activityForm, description: e.target.value })}
                      rows={3}
                    />
                  </div>

                  <div className="bg-muted p-3 rounded-lg">
                    <p className="text-sm text-muted-foreground">
                      Будет начислено: <span className="font-bold text-primary">
                        {activityForm.xpAmount * SKILL_ACTIVITY_XP[activityForm.activityType]} XP
                      </span>
                    </p>
                  </div>

                  <Button 
                    onClick={handleAddActivity}
                    disabled={!activityForm.description}
                    className="w-full"
                  >
                    <CheckCircle2 className="w-4 h-4 mr-2" />
                    Записать и получить XP
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            {/* History Tab */}
            <TabsContent value="history">
              <Card>
                <CardHeader>
                  <CardTitle>История активностей</CardTitle>
                </CardHeader>
                <CardContent>
                  {skill.activities.length > 0 ? (
                    <div className="space-y-3">
                      {[...skill.activities]
                        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                        .map((activity, index) => (
                        <motion.div
                          key={activity.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className="flex items-start gap-3 p-3 rounded-lg bg-muted/50"
                        >
                          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                            <Sparkles className="w-5 h-5 text-primary" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium">{activity.description}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <ActivityTypeBadge type={activity.activityType} />
                              <span className="text-xs text-muted-foreground">
                                {new Date(activity.createdAt).toLocaleDateString('ru-RU')}
                              </span>
                            </div>
                          </div>
                          <div className="text-right">
                            <span className="font-bold text-primary">
                              +{activity.xpAmount * SKILL_ACTIVITY_XP[activity.activityType]} XP
                            </span>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Clock className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                      <p className="text-muted-foreground">Пока нет записанных активностей</p>
                      <p className="text-sm text-muted-foreground">
                        Начни тренироваться и записывай свой прогресс!
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Certificates Tab */}
            <TabsContent value="certificates">
              <div className="space-y-4">
                {skill.certificates.length > 0 ? (
                  skill.certificates
                    .sort((a, b) => b.levelAchieved - a.levelAchieved)
                    .map((cert) => (
                      <CertificateCard 
                        key={cert.id}
                        level={cert.levelAchieved}
                        issuedAt={cert.issuedAt}
                      />
                    ))
                ) : (
                  <Card>
                    <CardContent className="p-8 text-center">
                      <Award className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                      <h3 className="font-semibold mb-2">Пока нет сертификатов</h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        Достигни 5 уровня, чтобы получить сертификат Эксперта!
                      </p>
                      <div className="flex justify-center gap-4">
                        <div className="text-center">
                          <div className="w-12 h-12 mx-auto mb-2 rounded-full bg-orange-500/20 flex items-center justify-center">
                            <Trophy className="w-6 h-6 text-orange-500" />
                          </div>
                          <p className="text-xs text-muted-foreground">Уровень 5</p>
                        </div>
                        <div className="text-center">
                          <div className="w-12 h-12 mx-auto mb-2 rounded-full bg-red-500/20 flex items-center justify-center">
                            <Crown className="w-6 h-6 text-red-500" />
                          </div>
                          <p className="text-xs text-muted-foreground">Уровень 10</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </FadeIn>
      </div>
    </AppShell>
  )
}
