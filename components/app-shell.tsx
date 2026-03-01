"use client"

import * as React from "react"
import Image from "next/image"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useTheme } from "next-themes"
import { startReminderCheck } from "@/lib/notifications"
import { cn } from "@/lib/utils"
import { useAuth } from "@/lib/auth/context"
import { useIdentity, useStats } from "@/hooks/use-data"
import { useAutoBackup } from "@/hooks/use-auto-backup"
import { getLevelName } from "@/lib/store"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Sheet, SheetContent } from "@/components/ui/sheet"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { SyncStatusV2, SyncStatusCompact } from "@/components/sync/sync-status-v2"
import { LevelUpModal } from "@/components/gamification/level-up-modal"
import { useLevelUp } from "@/hooks/useLevelUp"
import {
  LayoutDashboard,
  Target,
  Compass,
  CheckSquare,
  Repeat,
  TrendingUp,
  BookOpen,
  Settings,
  User,
  Wallet,
  Heart,
  Sparkles,
  LogOut,
  ShoppingBag,
  Star,
  Trophy,
  ChevronDown,
  ChevronRight,
  Database,
  FolderKanban,
  MoreHorizontal,
} from "lucide-react"

function SidebarToggleIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <path fillRule="evenodd" clipRule="evenodd" d="M9.94358 2.25C8.10583 2.24998 6.65019 2.24997 5.51098 2.40314C4.33856 2.56076 3.38961 2.89288 2.64124 3.64124C1.89288 4.38961 1.56076 5.33856 1.40314 6.51098C1.24997 7.65019 1.24998 9.10582 1.25 10.9436V13.0564C1.24998 14.8942 1.24997 16.3498 1.40314 17.489C1.56076 18.6614 1.89288 19.6104 2.64124 20.3588C3.38961 21.1071 4.33856 21.4392 5.51098 21.5969C6.65018 21.75 8.1058 21.75 9.94354 21.75H14.0564C14.3706 21.75 14.6738 21.75 14.966 21.7492C14.9773 21.7497 14.9886 21.75 15 21.75C15.0129 21.75 15.0257 21.7497 15.0384 21.749C16.4224 21.7448 17.5607 21.7217 18.489 21.5969C19.6614 21.4392 20.6104 21.1071 21.3588 20.3588C22.1071 19.6104 22.4392 18.6614 22.5969 17.489C22.75 16.3498 22.75 14.8942 22.75 13.0565V10.9436C22.75 9.10585 22.75 7.65018 22.5969 6.51098C22.4392 5.33856 22.1071 4.38961 21.3588 3.64124C20.6104 2.89288 19.6614 2.56076 18.489 2.40314C17.5607 2.27833 16.4224 2.25523 15.0384 2.25096C15.0257 2.25032 15.0129 2.25 15 2.25C14.9886 2.25 14.9773 2.25025 14.966 2.25076C14.6737 2.25 14.3707 2.25 14.0564 2.25H9.94358ZM14.25 3.75002C14.1677 3.75 14.0844 3.75 14 3.75H10C8.09318 3.75 6.73851 3.75159 5.71085 3.88976C4.70476 4.02503 4.12511 4.27869 3.7019 4.7019C3.27869 5.12511 3.02503 5.70476 2.88976 6.71085C2.75159 7.73851 2.75 9.09318 2.75 11V13C2.75 14.9068 2.75159 16.2615 2.88976 17.2892C3.02503 18.2952 3.27869 18.8749 3.7019 19.2981C4.12511 19.7213 4.70476 19.975 5.71085 20.1102C6.73851 20.2484 8.09318 20.25 10 20.25H14C14.0844 20.25 14.1677 20.25 14.25 20.25L14.25 3.75002ZM15.75 20.2443C16.7836 20.2334 17.6082 20.2018 18.2892 20.1102C19.2952 19.975 19.8749 19.7213 20.2981 19.2981C20.7213 18.8749 20.975 18.2952 21.1102 17.2892C21.2484 16.2615 21.25 14.9068 21.25 13V11C21.25 9.09318 21.2484 7.73851 21.1102 6.71085C20.975 5.70476 20.7213 5.12511 20.2981 4.7019C19.8749 4.27869 19.2952 4.02503 18.2892 3.88976C17.6082 3.79821 16.7836 3.76662 15.75 3.75573L15.75 20.2443Z" fill="currentColor"/>
    </svg>
  )
}

