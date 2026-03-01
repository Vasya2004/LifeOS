# LifeOS Improvements

## Выполненные улучшения

### 1. Store Code Splitting ✅

**Проблема**: Монолитный store (6000+ строк) загружался целиком

**Решение**: Создана lazy-loading система

```typescript
// Новая структура
lib/store/lazy/
├── registry.ts      # Реестр модулей с async загрузкой
├── finance.ts       # Lazy-загрузка финансов
├── health.ts        # Lazy-загрузка здоровья
├── skills.ts        # Lazy-загрузка навыков
└── index.ts         # Единый экспорт

// Использование
const accounts = await lazyFinance.getAccounts() // Async import()
```

**Преимущества**:
- Критические модули загружаются сразу
- Тяжёлые модули (finance, health, skills) - lazy
- Уменьшение начального бандла

---

### 2. SSR-Friendly Архитектура ✅

**Проблема**: Только localStorage, нет серверного рендеринга

**Решение**: Гибридное хранилище

```typescript
// Server (cookies, <4KB)
- identity (name, onboarding)
- stats (level, xp, streak)
- settings (theme)

// Client (IndexedDB, 50MB+)
- Полные данные всех модулей
```

**Новые файлы**:
```
lib/storage/
├── hybrid.ts      # Универсальные accessors
├── server.ts      # Server Actions + cookies
├── client.ts      # Hydration
└── types.ts       # Типы

hooks/use-hybrid-data.ts  # SSR-safe hooks
components/hybrid-provider.tsx
```

**Flow**:
1. Сервер читает cookies → `serverState`
2. `HybridProvider` гидратирует client storage
3. Компоненты используют `useHybridData` → SSR-safe

---

### 3. Реальный AI Advisor ✅

**Проблема**: AIAdvisor - заглушка со статическими советами

**Решение**: Интеграция с OpenAI/Anthropic + fallback

```typescript
// lib/ai/
├── config.ts      # Конфигурация провайдеров
├── prompts.ts     # Промпты для разных типов
├── client.ts      # API клиент
├── fallback.ts    # Local rule-based engine
└── index.ts       # Экспорты

// API Route
app/api/ai/advice/route.ts

// Rate Limiting: 5 req/min
// Cost: ~$0.01/100 запросов (GPT-4o-mini)
// Cache: 5 минут
```

**Типы советов**:
- `urgent` - Просроченные задачи
- `warning` - Низкая серия
- `tip` - Рекомендации по привычкам
- `positive` - Позитивные подкрепления

**Fallback**: Если AI недоступен - rule-based логика (анализ streaks, goals, tasks)

---

### 4. Conflict Resolution ✅

**Проблема**: "Last write wins" - потеря данных при конфликтах

**Решение**: CRDT-inspired versioning

```typescript
// lib/sync/
├── conflict-resolver.ts   # Vector clocks, 3-way merge
├── versioning.ts          # History, revert
└── sync-engine.ts         # Обновлённый sync

// UI
components/sync/conflict-dialog.tsx
```

**Структура версионированной сущности**:
```typescript
interface VersionedEntity<T> {
  id: string
  data: T
  _version: number
  _modifiedAt: string
  _deviceId: string
  _vectorClock: VectorClock
}
```

**Стратегии разрешения**:
- `local-wins` - локальная версия
- `remote-wins` - серверная версия
- `merge` - 3-way merge с автоматическим разрешением
- `manual` - пользователь выбирает

**UI**: Диалог с diff view для ручного разрешения

---

### 5. Интеграции с внешними сервисами ✅

**Проблема**: Нет интеграций с Google Calendar, Apple Health и т.д.

**Решение**: Расширяемая система интеграций

```typescript
// lib/integrations/
├── registry.ts                    # Registry паттерн
├── google-calendar/provider.ts    # Google Calendar API
└── apple-health/provider.ts       # Apple HealthKit

// API Routes
app/api/integrations/
├── auth/google-calendar/callback/
├── auth/google-calendar/token/
└── webhook/

// UI
app/settings/integrations/page.tsx
components/integrations/
├── integration-card.tsx
└── sync-status.tsx
```

**Поддерживаемые сервисы**:
| Сервис | Тип | Функционал |
|--------|-----|------------|
| Google Calendar | Календарь | Синхронизация событий → задачи |
| Apple Health | Здоровье | Шаги, сон, пульс |
| Fitbit | Фитнес | Активность, сон |

**Безопасность**:
- Токены хранятся encrypted в Supabase
- OAuth на server-side
- HTTPS only
- Пользователь контролирует disconnect

---

## Миграция

### Для разработчика

1. **Применить миграции БД**:
```bash
# SQL в supabase/migrations/002_integrations.sql
```

2. **Настроить окружение**:
```env
# AI
AI_PROVIDER=openai
OPENAI_API_KEY=sk-...

# Google Calendar
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
NEXT_PUBLIC_GOOGLE_CLIENT_ID=...
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

3. **Установить зависимости**:
```bash
npm install
```

### Для пользователя

1. Обновление прозрачно - данные сохраняются
2. Новые функции появятся в Settings → Integrations
3. AI Advisor начнёт работать при наличии API ключа

---

## Архитектура (итоговая)

```
┌─────────────────────────────────────────────────────────────────┐
│                         PRESENTATION                            │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌──────────┐  │
│  │   UI    │ │ Dashboard│ │  Forms  │ │ AIAdvisor│ │Integrations│ │
│  └────┬────┘ └────┬────┘ └────┬────┘ └────┬────┘ └────┬─────┘  │
├───────┼───────────┼───────────┼───────────┼───────────┼────────┤
│                       HYBRID STORAGE                            │
│     ┌─────────────────┐          ┌─────────────────┐            │
│     │   Server (SSR)  │          │  Client (IDB)   │            │
│     │   Cookies 4KB   │◄────────►│   Data 50MB+    │            │
│     └─────────────────┘          └─────────────────┘            │
├─────────────────────────────────────────────────────────────────┤
│                         SYNC LAYER                              │
│  ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐   │
│  │ Conflict        │ │ Versioning      │ │ Integrations    │   │
│  │ Resolution      │ │ History/Revert  │ │ External APIs   │   │
│  └─────────────────┘ └─────────────────┘ └─────────────────┘   │
├─────────────────────────────────────────────────────────────────┤
│                         BACKEND                                 │
│  ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐   │
│  │ Supabase Auth   │ │ PostgreSQL      │ │ AI API          │   │
│  │ OAuth Callbacks │ │ Integrations    │ │ OpenAI/Claude   │   │
│  └─────────────────┘ └─────────────────┘ └─────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```
