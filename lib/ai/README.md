# AI Integration for LifeOS

Реальная AI интеграция для AIAdvisor компонента.

## Архитектура

```
lib/ai/
├── config.ts      # Конфигурация провайдеров (OpenAI/Anthropic)
├── client.ts      # Клиент для генерации советов
├── prompts.ts     # Промпты для разных типов советов
├── fallback.ts    # Локальный rule-based fallback
└── index.ts       # Экспорты

app/api/ai/advice/
└── route.ts       # API route с rate limiting

hooks/
└── useAIAdvice.ts # Обновлённый хук с AI интеграцией
```

## Провайдеры

- **OpenAI** (default): GPT-4o-mini
- **Anthropic**: Claude 3 Haiku
- **Local**: Rule-based fallback

## Настройка

1. Добавьте ключ API в `.env.local`:

```bash
# OpenAI
OPENAI_API_KEY=sk-...

# Или Anthropic
ANTHROPIC_API_KEY=sk-ant-...

# Включить AI
NEXT_PUBLIC_AI_ENABLED=true
```

2. Выберите провайдера:

```bash
AI_PROVIDER=openai  # или anthropic
```

## Использование

### В компонентах

```typescript
import { useAIAdvice } from "@/hooks/useAIAdvice"

function Dashboard() {
  const { advice, isLoading, refresh } = useAIAdvice()
  
  return (
    <div>
      {advice.map(a => (
        <AdviceCard key={a.id} advice={a} />
      ))}
    </div>
  )
}
```

### Прямой вызов AI

```typescript
import { generateAdvice, analyzeHabits } from "@/lib/ai"

// Генерация советов
const result = await generateAdvice(context)

// Анализ привычек
const analysis = await analyzeHabits(habits)

// Финансовые рекомендации
const financeTip = await getFinancialAdvice(financeData)
```

## API Route

```bash
POST /api/ai/advice
Content-Type: application/json

{
  "context": {
    "level": 5,
    "currentStreak": 7,
    "tasksPending": 3,
    "tasksCompletedToday": 5,
    "habitsActive": 4,
    "habitsCompletedToday": 3,
    "goalsActive": 2,
    "healthScore": 85,
    "savingsRate": 0.15,
    "timestamp": "2024-01-15T10:00:00Z"
  }
}
```

### Rate Limiting

- 5 запросов в минуту на пользователя
- Fallback на rule-based при превышении лимита

### Ответ

```json
{
  "advice": [
    {
      "id": "ai-urgent-123",
      "type": "urgent",
      "category": "productivity",
      "title": "Нулевой день? Время исправить!",
      "message": "Сегодня ещё ни одной выполненной задачи...",
      "actionLabel": "К задачам",
      "actionHref": "/tasks",
      "dismissible": true
    }
  ],
  "meta": {
    "source": "ai",
    "latency": 850,
    "cost": 0.00012
  }
}
```

## Fallback

При недоступности AI API:
1. Автоматически переключается на rule-based engine
2. Сохраняет структуру ответа
3. Добавляет заголовок `X-AI-Source: fallback`

## Кэширование

- Советы кэшируются на 5 минут
- Ключ кэша: комбинация level, streak, pending tasks
- Повторные запросы с теми же данными — из кэша

## Стоимость

- GPT-4o-mini: ~$0.00012 за запрос
- Claude Haiku: ~$0.00025 за запрос
- При 100 запросов/день: ~$0.01-0.03/день

## Безопасность

- API keys только на сервере
- Персональные данные не отправляются в AI
- Rate limiting защищает от злоупотреблений
- PII fields фильтруются перед отправкой