// ─── Nav structure ────────────────────────────────────────────────
// Core items: shown in sidebar primary + mobile bottom bar

const coreNavItems = [
  { href: "/",        label: "Главная",  icon: LayoutDashboard },
  { href: "/tasks",   label: "Задачи",   icon: CheckSquare },
  { href: "/habits",  label: "Привычки", icon: Repeat },
  { href: "/goals",   label: "Цели",     icon: Target },
]

// More items: shown in sidebar "Дополнительно" + mobile "Ещё" sheet
const moreNavItems = [
  { href: "/achievements", label: "Достижения",     icon: Trophy },
  { href: "/finance",      label: "Финансы",        icon: Wallet },
  { href: "/health",       label: "Здоровье",       icon: Heart },
  { href: "/shop",         label: "Магазин наград", icon: ShoppingBag },
  { href: "/projects",     label: "Проекты",        icon: FolderKanban },
  { href: "/review",       label: "Рефлексия",      icon: BookOpen },
  { href: "/analytics",    label: "Аналитика",      icon: TrendingUp },
  { href: "/areas",        label: "Сферы жизни",    icon: Compass },
  { href: "/skills",       label: "Навыки",         icon: Sparkles },
  { href: "/wishes",       label: "Желания",        icon: Star },
  { href: "/storage",      label: "Хранилище",      icon: Database },
]

// ─── User stats (bottom of sidebar) ─────────────────────────────

function StatItem({ value, label, color }: { value: string | number; label: string; color: string }) {
  return (
    <div className="flex flex-col items-center rounded-md bg-sidebar-accent/40 py-1.5">
      <span className={cn("text-xs font-bold font-mono leading-none", color)}>{value}</span>
      <span className="mt-0.5 text-[9px] font-medium uppercase tracking-wider text-sidebar-foreground/40 leading-none">{label}</span>
    </div>
  )
}

function UserStats() {
  const { user } = useAuth()
  const { data: stats } = useStats()
  const { data: identity } = useIdentity()

  const name = user?.profile?.name || identity?.name || "Игрок"
  const level = stats?.level ?? 1
  const levelName = stats ? getLevelName(level) : "Новичок"
  const xpPercent = stats ? Math.round((stats.xp / stats.xpToNext) * 100) : 0
  const coins = stats?.coins ?? 0
  const streak = stats?.currentStreak ?? 0
  const tasksCompleted = stats?.totalTasksCompleted ?? 0

  return (
    <div className="px-4 py-3 border-t border-sidebar-border">
      <div className="flex items-center gap-2.5 mb-2.5">
        <Link
          href="/profile"
          className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/15 border border-primary/25 text-xs font-bold text-primary hover:bg-primary/25 hover:border-primary/50 transition-colors"
          title="Профиль"
        >
          {name.charAt(0).toUpperCase()}
        </Link>
        <div className="min-w-0">
          <Link href="/profile" className="hover:text-primary transition-colors">
            <p className="text-sm font-semibold truncate text-sidebar-foreground">{name}</p>
          </Link>
          <p className="text-[11px] text-sidebar-foreground/50">Ур. {level} · {levelName}</p>
        </div>
      </div>
      <Progress value={xpPercent} className="h-1.5 mb-2.5" />
      <div className="grid grid-cols-3 gap-1">
        <StatItem value={coins.toLocaleString()} label="монет" color="text-chart-4" />
        <StatItem value={streak} label="серия" color="text-chart-5" />
        <StatItem value={tasksCompleted} label="задач" color="text-primary" />
      </div>
    </div>
  )
}

// ─── User greeting (top of sidebar) ─────────────────────────────

