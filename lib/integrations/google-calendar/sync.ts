/**
 * Google Calendar bidirectional sync
 */

import { SyncResult, SyncOptions } from '../types';
import { GoogleCalendarApi } from './api';
import { GoogleEvent, SyncedTask, CalendarSyncConfig } from './types';
import { createClient } from '@/lib/supabase/client';

interface SyncState {
  syncToken?: string;
  lastSyncAt?: Date;
  pageToken?: string;
}

/**
 * Convert Google Calendar event to LifeOS task
 */
function eventToTask(event: GoogleEvent): SyncedTask {
  const startDate = event.start.dateTime 
    ? new Date(event.start.dateTime)
    : event.start.date 
      ? new Date(event.start.date)
      : undefined;

  return {
    id: `gcal-${event.id}`,
    title: event.summary || 'Untitled Event',
    description: event.description,
    dueDate: startDate,
    completed: event.status === 'cancelled',
    source: 'google-calendar',
    externalId: event.id,
    calendarId: event.extendedProperties?.private?.calendarId,
    lastSyncedAt: new Date(),
  };
}

/**
 * Convert LifeOS task to Google Calendar event
 */
function taskToEvent(task: SyncedTask): Partial<GoogleEvent> {
  const endDate = task.dueDate 
    ? new Date(task.dueDate.getTime() + 60 * 60 * 1000) // 1 hour duration
    : undefined;

  return {
    summary: task.title,
    description: task.description,
    start: task.dueDate
      ? { dateTime: task.dueDate.toISOString() }
      : { date: new Date().toISOString().split('T')[0] },
    end: endDate
      ? { dateTime: endDate.toISOString() }
      : { date: new Date().toISOString().split('T')[0] },
    extendedProperties: {
      private: {
        lifeosTaskId: task.id,
        source: 'lifeos',
      },
    },
  };
}

/**
 * Load sync state from database
 */
async function loadSyncState(userId: string, calendarId: string): Promise<SyncState> {
  const supabase = createClient();
  
  const { data } = await supabase
    .from('calendar_sync_state')
    .select('*')
    .eq('user_id', userId)
    .eq('calendar_id', calendarId)
    .single();

  if (!data) {
    return {};
  }

  return {
    syncToken: data.sync_token,
    lastSyncAt: data.last_sync_at ? new Date(data.last_sync_at) : undefined,
  };
}

/**
 * Save sync state to database
 */
async function saveSyncState(
  userId: string,
  calendarId: string,
  state: SyncState
): Promise<void> {
  const supabase = createClient();
  
  await supabase
    .from('calendar_sync_state')
    .upsert({
      user_id: userId,
      calendar_id: calendarId,
      sync_token: state.syncToken,
      last_sync_at: state.lastSyncAt?.toISOString(),
      updated_at: new Date().toISOString(),
    });
}

/**
 * Pull events from Google Calendar
 */
async function pullEvents(
  api: GoogleCalendarApi,
  userId: string,
  calendarId: string,
  options: { timeMin?: Date; timeMax?: Date } = {}
): Promise<{ events: SyncedTask[]; syncToken?: string }> {
  const state = await loadSyncState(userId, calendarId);
  
  const allEvents: GoogleEvent[] = [];
  let pageToken: string | undefined;
  let finalSyncToken: string | undefined;

  do {
    const result = await api.getEvents(calendarId, {
      timeMin: options.timeMin,
      timeMax: options.timeMax,
      syncToken: state.syncToken,
      pageToken,
      showDeleted: true,
    });

    allEvents.push(...result.events);
    pageToken = result.nextPageToken;
    finalSyncToken = result.nextSyncToken;
  } while (pageToken);

  // Save new sync token
  if (finalSyncToken) {
    await saveSyncState(userId, calendarId, {
      syncToken: finalSyncToken,
      lastSyncAt: new Date(),
    });
  }

  return {
    events: allEvents.map(eventToTask),
    syncToken: finalSyncToken,
  };
}

/**
 * Push tasks to Google Calendar
 */
async function pushTasks(
  api: GoogleCalendarApi,
  calendarId: string,
  tasks: SyncedTask[]
): Promise<{ created: number; updated: number; failed: number }> {
  let created = 0;
  let updated = 0;
  let failed = 0;

  for (const task of tasks) {
    try {
      if (task.externalId) {
        // Update existing event
        await api.updateEvent(calendarId, task.externalId, taskToEvent(task));
        updated++;
      } else {
        // Create new event
        await api.createEvent(calendarId, taskToEvent(task));
        created++;
      }
    } catch (error) {
      console.error('[GoogleCalendarSync] Failed to push task:', error);
      failed++;
    }
  }

  return { created, updated, failed };
}

