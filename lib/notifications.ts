// ============================================
// NOTIFICATIONS SYSTEM - Browser & Push
// ============================================

import { createClient } from "@/lib/supabase/client"

const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || ""

// ============================================
// BROWSER NOTIFICATIONS
// ============================================

export async function requestNotificationPermission(): Promise<boolean> {
  if (!("Notification" in window)) {
    console.log("This browser does not support notifications")
    return false
  }

  const permission = await Notification.requestPermission()
  return permission === "granted"
}

export function sendBrowserNotification(title: string, options?: NotificationOptions) {
  if (!("Notification" in window)) return
  if (Notification.permission !== "granted") return

  return new Notification(title, {
    icon: "/icon-192x192.png",
    badge: "/icon-96x96.png",
    ...options,
  })
}

// ============================================
// PUSH NOTIFICATIONS (Service Worker)
// ============================================

export async function subscribeToPushNotifications(): Promise<boolean> {
  if (!("serviceWorker" in navigator)) return false
  if (!("PushManager" in window)) return false

  try {
    const registration = await navigator.serviceWorker.ready
    
    // Check existing subscription
    const existingSubscription = await registration.pushManager.getSubscription()
    if (existingSubscription) {
      await saveSubscription(existingSubscription)
      return true
    }

    // Request permission
    const permission = await Notification.requestPermission()
    if (permission !== "granted") return false

    // Subscribe
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
    })

    await saveSubscription(subscription)
    return true
  } catch (error) {
    console.error("Push subscription error:", error)
    return false
  }
}

export async function unsubscribeFromPushNotifications(): Promise<boolean> {
  if (!("serviceWorker" in navigator)) return false

  try {
    const registration = await navigator.serviceWorker.ready
    const subscription = await registration.pushManager.getSubscription()
    
    if (subscription) {
      await subscription.unsubscribe()
      await deleteSubscription(subscription.endpoint)
    }
    
    return true
  } catch (error) {
    console.error("Unsubscribe error:", error)
    return false
  }
}

async function saveSubscription(subscription: PushSubscription) {
  const supabase = createClient()
  
  // Extract keys from subscription
  const keys = subscription.toJSON().keys as { p256dh: string; auth: string }
  
  await supabase.from("push_subscriptions").upsert({
    endpoint: subscription.endpoint,
    p256dh: keys.p256dh,
    auth: keys.auth,
  }, {
    onConflict: "endpoint",
  })
}

async function deleteSubscription(endpoint: string) {
  const supabase = createClient()
  await supabase.from("push_subscriptions").delete().eq("endpoint", endpoint)
}

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/")
  const rawData = window.atob(base64)
  const outputArray = new Uint8Array(rawData.length)
  
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i)
  }
  
  return outputArray
}

// ============================================
// SCHEDULED NOTIFICATIONS
// ============================================

export interface ScheduledNotification {
  id: string
  title: string
  body: string
  scheduledAt: Date
  type: "habit" | "task" | "goal" | "reminder"
}

export async function scheduleNotification(
  notification: Omit<ScheduledNotification, "id">
): Promise<string | null> {
  const supabase = createClient()
  
  const { data, error } = await supabase
    .from("notifications")
    .insert({
      title: notification.title,
      body: notification.body,
      type: notification.type,
      scheduled_at: notification.scheduledAt.toISOString(),
    })
    .select("id")
    .single()

  if (error) {
    console.error("Schedule notification error:", error)
    return null
  }

  return data.id
}

export async function cancelNotification(id: string): Promise<boolean> {
  const supabase = createClient()
  
  const { error } = await supabase
    .from("notifications")
    .delete()
    .eq("id", id)

  return !error
}

export async function getScheduledNotifications(): Promise<ScheduledNotification[]> {
  const supabase = createClient()
  
  const { data, error } = await supabase
    .from("notifications")
    .select("*")
    .eq("read", false)
    .gte("scheduled_at", new Date().toISOString())
    .order("scheduled_at", { ascending: true })

  if (error || !data) return []

  return data.map(n => ({
    id: n.id,
    title: n.title,
    body: n.body,
    scheduledAt: new Date(n.scheduled_at),
    type: n.type,
  }))
}

// ============================================
// NOTIFICATION PRESETS
// ============================================

export function scheduleHabitReminder(habitName: string, scheduledTime: Date): Promise<string | null> {
  return scheduleNotification({
    title: "Время для привычки!",
    body: `Не забудьте: ${habitName}`,
    scheduledAt: scheduledTime,
    type: "habit",
  })
}

export function scheduleTaskReminder(taskTitle: string, dueDate: Date): Promise<string | null> {
  // Remind 1 hour before
  const reminderTime = new Date(dueDate.getTime() - 60 * 60 * 1000)
  
  return scheduleNotification({
    title: "Задача скоро дедлайн!",
    body: taskTitle,
    scheduledAt: reminderTime,
    type: "task",
  })
}

export function scheduleDailyReviewReminder(scheduledTime: Date): Promise<string | null> {
  return scheduleNotification({
    title: "Время для ежедневного обзора",
    body: "Подведите итоги дня и спланируйте завтра",
    scheduledAt: scheduledTime,
    type: "reminder",
  })
}

// ============================================
// HABIT REMINDERS (Local)
// ============================================

interface HabitReminder {
  habitId: string
  habitName: string
  time: string // "09:00"
  days: number[] // [1, 3, 5] = Mon, Wed, Fri
}

const REMINDERS_KEY = "lifeos_habit_reminders"

export function setHabitReminder(reminder: HabitReminder) {
  const reminders = getHabitReminders().filter(r => r.habitId !== reminder.habitId)
  reminders.push(reminder)
  localStorage.setItem(REMINDERS_KEY, JSON.stringify(reminders))
}

export function removeHabitReminder(habitId: string) {
  const reminders = getHabitReminders().filter(r => r.habitId !== habitId)
  localStorage.setItem(REMINDERS_KEY, JSON.stringify(reminders))
}

export function getHabitReminders(): HabitReminder[] {
  if (typeof window === "undefined") return []
  const stored = localStorage.getItem(REMINDERS_KEY)
  return stored ? JSON.parse(stored) : []
}

// Check reminders every minute
export function startReminderCheck(): () => void {
  const intervalId = setInterval(() => {
    checkReminders()
  }, 60000) // Every minute

  return () => clearInterval(intervalId)
}

function checkReminders() {
  const now = new Date()
  const currentTime = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`
  const currentDay = now.getDay() || 7 // 1-7 (Mon-Sun)

  // Check habit reminders
  const reminders = getHabitReminders()
  for (const reminder of reminders) {
    if (reminder.time === currentTime && reminder.days.includes(currentDay)) {
      sendBrowserNotification("Напоминание о привычке", {
        body: reminder.habitName,
        tag: `habit-${reminder.habitId}`,
        requireInteraction: true,
      })
    }
  }

  // Check daily reminder
  const dailyEnabled = localStorage.getItem("lifeos_daily_reminder_enabled") === "true"
  const dailyTime = localStorage.getItem("lifeos_daily_reminder_time")
  if (dailyEnabled && dailyTime && dailyTime === currentTime) {
    const lastSent = localStorage.getItem("lifeos_daily_reminder_last_sent")
    const today = now.toDateString()
    if (lastSent !== today) {
      sendBrowserNotification("LifeOS", {
        body: "Не забудьте проверить задачи и привычки на сегодня! 🎯",
        tag: "daily-reminder",
      })
      localStorage.setItem("lifeos_daily_reminder_last_sent", today)
    }
  }
}
