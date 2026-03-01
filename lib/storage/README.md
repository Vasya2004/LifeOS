# Hybrid Storage Architecture

SSR-friendly хранилище данных для Next.js 16 App Router.

## Архитектура

```
┌─────────────────────────────────────────────────────────────┐
│                         SERVER                              │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐     │
│  │   Cookies   │    │  getServer  │    │  Server     │     │
│  │   (4KB)     │◄───│   State()   │◄───│  Actions    │     │
│  │             │    │             │    │             │     │
│  │ • identity  │    │  layout.tsx │    │ • setStats  │     │
│  │ • stats     │    │             │    │ • setAuth   │     │
│  │ • settings  │    │  passed to  │    │             │     │
│  │ • theme     │    │  providers  │    │             │     │
│  └──────┬──────┘    └─────────────┘    └─────────────┘     │
└───────┼─────────────────────────────────────────────────────┘
        │ initialState
        ▼
┌─────────────────────────────────────────────────────────────┐
│                    HYBRID PROVIDER                          │
│              (hydrates client storage)                      │
└───────┬─────────────────────────────────────────────────────┘
        │
        ▼
┌─────────────────────────────────────────────────────────────┐
│                        CLIENT                               │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐     │
│  │  IndexedDB  │◄───│ useHybrid   │◄───│   Hooks     │     │
│  │   (50MB+)   │    │   Data()    │    │             │     │
│  │             │    │             │    │ • identity  │     │
│  │ • identity  │    │  SSR-safe   │    │ • stats     │     │
│  │ • stats     │    │  fallback   │    │ • settings  │     │
│  │ • settings  │    │  hydration  │    │ • areas     │     │
│  │ • areas     │    │             │    │ • goals     │     │
│  │ • goals     │    │             │    │ • tasks     │     │
│  │ • tasks     │    │             │    │             │     │
│  │ • ...       │    │             │    │             │     │
│  └──────┬──────┘    └─────────────┘    └─────────────┘     │
│         │                                                   │
│         └──────────────────────┐                            │
│                                ▼                            │
│                       ┌─────────────┐                       │
│                       │   Cookies   │                       │
│                       │   (sync)    │                       │
│                       │             │                       │
│                       │  debounced  │                       │
│                       │  periodic   │                       │
│                       └─────────────┘                       │
└─────────────────────────────────────────────────────────────┘
```

## Структура файлов

```
lib/storage/
├── types.ts       # TypeScript типы, константы, дефолты
├── server.ts      # Серверные утилиты (cookies, Server Actions)
├── client.ts      # Клиентские утилиты (hydration, sync)
├── hybrid.ts      # Универсальные accessors
└── index.ts       # Публичный API (типы + константы)

hooks/
└── use-hybrid-data.ts   # SSR-safe React hooks

components/
└── hybrid-provider.tsx  # Провайдер для гидратации

app/
└── layout.tsx           # Получает serverState, передаёт в HybridProvider
```

## Использование

### 1. Server Component (layout/page)

```tsx
// app/layout.tsx
import { getServerState } from '@/lib/storage/server'
import { HybridProvider } from '@/components/hybrid-provider'

export default async function RootLayout({ children }) {
  const serverState = await getServerState()
  
  return (
    <html>
      <body>
        <HybridProvider initialState={serverState}>
          {children}
        </HybridProvider>
      </body>
    </html>
  )
}
```

### 2. Client Component с SSR-safe данными

```tsx
'use client'

import { useHybridIdentity, useHybridStats } from '@/hooks/use-hybrid-data'
import type { ServerState } from '@/lib/storage'

interface Props {
  serverState: ServerState
}

export function UserHeader({ serverState }: Props) {
  // Работает на сервере (fallback) и клиенте (hydrated)
  const { data: identity, isReady } = useHybridIdentity(serverState)
  const { data: stats } = useHybridStats(serverState)

  if (!isReady) return <Skeleton />

  return (
    <div>
      <h1>{identity.name}</h1>
      <span>Level {stats.level}</span>
    </div>
  )
}
```

### 3. Обновление данных

```tsx
const { setData, syncNow } = useHybridIdentity(serverState)

// Оптимистичное обновление + debounced sync
setData(prev => ({ ...prev, name: 'New Name' }))

// Немедленный sync (например, перед навигацией)
await syncNow()
```

### 4. Server Actions (для критических обновлений)

