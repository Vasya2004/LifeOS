# LifeOS API Documentation

## Overview

LifeOS provides a RESTful API built with Next.js App Router. All endpoints support server-side validation, authentication, and follow RESTful conventions.

## Authentication

All API routes require authentication via Supabase Auth. Include the session cookie with each request.

## Base URL

```
/api
```

## Endpoints

### Sync

Full data synchronization for offline-first approach.

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/sync` | Load all user data |
| POST | `/api/sync` | Save all user data |
| DELETE | `/api/sync` | Clear user data |

**POST Body:**
```json
{
  "data": { ... },
  "version": "1.0.0"
}
```

### Goals

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/goals` | List goals (with filters) |
| POST | `/api/goals` | Create goal |
| PATCH | `/api/goals` | Update goal |
| DELETE | `/api/goals?id={id}` | Delete goal |

**Query Parameters (GET):**
- `status` - Filter by status (active, completed, paused, dropped)
- `areaId` - Filter by life area
- `priority` - Filter by priority (1-5)
- `search` - Search in title

### Tasks

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/tasks` | List tasks (with filters) |
| POST | `/api/tasks` | Create task |
| PATCH | `/api/tasks` | Update task or complete |
| DELETE | `/api/tasks?id={id}` | Delete task |

**Query Parameters (GET):**
- `status` - Filter by status
- `priority` - Filter by priority
- `dateFrom` / `dateTo` - Date range
- `projectId` - Filter by project
- `search` - Search in title

**Complete Task (PATCH):**
```json
{
  "action": "complete",
  "id": "task-id",
  "actualDuration": 60,
  "notes": "Completed notes"
}
```

### Habits

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/habits` | List habits |
| POST | `/api/habits` | Create habit |
| PATCH | `/api/habits` | Update habit or toggle entry |
| DELETE | `/api/habits?id={id}` | Delete habit |

**Toggle Entry (PATCH):**
```json
{
  "action": "toggle",
  "habitId": "habit-id",
  "date": "2024-01-15",
  "completed": true,
  "note": "Optional note"
}
```

### Skills

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/skills` | List skills |
| POST | `/api/skills` | Create skill |
| PATCH | `/api/skills` | Update skill or add activity |
| DELETE | `/api/skills?id={id}` | Delete skill |

**Query Parameters (GET):**
- `category` - Filter by category
- `minLevel` / `maxLevel` - Level range
- `isDecaying` - Filter decaying skills

**Add Activity (PATCH):**
```json
{
  "action": "addActivity",
  "skillId": "skill-id",
  "description": "Completed exercise",
  "xpAmount": 2,
  "activityType": "practice",
  "proofUrl": "optional-url",
  "proofRequired": false
}
```

### Finance

Unified endpoint for all financial operations.

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/finance?type=accounts` | List accounts |
| GET | `/api/finance?type=transactions` | List transactions |
| GET | `/api/finance?type=goals` | List financial goals |
| GET | `/api/finance?type=budgets` | List budgets |
| GET | `/api/finance?type=stats` | Get financial stats |
| POST | `/api/finance` | Create account/transaction/goal/budget |
| PATCH | `/api/finance` | Update or contribute |
| DELETE | `/api/finance?type={type}&id={id}` | Delete item |

**Transaction Filters:**
- `accountId` - Filter by account
- `transactionType` - income/expense/transfer
- `category` - Filter by category
- `dateFrom` / `dateTo` - Date range

**Create Transaction (POST):**
```json
{
  "type": "transaction",
  "data": {
    "accountId": "account-id",
    "type": "expense",
    "amount": 50.00,
    "category": "food",
    "description": "Grocery shopping",
    "transactionDate": "2024-01-15T00:00:00Z"
  }
}
```

**Contribute to Goal (PATCH):**
```json
{
  "type": "goal",
  "id": "goal-id",
  "action": "contribute",
  "data": {
    "amount": 100
  }
}
```

## Response Format

All responses follow this format:

**Success (200-201):**
```json
{
  "data": { ... }
}
```

**Success with Meta:**
```json
{
  "data": { ... },
  "meta": { ... }
}
```

**Error (400-500):**
```json
{
  "error": "Error message",
  "details": [ ... ] // Validation errors (optional)
}
```

## HTTP Status Codes

| Code | Description |
|------|-------------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request (validation error) |
| 401 | Unauthorized |
| 404 | Not Found |
| 413 | Payload Too Large |
| 500 | Internal Server Error |

## Validation

All POST and PATCH requests are validated using Zod schemas. Validation errors return 400 with details:

```json
{
  "error": "Validation failed",
  "details": [
    {
      "path": ["fieldName"],
      "message": "Expected string, received number"
    }
  ]
}
```

## Rate Limiting

Currently no rate limiting is implemented. Recommended to add for production use.

## Offline-First Strategy

The API supports offline-first architecture:

1. Client performs optimistic updates locally
2. Client syncs to server when online
3. Client falls back to local data on server errors
4. Use `/api/sync` for full data backup/restore
