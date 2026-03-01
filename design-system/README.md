# 🎨 LifeOS Design System

> Единая система дизайна для приложения LifeOS

## 📁 Структура

```
design-system/
├── tokens.ts       # Цвета, отступы, типографика, тени и т.д.
├── components.ts   # Готовые стили для компонентов
└── README.md       # Этот файл
```

## 🚀 Быстрый старт

### 1. Импорт

```typescript
import { button, card, input, text } from '@/design-system/components'
import { colors, spacing } from '@/design-system/tokens'
```

### 2. Использование

```tsx
// Button
<button className={cn(button.base, button.variants.primary, button.sizes.md)}>
  Сохранить
</button>

// Card
<div className={cn(card.base, card.variants.default, card.padding.md)}>
  <h3 className={text.h3}>Заголовок</h3>
  <p className={text.body}>Контент карточки</p>
</div>

// Input
<input 
  className={cn(input.base, input.sizes.md)} 
  placeholder="Введите текст..."
/>
```

## 🎯 Компоненты

### Button (Кнопки)

```tsx
import { button } from '@/design-system/components'
import { cn } from '@/lib/utils'

// Variants
<button className={cn(button.base, button.variants.primary)}>Primary</button>
<button className={cn(button.base, button.variants.secondary)}>Secondary</button>
<button className={cn(button.base, button.variants.ghost)}>Ghost</button>
<button className={cn(button.base, button.variants.destructive)}>Delete</button>
<button className={cn(button.base, button.variants.xp)}>+100 XP</button>

// Sizes
<button className={cn(button.base, button.sizes.sm)}>Small</button>
<button className={cn(button.base, button.sizes.md)}>Medium</button>
<button className={cn(button.base, button.sizes.lg)}>Large</button>
```

### Card (Карточки)

```tsx
import { card } from '@/design-system/components'

// Variants
<div className={cn(card.base, card.variants.default)}>Default</div>
<div className={cn(card.base, card.variants.elevated)}>Elevated</div>
<div className={cn(card.base, card.variants.interactive)}>Interactive</div>
<div className={cn(card.base, card.variants.success)}>Success</div>
```

### Input (Поля ввода)

```tsx
import { input } from '@/design-system/components'

<input className={cn(input.base, input.sizes.md)} />
<input className={cn(input.base, input.states.error)} /> // Ошибка
```

### Badge (Бейджи)

```tsx
import { badge } from '@/design-system/components'

<span className={cn(badge.base, badge.variants.default)}>Default</span>
<span className={cn(badge.base, badge.variants.xp)}>+50 XP</span>
<span className={cn(badge.base, badge.variants.coin)}>100 💰</span>
<span className={cn(badge.base, badge.variants.streak)}>7 🔥</span>
```

### Progress (Прогресс-бары)

```tsx
import { progress } from '@/design-system/components'

// XP прогресс
<div className={progress.base}>
  <div className={cn(progress.bar, progress.variants.xp)} style={{ width: '65%' }} />
</div>

// Health
<div className={progress.base}>
  <div className={cn(progress.bar, progress.variants.health)} style={{ width: '80%' }} />
</div>
```

## 🎨 Токены

### Colors

```typescript
import { colors } from '@/design-system/tokens'

// Primary
 colors.primary[500] // #6366f1

// Semantic
 colors.success[500] // #22c55e
 colors.error[500]   // #ef4444
 colors.warning[500] // #f59e0b

// Gamification
 colors.tier.gold    // #ffd700
 colors.xp.start     // #6366f1
```

### Dark Theme

```typescript
import { darkTheme } from '@/design-system/tokens'

// Backgrounds
 darkTheme.bg.primary    // #0d0f1a
 darkTheme.bg.secondary  // #151725
 darkTheme.bg.tertiary   // #1e2130

// Text
 darkTheme.text.primary   // #f8fafc
 darkTheme.text.secondary // #94a3b8
```

### Spacing

```typescript
import { spacing } from '@/design-system/tokens'

 spacing[4]  // 1rem (16px)
 spacing[6]  // 1.5rem (24px)
 spacing[8]  // 2rem (32px)
```

## 🎮 Gamification

### XP Bar

```tsx
import { gamification } from '@/design-system/components'

<div className={gamification.xpBar.container}>
  <div 
    className={gamification.xpBar.fill} 
    style={{ width: `${progress}%` }}
  />
</div>
```

### Level Badge

```tsx
<span className={cn(gamification.levelBadge, 'w-10 h-10 text-lg')}>
  42
</span>
```

### Coin Display

```tsx
<span className={gamification.coin.container}>
  <span className={gamification.coin.icon}>💰</span>
  <span className={gamification.coin.value}>1,250</span>
</span>
```

## 📱 Responsive

```tsx
import { layout } from '@/design-system/components'

// Container
<div className={layout.container}>
  
// Grid
<div className={layout.grid[3]}>
  <Card />
  <Card />
  <Card />
</div>

// Stack
<div className={layout.stack[4]}>
  <Item />
  <Item />
</div>
```

## 🔄 Утилита cn()

Используй `cn()` для объединения классов:

```typescript
import { cn } from '@/lib/utils'

// Базовые классы + условные
className={cn(button.base, button.variants.primary, isLoading && 'opacity-50')}

// С перезаписью
className={cn(card.base, 'custom-class', className)}
```

## ⚡ Примеры страниц

### Dashboard Card

```tsx
<div className={cn(card.base, card.variants.default, card.padding.lg)}>
  <div className="flex items-center justify-between mb-4">
    <h3 className={text.h4}>Статистика</h3>
    <Badge variant="xp">+50 XP</Badge>
  </div>
  
  <div className={progress.base}>
    <div className={cn(progress.bar, progress.variants.xp)} style={{ width: '65%' }} />
  </div>
  
  <div className="mt-4 flex gap-2">
    <button className={cn(button.base, button.variants.primary, button.sizes.sm)}>
      Подробнее
    </button>
  </div>
</div>
```

### Task Item

```tsx
<div className={cn(card.base, card.variants.interactive, card.padding.md)}>
  <div className="flex items-start gap-3">
    <Checkbox />
    <div className="flex-1">
      <h4 className={cn(text.h4, 'line-through opacity-50')}>Задача</h4>
      <p className={text.caption}>Сегодня, 14:00</p>
    </div>
    <Badge variant="priority" size="sm">High</Badge>
  </div>
</div>
```

## 📝 Конвенции

1. **Всегда используй `cn()`** для объединения классов
2. **Не пиши CSS вручную** - используй токены
3. **Соблюдай иерархию**:
   - `base` - базовые стили
   - `variants` - варианты
   - `sizes` - размеры
   - Собственные классы - кастомизация
4. **Тестируй на мобильных** - используй responsive классы Tailwind

## 🎨 Добавление новых компонентов

1. Создай стили в `components.ts`
2. Добавь токены в `tokens.ts` если нужно
3. Обнови этот README
4. Используй в проекте!

## 🔗 Полезные ссылки

- [Tailwind CSS](https://tailwindcss.com)
- [shadcn/ui](https://ui.shadcn.com)
- [Radix UI](https://www.radix-ui.com)
