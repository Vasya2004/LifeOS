# LifeOS - Agent Documentation

## Project Overview

**LifeOS** is a gamified personal productivity and life management system built as a Progressive Web App (PWA). It helps users track goals, build habits, manage finances, monitor health, and develop skills through an RPG-like progression system.

---

## Tech Stack

| Category | Technology |
|----------|------------|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript 5.7 |
| Styling | Tailwind CSS 4.x |
| UI Library | shadcn/ui + Radix UI |
| State Management | SWR (client-side caching) |
| Backend/Auth | Supabase |
| Animations | Framer Motion |
| Forms | React Hook Form + Zod |
| Testing | Vitest + Playwright |

---

## Project Structure

```
app/                    # Next.js App Router pages
├── page.tsx           # Dashboard (server component)
├── dashboard-content.tsx # Dashboard client content
├── layout.tsx         # Root layout with auth
├── areas/             # Life areas management
├── goals/             # Goals tracking
├── tasks/             # Task management
├── habits/            # Habit tracking
├── skills/            # RPG skill system
├── finance/           # Financial tracking
├── health/            # Health monitoring
├── review/            # Daily/weekly reviews
├── analytics/         # Analytics dashboard
├── settings/          # App settings
└── auth/              # Authentication pages
    ├── login/         # Login/register page
    └── callback/      # OAuth callback

components/
├── ui/                # shadcn/ui components (50+)
├── auth/              # Auth components
│   ├── auth-form.tsx
│   └── user-menu.tsx
├── notifications/     # Notification components
│   └── notification-settings.tsx
├── app-shell.tsx      # Main layout shell
├── animations.tsx     # Framer Motion wrappers
└── ...

lib/
├── types.ts           # TypeScript types (~800 lines)
├── store.ts           # LocalStorage data layer (~1300 lines)
├── sync.ts            # Supabase sync logic
├── notifications.ts   # Browser/Push notifications
├── validation.ts      # Zod schemas
└── supabase/          # Supabase clients
    ├── client.ts
    ├── server.ts
    └── middleware.ts

hooks/
└── use-data.ts        # SWR data hooks

test/
├── setup.ts           # Test setup
├── store.test.ts      # Store unit tests
├── validation.test.ts # Validation tests
└── sync.test.ts       # Sync tests

supabase/migrations/   # Database migrations
└── 001_initial_schema.sql
```

---

## Key Features

### 1. Gamification System
- **Levels**: 1-50+ progression (Новичок → Легенда)
- **XP**: Earned from tasks, habits, goals
- **Coins**: Currency for rewards
- **Streaks**: Daily activity tracking

### 2. RPG Skill System
- 50 levels per skill
- 6 tiers: Новичок, Любитель, Практик, Профи, Эксперт, Легенда
- Skill decay: -1 XP/day after 7 days inactive
- Certificates at levels 5 and 10

### 3. Data Management
- **Local-first**: All data stored in localStorage
- **Cloud Sync**: Optional Supabase synchronization
- **Export/Import**: JSON backup support

### 4. Notifications
- Browser notifications
- Push notifications (via service worker)
- Scheduled reminders for habits

---

## Authentication Flow

1. **Login Page** (`/auth/login`)
   - Email/password auth
   - OAuth (Google, GitHub)
   - Automatic redirect to dashboard on success

2. **Middleware Protection**
   - Unauthenticated users redirected to `/auth/login`
   - Authenticated users redirected from auth pages to `/`

3. **User Session**
   - Managed by Supabase Auth
   - User object passed from server to AppShell

---

## Data Synchronization

### Local Storage Keys (prefix: `lifeos_`)
- `identity`, `values`, `areas`, `roles`
- `goals`, `projects`, `tasks`, `habits`
- `stats`, `wishes`, `journal`
- `accounts`, `transactions`, `financialGoals`
- `bodyZones`, `healthMetrics`, `skills`

### Sync Process
1. Local changes marked with `markPendingChanges()`
2. Auto-sync every 5 minutes (when online)
3. Manual sync via SyncStatus button
4. Full JSON blob stored in Supabase `user_data` table

### Database Schema

```sql
-- Main data storage
user_data (
  id uuid,
  user_id uuid references auth.users,
  data jsonb,
  updated_at timestamp,
  created_at timestamp
)

-- Scheduled notifications
notifications (
  id uuid,
  user_id uuid,
  title text,
  body text,
  type text,
  scheduled_at timestamp,
  read boolean
)

-- Push subscriptions
push_subscriptions (
  id uuid,
  user_id uuid,
  endpoint text,
  p256dh text,
  auth text
)
```

---

## Development Commands

```bash
# Development
npm run dev              # Start dev server

# Building
npm run build           # Production build
npm start               # Start production server

# Testing
npm test                # Run unit tests (Vitest)
npm run test:watch      # Watch mode
npm run test:coverage   # Coverage report
npm run test:e2e        # E2E tests (Playwright)

# Type checking
npm run typecheck       # TypeScript check
npm run lint            # ESLint
```

---

## Testing Strategy

### Unit Tests (Vitest)
- Store logic
- Validation schemas
- Sync utilities

### E2E Tests (Playwright)
- Authentication flows
- CRUD operations
- Data synchronization

---

## Environment Variables

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key

# Push Notifications (optional)
NEXT_PUBLIC_VAPID_PUBLIC_KEY=your_vapid_key
```

---

## Common Tasks

### Adding a New Page
1. Create directory in `app/new-page/`
2. Create `page.tsx` with server component
3. Fetch user in page: `const { data: { user } } = await supabase.auth.getUser()`
4. Wrap with `<AppShell user={user}>`

### Adding a New Data Type
1. Add TypeScript interface to `lib/types.ts`
2. Add storage functions to `lib/store.ts`
3. Add SWR hook to `hooks/use-data.ts`
4. Add to export/import in `lib/store.ts`

### Modifying Auth Behavior
1. Update `lib/supabase/middleware.ts` for route protection
2. Update `app/auth/login/page.tsx` for UI changes
3. Update `components/auth/auth-form.tsx` for auth logic

---

## Performance Considerations

1. **Local-first**: No loading states for most operations
2. **SWR Caching**: Automatic revalidation and caching
3. **Lazy Loading**: Components loaded on demand
4. **PWA**: Service worker for offline support
5. **Image Optimization**: Next.js image optimization disabled (static export compatible)

---

## Security Notes

1. **RLS Enabled**: All Supabase tables have Row Level Security
2. **User Isolation**: Users can only access their own data
3. **Client-side Validation**: Zod schemas validate all inputs
4. **XSS Protection**: React escapes content by default

---

## Future Roadmap

- [ ] Real-time sync with Supabase Realtime
- [ ] Mobile app (React Native/Expo)
- [ ] AI-powered insights and recommendations
- [ ] Social features (challenges with friends)
- [ ] Advanced analytics with charts
- [ ] Integration with fitness trackers

---

## Troubleshooting

### Build Errors
- Ensure `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are set
- Run `npm run typecheck` to catch TypeScript errors

### Sync Issues
- Check browser console for errors
- Verify user is authenticated
- Check network connectivity

### Data Loss
- Data is stored in localStorage - clear only if intentional
- Use Export feature for backups
- Check Supabase for cloud backups