/**
 * Sync LifeOS tasks with local changes
 */
async function getPendingLifeosTasks(userId: string): Promise<SyncedTask[]> {
  const supabase = createClient();
  
  // Get tasks that need to be synced
  const { data } = await supabase
    .from('tasks')
    .select('*')
    .eq('user_id', userId)
    .eq('sync_status', 'pending')
    .is('external_id', null); // Only tasks not yet synced

  if (!data) return [];

  return data.map((row: Record<string, unknown>) => ({
    id: row.id as string,
    title: row.title as string,
    description: row.description as string,
    dueDate: row.due_date ? new Date(row.due_date as string) : undefined,
    completed: row.completed as boolean,
    source: 'lifeos',
    lastSyncedAt: new Date(),
  }));
}

/**
 * Mark tasks as synced
 */
async function markTasksSynced(
  userId: string,
  taskIds: string[],
  externalIds: Map<string, string>
): Promise<void> {
  const supabase = createClient();
  
  for (const taskId of taskIds) {
    await supabase
      .from('tasks')
      .update({
        sync_status: 'synced',
        external_id: externalIds.get(taskId),
        last_synced_at: new Date().toISOString(),
      })
      .eq('id', taskId)
      .eq('user_id', userId);
  }
}

/**
 * Perform bidirectional sync
 */
export async function syncCalendar(
  api: GoogleCalendarApi,
  userId: string,
  config: CalendarSyncConfig,
  options?: SyncOptions
): Promise<SyncResult> {
  const errors: string[] = [];
  let itemsSynced = 0;
  let itemsFailed = 0;

  try {
    const direction = options?.direction || config.syncDirection;

    for (const calendarId of config.calendars) {
      try {
        // Pull from Google
        if (direction === 'pull' || direction === 'bidirectional') {
          const { events } = await pullEvents(api, userId, calendarId, {
            timeMin: options?.dateRange?.from,
            timeMax: options?.dateRange?.to,
          });

          // Save events as tasks
          if (config.createTasksFromEvents && events.length > 0) {
            await saveEventsAsTasks(userId, events);
            itemsSynced += events.length;
          }
        }

        // Push to Google
        if (direction === 'push' || direction === 'bidirectional') {
          const pendingTasks = await getPendingLifeosTasks(userId);
          
          if (config.createEventsFromTasks && pendingTasks.length > 0) {
            const result = await pushTasks(api, calendarId, pendingTasks);
            itemsSynced += result.created + result.updated;
            itemsFailed += result.failed;
          }
        }
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Sync failed';
        errors.push(`Calendar ${calendarId}: ${message}`);
        itemsFailed++;
      }
    }

    return {
      success: errors.length === 0,
      itemsSynced,
      itemsFailed,
      errors,
      lastSyncAt: new Date(),
    };
  } catch (error) {
    return {
      success: false,
      itemsSynced,
      itemsFailed,
      errors: [error instanceof Error ? error.message : 'Unknown error'],
      lastSyncAt: new Date(),
    };
  }
}

/**
 * Save pulled events as tasks in LifeOS
 */
async function saveEventsAsTasks(userId: string, events: SyncedTask[]): Promise<void> {
  const supabase = createClient();
  
  for (const event of events) {
    // Check if task already exists
    const { data: existing } = await supabase
      .from('tasks')
      .select('id')
      .eq('user_id', userId)
      .eq('external_id', event.externalId)
      .single();

    if (existing) {
      // Update existing
      await supabase
        .from('tasks')
        .update({
          title: event.title,
          description: event.description,
          due_date: event.dueDate?.toISOString(),
          completed: event.completed,
          last_synced_at: event.lastSyncedAt.toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', existing.id);
    } else {
      // Create new
      await supabase
        .from('tasks')
        .insert({
          user_id: userId,
          title: event.title,
          description: event.description,
          due_date: event.dueDate?.toISOString(),
          completed: event.completed,
          external_id: event.externalId,
          external_source: 'google-calendar',
          sync_status: 'synced',
          last_synced_at: event.lastSyncedAt.toISOString(),
          created_at: new Date().toISOString(),
        });
    }
  }
}