```tsx
// app/actions.ts
'use server'

import { setServerStats } from '@/lib/storage/server'

export async function updateUserLevel(level: number) {
  await setServerStats({ level, xp: 0, xpToNext: 100, coins: 0 })
}
```

## Cookie Size Limits

| Data | Size | Cookie? |
|------|------|---------|
| identity (minimal) | ~100 bytes | ✅ Да |
| stats (minimal) | ~80 bytes | ✅ Да |
| settings (theme) | ~20 bytes | ✅ Да |
| areas | ~2-10 KB | ❌ Нет (IndexedDB) |
| goals | ~5-50 KB | ❌ Нет (IndexedDB) |
| tasks | ~10-100 KB | ❌ Нет (IndexedDB) |

**Всего cookies: < 4KB** (безопасно)

## Flow данных

### Первый визит (новый пользователь)
1. Сервер: нет cookies → default state
2. Клиент: гидратация с default значениями
3. IndexedDB: создаётся с полными данными

### Возвращение пользователя
1. Сервер: читает cookies → minimal state
2. Клиент: получает serverState через props
3. Гидратация: merge server → IndexedDB
4. UI: показывает SSR-rendered данные
5. Client storage: полные данные из IndexedDB

### Обновление данных
1. User action → `setData()` (optimistic)
2. IndexedDB: обновляется сразу
3. Cookies: debounced sync (1s)
4. Следующий SSR: видит новые cookies

## API Reference

### Server (`@/lib/storage/server`)

```typescript
// Получение состояния
getServerState(): Promise<ServerState>
getServerIdentity(): Promise<MinimalIdentity | null>
getServerTheme(): Promise<'dark' | 'light' | 'system'>

// Server Actions
setServerIdentity(identity): Promise<void>
setServerStats(stats): Promise<void>
setServerSettings(settings): Promise<void>
setServerAuth(isAuth): Promise<void>
clearServerCookies(): Promise<void>

// Конвертеры
ToServerIdentity(full) → minimal
toServerStats(full) → minimal
toServerSettings(full) → minimal
```

### Client (`@/lib/storage/client`)

```typescript
// Гидратация
hydrateFromServer(serverState): Promise<void>

// Синхронизация
syncWithServer(options?): Promise<SyncResult>
debouncedSync(key, delay?): void
flushPendingSyncs(): Promise<SyncResult>

// Cookies (client-side)
getCookie(name): string | null
setCookie(name, value, options?): void

// Setup
setupAutoSync(): void
```

### Hooks (`@/hooks/use-hybrid-data`)

```typescript
useHybridIdentity(serverState?) → UseHybridDataReturn<Identity>
useHybridStats(serverState?) → UseHybridDataReturn<UserStats>
useHybridSettings(serverState?) → UseHybridDataReturn<AppSettings>
useHybridAreas() → UseHybridDataReturn<LifeArea[]> // client-only
useHybridData<T>(options) → UseHybridDataReturn<T> // generic

// Утилиты
useIsHydrated() → boolean
```

## Types

```typescript
interface ServerState {
  identity: { id, name, onboardingCompleted } | null
  stats: { level, xp, xpToNext, coins } | null
  settings: { theme } | null
  lastSyncAt: string | null
  isAuthenticated: boolean
}

interface UseHybridDataReturn<T> {
  serverData: T | null      // Данные с сервера (SSR)
  clientData: T | null      // Данные из IndexedDB
  isLoading: boolean
  isHydrating: boolean
  isReady: boolean          // Можно ли рендерить UI
  error: Error | null
  setData: (value) => void  // Optimistic update
  syncNow: () => Promise<void>
  refresh: () => Promise<void>
}
```

## Best Practices

1. **Всегда передавайте `serverState`** в useHybrid hooks для мгновенного SSR fallback
2. **Используйте `isReady`** для показа skeleton/loading состояния
3. **Не храните большие данные в cookies** - используйте IndexedDB
4. **Debounced sync** для частых обновлений (XP, прогресс)
5. **Immediate sync** перед важными операциями (навигация, logout)

## Миграция с существующего store

```typescript
// Было (только client)
import { getIdentity } from '@/lib/store'
const identity = getIdentity()

// Стало (SSR-safe)
import { useHybridIdentity } from '@/hooks/use-hybrid-data'
const { data: identity, isReady } = useHybridIdentity(serverState)
```

Существующий `lib/store` продолжает работать как раньше. Новая архитектура добавляет слой поверх него для SSR.
