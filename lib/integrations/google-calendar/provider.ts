// ============================================
// GOOGLE CALENDAR INTEGRATION
// ============================================

import type { IntegrationProvider, SyncResult, IntegrationConfig } from "../registry"
import { createClient } from "@/lib/supabase/client"

const GOOGLE_CALENDAR_CONFIG: IntegrationConfig = {
  clientId: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '',
  clientSecret: '', // Only on server
  redirectUri: `${process.env.NEXT_PUBLIC_APP_URL}/api/integrations/auth/google-calendar/callback`,
  scopes: [
    'https://www.googleapis.com/auth/calendar.readonly',
    'https://www.googleapis.com/auth/calendar.events',
  ],
  authUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
  tokenUrl: 'https://oauth2.googleapis.com/token',
  apiBaseUrl: 'https://www.googleapis.com/calendar/v3',
}

export interface CalendarEvent {
  id: string
  summary: string
  description?: string
  start: { dateTime?: string; date?: string }
  end: { dateTime?: string; date?: string }
  status: string
  created: string
  updated: string
}

class GoogleCalendarProvider implements IntegrationProvider {
  id = 'google-calendar' as const
  name = 'Google Calendar'
  description = 'Синхронизация задач с Google Calendar'
  icon = 'calendar'
  category = 'calendar' as const
  config = GOOGLE_CALENDAR_CONFIG

  async connect(): Promise<void> {
    // Open OAuth popup
    const params = new URLSearchParams({
      client_id: this.config.clientId,
      redirect_uri: this.config.redirectUri,
      response_type: 'code',
      scope: this.config.scopes.join(' '),
      access_type: 'offline',
      prompt: 'consent',
    })

    const authUrl = `${this.config.authUrl}?${params.toString()}`
    window.location.href = authUrl
  }

  async disconnect(): Promise<void> {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) return

    // Revoke token on server
    await fetch('/api/integrations/auth/google-calendar/revoke', {
      method: 'POST',
    })

    // Delete from database
    await supabase
      .from('integrations')
      .delete()
      .eq('user_id', user.id)
      .eq('type', this.id)
  }

  async isConnected(): Promise<boolean> {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) return false

    const { data } = await supabase
      .from('integrations')
      .select('connected')
      .eq('user_id', user.id)
      .eq('type', this.id)
      .single()

    return data?.connected || false
  }

  async sync(): Promise<SyncResult> {
    const result: SyncResult = {
      success: false,
      itemsSynced: 0,
      errors: [],
    }

    try {
      // Get access token from server
      const tokenRes = await fetch('/api/integrations/auth/google-calendar/token')
      if (!tokenRes.ok) {
        throw new Error('Failed to get access token')
      }
      
      const { access_token } = await tokenRes.json()

      // Fetch events from last 7 days and next 30 days
      const timeMin = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
      const timeMax = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()

      const eventsRes = await fetch(
        `${this.config.apiBaseUrl}/calendars/primary/events?` +
        `timeMin=${timeMin}&timeMax=${timeMax}&singleEvents=true&orderBy=startTime`,
        {
          headers: { Authorization: `Bearer ${access_token}` },
        }
      )

      if (!eventsRes.ok) {
        throw new Error('Failed to fetch events')
      }

      const data = await eventsRes.json()
      const events: CalendarEvent[] = data.items || []

      // Convert events to tasks
      const tasks = events
        .filter(e => e.status !== 'cancelled')
        .map(event => ({
          title: event.summary,
          description: event.description,
          scheduledDate: event.start.dateTime?.split('T')[0] || event.start.date,
          scheduledTime: event.start.dateTime?.split('T')[1]?.slice(0, 5),
          duration: calculateDuration(event.start, event.end),
          externalId: event.id,
          source: 'google-calendar',
        }))

      // Sync with local tasks
      await this.syncTasksWithLocal(tasks)

      result.success = true
      result.itemsSynced = tasks.length
      result.nextSyncToken = data.nextSyncToken

    } catch (error) {
      result.errors.push(error instanceof Error ? error.message : 'Unknown error')
    }

    return result
  }

  private async syncTasksWithLocal(tasks: Array<{
    title: string
    description?: string
    scheduledDate: string
    scheduledTime?: string
    duration?: number
    externalId: string
    source: string
  }>): Promise<void> {
    // Import existing task functions
    const { getTasks, addTask, updateTask } = await import('@/lib/store/tasks')
    
    const existingTasks = getTasks()
    const existingExternalIds = new Set(
      existingTasks
        .filter(t => t.externalId)
        .map(t => t.externalId)
    )

    for (const task of tasks) {
      const existing = existingTasks.find(t => t.externalId === task.externalId)
      
      if (existing) {
        // Update existing task
        updateTask(existing.id, {
          title: task.title,
          description: task.description,
          scheduledDate: task.scheduledDate,
          scheduledTime: task.scheduledTime,
          duration: task.duration,
        })
      } else if (!existingExternalIds.has(task.externalId)) {
        // Create new task
        addTask({
          title: task.title,
          description: task.description,
          scheduledDate: task.scheduledDate,
          scheduledTime: task.scheduledTime,
          duration: task.duration,
          externalId: task.externalId,
          source: task.source,
          status: 'todo',
          priority: 'medium',
          energyCost: 'medium',
          energyType: 'mental',
        })
      }
    }
  }
}

function calculateDuration(
  start: { dateTime?: string; date?: string },
  end: { dateTime?: string; date?: string }
): number | undefined {
  if (!start.dateTime || !end.dateTime) return undefined
  
  const startTime = new Date(start.dateTime).getTime()
  const endTime = new Date(end.dateTime).getTime()
  return Math.round((endTime - startTime) / (1000 * 60)) // minutes
}

export const googleCalendarProvider = new GoogleCalendarProvider()
