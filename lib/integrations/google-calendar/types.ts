/**
 * Google Calendar integration types
 */

export interface GoogleCalendar {
  id: string;
  summary: string;
  description?: string;
  timeZone: string;
  accessRole: string;
  backgroundColor?: string;
  foregroundColor?: string;
  selected?: boolean;
  primary?: boolean;
}

export interface GoogleEvent {
  id: string;
  summary: string;
  description?: string;
  location?: string;
  start: {
    date?: string;
    dateTime?: string;
    timeZone?: string;
  };
  end: {
    date?: string;
    dateTime?: string;
    timeZone?: string;
  };
  status: 'confirmed' | 'tentative' | 'cancelled';
  created: string;
  updated: string;
  creator: {
    email: string;
    displayName?: string;
  };
  attendees?: Array<{
    email: string;
    displayName?: string;
    responseStatus: 'needsAction' | 'declined' | 'tentative' | 'accepted';
  }>;
  recurrence?: string[];
  recurringEventId?: string;
  reminders?: {
    useDefault: boolean;
    overrides?: Array<{
      method: 'email' | 'popup';
      minutes: number;
    }>;
  };
  colorId?: string;
  extendedProperties?: {
    private?: Record<string, string>;
    shared?: Record<string, string>;
  };
}

export interface SyncedTask {
  id: string;
  title: string;
  description?: string;
  dueDate?: Date;
  completed: boolean;
  source: 'google-calendar' | 'lifeos';
  externalId?: string;
  calendarId?: string;
  lastSyncedAt: Date;
}

export interface CalendarSyncConfig {
  calendars: string[]; // Calendar IDs to sync
  syncDirection: 'push' | 'pull' | 'bidirectional';
  createTasksFromEvents: boolean;
  createEventsFromTasks: boolean;
  defaultCalendarId?: string;
  eventMapping: {
    includeDescription: boolean;
    includeLocation: boolean;
    reminderMinutes: number;
  };
}

export interface GoogleWebhookData {
  messageNumber?: string;
  resourceId?: string;
  resourceUri?: string;
  channelId?: string;
  channelExpiration?: string;
  token?: string;
  resourceState?: string;
}
