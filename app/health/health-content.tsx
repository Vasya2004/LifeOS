"use client"

import { AppShell } from "@/components/app-shell"
import { useBodyZones, useBodyZonesStats, useMedicalDocuments, useHealthMetrics } from "@/hooks/use-data"
import { updateBodyZone, addMedicalDocument, deleteMedicalDocument, addHealthMetric } from "@/lib/store"
import { type BodyZoneStatus, type MedicalDocumentType, HEALTH_METRIC_UNITS, type HealthMetricType } from "@/lib/types"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { FadeIn } from "@/components/animations"
import { 
  Heart, 
  Activity, 
  FileText, 
  TrendingUp, 
  AlertCircle,
  CheckCircle2,
  AlertTriangle,
  Brain,
  Upload,
  X,
  Droplets,
  Moon,
  Footprints,
  Scale,
  Plus,
  Calendar
} from "lucide-react"
import { useState, useRef } from "react"
import { toast } from "sonner"
import { format } from "date-fns"
import { ru } from "date-fns/locale"

// Status colors mapping
const statusColors: Record<BodyZoneStatus, { bg: string; border: string; text: string; icon: typeof CheckCircle2 }> = {
  green: { 
    bg: "bg-green-500/10", 
    border: "border-green-500", 
    text: "text-green-500",
    icon: CheckCircle2 
  },
  yellow: { 
    bg: "bg-yellow-500/10", 
    border: "border-yellow-500", 
    text: "text-yellow-500",
    icon: AlertCircle 
  },
  red: { 
    bg: "bg-red-500/10", 
    border: "border-red-500", 
    text: "text-red-500",
    icon: AlertTriangle 
  },
}

const statusLabels: Record<BodyZoneStatus, string> = {
  green: "Отлично",
  yellow: "Требует внимания",
  red: "Проблема",
}

const documentTypeLabels: Record<MedicalDocumentType, string> = {
  blood: "Анализ крови",
  xray: "Рентген",
  mri: "МРТ",
  ultrasound: "УЗИ",
  prescription: "Рецепт",
  other: "Другое",
}

// Body Zone Icon mapping
const zoneIcons: Record<string, typeof Heart> = {
  head: Brain,
  chest: Heart,
  stomach: Activity,
  back: Activity,
  left_arm: Activity,
  right_arm: Activity,
  left_leg: Activity,
  right_leg: Activity,
}

