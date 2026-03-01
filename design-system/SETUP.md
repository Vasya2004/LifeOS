# 🚀 Быстрая настройка Design System

## 1. Установка (уже есть в проекте)

```bash
# Убедись, что есть утилита cn()
npm install clsx tailwind-merge
```

## 2. Создай файл `lib/utils.ts` (если нет)

```typescript
import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
```

## 3. Импортируй Design System

```typescript
// В любом компоненте
import { button, card, input, text } from '@/design-system/components'
import { cn } from '@/lib/utils'
```

## 4. Примеры использования

### Простая кнопка
```tsx
<button className={cn(button.base, button.variants.primary, button.sizes.md)}>
  Нажми меня
</button>
```

### Карточка
```tsx
<div className={cn(card.base, card.variants.default, card.padding.md)}>
  <h3 className={text.h3}>Заголовок</h3>
  <p className={text.body}>Текст</p>
</div>
```

### Поле ввода
```tsx
<input className={cn(input.base, input.sizes.md)} placeholder="Email" />
```

## 5. Миграция существующих компонентов

### Было:
```tsx
<button className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-500">
  Сохранить
</button>
```

### Стало:
```tsx
<button className={cn(button.base, button.variants.primary, button.sizes.md)}>
  Сохранить
</button>
```

## 6. Преимущества

✅ **Консистентность** - все кнопки одинаковые
✅ **Легко менять** - поменял в одном месте, применилось везде
✅ **Типобезопасность** - TypeScript подсказывает варианты
✅ **Быстрая разработка** - не нужно писать CSS

## 7. Добавление нового компонента

1. Добавь стили в `design-system/components.ts`
2. Создай компонент в `components/ui/my-component.tsx`
3. Используй!

## 8. Чеклист миграции

- [ ] Заменить все кнопки на `button.*`
- [ ] Заменить все карточки на `card.*`
- [ ] Заменить все инпуты на `input.*`
- [ ] Заменить текстовые классы на `text.*`
- [ ] Добавить empty states
- [ ] Добавить loading skeletons

## Готово! 🎉

Теперь у тебя есть единая система дизайна для всего проекта.
