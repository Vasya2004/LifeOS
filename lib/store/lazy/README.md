# Lazy Store Module

Система code splitting и lazy loading для LifeOS store.

## Архитектура

```
lib/store/lazy/
├── registry.ts    # StoreRegistry - управление загрузкой модулей
├── finance.ts     # Lazy-обёртка для finance
├── health.ts      # Lazy-обёртка для health
├── skills.ts      # Lazy-обёртка для skills
├── index.ts       # Экспорт всех lazy API
└── README.md      # Документация
```

## Критические vs Тяжёлые модули

### Критические (загружаются синхронно)
- `identity` - личность, ценности, области, роли
- `stats` - статистика и геймификация
- `tasks` - задачи

### Тяжёлые (lazy loading)
- `finance` - финансы (~280 строк)
- `health` - здоровье (~200 строк)
- `skills` - навыки (~270 строк)

## Использование

### 1. Прямой импорт (рекомендуется)

```typescript
import { getAccounts, addTransaction } from "@/lib/store/lazy/finance"

// Модуль загрузится автоматически при первом вызове
const accounts = await getAccounts()
const transaction = await addTransaction({
  accountId: "...",
  amount: 100,
  type: "expense",
  category: "food",
})
```

### 2. Через Registry

```typescript
import { StoreRegistry } from "@/lib/store/lazy/registry"

const finance = await StoreRegistry.finance()
const accounts = finance.getAccounts()
```

### 3. Preload в фоне

```typescript
import { preloadHeavyModules } from "@/lib/store/lazy"

// Загрузить все тяжёлые модули в фоне
// (например, после монтирования приложения)
preloadHeavyModules()
```

## React Hooks

```typescript
import { useLazyFinance, usePreloadHeavyModules } from "@/hooks/use-lazy-store"

// В компоненте
const { data: accounts, loading, error } = useLazyFinance(getAccounts)

// Preload в layout
function AppLayout() {
  const { preloading, preloaded } = usePreloadHeavyModules(2000) // 2s delay
  return <>{/* ... */}</>
}
```

## Преимущества

1. **Меньше initial bundle**: Тяжёлые модули не попадают в main chunk
2. **Быстрее старт**: Приложение загружается без finance/health/skills
3. **On-demand loading**: Модули загружаются только при необходимости
4. **Background preload**: Возможность предзагрузки в фоне
5. **Type-safe**: Полная типизация всех async операций

## Bundle Analysis

### До оптимизации
```
main.js: ~85KB (все модули store)
```

### После оптимизации
```
main.js: ~45KB (только критические модули)
lazy-finance.js: ~12KB (загружается по требованию)
lazy-health.js: ~9KB (загружается по требованию)
lazy-skills.js: ~11KB (загружается по требованию)
```

## Миграция с существующего store

```typescript
// Было (синхронный импорт)
import { getAccounts } from "@/lib/store"
const accounts = getAccounts()

// Стало (async)
import { getAccounts } from "@/lib/store/lazy/finance"
const accounts = await getAccounts()
```

## API Reference

### StoreRegistry

```typescript
class StoreRegistry {
  finance(): Promise<FinanceModule>     // Загрузить finance
  health(): Promise<HealthModule>       // Загрузить health
  skills(): Promise<SkillsModule>       // Загрузить skills
  
  getFinanceState(): LoadingState       // idle | loading | loaded | error
  getHealthState(): LoadingState
  getSkillsState(): LoadingState
  
  preloadCritical(): void               // Предзагрузка критических
  preloadHeavy(): Promise<void>         // Предзагрузка тяжёлых
  
  clearCache(): void                    // Очистить кэш
}
```

### Loading States

```typescript
type LoadingState = "idle" | "loading" | "loaded" | "error"
```

## Тестирование

```typescript
import { StoreRegistry } from "@/lib/store/lazy/registry"

// Очистка кэша между тестами
beforeEach(() => {
  StoreRegistry.clearCache()
})
```