function UserGreeting() {
  const { user } = useAuth()
  const { data: stats } = useStats()
  const { data: identity } = useIdentity()

  const name = user?.profile?.name || identity?.name || "Игрок"
  const level = stats?.level ?? 1
  const levelName = stats ? getLevelName(level) : "Новичок"
  const xpPercent = stats ? Math.round((stats.xp / stats.xpToNext) * 100) : 0

  return (
    <div className="px-4 pt-1 pb-4">
      <p className="text-[11px] font-medium text-sidebar-foreground/40 uppercase tracking-widest">
        С возвращением,
      </p>
      <p className="text-base font-bold text-sidebar-foreground mt-0.5 truncate leading-tight">
        {name}
      </p>
      <p className="text-xs text-sidebar-foreground/50 mt-0.5">
        Ур. {level} · {levelName}
      </p>
      <Progress value={xpPercent} className="h-1 mt-2.5 opacity-50" />
    </div>
  )
}

// ─── Nav content ──────────────────────────────────────────────────

function NavContent({
  onItemClick,
  collapsed = false,
  onToggleCollapse,
}: {
  onItemClick?: () => void
  collapsed?: boolean
  onToggleCollapse?: () => void
}) {
  const pathname = usePathname()
  const { signOut } = useAuth()
  const router = useRouter()
  const { resolvedTheme } = useTheme()
  const logoSrc = resolvedTheme === "dark" ? "/logo-light.svg" : "/logo-dark.svg"

  const isInMore = moreNavItems.some(
    (item) => pathname === item.href || pathname.startsWith(`${item.href}/`)
  )
  const [moreOpen, setMoreOpen] = React.useState(isInMore)

  const handleSignOut = async () => {
    await signOut()
    router.push("/auth/login")
  }

  // Active link: highlighted bg + glow effect + left indicator
  const linkClass = (href: string) => {
    const active = pathname === href || (href !== "/" && pathname.startsWith(`${href}/`))
    return cn(
      "relative flex items-center rounded-md text-sm font-medium",
      "transition-all duration-300 ease-out",
      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring",
      collapsed ? "justify-center px-0 py-3 w-full" : "gap-3 px-3.5 py-2.5",
      !collapsed && active && [
        "before:absolute before:-left-2.5 before:top-1/2 before:-translate-y-1/2",
        "before:w-[3px] before:h-[80%] before:rounded-full",
        "before:bg-gradient-to-b before:from-primary before:to-primary/40",
        "before:shadow-[0_0_8px_2px_rgba(139,92,246,0.7)]",
      ],
      active
        ? [
            "bg-gradient-to-r from-primary/[0.18] via-primary/[0.10] to-primary/[0.04]",
            "text-primary",
            "ring-1 ring-primary/20",
            "shadow-[0_4px_24px_-6px_rgba(139,92,246,0.45)]",
          ]
        : "text-sidebar-foreground/60 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground hover:translate-x-0.5"
    )
  }

  const isActive = (href: string) =>
    pathname === href || (href !== "/" && pathname.startsWith(`${href}/`))

  return (
    <div className="flex h-full flex-col">

      {/* ── Logo + collapse toggle ── */}
      <div className={cn(
        "flex items-center shrink-0 py-4",
        collapsed ? "justify-center px-2" : "justify-between px-4"
      )}>
        {!collapsed && (
          <>
            <div className="flex items-center gap-2.5">
              <Image src={logoSrc} alt="LifeOS" width={24} height={24} className="size-6" />
              <span className="text-lg font-medium tracking-tight font-heading">LifeOS</span>
            </div>
            {onToggleCollapse && (
              <button
                onClick={onToggleCollapse}
                className="rounded-md p-1.5 text-sidebar-foreground/40 hover:text-sidebar-foreground hover:bg-sidebar-accent/50 transition-colors"
                title="Свернуть"
              >
                <SidebarToggleIcon className="size-[20px]" />
              </button>
            )}
          </>
        )}
        {collapsed && (
          <button
            onClick={onToggleCollapse}
            className="relative flex size-9 items-center justify-center rounded-md transition-colors hover:bg-sidebar-accent/50"
            title="Развернуть"
          >
            <Image src={logoSrc} alt="LifeOS" width={24} height={24}
              className="size-6 transition-all duration-200 group-hover:opacity-0 group-hover:scale-75"
            />
            <SidebarToggleIcon className="absolute inset-0 m-auto size-[20px] scale-75 text-sidebar-foreground opacity-0 transition-all duration-200 group-hover:scale-100 group-hover:opacity-100" />
          </button>
        )}
      </div>


      {/* ── Core nav ── */}
      {!collapsed && (
        <p className="px-4 pt-3 pb-1 text-[10px] font-semibold uppercase tracking-widest text-sidebar-foreground/35">
          Навигация
        </p>
      )}
      <nav className={cn("flex flex-col gap-0.5", collapsed ? "px-2 mt-2" : "px-3")} aria-label="Основная навигация">
        {coreNavItems.map((item) => {
          const active = isActive(item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onItemClick}
              className={linkClass(item.href)}
              title={collapsed ? item.label : undefined}
              aria-current={active ? "page" : undefined}
            >
              <item.icon className={cn("size-4 shrink-0 transition-all duration-300", active && "text-primary")} />
              {!collapsed && (
                <>
                  <span className={cn("flex-1 transition-colors duration-300", active && "font-semibold")}>{item.label}</span>
                  {active && (
                    <span className="relative flex h-2 w-2 shrink-0">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
                    </span>
                  )}
                </>
              )}
              {active && collapsed && (
                <span className="absolute -left-2.5 top-1/2 -translate-y-1/2 w-[3px] h-[80%] rounded-full bg-gradient-to-b from-primary to-primary/40 shadow-[0_0_8px_2px_rgba(139,92,246,0.7)]" />
              )}
            </Link>
          )
        })}
      </nav>

      {/* ── More nav ── */}
      {!collapsed && (
        <div className="px-3 mt-2">
          <Collapsible open={moreOpen} onOpenChange={setMoreOpen}>
            <CollapsibleTrigger asChild>
              <button className="flex w-full items-center justify-between px-1 py-1.5 text-[10px] font-semibold uppercase tracking-widest text-sidebar-foreground/35 hover:text-sidebar-foreground/60 transition-colors">
                Дополнительно
                <ChevronDown className={cn("size-3 transition-transform duration-200", moreOpen && "rotate-180")} />
              </button>
            </CollapsibleTrigger>
            <CollapsibleContent className="flex flex-col gap-0.5 pt-1">
              {moreNavItems.map((item) => {
                const active = isActive(item.href)
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={onItemClick}
                    className={linkClass(item.href)}
                    aria-current={active ? "page" : undefined}
                  >
                    <item.icon className={cn("size-4 shrink-0 transition-colors duration-300", active && "text-primary")} />
                    <span className={cn("flex-1 transition-colors duration-300", active && "font-semibold")}>{item.label}</span>
                    {active && (
                      <span className="relative flex h-2 w-2 shrink-0">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
                      </span>
                    )}
                  </Link>
                )
              })}
            </CollapsibleContent>
          </Collapsible>
        </div>
      )}

      {/* Collapsed more — icons only */}
      {collapsed && (
        <nav className="flex flex-col gap-0.5 px-2 mt-1">
          {moreNavItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={onItemClick}
              className={linkClass(item.href)}
              title={item.label}
            >
              <item.icon className={cn("size-4 shrink-0 transition-colors duration-300", isActive(item.href) && "text-primary")} />
              {isActive(item.href) && (
                <span className="absolute -left-2.5 top-1/2 -translate-y-1/2 w-[3px] h-[80%] rounded-full bg-gradient-to-b from-primary to-primary/40 shadow-[0_0_8px_2px_rgba(139,92,246,0.7)]" />
              )}
            </Link>
          ))}
        </nav>
      )}

      {/* ── Spacer ── */}
      <div className="flex-1" />

      {/* ── Player profile (expanded only) ── */}
      {!collapsed && <UserStats />}

      {/* ── Account / Settings ── */}
      <div className={cn("border-t border-sidebar-border", collapsed ? "p-2 space-y-0.5" : "p-3")}>
        {!collapsed && (
          <p className="px-1 pb-1.5 text-[10px] font-semibold uppercase tracking-widest text-sidebar-foreground/35">
            Аккаунт
          </p>
        )}
        <Link
          href="/profile"
          onClick={onItemClick}
          className={linkClass("/profile")}
          title={collapsed ? "Профиль" : undefined}
        >
          <User className="size-4 shrink-0" />
          {!collapsed && (
            <>
              <span className="flex-1">Профиль</span>
              {isActive("/profile") && (
                <span className="w-[3px] h-4 rounded-full bg-sidebar-primary/70 shrink-0" />
              )}
            </>
          )}
        </Link>
        <Link
          href="/settings"
          onClick={onItemClick}
          className={linkClass("/settings")}
          title={collapsed ? "Настройки" : undefined}
        >
          <Settings className="size-4 shrink-0" />
          {!collapsed && (
            <>
              <span className="flex-1">Настройки</span>
              {isActive("/settings") && (
                <span className="w-[3px] h-4 rounded-full bg-sidebar-primary/70 shrink-0" />
              )}
            </>
          )}
        </Link>
        <button
          onClick={handleSignOut}
          className={cn(
            "relative flex w-full items-center rounded-lg text-sm font-medium transition-colors",
            "text-sidebar-foreground/55 hover:text-sidebar-foreground hover:bg-sidebar-accent/40",
            collapsed ? "justify-center px-0 py-2" : "gap-3 px-3 py-2"
          )}
          title={collapsed ? "Выйти" : undefined}
        >
          <LogOut className="size-4 shrink-0" />
          {!collapsed && "Выйти"}
        </button>
        {!collapsed && (
          <div className="pt-1">
            <SyncStatusV2 />
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Mobile bottom nav ────────────────────────────────────────────

function MobileBottomNav() {
  const pathname = usePathname()
  const { signOut } = useAuth()
  const router = useRouter()
  const [moreOpen, setMoreOpen] = React.useState(false)

  const isActive = (href: string) =>
    pathname === href || (href !== "/" && pathname.startsWith(`${href}/`))

  const tabClass = (active: boolean) =>
    cn(
      "flex flex-1 flex-col items-center justify-center gap-1 py-2 text-[10px] font-medium transition-colors",
      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset",
      active ? "text-primary" : "text-muted-foreground"
    )

  const handleSignOut = async () => {
    setMoreOpen(false)
    await signOut()
    router.push("/auth/login")
  }

  return (
    <>
      {/* Bottom bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 flex h-16 items-stretch border-t border-border bg-background/95 backdrop-blur-sm md:hidden" aria-label="Мобильная навигация">
        {coreNavItems.map((item) => {
          const active = isActive(item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              className={tabClass(active)}
              aria-current={active ? "page" : undefined}
            >
              <item.icon className={cn("size-5", active && "text-primary")} />
              <span>{item.label}</span>
            </Link>
          )
        })}
        {/* Ещё */}
        <button
          onClick={() => setMoreOpen(true)}
          className={tabClass(false)}
        >
          <MoreHorizontal className="size-5" />
          <span>Ещё</span>
        </button>
      </nav>

      {/* Ещё — sheet */}
      <Sheet open={moreOpen} onOpenChange={setMoreOpen}>
        <SheetContent side="bottom" className="rounded-t-2xl px-0 pb-safe md:hidden" style={{ maxHeight: "80vh" }}>
          <div className="overflow-y-auto">
            {/* Handle */}
            <div className="flex justify-center pt-3 pb-4">
              <div className="h-1 w-10 rounded-full bg-muted-foreground/30" />
            </div>

            <div className="grid grid-cols-2 gap-1 px-3 pb-3">
              {moreNavItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMoreOpen(false)}
                  className={cn(
                    "flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition-colors",
                    isActive(item.href)
                      ? "bg-primary/10 text-primary"
                      : "text-foreground hover:bg-accent"
                  )}
                >
                  <item.icon className="size-4 shrink-0" />
                  {item.label}
                </Link>
              ))}
            </div>

            <div className="mx-3 border-t border-border pt-2 pb-3 flex flex-col gap-1">
              <Link
                href="/settings"
                onClick={() => setMoreOpen(false)}
                className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-foreground hover:bg-accent transition-colors"
              >
                <Settings className="size-4 shrink-0" />
                Настройки
              </Link>
              <button
                onClick={handleSignOut}
                className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-destructive hover:bg-destructive/10 transition-colors w-full text-left"
              >
                <LogOut className="size-4 shrink-0" />
                Выйти
              </button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </>
  )
}

