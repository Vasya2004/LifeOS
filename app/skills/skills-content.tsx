"use client"

import { useState } from "react"
import { AppShell } from "@/components/app-shell"
import { SkillCard } from "@/components/skill-card"
import { useSkills, useSkillStats } from "@/hooks/use-data"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { FadeIn, StaggerContainer, StaggerItem } from "@/components/animations"
import { AddSkillDialog } from "@/components/add-skill-dialog"
import { SKILL_CATEGORIES } from "@/lib/types"
import type { Skill } from "@/lib/types"
import { 
  Search, 
  Plus, 
  Trophy, 
  Crown, 
  TrendingUp, 
  Clock, 
  AlertTriangle,
  BarChart3,
} from "lucide-react"

export default function SkillsContent() {
  const { data: skills = [] } = useSkills()
  const { data: stats } = useSkillStats()
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [sortBy, setSortBy] = useState<"level" | "recent" | "xp">("level")

  // Filter and sort skills
  const filteredSkills = skills.filter((skill: Skill) => {
    const matchesSearch = skill.name.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = selectedCategory === "all" || skill.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const sortedSkills = [...filteredSkills].sort((a: Skill, b: Skill) => {
    switch (sortBy) {
      case "level":
        return b.currentLevel - a.currentLevel || b.currentXp - a.currentXp
      case "recent":
        return new Date(b.lastActivityDate).getTime() - new Date(a.lastActivityDate).getTime()
      case "xp":
        return b.totalXpEarned - a.totalXpEarned
      default:
        return 0
    }
  })

  // Get decaying skills
  const decayingSkills = skills.filter((s: Skill) => s.isDecaying)

  // Calculate tier distribution
  const tierDistribution = {
    novice: skills.filter((s: Skill) => s.currentLevel === 1).length,
    amateur: skills.filter((s: Skill) => s.currentLevel === 2).length,
    practitioner: skills.filter((s: Skill) => s.currentLevel === 3).length,
    pro: skills.filter((s: Skill) => s.currentLevel === 4).length,
    expert: skills.filter((s: Skill) => s.currentLevel >= 5 && s.currentLevel < 10).length,
    legend: skills.filter((s: Skill) => s.currentLevel >= 10).length,
  }

  return (
    <AppShell>
      <div className="flex flex-col gap-6 p-4 md:p-6 lg:p-8">
        {/* Header */}
        <FadeIn>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Навыки</h1>
              <p className="text-sm text-muted-foreground">
                Развивай свои способности как в RPG
              </p>
            </div>
            <AddSkillDialog />
          </div>
        </FadeIn>

        {/* Stats Overview */}
        <FadeIn delay={0.1}>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <BarChart3 className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{stats?.totalSkills || 0}</p>
                    <p className="text-xs text-muted-foreground">Всего навыков</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-chart-3/10">
                    <TrendingUp className="w-5 h-5 text-chart-3" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{stats?.avgLevel || 0}</p>
                    <p className="text-xs text-muted-foreground">Средний уровень</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-orange-500/10">
                    <Trophy className="w-5 h-5 text-orange-500" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{stats?.expertOrAbove || 0}</p>
                    <p className="text-xs text-muted-foreground">Экспертов</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-red-500/10">
                    <Crown className="w-5 h-5 text-red-500" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{stats?.legends || 0}</p>
                    <p className="text-xs text-muted-foreground">Легенд</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </FadeIn>

        {/* Decay Warning */}
        {decayingSkills.length > 0 && (
          <FadeIn delay={0.15}>
            <Card className="border-destructive/50 bg-destructive/5">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <AlertTriangle className="w-5 h-5 text-destructive" />
                  <div>
                    <p className="font-medium text-destructive">
                      Внимание: {decayingSkills.length} навык(а) теряют XP
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Занимайтесь навыками регулярно, чтобы избежать декей
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </FadeIn>
        )}

        {/* Tier Progress */}
        <FadeIn delay={0.2}>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Распределение по уровням</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-gray-400">Новички</span>
                  <span>{tierDistribution.novice}</span>
                </div>
                <Progress value={(tierDistribution.novice / (skills.length || 1)) * 100} className="h-1.5 bg-gray-800" />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-green-500">Любители</span>
                  <span>{tierDistribution.amateur}</span>
                </div>
                <Progress value={(tierDistribution.amateur / (skills.length || 1)) * 100} className="h-1.5 bg-gray-800 [&>div]:bg-green-500" />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-blue-500">Практики</span>
                  <span>{tierDistribution.practitioner}</span>
                </div>
                <Progress value={(tierDistribution.practitioner / (skills.length || 1)) * 100} className="h-1.5 bg-gray-800 [&>div]:bg-blue-500" />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-purple-500">Профи</span>
                  <span>{tierDistribution.pro}</span>
                </div>
                <Progress value={(tierDistribution.pro / (skills.length || 1)) * 100} className="h-1.5 bg-gray-800 [&>div]:bg-purple-500" />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-orange-500">Эксперты</span>
                  <span>{tierDistribution.expert}</span>
                </div>
                <Progress value={(tierDistribution.expert / (skills.length || 1)) * 100} className="h-1.5 bg-gray-800 [&>div]:bg-orange-500" />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-red-500">Легенды</span>
                  <span>{tierDistribution.legend}</span>
                </div>
                <Progress value={(tierDistribution.legend / (skills.length || 1)) * 100} className="h-1.5 bg-gray-800 [&>div]:bg-red-500" />
              </div>
            </CardContent>
          </Card>
        </FadeIn>

        {/* Filters and Search */}
        <FadeIn delay={0.25}>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Поиск навыков..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant={sortBy === "level" ? "default" : "outline"}
                size="sm"
                onClick={() => setSortBy("level")}
              >
                <Trophy className="w-4 h-4 mr-1" />
                Уровень
              </Button>
              <Button
                variant={sortBy === "recent" ? "default" : "outline"}
                size="sm"
                onClick={() => setSortBy("recent")}
              >
                <Clock className="w-4 h-4 mr-1" />
                Недавние
              </Button>
              <Button
                variant={sortBy === "xp" ? "default" : "outline"}
                size="sm"
                onClick={() => setSortBy("xp")}
              >
                <TrendingUp className="w-4 h-4 mr-1" />
                XP
              </Button>
            </div>
          </div>
        </FadeIn>

        {/* Category Tabs */}
        <FadeIn delay={0.3}>
          <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
            <TabsList className="flex-wrap h-auto gap-1">
              <TabsTrigger value="all">Все</TabsTrigger>
              {SKILL_CATEGORIES.map(cat => (
                <TabsTrigger key={cat.id} value={cat.id}>
                  {cat.name}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </FadeIn>

        {/* Skills Grid */}
        <StaggerContainer 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
          staggerDelay={0.05}
        >
          {sortedSkills.length > 0 ? (
            sortedSkills.map((skill) => (
              <StaggerItem key={skill.id}>
                <SkillCard skill={skill} />
              </StaggerItem>
            ))
          ) : (
            <div className="col-span-full">
              <Card className="border-dashed">
                <CardContent className="p-8 text-center">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
                    <Plus className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <h3 className="font-semibold mb-2">
                    {searchQuery ? "Ничего не найдено" : "Нет навыков"}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    {searchQuery 
                      ? "Попробуй изменить поисковый запрос"
                      : "Создай свой первый навык и начни прокачиваться!"
                    }
                  </p>
                  {!searchQuery && <AddSkillDialog />}
                </CardContent>
              </Card>
            </div>
          )}
        </StaggerContainer>
      </div>
    </AppShell>
  )
}
