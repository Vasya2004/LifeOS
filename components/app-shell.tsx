"use client"

import * as React from "react"
import Image from "next/image"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useTheme } from "next-themes"
import { startReminderCheck } from "@/lib/notifications"
import { cn } from "@/lib/utils"
import { useAuth } from "@/lib/auth/context"
import { useSync } from "@/components/sync-provider"
import { RealtimeStatus } from "@/components/realtime-status"
import { useIdentity, useStats } from "@/hooks/use-data"
import { useAchievements } from "@/hooks"
import { getLevelName } from "@/lib/store"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { ThemeToggle } from "@/components/theme-toggle"
import { SyncStatus } from "@/components/sync-status"
import {
  LayoutDashboard,
  Target,
  Compass,
  CheckSquare,
  Repeat,
  TrendingUp,
  BookOpen,
  Settings,
  Menu,
  Zap,
  Coins,
  Flame,
  Wallet,
  Heart,
  Sparkles,
  LogOut,
  ShoppingBag,
  Star,
  Trophy,
  ChevronDown,
  Database,
  Award,
} from "lucide-react"
import { ACHIEVEMENT_TYPE_CONFIG } from "@/lib/types/achievements"

// ─── Nav structure ────────────────────────────────────────────────

const primaryNavItems = [
  { href: "/",             label: "Главная",      icon: LayoutDashboard },
  { href: "/tasks",        label: "Задачи",        icon: CheckSquare },
  { href: "/habits",       label: "Привычки",      icon: Repeat },
  { href: "/goals",        label: "Цели",          icon: Target },
  { href: "/skills",       label: "Навыки",        icon: Sparkles },
  { href: "/finance",      label: "Финансы",       icon: Wallet },
  { href: "/health",       label: "Здоровье",      icon: Heart },
  { href: "/achievements", label: "Достижения",    icon: Trophy },
]

const secondaryNavItems = [
  { href: "/review",    label: "Обзор",        icon: BookOpen },
  { href: "/analytics", label: "Аналитика",    icon: TrendingUp },
  { href: "/areas",     label: "Сферы жизни",  icon: Compass },
  { href: "/wishes",    label: "Желания",       icon: Star },
  { href: "/storage",   label: "Хранилище",    icon: Database },
  { href: "/shop",      label: "Магазин",       icon: ShoppingBag },
]

// ─── Badge icon map (for achievement type icons) ──────────────────

function AchievementBadgeIcon({ icon, color }: { icon: string; color: string }) {
  const iconProps = { style: { color }, className: "size-3" }
  switch (icon) {
    case "zap":       return <Zap {...iconProps} />
    case "trophy":    return <Trophy {...iconProps} />
    case "star":      return <Star {...iconProps} />
    case "sparkles":  return <Sparkles {...iconProps} />
    default:          return <Award {...iconProps} />
  }
}

// ─── Player profile (bottom of sidebar) ──────────────────────────

function UserStats() {
  const { data: stats } = useStats()
  const { data: identity } = useIdentity()
  const { data: achievements } = useAchievements(undefined, { field: "date", direction: "desc" })
  const { user } = useAuth()

  if (!stats) return null

  const levelName = getLevelName(stats.level)
  const xpPercent = (stats.xp / stats.xpToNext) * 100
  const recentAchievements = (achievements ?? []).slice(0, 3)

  return (
    <div className="px-4 py-3 border-t border-sidebar-border">
      {/* Avatar + name */}
      <div className="flex items-center gap-3 mb-3">
        <div className="flex size-10 items-center justify-center rounded-full bg-primary/10 text-primary font-bold shrink-0">
          {stats.level}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-medium truncate text-sm">
            {user?.profile?.name || identity?.name || levelName}
          </p>
          <p className="text-xs text-muted-foreground">{levelName}</p>
        </div>
      </div>

      {/* XP bar */}
      <Progress value={xpPercent} className="h-1.5 mb-3" />

      {/* Mini stats */}
      <div className="grid grid-cols-3 gap-2 text-center mb-3">
        <div>
          <p className="text-xs font-medium text-chart-4">{stats.coins}</p>
          <p className="text-[10px] text-muted-foreground">Coins</p>
        </div>
        <div>
          <p className="text-xs font-medium text-chart-5">{stats.currentStreak}</p>
          <p className="text-[10px] text-muted-foreground">Streak</p>
        </div>
        <div>
          <p className="text-xs font-medium text-primary">{stats.totalTasksCompleted}</p>
          <p className="text-[10px] text-muted-foreground">Tasks</p>
        </div>
      </div>

      {/* Recent achievements mini-badges */}
      {recentAchievements.length > 0 && (
        <Link
          href="/achievements"
          className="flex items-center gap-2 rounded-md px-2 py-1.5 hover:bg-sidebar-accent/50 transition-colors group"
        >
          <div className="flex gap-1">
            {recentAchievements.map((a) => {
              const cfg = ACHIEVEMENT_TYPE_CONFIG[a.type]
              return (
                <div
                  key={a.id}
                  title={a.title}
                  className="flex size-5 items-center justify-center rounded-full"
                  style={{ backgroundColor: `${cfg.color}20`, border: `1px solid ${cfg.color}50` }}
                >
                  <AchievementBadgeIcon icon={cfg.icon} color={cfg.color} />
                </div>
              )
            })}
          </div>
          <span className="text-[10px] text-muted-foreground group-hover:text-foreground transition-colors">
            Победы
          </span>
        </Link>
      )}
    </div>
  )
}

