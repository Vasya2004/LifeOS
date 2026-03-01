/**
 * Google Calendar API client
 */

import { GoogleCalendar, GoogleEvent, GoogleWebhookData } from './types';

const GOOGLE_API_BASE = 'https://www.googleapis.com/calendar/v3';

export class GoogleCalendarApi {
  constructor(private accessToken: string) {}

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${GOOGLE_API_BASE}${endpoint}`;
    
    const response = await fetch(url, {
      ...options,
      headers: {
        'Authorization': `Bearer ${this.accessToken}`,
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('UNAUTHORIZED');
      }
      const error = await response.text();
      throw new Error(`API request failed: ${error}`);
    }

    return response.json();
  }

  /**
   * Get list of user's calendars
   */
  async getCalendars(): Promise<GoogleCalendar[]> {
    const response = await this.request<{ items: GoogleCalendar[] }>('/users/me/calendarList');
    return response.items;
  }

  /**
   * Get calendar by ID
   */
  async getCalendar(calendarId: string): Promise<GoogleCalendar> {
    return this.request<GoogleCalendar>(`/calendars/${encodeURIComponent(calendarId)}`);
  }

  /**
   * Get events from calendar
   */
  async getEvents(
    calendarId: string,
    options: {
      timeMin?: Date;
      timeMax?: Date;
      maxResults?: number;
      pageToken?: string;
      syncToken?: string;
      showDeleted?: boolean;
    } = {}
  ): Promise<{ events: GoogleEvent[]; nextPageToken?: string; nextSyncToken?: string }> {
    const params = new URLSearchParams();
    
    if (options.timeMin) {
      params.set('timeMin', options.timeMin.toISOString());
    }
    if (options.timeMax) {
      params.set('timeMax', options.timeMax.toISOString());
    }
    if (options.maxResults) {
      params.set('maxResults', options.maxResults.toString());
    }
    if (options.pageToken) {
      params.set('pageToken', options.pageToken);
    }
    if (options.syncToken) {
      params.set('syncToken', options.syncToken);
    }
    if (options.showDeleted) {
      params.set('showDeleted', 'true');
    }

    params.set('singleEvents', 'true');
    params.set('orderBy', 'startTime');

    const response = await this.request<{
      items: GoogleEvent[];
      nextPageToken?: string;
      nextSyncToken?: string;
    }>(`/calendars/${encodeURIComponent(calendarId)}/events?${params.toString()}`);

    return {
      events: response.items || [],
      nextPageToken: response.nextPageToken,
      nextSyncToken: response.nextSyncToken,
    };
  }

  /**
   * Create a new event
   */
  async createEvent(
    calendarId: string,
    event: Partial<GoogleEvent>
  ): Promise<GoogleEvent> {
    return this.request<GoogleEvent>(
      `/calendars/${encodeURIComponent(calendarId)}/events`,
      {
        method: 'POST',
        body: JSON.stringify(event),
      }
    );
  }

  /**
   * Update an event
   */
  async updateEvent(
    calendarId: string,
    eventId: string,
    event: Partial<GoogleEvent>
  ): Promise<GoogleEvent> {
    return this.request<GoogleEvent>(
      `/calendars/${encodeURIComponent(calendarId)}/events/${encodeURIComponent(eventId)}`,
      {
        method: 'PATCH',
        body: JSON.stringify(event),
      }
    );
  }

  /**
   * Delete an event
   */
  async deleteEvent(calendarId: string, eventId: string): Promise<void> {
    await this.request(
      `/calendars/${encodeURIComponent(calendarId)}/events/${encodeURIComponent(eventId)}`,
      {
        method: 'DELETE',
      }
    );
  }

  /**
   * Watch for changes (webhook setup)
   */
  async watchCalendar(
    calendarId: string,
    webhookUrl: string,
    channelId: string,
    token?: string
  ): Promise<GoogleWebhookData> {
    const body: Record<string, string> = {
      id: channelId,
      type: 'web_hook',
      address: webhookUrl,
    };
    
    if (token) {
      body.token = token;
    }

    return this.request<GoogleWebhookData>(
      `/calendars/${encodeURIComponent(calendarId)}/events/watch`,
      {
        method: 'POST',
        body: JSON.stringify(body),
      }
    );
  }

  /**
   * Stop watching for changes
   */
  async stopWatch(channelId: string, resourceId: string): Promise<void> {
    await this.request('/channels/stop', {
      method: 'POST',
      body: JSON.stringify({ id: channelId, resourceId }),
    });
  }
}
