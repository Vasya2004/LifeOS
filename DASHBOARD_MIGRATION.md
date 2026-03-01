# ✅ Миграция Dashboard на Design System

## Обновленные компоненты

### 1. TasksToday.tsx ✅
**Что изменено:**
- Импорт `PriorityBadge` и `XpBadge` вместо ручных стилей
- Импорт `SkeletonList` для загрузки
- `Card variant="elevated"` вместо обычного
- Удалены ручные классы для badge (перенесены в компонент)
- Добавлен `CardFooter` для статистики

**Было:**
```tsx
<Badge variant="outline" className={cn("text-[10px]...", priority.color)}>
  {priority.label}
</Badge>
<div className="flex items-center gap-0.5 text-[10px] font-bold text-chart-3...">
  <Zap className="size-3" />
  {xp}
</div>
```

**Стало:**
```tsx
<PriorityBadge priority={task.priority} />
<XpBadge amount={xp} />
```

### 2. HeroSection.tsx ✅
**Что изменено:**
- Импорт `CoinBadge` и `StreakBadge`
- `Card variant="elevated"`
- Улучшены цвета текста ( slate-200, slate-500)

**Было:**
```tsx
<div className="flex flex-col items-center...">
  <Icon className={cn("size-4", colorClass)} />
  <span className="text-lg font-bold...">{value}</span>
</div>
```

**Стало:**
```tsx
<div className="flex flex-col items-center...">
  <span className="text-amber-400 text-lg">💰</span>
  <span className="text-lg font-bold text-slate-200">{value}</span>
</div>
```

### 3. BossBattle.tsx ✅
**Что изменено:**
- Импорт `GoalProgress` и `SkeletonCard`
- `XpBadge` вместо ручного блока
- Удален motion.div (теперь анимация в GoalProgress)
- Улучшены цвета (red-500, slate)

**Было:**
```tsx
<div className="relative h-3 w-full rounded-full bg-muted overflow-hidden">
  <motion.div
    className="absolute left-0 top-0 h-full rounded-full bg-gradient-to-r..."
    initial={{ width: 0 }}
    animate={{ width: `${boss.progress}%` }}
  />
</div>
<div className="flex items-center gap-1 text-chart-3 font-semibold ml-auto">
  <Zap className="size-3.5" />
  {xpReward} XP награда
</div>
```

**Стало:**
```tsx
<GoalProgress current={boss.progress} target={100} title="Прогресс" />
<XpBadge amount={xpReward} />
```

### 4. QuickActions.tsx ✅
**Что изменено:**
- `Card variant="elevated"`
- Упрощены стили кнопок
- Удалены кастомные bgClass

## Преимущества

### До:
- ❌ Ручные стили для каждого badge
- ❌ Дублирование кода цветов
- ❌ Непоследовательность в оформлении
- ❌ Сложно поддерживать

### После:
- ✅ Единые компоненты из Design System
- ✅ Консистентные цвета и стили
- ✅ Легко изменять глобально
- ✅ TypeScript подсказывает варианты
- ✅ Меньше кода

## Что делать дальше

1. **Запустить приложение** и проверить визуально:
   ```bash
   npm run dev
   ```

2. **Проверить остальные компоненты Dashboard:**
   - MiniMetrics.tsx
   - AIAdvisor.tsx
   - DayWidget.tsx

3. **Обновить страницы:**
   - /tasks
   - /habits
   - /goals
   - /skills

## Команда для поиска старых компонентов

```bash
# Найти использование старых badge
rg "variant=\"outline\"" components/ --type tsx

# Найти ручные цвета
rg "text-chart-3" components/ --type tsx
rg "bg-muted" components/ --type tsx
```
