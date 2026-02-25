# Real-time Features

LifeOS supports real-time synchronization using Supabase Realtime.

## Features

- **Live Data Updates** - Changes from other devices appear instantly
- **Auto-revalidation** - SWR cache is automatically updated
- **Connection Status** - Visual indicator shows realtime connection state
- **Selective Sync** - Subscribe only to needed tables

## Setup

1. Run migration to enable realtime:
```bash
psql < supabase/migrations/003_realtime.sql
```

2. Realtime is automatically enabled via `RealtimeProvider` in layout

## Usage

### Basic Hook Usage

```tsx
import { useRealtimeGoals } from "@/hooks/realtime"

function MyComponent() {
  // Automatically subscribes to goals changes
  useRealtimeGoals()
  
  return <div>Goals are synced in real-time</div>
}
```

### Available Hooks

| Hook | Description |
|------|-------------|
| `useRealtimeGoals()` | Subscribe to all goals changes |
| `useRealtimeGoal(id)` | Subscribe to single goal |
| `useRealtimeTasks()` | Subscribe to tasks |
| `useRealtimeHabits()` | Subscribe to habits |
| `useRealtimeSkills()` | Subscribe to skills |
| `useRealtimeStatus()` | Get connection status |

### Custom Subscription

```tsx
import { useRealtimeSubscription } from "@/hooks/realtime"

function MyComponent() {
  useRealtimeSubscription("tasks", "tasks-key", {
    event: "INSERT", // Only new items
    onChange: (payload) => {
      console.log("New task:", payload.new)
    }
  })
}
```

### Connection Status

```tsx
import { RealtimeStatus } from "@/components/realtime-status"

function Header() {
  return <RealtimeStatus showLabel />
}
```

## How It Works

1. **Subscription** - Client subscribes to PostgreSQL changes via WebSocket
2. **Trigger** - Database trigger notifies Supabase Realtime
3. **Broadcast** - Change is broadcast to all connected clients
4. **Update** - Client revalidates SWR cache, UI updates automatically

## Architecture

```
┌─────────────┐     WebSocket     ┌──────────────┐
│   Client    │ ◄────────────────► │  Supabase    │
│  (React)    │                    │  Realtime    │
└──────┬──────┘                    └──────┬───────┘
       │                                   │
       │ SWR Revalidation                  │ PostgreSQL
       ▼                                   ▼
┌─────────────┐                    ┌──────────────┐
│   Cache     │                    │   Database   │
└─────────────┘                    └─────────────┘
```

## Troubleshooting

### Not receiving updates?
- Check if realtime is enabled in Supabase dashboard
- Verify RLS policies allow reading changes
- Check browser console for connection errors

### High memory usage?
- Unsubscribe when components unmount (handled automatically)
- Use specific filters instead of subscribing to entire tables
- Limit number of simultaneous subscriptions