// Body Zones Grid Component
function BodyZonesGrid() {
  const { data: zones, mutate } = useBodyZones()
  const { data: stats } = useBodyZonesStats()
  const [selectedZone, setSelectedZone] = useState<string | null>(null)
  const [editStatus, setEditStatus] = useState<BodyZoneStatus>("green")
  const [editNotes, setEditNotes] = useState("")

  if (!zones) return null

  const selectedZoneData = zones.find(z => z.id === selectedZone)

  const handleOpenEdit = (zone: typeof zones[0]) => {
    setSelectedZone(zone.id)
    setEditStatus(zone.status)
    setEditNotes(zone.notes)
  }

  const handleSave = () => {
    if (!selectedZone) return
    updateBodyZone(selectedZone, { status: editStatus, notes: editNotes })
    mutate()
    setSelectedZone(null)
    toast.success("Статус обновлен", { description: "+15 XP за обновление зоны" })
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Activity className="size-5" />
              Карта тела
            </CardTitle>
            <CardDescription>
              Статус здоровья по зонам тела
            </CardDescription>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-2xl font-bold">{stats?.healthScore}%</p>
              <p className="text-xs text-muted-foreground">Health Score</p>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Legend */}
        <div className="flex gap-4 mb-6 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-green-500" />
            <span>Отлично ({stats?.green})</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-yellow-500" />
            <span>Внимание ({stats?.yellow})</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500" />
            <span>Проблема ({stats?.red})</span>
          </div>
        </div>

        {/* Body Grid */}
        <div className="relative bg-muted/30 rounded-xl p-6 min-h-[400px]">
          {/* Simple body silhouette representation */}
          <div className="absolute inset-0 flex items-center justify-center opacity-10">
            <Activity className="size-64" />
          </div>
          
          {/* Zones Grid */}
          <div className="relative grid grid-cols-2 md:grid-cols-4 gap-4">
            {zones.map((zone) => {
              const colors = statusColors[zone.status]
              const Icon = zoneIcons[zone.name] || Activity
              
              return (
                <button
                  key={zone.id}
                  onClick={() => handleOpenEdit(zone)}
                  className={`
                    p-4 rounded-xl border-2 transition-all duration-200 text-left
                    hover:scale-105 hover:shadow-lg
                    ${colors.bg} ${colors.border} ${colors.text} border-opacity-50
                  `}
                >
                  <div className="flex items-start justify-between mb-2">
                    <Icon className="size-6" />
                    <colors.icon className="size-4 opacity-70" />
                  </div>
                  <p className="font-medium">{zone.displayName}</p>
                  <p className="text-xs opacity-70 mt-1">{statusLabels[zone.status]}</p>
                  {zone.notes && (
                    <p className="text-xs opacity-60 mt-1 line-clamp-1">{zone.notes}</p>
                  )}
                </button>
              )
            })}
          </div>
        </div>

        {/* Edit Dialog */}
        <Dialog open={!!selectedZone} onOpenChange={() => setSelectedZone(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{selectedZoneData?.displayName}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Статус</Label>
                <Select value={editStatus} onValueChange={(v) => setEditStatus(v as BodyZoneStatus)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="green">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-green-500" />
                        Отлично
                      </div>
                    </SelectItem>
                    <SelectItem value="yellow">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-yellow-500" />
                        Требует внимания
                      </div>
                    </SelectItem>
                    <SelectItem value="red">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-red-500" />
                        Проблема
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Заметки</Label>
                <Textarea
                  value={editNotes}
                  onChange={(e) => setEditNotes(e.target.value)}
                  placeholder="Опишите состояние, симптомы, лечение..."
                  rows={4}
                />
              </div>
              {editStatus === 'red' && (
                <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-sm text-red-400">
                  <AlertTriangle className="inline size-4 mr-1" />
                  Рекомендуется консультация специалиста
                </div>
              )}
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline">Отмена</Button>
              </DialogClose>
              <Button onClick={handleSave}>Сохранить</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  )
}

// Medical Documents Vault Component
function DocumentsVault() {
  const { data: documents, mutate } = useMedicalDocuments()
  const [isUploadOpen, setIsUploadOpen] = useState(false)
  const [newDoc, setNewDoc] = useState({
    title: "",
    documentType: "other" as MedicalDocumentType,
    date: format(new Date(), "yyyy-MM-dd"),
    summary: "",
    doctorName: "",
    clinic: "",
  })
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Файл слишком большой", { description: "Максимальный размер — 5 МБ" })
      return
    }

    const fileUrl = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result as string)
      reader.onerror = reject
      reader.readAsDataURL(file)
    })

    addMedicalDocument({
      ...newDoc,
      fileUrl,
      fileType: file.type.startsWith("image/") ? "image" : "pdf",
      tags: [documentTypeLabels[newDoc.documentType]],
    })

    mutate()
    setIsUploadOpen(false)
    setNewDoc({
      title: "",
      documentType: "other",
      date: format(new Date(), "yyyy-MM-dd"),
      summary: "",
      doctorName: "",
      clinic: "",
    })
    toast.success("Документ добавлен", { description: "+25 XP и +5 монет" })
  }

  const handleDelete = (id: string) => {
    deleteMedicalDocument(id)
    mutate()
    toast.success("Документ удален")
  }

  const getDocumentIcon = (type: MedicalDocumentType) => {
    switch (type) {
      case "blood": return Droplets
      case "xray":
      case "mri":
      case "ultrasound": return Activity
      case "prescription": return FileText
      default: return FileText
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <FileText className="size-5" />
              Медицинские документы
            </CardTitle>
            <CardDescription>
              Хранилище анализов и заключений
            </CardDescription>
          </div>
          <Dialog open={isUploadOpen} onOpenChange={setIsUploadOpen}>
            <DialogTrigger asChild>
              <Button>
                <Upload className="mr-2 size-4" />
                Загрузить
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Новый документ</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Название</Label>
                  <Input
                    value={newDoc.title}
                    onChange={(e) => setNewDoc({ ...newDoc, title: e.target.value })}
                    placeholder="Например: Общий анализ крови"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Тип</Label>
                    <Select 
                      value={newDoc.documentType} 
                      onValueChange={(v) => setNewDoc({ ...newDoc, documentType: v as MedicalDocumentType })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(documentTypeLabels).map(([key, label]) => (
                          <SelectItem key={key} value={key}>{label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Дата</Label>
                    <Input
                      type="date"
                      value={newDoc.date}
                      onChange={(e) => setNewDoc({ ...newDoc, date: e.target.value })}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Врач</Label>
                  <Input
                    value={newDoc.doctorName}
                    onChange={(e) => setNewDoc({ ...newDoc, doctorName: e.target.value })}
                    placeholder="ФИО врача"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Клиника</Label>
                  <Input
                    value={newDoc.clinic}
                    onChange={(e) => setNewDoc({ ...newDoc, clinic: e.target.value })}
                    placeholder="Название клиники"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Краткое содержание</Label>
                  <Textarea
                    value={newDoc.summary}
                    onChange={(e) => setNewDoc({ ...newDoc, summary: e.target.value })}
                    placeholder="Основные выводы и рекомендации"
                    rows={3}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Файл</Label>
                  <Input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf,image/*"
                    onChange={handleFileSelect}
                  />
                  <p className="text-xs text-muted-foreground">
                    Поддерживаются PDF и изображения
                  </p>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {documents && documents.length > 0 ? (
          <div className="space-y-3">
            {documents
              .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
              .map((doc) => {
                const Icon = getDocumentIcon(doc.documentType)
                return (
                  <div
                    key={doc.id}
                    className="flex items-start gap-4 p-4 rounded-lg border hover:border-primary/50 transition-colors"
                  >
                    <div className="p-2 rounded-lg bg-primary/10">
                      <Icon className="size-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="font-medium">{doc.title}</p>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                            <Calendar className="size-3" />
                            {format(new Date(doc.date), "d MMMM yyyy", { locale: ru })}
                            {doc.doctorName && (
                              <>
                                <span>•</span>
                                <span>{doc.doctorName}</span>
                              </>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary">{documentTypeLabels[doc.documentType]}</Badge>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="size-8 text-muted-foreground hover:text-destructive"
                            onClick={() => handleDelete(doc.id)}
                          >
                            <X className="size-4" />
                          </Button>
                        </div>
                      </div>
                      {doc.summary && (
                        <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                          {doc.summary}
                        </p>
                      )}
                      {doc.clinic && (
                        <p className="text-xs text-muted-foreground mt-1">
                          {doc.clinic}
                        </p>
                      )}
                    </div>
                  </div>
                )
              })}
          </div>
        ) : (
          <div className="text-center py-12 text-muted-foreground">
            <FileText className="size-12 mx-auto mb-4 opacity-30" />
            <p>Нет документов</p>
            <p className="text-sm">Загрузите первый медицинский документ</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// Health Stats Component
function HealthStats() {
  const { data: metrics } = useHealthMetrics()
  const [newMetric, setNewMetric] = useState({
    type: "weight" as HealthMetricType,
    value: "",
    date: format(new Date(), "yyyy-MM-dd"),
    notes: "",
  })

  const weightMetrics = metrics?.filter(m => m.type === "weight") || []
  const sleepMetrics = metrics?.filter(m => m.type === "sleep") || []
  const waterMetrics = metrics?.filter(m => m.type === "water") || []

  // Get latest values
  const latestWeight = weightMetrics[weightMetrics.length - 1]?.value
  const latestSleep = sleepMetrics[sleepMetrics.length - 1]?.value

  const handleAddMetric = () => {
    if (!newMetric.value) return
    
    addHealthMetric({
      type: newMetric.type,
      value: parseFloat(newMetric.value),
      date: newMetric.date,
      unit: HEALTH_METRIC_UNITS[newMetric.type],
      notes: newMetric.notes,
    })
    
    setNewMetric({
      type: "weight",
      value: "",
      date: format(new Date(), "yyyy-MM-dd"),
      notes: "",
    })
    
    toast.success("Показатель добавлен", { description: "+5 XP" })
  }

  const getMetricIcon = (type: HealthMetricType) => {
    switch (type) {
      case "weight": return Scale
      case "sleep": return Moon
      case "water": return Droplets
      case "steps": return Footprints
      default: return Activity
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="size-5" />
          Показатели здоровья
        </CardTitle>
        <CardDescription>
          Отслеживание веса, сна, воды и активности
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 rounded-lg bg-muted/50">
            <Scale className="size-5 mb-2 text-primary" />
            <p className="text-2xl font-bold">{latestWeight || "—"}</p>
            <p className="text-xs text-muted-foreground">кг (вес)</p>
          </div>
          <div className="p-4 rounded-lg bg-muted/50">
            <Moon className="size-5 mb-2 text-chart-2" />
            <p className="text-2xl font-bold">{latestSleep || "—"}</p>
            <p className="text-xs text-muted-foreground">ч (сон)</p>
          </div>
          <div className="p-4 rounded-lg bg-muted/50">
            <Droplets className="size-5 mb-2 text-chart-4" />
            <p className="text-2xl font-bold">{waterMetrics[waterMetrics.length - 1]?.value || "—"}</p>
            <p className="text-xs text-muted-foreground">мл (вода)</p>
          </div>
          <div className="p-4 rounded-lg bg-muted/50">
            <Footprints className="size-5 mb-2 text-chart-5" />
            <p className="text-2xl font-bold">—</p>
            <p className="text-xs text-muted-foreground">шаги</p>
          </div>
        </div>

        {/* Add New Metric */}
        <div className="p-4 rounded-lg border space-y-4">
          <h4 className="font-medium">Добавить показатель</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label>Тип</Label>
              <Select 
                value={newMetric.type} 
                onValueChange={(v) => setNewMetric({ ...newMetric, type: v as HealthMetricType })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="weight">Вес</SelectItem>
                  <SelectItem value="sleep">Сон</SelectItem>
                  <SelectItem value="water">Вода</SelectItem>
                  <SelectItem value="steps">Шаги</SelectItem>
                  <SelectItem value="mood">Настроение</SelectItem>
                  <SelectItem value="heart_rate">Пульс</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Значение ({HEALTH_METRIC_UNITS[newMetric.type]})</Label>
              <Input
                type="number"
                step="0.1"
                value={newMetric.value}
                onChange={(e) => setNewMetric({ ...newMetric, value: e.target.value })}
                placeholder="0"
              />
            </div>
            <div className="space-y-2">
              <Label>Дата</Label>
              <Input
                type="date"
                value={newMetric.date}
                onChange={(e) => setNewMetric({ ...newMetric, date: e.target.value })}
              />
            </div>
            <div className="flex items-end">
              <Button onClick={handleAddMetric} className="w-full">
                <Plus className="mr-2 size-4" />
                Добавить
              </Button>
            </div>
          </div>
        </div>

        {/* Recent History */}
        {metrics && metrics.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-medium">История</h4>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {metrics
                .slice()
                .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                .slice(0, 10)
                .map((metric) => {
                  const Icon = getMetricIcon(metric.type)
                  return (
                    <div
                      key={metric.id}
                      className="flex items-center justify-between p-3 rounded-lg bg-muted/30 text-sm"
                    >
                      <div className="flex items-center gap-3">
                        <Icon className="size-4 text-muted-foreground" />
                        <span className="capitalize">{metric.type === "weight" ? "Вес" : 
                          metric.type === "sleep" ? "Сон" : 
                          metric.type === "water" ? "Вода" : 
                          metric.type === "steps" ? "Шаги" : metric.type}</span>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="font-medium">{metric.value} {metric.unit}</span>
                        <span className="text-xs text-muted-foreground">
                          {format(new Date(metric.date), "dd.MM.yyyy")}
                        </span>
                      </div>
                    </div>
                  )
                })}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// Main Health Page Content
export default function HealthContent() {
  const { data: stats } = useBodyZonesStats()

  return (
    <AppShell>
      <div className="flex flex-col gap-6 p-4 md:p-6 lg:p-8">
        {/* Header */}
        <FadeIn>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
                <Heart className="size-6 text-red-500" />
                Здоровье
              </h1>
              <p className="text-sm text-muted-foreground">
                Мониторинг состояния организма • Health Score: {stats?.healthScore || 0}%
              </p>
            </div>
            <div className="flex gap-2">
              <Badge variant="secondary" className="text-green-500">
                <CheckCircle2 className="mr-1 size-3" />
                {stats?.green || 0} зон отлично
              </Badge>
              {stats && stats.red > 0 && (
                <Badge variant="secondary" className="text-red-500">
                  <AlertTriangle className="mr-1 size-3" />
                  {stats.red} требуют внимания
                </Badge>
              )}
            </div>
          </div>
        </FadeIn>

        {/* Tabs Content */}
        <FadeIn delay={0.1}>
          <Tabs defaultValue="body" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="body">Карта тела</TabsTrigger>
              <TabsTrigger value="documents">Документы</TabsTrigger>
              <TabsTrigger value="stats">Показатели</TabsTrigger>
            </TabsList>

            <TabsContent value="body" className="space-y-6">
              <BodyZonesGrid />
            </TabsContent>

            <TabsContent value="documents" className="space-y-6">
              <DocumentsVault />
            </TabsContent>

            <TabsContent value="stats" className="space-y-6">
              <HealthStats />
            </TabsContent>
          </Tabs>
        </FadeIn>

        {/* Gamification Tips */}
        <FadeIn delay={0.2}>
          <Card className="bg-gradient-to-r from-primary/5 to-chart-2/5 border-primary/20">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Activity className="size-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium">Как работает геймификация здоровья?</p>
                  <ul className="text-sm text-muted-foreground mt-2 space-y-1">
                    <li>• +15 XP за обновление статуса зоны тела</li>
                    <li>• +50 XP и +10 монет за восстановление (красная → зеленая)</li>
                    <li>• +25 XP и +5 монет за загрузку медицинского документа</li>
                    <li>• +5 XP за ежедневное отслеживание показателей</li>
                    <li>• +100 XP бонус когда все зоны в статусе "Отлично"</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </FadeIn>
      </div>
    </AppShell>
  )
}
