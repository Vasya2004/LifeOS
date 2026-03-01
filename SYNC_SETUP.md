# Настройка синхронизации с Supabase

## Быстрый старт

### 1. Применение миграций в Supabase

```sql
-- В Supabase Dashboard → SQL Editor
-- Выполнить содержимое файла:
supabase/migrations/003_full_schema.sql
```

Это создаст:
- **28 таблиц** для всех сущностей LifeOS
- **RLS политики** для безопасности
- **Realtime подписки** для живых обновлений
- **Индексы** для производительности

### 2. Включение Realtime

В Supabase Dashboard:
1. Database → Replication
2. Включить Realtime для таблиц:
   - `tasks`, `habits`, `goals`, `projects`
   - `accounts`, `transactions`, `health_metrics`
   - `skills`, `user_stats`

### 3. Настройка окружения

Убедитесь, что `.env.local` содержит:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### 4. Перезапуск приложения

```bash
npm run dev
```

Синхронизация запустится автоматически при входе пользователя.

---

## Архитектура

### Offline-First Подход

```
Пользователь ──► Локальное хранилище ──► Очередь ──► Сервер
     │                   │                  │          │
     │                   ▼                  ▼          ▼
     │            ┌──────────┐         ┌────────┐  ┌─────────┐
     │            │ IndexedDB│         │ Queue  │  │Supabase │
     │            └──────────┘         └────────┘  └─────────┘
     │                                                  │
     └────────────────── Realtime ◄─────────────────────┘
```

1. **Локальные изменения** сохраняются сразу в IndexedDB
2. **Очередь** накапливает изменения для синхронизации
3. **Автосинхронизация** каждые 5 минут или при появлении сети
4. **Realtime** мгновенно доставляет изменения с сервера

---

## Использование

### В компонентах

```typescript
import { useSync } from '@/components/sync/sync-provider-v2'

function MyComponent() {
  const { 
    status,           // 'idle' | 'syncing' | 'error' | 'offline' | 'conflict'
    lastSync,         // timestamp последней синхронизации
    pendingCount,     // количество несинхронизированных изменений
    isOnline,         // есть ли подключение
    isSyncing,        // идёт ли синхронизация
    forceSync         // функция для принудительной синхронизации
  } = useSync()

  return (
    <div>
      {!isOnline && <Badge>Нет сети</Badge>}
      {pendingCount > 0 && <Badge>{pendingCount} изменений</Badge>}
      <Button onClick={forceSync} disabled={isSyncing}>
        Синхронизировать
      </Button>
    </div>
  )
}
```

### В store (автоматическая синхронизация)

```typescript
import { syncEngineV2 } from '@/lib/sync/sync-engine-v2'

export function addTask(task: Task) {
  // 1. Сохранить локально
  const tasks = getTasks()
  tasks.push(task)
  setStore(KEYS.tasks, tasks)
  
  // 2. Добавить в очередь синхронизации
  syncEngineV2.enqueue('tasks', 'create', task)
  
  // 3. Обновить UI
  mutateKey(KEYS.tasks)
}
```

---

## Конфликты

### Автоматическое разрешение

По умолчанию используется стратегия `merge`:
- Поля с разными значениями объединяются
- Массивы объединяются (unique)
- Числа берётся максимум

### Ручное разрешение

При сложных конфликтах появляется диалог:

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

Варианты разрешения:
- **Локальная версия** - мои изменения
- **Серверная версия** - изменения с других устройств
- **Объединить** - попытка объединить

---

## API Endpoints

### POST /api/sync/v2

Отправка изменений на сервер:

```json
{
  "changes": [
    {
      "table": "tasks",
      "operation": "create",
      "data": {
        "id": "...",
        "title": "New task",
        "status": "todo"
      }
    }
  ]
}
```

### GET /api/sync/v2?since=2024-01-01T00:00:00Z

Получение изменений с сервера:

```json
{
  "data": {
    "tasks": [...],
    "habits": [...]
  },
  "serverTime": "2024-01-01T12:00:00Z"
}
```

---

## Отладка

### Просмотр состояния
```typescript
import { syncEngineV2 } from '@/lib/sync/sync-engine-v2'

// Текущее состояние
console.log(syncEngineV2.getState())

// Очередь изменений
console.log(syncEngineV2.getQueueItems())

// Очистка очереди
syncEngineV2.clearQueue()
```

### Browser DevTools

```javascript
// В консоли браузера
window.syncEngine = syncEngineV2

// Просмотр
syncEngine.getState()
syncEngine.getQueueItems()

// Принудительная синхронизация
syncEngine.forceSync()
```

---

## Таблицы в БД

| Таблица | Назначение | Realtime |
|---------|-----------|----------|
| `tasks` | Задачи | ✅ |
| `habits` | Привычки | ✅ |
| `goals` | Цели | ✅ |
| `projects` | Проекты | ✅ |
| `accounts` | Финансовые счета | ✅ |
| `transactions` | Транзакции | ✅ |
| `skills` | Навыки | ✅ |
| `health_metrics` | Метрики здоровья | ✅ |
| `user_stats` | Статистика пользователя | ✅ |
| `daily_reviews` | Ежедневные обзоры | ❌ |
| `journal_entries` | Записи журнала | ❌ |

---

## Безопасность

### Row Level Security (RLS)

Все таблицы имеют RLS политики:
```sql
CREATE POLICY "Users can CRUD their own data" ON tasks
  FOR ALL USING (auth.uid() = user_id);
```

### User ID

Каждая запись привязана к `auth.users(id)`:
```typescript
{
  id: "...",
  user_id: "...", // <-- RLS проверяет это поле
  title: "...",
  ...
}
```

---

## Устранение неполадок

### Не синхронизируются данные

1. Проверьте авторизацию:
   ```typescript
   const { data: { user } } = await supabase.auth.getUser()
   console.log(user) // должно быть не null
   ```

2. Проверьте очередь:
   ```typescript
   syncEngineV2.getQueueItems()
   ```

3. Проверьте сетевой статус:
   ```typescript
   navigator.onLine // должно быть true
   ```

### Конфликты не разрешаются

1. Откройте диалог конфликтов
2. Выберите стратегию разрешения
3. Нажмите "Применить"

### Realtime не работает

1. Проверьте настройки в Supabase Dashboard
2. Проверьте подписки:
   ```typescript
   const channel = supabase.channel('test')
   channel.subscribe(status => console.log(status))
   ```

---

## Мониторинг

### Метрики синхронизации

| Метрика | Описание |
|---------|----------|
| `pendingCount` | Изменений в очереди |
| `lastSync` | Время последней синхронизации |
| `conflicts.length` | Нерешённых конфликтов |

### События

```typescript
useSyncV2({
  onConflict: (conflicts) => {
    console.log('Конфликты:', conflicts)
  },
  onError: (error) => {
    console.error('Ошибка синхронизации:', error)
  },
  onSync: () => {
    console.log('Синхронизация завершена')
  }
})
```
