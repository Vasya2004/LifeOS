"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import {
  requestNotificationPermission,
  subscribeToPushNotifications,
  unsubscribeFromPushNotifications,
} from "@/lib/notifications"
import { Bell, BellOff, Smartphone, Clock } from "lucide-react"

export function NotificationSettings() {
  const [browserEnabled, setBrowserEnabled] = useState(false)
  const [pushEnabled, setPushEnabled] = useState(false)
  const [loading, setLoading] = useState(false)
  const [dailyEnabled, setDailyEnabled] = useState(false)
  const [dailyTime, setDailyTime] = useState("09:00")

  useEffect(() => {
    if ("Notification" in window) {
      setBrowserEnabled(Notification.permission === "granted")
    }
    setDailyEnabled(localStorage.getItem("lifeos_daily_reminder_enabled") === "true")
    setDailyTime(localStorage.getItem("lifeos_daily_reminder_time") || "09:00")
  }, [])

  const handleBrowserToggle = async (checked: boolean) => {
    setLoading(true)
    
    if (checked) {
      const granted = await requestNotificationPermission()
      setBrowserEnabled(granted)
      
      if (granted) {
        toast.success("Браузерные уведомления включены")
      } else {
        toast.error("Разрешение на уведомления отклонено")
      }
    } else {
      // Cannot revoke permission programmatically, just update UI
      setBrowserEnabled(false)
      toast.info("Отключите уведомления в настройках браузера")
    }
    
    setLoading(false)
  }

  const handlePushToggle = async (checked: boolean) => {
    setLoading(true)
    
    if (checked) {
      const success = await subscribeToPushNotifications()
      setPushEnabled(success)
      
      if (success) {
        toast.success("Push-уведомления включены")
      } else {
        toast.error("Не удалось включить push-уведомления")
      }
    } else {
      const success = await unsubscribeFromPushNotifications()
      setPushEnabled(!success)
      
      if (success) {
        toast.success("Push-уведомления отключены")
      }
    }
    
    setLoading(false)
  }

  const testNotification = () => {
    if (!browserEnabled) {
      toast.error("Сначала включите уведомления")
      return
    }

    new Notification("Test Notification", {
      body: "Если вы видите это, уведомления работают! 🎉",
      icon: "/icon-192x192.png",
    })
  }

  const handleDailyToggle = (checked: boolean) => {
    setDailyEnabled(checked)
    localStorage.setItem("lifeos_daily_reminder_enabled", String(checked))
    if (checked) toast.success(`Ежедневное напоминание включено в ${dailyTime}`)
    else toast.info("Ежедневное напоминание отключено")
  }

  const handleDailyTimeChange = (time: string) => {
    setDailyTime(time)
    localStorage.setItem("lifeos_daily_reminder_time", time)
    // Reset "already sent today" so the new time can fire today
    localStorage.removeItem("lifeos_daily_reminder_last_sent")
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="size-5" />
            Браузерные уведомления
          </CardTitle>
          <CardDescription>
            Получайте уведомления прямо в браузере
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Включить уведомления</Label>
              <p className="text-sm text-muted-foreground">
                Показывать всплывающие уведомления в браузере
              </p>
            </div>
            <Switch
              checked={browserEnabled}
              onCheckedChange={handleBrowserToggle}
              disabled={loading}
            />
          </div>

          {browserEnabled && (
            <Button variant="outline" onClick={testNotification} size="sm">
              <Bell className="mr-2 size-4" />
              Тестовое уведомление
            </Button>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Smartphone className="size-5" />
            Push-уведомления
          </CardTitle>
          <CardDescription>
            Получайте уведомления даже когда приложение закрыто
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Включить push-уведомления</Label>
              <p className="text-sm text-muted-foreground">
                Работает на мобильных устройствах и десктопе
              </p>
            </div>
            <Switch
              checked={pushEnabled}
              onCheckedChange={handlePushToggle}
              disabled={loading || !browserEnabled}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="size-5" />
            Ежедневное напоминание
          </CardTitle>
          <CardDescription>
            Напоминание о задачах и привычках раз в день
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Включить</Label>
              <p className="text-sm text-muted-foreground">
                Напомнить о задачах дня в выбранное время
              </p>
            </div>
            <Switch
              checked={dailyEnabled}
              onCheckedChange={handleDailyToggle}
              disabled={!browserEnabled}
            />
          </div>

          {dailyEnabled && (
            <div className="flex items-center gap-3">
              <Label htmlFor="daily-time" className="shrink-0">Время</Label>
              <Input
                id="daily-time"
                type="time"
                value={dailyTime}
                onChange={(e) => handleDailyTimeChange(e.target.value)}
                className="w-32"
              />
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="size-5" />
            Напоминания о привычках
          </CardTitle>
          <CardDescription>
            Настройте время для напоминаний о привычках
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Напоминания настраиваются индивидуально для каждой привычки в разделе "Привычки"
          </p>
        </CardContent>
      </Card>

      {!browserEnabled && (
        <Card className="border-destructive/50 bg-destructive/5">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <BellOff className="size-5 text-destructive" />
              <div>
                <p className="font-medium text-destructive">Уведомления отключены</p>
                <p className="text-sm text-muted-foreground">
                  Включите уведомления, чтобы не пропускать важные задачи и привычки
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