// ─── App shell ────────────────────────────────────────────────────

const COLLAPSED_KEY = "lifeos_sidebar_collapsed"

export function AppShell({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = React.useState(false)
  const [initialized, setInitialized] = React.useState(false)
  const { resolvedTheme } = useTheme()
  const logoSrc = resolvedTheme === "dark" ? "/logo-light.svg" : "/logo-dark.svg"

  // Restore collapse state from localStorage — delay transitions until after initial snap
  React.useEffect(() => {
    try {
      const stored = localStorage.getItem(COLLAPSED_KEY)
      if (stored === "true") setCollapsed(true)
    } catch {}
    requestAnimationFrame(() => setInitialized(true))
  }, [])

  const handleToggleCollapse = () => {
    setCollapsed(prev => {
      const next = !prev
      try { localStorage.setItem(COLLAPSED_KEY, String(next)) } catch {}
      return next
    })
  }

  React.useEffect(() => {
    if (typeof window !== "undefined" && "Notification" in window && Notification.permission === "granted") {
      return startReminderCheck()
    }
  }, [])

  useAutoBackup()

  const { levelUpEvent, dismiss: dismissLevelUp } = useLevelUp()

  return (
    <div className="flex min-h-screen">
      {/* Desktop sidebar — animates between w-64 and w-14 */}
      <aside
        className={cn(
          "group relative hidden shrink-0 border-r border-border bg-sidebar md:block",
          initialized && "transition-all duration-300 ease-in-out",
          collapsed ? "w-14" : "w-64"
        )}
        onWheel={(e) => {
          // Scroll left on expanded sidebar → collapse
          if (!collapsed && e.deltaX < -40 && Math.abs(e.deltaX) > Math.abs(e.deltaY) * 1.2) {
            handleToggleCollapse()
          }
        }}
      >
        <div className="sticky top-0 h-screen overflow-y-auto overflow-x-hidden">
          <NavContent collapsed={collapsed} onToggleCollapse={handleToggleCollapse} />
        </div>

        {/* ── Collapsed: right-edge click strip ── */}
        {collapsed && (
          <div
            onClick={handleToggleCollapse}
            className="absolute right-0 top-0 h-full w-3 cursor-e-resize"
            title="Открыть"
          />
        )}

      </aside>

      {/* Mobile header (logo only) + bottom nav */}
      <div className="flex flex-1 flex-col min-w-0">
        <header className="sticky top-0 z-40 flex items-center justify-between border-b border-border bg-background/80 px-4 py-3 backdrop-blur-sm md:hidden">
          <div className="flex items-center gap-2.5">
            <Image src={logoSrc} alt="LifeOS" width={28} height={28} className="size-7" />
            <span className="text-base font-normal tracking-tight font-heading">LifeOS</span>
          </div>
          <SyncStatusCompact />
        </header>

        {/* pb-16 leaves room for the fixed bottom nav on mobile */}
        <main className="flex-1 pb-16 md:pb-0">{children}</main>
      </div>

      {/* Mobile bottom navigation */}
      <MobileBottomNav />

      {/* Level-up celebration modal */}
      <LevelUpModal event={levelUpEvent} onDismiss={dismissLevelUp} />
    </div>
  )
}