// ─── Nav content ──────────────────────────────────────────────────

function NavContent({ onItemClick }: { onItemClick?: () => void }) {
  const pathname = usePathname()
  const { signOut } = useAuth()
  const router = useRouter()
  const { resolvedTheme } = useTheme()
  const logoSrc = resolvedTheme === "dark" ? "/logo-light.svg" : "/logo-dark.svg"

  // Keep "Ещё" open if current page is in the secondary list
  const isInSecondary = secondaryNavItems.some(
    (item) => pathname === item.href || pathname.startsWith(`${item.href}/`)
  )
  const [moreOpen, setMoreOpen] = React.useState(isInSecondary)

  const handleSignOut = async () => {
    await signOut()
    router.push("/auth/login")
  }

  const linkClass = (href: string) => {
    const isActive = pathname === href || (href !== "/" && pathname.startsWith(`${href}/`))
    return cn(
      "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
      isActive
        ? "bg-sidebar-accent text-sidebar-primary"
        : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
    )
  }

  return (
    <div className="flex h-full flex-col">
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-4 py-5 shrink-0">
        <Image src={logoSrc} alt="LifeOS" width={24} height={24} className="size-6" />
        <span className="text-lg font-normal tracking-tight font-heading">LifeOS</span>
      </div>

      {/* Primary nav */}
      <nav className="flex flex-col gap-1 px-3">
        {primaryNavItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            onClick={onItemClick}
            className={linkClass(item.href)}
          >
            <item.icon className="size-4 shrink-0" />
            {item.label}
          </Link>
        ))}
      </nav>

      {/* Divider */}
      <div className="mx-3 my-2 border-t border-sidebar-border/50" />

      {/* Secondary nav (collapsible) */}
      <div className="px-3">
        <Collapsible open={moreOpen} onOpenChange={setMoreOpen}>
          <CollapsibleTrigger asChild>
            <button className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-xs font-medium uppercase tracking-wider text-sidebar-foreground/40 hover:text-sidebar-foreground/70 transition-colors">
              <span className="flex-1 text-left">Ещё</span>
              <ChevronDown
                className={cn("size-3 transition-transform duration-200", moreOpen && "rotate-180")}
              />
            </button>
          </CollapsibleTrigger>
          <CollapsibleContent className="flex flex-col gap-1 pt-1">
            {secondaryNavItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={onItemClick}
                className={linkClass(item.href)}
              >
                <item.icon className="size-4 shrink-0" />
                {item.label}
              </Link>
            ))}
          </CollapsibleContent>
        </Collapsible>
      </div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Player profile */}
      <UserStats />

      {/* Settings + sign out */}
      <div className="p-3 border-t border-sidebar-border space-y-1">
        <Link
          href="/settings"
          onClick={onItemClick}
          className={linkClass("/settings")}
        >
          <Settings className="size-4 shrink-0" />
          Настройки
        </Link>
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start text-sidebar-foreground/70 hover:text-sidebar-foreground"
          onClick={handleSignOut}
        >
          <LogOut className="mr-3 size-4" />
          Выйти
        </Button>
        <div className="pt-1 space-y-1">
          <SyncStatus />
          <ThemeToggle />
        </div>
      </div>
    </div>
  )
}

// ─── App shell ────────────────────────────────────────────────────

export function AppShell({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = React.useState(false)
  const { resolvedTheme } = useTheme()
  const logoSrc = resolvedTheme === "dark" ? "/logo-light.svg" : "/logo-dark.svg"

  React.useEffect(() => {
    if (typeof window !== "undefined" && "Notification" in window && Notification.permission === "granted") {
      return startReminderCheck()
    }
  }, [])

  return (
    <div className="flex min-h-screen">
      {/* Desktop sidebar */}
      <aside className="hidden w-64 shrink-0 border-r border-border bg-sidebar md:block">
        <div className="sticky top-0 h-screen overflow-y-auto">
          <NavContent />
        </div>
      </aside>

      {/* Mobile header + sheet */}
      <div className="flex flex-1 flex-col">
        <header className="sticky top-0 z-40 flex items-center justify-between border-b border-border bg-background/80 px-4 py-3 backdrop-blur-sm md:hidden">
          <div className="flex items-center gap-2.5">
            <Image src={logoSrc} alt="LifeOS" width={28} height={28} className="size-7" />
            <span className="text-base font-normal tracking-tight font-heading">LifeOS</span>
          </div>
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="size-8">
                <Menu className="size-4" />
                <span className="sr-only">Открыть навигацию</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-64 bg-sidebar p-0">
              <NavContent onItemClick={() => setOpen(false)} />
            </SheetContent>
          </Sheet>
        </header>

        <main className="flex-1">{children}</main>
      </div>
    </div>
  )
}
