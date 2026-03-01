# LifeOS Sync System

## Два слоя синхронизации

| Слой | Файл | Назначение |
|------|------|------------|
| **Активный** | `sync-engine-v2.ts` | Основной движок: очередь, realtime, конфликты, версионирование. Используется в приложении. |
| **UI** | `sync-provider-v2.tsx` | React-провайдер: подписка на состояние V2, тосты, диалог конфликтов, `useSync()`. |
| **Legacy** | `sync-engine.ts` | Старый движок (очередь + JSON blob в `user_data`). Оставлен для совместимости; новый код использует V2. |

В `layout.tsx` подключён только **SyncProviderV2**; он внутри вызывает `syncEngineV2`. Импорты из `sync-engine.ts` в новом коде не использовать.

## Архитектура синхронизации

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│  Local Storage  │◄───►│  Sync Engine V2 │◄───►│   Supabase      │
│  (IndexedDB)    │     │                 │     │  (PostgreSQL)   │
└─────────────────┘     └─────────────────┘     └─────────────────┘
        │                       │                        │
        │                ┌──────┴──────┐                 │
        │                │             │                 │
        │           Realtime      Conflict             Realtime
        │           Channel       Resolution           Subscriptions
        │                             │                    │
        └─────────────────────────────┴────────────────────┘
```

## Компоненты

### 1. Sync Engine V2 (`sync-engine-v2.ts`)

Основной движок синхронизации с поддержкой:
- **Offline-first**: Очередь изменений
- **Realtime**: Подписки на изменения
- **Conflict Resolution**: Автоматическое и ручное разрешение конфликтов
- **Versioning**: Версионирование данных

```typescript
import { syncEngineV2 } from '@/lib/sync/sync-engine-v2'

// Инициализация
await syncEngineV2.initialize({
  enableRealtime: true,
  autoSync: true,
  syncInterval: 5 * 60 * 1000, // 5 минут
  conflictStrategy: 'merge'
})

// Добавить в очередь
syncEngineV2.enqueue('tasks', 'create', newTask)

// Принудительная синхронизация
await syncEngineV2.forceSync()
```

### 2. Sync Provider (`sync-provider-v2.tsx`)

React Provider для использования в приложении:

```typescript
// layout.tsx
import { SyncProviderV2 } from '@/components/sync/sync-provider-v2'

<SyncProviderV2>
  {children}
</SyncProviderV2>

// Использование в компоненте
import { useSync } from '@/components/sync/sync-provider-v2'

function MyComponent() {
  const { status, isOnline, pendingCount, forceSync } = useSync()
  // ...
}
```

### 3. Hooks

```typescript
// Полный контроль
import { useSyncV2 } from '@/hooks/use-sync-v2'

const {
  status,
  lastSync,
  pendingCount,
  conflicts,
  sync,
  resolveConflicts
} = useSyncV2({
  onConflict: (conflicts) => console.log(conflicts),
  onError: (error) => console.error(error),
})

// Только статус
import { useSyncStatus } from '@/hooks/use-sync-v2'
const status = useSyncStatus()
```

## Таблицы в Supabase

Все таблицы имеют:
- `user_id` - RLS политика
- `updated_at` - для инкрементальной синхронизации
- Realtime publication

### Основные таблицы:
- `tasks`, `habits`, `goals`, `projects`
- `accounts`, `transactions`, `financial_goals`
- `skills`, `health_metrics`
- `user_stats`

## Conflict Resolution

### Автоматическое разрешение (стратегии):
- `local-wins` - локальная версия приоритетнее
- `remote-wins` - серверная версия приоритетнее
- `merge` - 3-way merge с умным объединением
- `manual` - пользователь выбирает

### UI для ручного разрешения:
```typescript
import { ConflictDialog } from '@/components/sync/conflict-dialog'

<ConflictDialog
  conflicts={conflicts}
  open={showDialog}
  onOpenChange={setShowDialog}
  onResolve={handleResolve}
  onResolveAll={handleResolveAll}
/>
```

## API Endpoints

### POST /api/sync/v2
Отправка изменений на сервер

```json
{
  "changes": [
    {
      "table": "tasks",
      "operation": "create",
      "data": { ... }
    }
  ],
  "lastSync": "2024-01-01T00:00:00Z"
}
```

### GET /api/sync/v2?since=...
Получение изменений с сервера

### DELETE /api/sync/v2
Очистка данных пользователя

## Миграция

### SQL миграция:
```bash
# Применить миграцию в Supabase SQL Editor
supabase/migrations/003_full_schema.sql
```

### Включить Realtime:
```sql
-- В Supabase Dashboard → Database → Replication
-- Включить realtime для нужных таблиц
```

## Использование в Store

Автоматическая синхронизация при изменениях:

```typescript
// lib/store/tasks.ts
import { syncEngineV2 } from '@/lib/sync/sync-engine-v2'

export function addTask(task: Task) {
  // Сохранить локально
  const tasks = getTasks()
  tasks.push(task)
  setStore(KEYS.tasks, tasks)
  
  // Добавить в очередь синхронизации
  syncEngineV2.enqueue('tasks', 'create', task)
  
  // Обновить UI
  mutateKey(KEYS.tasks)
}
```

## Отладка

```typescript
// Просмотр состояния
console.log(syncEngineV2.getState())

// Просмотр очереди
console.log(syncEngineV2.getQueueItems())

// Очистка очереди
syncEngineV2.clearQueue()
```
