"use client"

import { useState, useEffect } from "react"
import { NotificationSettings } from "@/components/notifications/notification-settings"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { FadeIn } from "@/components/animations"
import { useDataExport } from "@/hooks/use-data"
import { useAuth } from "@/lib/auth/context"
import { useUpdateIdentity } from "@/hooks/modules/use-identity"
import {
  Bell,
  Download,
  Upload,
  Trash2,
  Moon,
  Palette,
  Shield,
  User,
  Save,
  UserPlus
} from "lucide-react"
import { toast } from "sonner"

function ProfileForm() {
  const { user, updateProfile, isAuthenticated } = useAuth()
  const updateIdentity = useUpdateIdentity()
  const [isSaving, setIsSaving] = useState(false)

  const [form, setForm] = useState({
    name: "",
    avatar_url: "",
    vision: "",
    mission: "",
  })

  useEffect(() => {
    if (user?.profile) {
      setForm({
        name: user.profile.name || "",
        avatar_url: user.profile.avatar_url || "",
        vision: user.profile.vision || "",
        mission: user.profile.mission || "",
      })
    }
  }, [user?.profile])

  if (!isAuthenticated || user?.isGuest) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center gap-4 py-10">
          <UserPlus className="size-10 text-muted-foreground" />
          <div className="text-center">
            <p className="font-medium">Вы вошли как гость</p>
            <p className="text-sm text-muted-foreground mt-1">
              Создайте аккаунт, чтобы редактировать профиль и синхронизировать данные
            </p>
          </div>
          <Button onClick={() => window.open("/auth/register", "_self")}>
            Создать аккаунт
          </Button>
        </CardContent>
      </Card>
    )
  }

  const handleSave = async () => {
    if (!form.name.trim()) {
      toast.error("Имя не может быть пустым")
      return
    }
    setIsSaving(true)
    try {
      const { error } = await updateProfile({
        name: form.name.trim(),
        avatar_url: form.avatar_url.trim() || undefined,
        vision: form.vision.trim(),
        mission: form.mission.trim(),
      })
      if (error) {
        toast.error("Ошибка сохранения: " + error.message)
      } else {
        await updateIdentity({
          name: form.name.trim(),
          vision: form.vision.trim(),
          mission: form.mission.trim(),
        })
        toast.success("Профиль сохранён")
      }
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Профиль</CardTitle>
        <CardDescription>Редактирование личной информации</CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="space-y-2">
          <Label htmlFor="avatar_url">Фото профиля (URL)</Label>
          <div className="flex items-center gap-3">
            {form.avatar_url && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={form.avatar_url}
                alt="avatar"
                className="size-12 rounded-full object-cover border"
                onError={(e) => { (e.target as HTMLImageElement).style.display = "none" }}
              />
            )}
            <Input
              id="avatar_url"
              placeholder="https://example.com/avatar.jpg"
              value={form.avatar_url}
              onChange={(e) => setForm(f => ({ ...f, avatar_url: e.target.value }))}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="name">Имя *</Label>
          <Input
            id="name"
            placeholder="Ваше имя"
            value={form.name}
            onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="vision">Видение</Label>
          <Textarea
            id="vision"
            placeholder="Кем хочу стать через 5 лет..."
            value={form.vision}
            onChange={(e) => setForm(f => ({ ...f, vision: e.target.value }))}
            rows={3}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="mission">Миссия</Label>
          <Textarea
            id="mission"
            placeholder="Моё главное предназначение..."
            value={form.mission}
            onChange={(e) => setForm(f => ({ ...f, mission: e.target.value }))}
            rows={3}
          />
        </div>

        <div className="flex items-center justify-between pt-2 border-t">
          <p className="text-xs text-muted-foreground">{user?.email}</p>
          <Button onClick={handleSave} disabled={isSaving}>
            <Save className="mr-2 size-4" />
            {isSaving ? "Сохранение..." : "Сохранить"}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

export default function SettingsPage() {
  const { exportData, importData, clearData } = useDataExport()
  const [importFile, setImportFile] = useState<File | null>(null)
  const [clearConfirm, setClearConfirm] = useState(false)

  const handleImport = async () => {
    if (!importFile) return

    const result = await importData(importFile)
    if (result.success) {
      toast.success("Данные успешно импортированы")
      setImportFile(null)
    } else {
      toast.error(result.error || "Ошибка импорта")
    }
  }

  const handleClear = () => {
    if (clearConfirm) {
      clearData()
      toast.success("Все данные удалены")
      setClearConfirm(false)
    } else {
      setClearConfirm(true)
      toast.info("Нажмите еще раз для подтверждения удаления")
    }
  }

  return (
    <div className="flex flex-col gap-6 p-4 md:p-6 lg:p-8 max-w-4xl">
      <FadeIn>
        <div>
          <h1 className="text-2xl font-bold">Настройки</h1>
          <p className="text-sm text-muted-foreground">
            Управление приложением и данными
          </p>
        </div>
      </FadeIn>

      <Tabs defaultValue="notifications" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 lg:w-auto">
          <TabsTrigger value="notifications">
            <Bell className="mr-2 size-4" />
            Уведомления
          </TabsTrigger>
          <TabsTrigger value="appearance">
            <Palette className="mr-2 size-4" />
            Внешний вид
          </TabsTrigger>
          <TabsTrigger value="data">
            <Shield className="mr-2 size-4" />
            Данные
          </TabsTrigger>
          <TabsTrigger value="account">
            <User className="mr-2 size-4" />
            Аккаунт
          </TabsTrigger>
        </TabsList>

        <TabsContent value="notifications">
          <NotificationSettings />
        </TabsContent>

        <TabsContent value="appearance">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Moon className="size-5" />
                  Тема оформления
                </CardTitle>
                <CardDescription>
                  Выберите предпочтительную тему
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Тема переключается через кнопку в боковом меню
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="data">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Download className="size-5" />
                  Экспорт данных
                </CardTitle>
                <CardDescription>
                  Сохраните резервную копию всех ваших данных
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button onClick={exportData}>
                  <Download className="mr-2 size-4" />
                  Скачать JSON
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="size-5" />
                  Импорт данных
                </CardTitle>
                <CardDescription>
                  Восстановите данные из резервной копии
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <input
                  type="file"
                  accept=".json"
                  onChange={(e) => setImportFile(e.target.files?.[0] || null)}
                  className="block w-full text-sm text-muted-foreground file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
                />
                <Button onClick={handleImport} disabled={!importFile}>
                  <Upload className="mr-2 size-4" />
                  Импортировать
                </Button>
              </CardContent>
            </Card>

            <Card className="border-destructive">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-destructive">
                  <Trash2 className="size-5" />
                  Опасная зона
                </CardTitle>
                <CardDescription>
                  Удаление всех данных без возможности восстановления
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  variant="destructive"
                  onClick={handleClear}
                  onBlur={() => setClearConfirm(false)}
                >
                  <Trash2 className="mr-2 size-4" />
                  {clearConfirm ? "Подтвердите удаление" : "Удалить все данные"}
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="account">
          <ProfileForm />
        </TabsContent>
      </Tabs>
    </div>
  )
}
