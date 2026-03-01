"use client"

import { useState } from "react"
import { useStorageFolders, useInsights, useLearningSources, useStorageContacts, useStorageResources, useStorageStats } from "@/hooks/use-storage"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { FadeIn, StaggerContainer, StaggerItem } from "@/components/animations"
import {
  Folder,
  Lightbulb,
  BookOpen,
  Users,
  FileText,
  Plus,
  Search,
  MoreHorizontal,
  TrendingUp,
  Clock,
  CheckCircle2,
  AlertCircle
} from "lucide-react"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import type {
  StorageFolder,
  Insight,
  LearningSource,
  StorageContact,
  StorageResource,
  InsightPriority,
  InsightStatus,
} from "@/lib/types/storage"

const folderIcons: Record<string, React.ElementType> = {
  insights: Lightbulb,
  contacts: Users,
  resources: FileText,
  templates: FileText,
  custom: Folder,
}

export default function StoragePage() {
  const { data: folders } = useStorageFolders()
  const { data: insights } = useInsights()
  const { data: sources } = useLearningSources()
  const { data: contacts } = useStorageContacts()
  const { data: resources } = useStorageResources()
  const { data: stats } = useStorageStats()

  const [activeTab, setActiveTab] = useState("overview")
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")

  const filteredFolders = folders?.filter((f: StorageFolder) =>
    selectedFolder ? f.id === selectedFolder : true
  )

  return (
    <div className="flex flex-col gap-6 p-4 md:p-6 lg:p-8">
      {/* Header */}
      <FadeIn>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Хранилище Данных</h1>
            <p className="text-sm text-muted-foreground">
              Организованное хранение знаний с планом применения
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input
                placeholder="Поиск..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 w-[200px]"
              />
            </div>
            <Button>
              <Plus className="mr-2 size-4" />
              Добавить
            </Button>
          </div>
        </div>
      </FadeIn>

      {/* Stats Overview */}
      <FadeIn delay={0.1}>
        <StaggerContainer className="grid grid-cols-2 md:grid-cols-4 gap-4" staggerDelay={0.1}>
          <StatsCard
            title="Инсайты"
            value={stats?.totalInsights || 0}
            icon={Lightbulb}
            color="text-yellow-500"
            bgColor="bg-yellow-500/10"
            subtitle={`${stats?.insightsByStatus?.in_action || 0} в действии`}
          />
          <StatsCard
            title="Источники"
            value={stats?.totalSources || 0}
            icon={BookOpen}
            color="text-[#8b5cf6]"
            bgColor="bg-[#8b5cf6]/10"
            subtitle={`${stats?.activeSources?.length || 0} активных`}
          />
          <StatsCard
            title="Контакты"
            value={stats?.totalContacts || 0}
            icon={Users}
            color="text-green-500"
            bgColor="bg-green-500/10"
          />
          <StatsCard
            title="Ресурсы"
            value={stats?.totalResources || 0}
            icon={FileText}
            color="text-purple-500"
            bgColor="bg-purple-500/10"
          />
        </StaggerContainer>
      </FadeIn>

      {/* Main Content */}
      <FadeIn delay={0.2}>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-4">
            <TabsTrigger value="overview">Обзор</TabsTrigger>
            <TabsTrigger value="insights">Инсайты</TabsTrigger>
            <TabsTrigger value="sources">Источники</TabsTrigger>
            <TabsTrigger value="contacts">Контакты</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-6 space-y-6">
            {/* Folders Grid */}
            <div>
              <h2 className="text-lg font-semibold mb-4">Папки</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                {folders?.map((folder: StorageFolder) => (
                  <FolderCard
                    key={folder.id}
                    folder={folder}
                    isSelected={selectedFolder === folder.id}
                    onClick={() => setSelectedFolder(
                      selectedFolder === folder.id ? null : folder.id
                    )}
                  />
                ))}
              </div>
            </div>

            {/* Recent Insights */}
            <div>
              <h2 className="text-lg font-semibold mb-4">Последние инсайты</h2>
              <div className="grid md:grid-cols-2 gap-4">
                {insights?.slice(0, 4).map((insight: Insight) => (
                  <InsightCard key={insight.id} insight={insight} />
                ))}
                {(!insights || insights.length === 0) && (
                  <EmptyState message="Пока нет инсайтов. Создайте первый!" />
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="insights" className="mt-6">
            <InsightsTab insights={insights} />
          </TabsContent>

          <TabsContent value="sources" className="mt-6">
            <SourcesTab sources={sources} />
          </TabsContent>

          <TabsContent value="contacts" className="mt-6">
            <ContactsTab contacts={contacts} />
          </TabsContent>
        </Tabs>
      </FadeIn>
    </div>
  )
}

// ============================================
// COMPONENTS
// ============================================

function StatsCard({
  title,
  value,
  icon: Icon,
  color,
  bgColor,
  subtitle
}: {
  title: string
  value: number
  icon: React.ElementType
  color: string
  bgColor: string
  subtitle?: string
}) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <div className={cn("p-2 rounded-lg", bgColor)}>
            <Icon className={cn("size-5", color)} />
          </div>
          <div>
            <p className="text-2xl font-bold">{value}</p>
            <p className="text-xs text-muted-foreground">{title}</p>
            {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function FolderCard({
  folder,
  isSelected,
  onClick
}: {
  folder: StorageFolder
  isSelected: boolean
  onClick: () => void
}) {
  const Icon = folderIcons[folder.type] || Folder

  return (
    <Card
      className={cn(
        "cursor-pointer transition-all hover:shadow-md",
        isSelected && "ring-2 ring-primary"
      )}
      onClick={onClick}
    >
      <CardContent className="p-4">
        <div className="flex flex-col items-center text-center gap-2">
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
            style={{ backgroundColor: folder.color + '20' }}
          >
            <span>{folder.icon}</span>
          </div>
          <div>
            <p className="font-medium text-sm">{folder.name}</p>
            {folder.description && (
              <p className="text-xs text-muted-foreground line-clamp-1">{folder.description}</p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function InsightCard({ insight }: { insight: Insight }) {
  const priorityColors: Record<InsightPriority, string> = {
    low: 'bg-[#8b5cf6]/10 text-[#8b5cf6]',
    medium: 'bg-yellow-500/10 text-yellow-500',
    high: 'bg-red-500/10 text-red-500',
  }

  const statusLabels: Record<InsightStatus, string> = {
    pending: 'Ожидает',
    in_action: 'В действии',
    completed: 'Выполнено',
    archived: 'Архив',
  }

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <h3 className="font-medium truncate">{insight.title}</h3>
            {insight.content && (
              <p className="text-sm text-muted-foreground line-clamp-2 mt-1">{insight.content}</p>
            )}
            {insight.applicationPlan && (
              <div className="mt-2 p-2 rounded bg-muted/50 text-xs">
                <span className="font-medium">План:</span> {insight.applicationPlan}
              </div>
            )}
          </div>
          <Badge className={priorityColors[insight.priority]}>
            {statusLabels[insight.status]}
          </Badge>
        </div>
      </CardContent>
    </Card>
  )
}

function InsightsTab({ insights }: { insights?: Insight[] }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Все инсайты</h2>
        <Button size="sm">
          <Plus className="mr-2 size-4" />
          Новый инсайт
        </Button>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {insights?.map((insight: Insight) => (
          <InsightCard key={insight.id} insight={insight} />
        ))}
        {(!insights || insights.length === 0) && (
          <EmptyState message="Пока нет инсайтов. Создайте первый!" />
        )}
      </div>
    </div>
  )
}

function SourcesTab({ sources }: { sources?: LearningSource[] }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Источники знаний</h2>
        <Button size="sm">
          <Plus className="mr-2 size-4" />
          Добавить источник
        </Button>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {sources?.map((source: LearningSource) => (
          <Card key={source.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium">{source.title}</h3>
                  {source.author && (
                    <p className="text-sm text-muted-foreground">{source.author}</p>
                  )}
                  <div className="flex items-center gap-2 mt-2">
                    <Progress value={source.progressPercent} className="w-24 h-2" />
                    <span className="text-xs text-muted-foreground">{source.progressPercent}%</span>
                  </div>
                </div>
                <Badge variant={source.status === 'completed' ? 'default' : 'secondary'}>
                  {source.status}
                </Badge>
              </div>
            </CardContent>
          </Card>
        ))}
        {(!sources || sources.length === 0) && (
          <EmptyState message="Пока нет источников. Добавьте первый!" />
        )}
      </div>
    </div>
  )
}

function ContactsTab({ contacts }: { contacts?: StorageContact[] }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Контакты</h2>
        <Button size="sm">
          <Plus className="mr-2 size-4" />
          Добавить контакт
        </Button>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {contacts?.map((contact: StorageContact) => (
          <Card key={contact.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="font-medium">{contact.name}</h3>
                  {contact.position && (
                    <p className="text-sm text-muted-foreground">{contact.position}</p>
                  )}
                  {contact.company && (
                    <p className="text-sm text-muted-foreground">{contact.company}</p>
                  )}
                </div>
                <Badge variant="outline">{contact.category}</Badge>
              </div>
            </CardContent>
          </Card>
        ))}
        {(!contacts || contacts.length === 0) && (
          <EmptyState message="Пока нет контактов. Добавьте первый!" />
        )}
      </div>
    </div>
  )
}

function EmptyState({ message }: { message: string }) {
  return (
    <Card className="col-span-full">
      <CardContent className="p-8 text-center">
        <Folder className="size-12 mx-auto mb-4 text-muted-foreground/50" />
        <p className="text-muted-foreground">{message}</p>
      </CardContent>
    </Card>
  )
}
