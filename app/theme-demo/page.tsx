import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge, XpBadge, CoinBadge, StreakBadge } from '@/components/ui/badge'
import { 
  Zap, 
  Coins, 
  Flame, 
  Target, 
  LayoutDashboard, 
  User, 
  Settings,
  LogOut,
  Plus
} from 'lucide-react'

/**
 * Theme Demo - Original Design from Preview
 * 
 * Восстановлено по preview картинкам:
 * - Чистый чёрный фон
 * - Синий primary (#8b5cf6)
 * - Тёмные карточки без glassmorphism
 * - Чистый минималистичный дизайн
 */

export default function ThemeDemoPage() {
  return (
    <div className="min-h-screen bg-black flex">
      {/* Sidebar */}
      <aside className="w-64 bg-black border-r border-white/[0.06] flex flex-col">
        {/* Logo */}
        <div className="p-4">
          <div className="flex items-center gap-2 px-3 py-2">
            <div className="w-8 h-8 rounded-lg bg-[#8b5cf6] flex items-center justify-center">
              <Target className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-bold text-white">LifeOS</span>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          <a href="#" className="flex items-center gap-3 px-3 py-2 rounded-lg bg-[#8b5cf6]/12 text-[#8b5cf6] text-sm font-medium">
            <LayoutDashboard className="w-5 h-5" />
            Дашборд
          </a>
          <a href="#" className="flex items-center gap-3 px-3 py-2 rounded-lg text-[#9ca3af] hover:text-white hover:bg-white/[0.05] text-sm font-medium transition-colors">
            <Target className="w-5 h-5" />
            Цели
          </a>
          <a href="#" className="flex items-center gap-3 px-3 py-2 rounded-lg text-[#9ca3af] hover:text-white hover:bg-white/[0.05] text-sm font-medium transition-colors">
            <Zap className="w-5 h-5" />
            Привычки
          </a>
          <a href="#" className="flex items-center gap-3 px-3 py-2 rounded-lg text-[#9ca3af] hover:text-white hover:bg-white/[0.05] text-sm font-medium transition-colors">
            <User className="w-5 h-5" />
            Профиль
          </a>
          <a href="#" className="flex items-center gap-3 px-3 py-2 rounded-lg text-[#9ca3af] hover:text-white hover:bg-white/[0.05] text-sm font-medium transition-colors">
            <Settings className="w-5 h-5" />
            Настройки
          </a>
        </nav>

        {/* Logout */}
        <div className="p-3">
          <button className="flex items-center gap-3 px-3 py-2 rounded-lg text-[#9ca3af] hover:text-white hover:bg-white/[0.05] text-sm font-medium transition-colors w-full">
            <LogOut className="w-5 h-5" />
            Выйти
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white mb-1">
            Добро пожаловать, Демо Пользователь
          </h1>
          <p className="text-[#9ca3af]">Новичок · Уровень 1</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-[#8b5cf6]/15 flex items-center justify-center">
                  <Zap className="w-5 h-5 text-[#8b5cf6]" />
                </div>
                <div>
                  <div className="text-sm text-[#9ca3af]">Опыт (XP)</div>
                  <div className="text-2xl font-bold text-white">50</div>
                </div>
              </div>
              <div className="w-full bg-white/[0.08] rounded-full h-1.5">
                <div className="bg-[#8b5cf6] h-1.5 rounded-full" style={{ width: '10%' }} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-[#a855f7]/15 flex items-center justify-center">
                  <Coins className="w-5 h-5 text-[#a855f7]" />
                </div>
                <div>
                  <div className="text-sm text-[#9ca3af]">Монеты</div>
                  <div className="text-2xl font-bold text-white">100</div>
                </div>
              </div>
              <div className="w-full bg-white/[0.08] rounded-full h-1.5">
                <div className="bg-[#a855f7] h-1.5 rounded-full" style={{ width: '100%' }} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-[#f97316]/15 flex items-center justify-center">
                  <Flame className="w-5 h-5 text-[#f97316]" />
                </div>
                <div>
                  <div className="text-sm text-[#9ca3af]">Стрик</div>
                  <div className="text-2xl font-bold text-white">3 дня</div>
                </div>
              </div>
              <div className="w-full bg-white/[0.08] rounded-full h-1.5">
                <div className="bg-[#f97316] h-1.5 rounded-full" style={{ width: '30%' }} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-[#22c55e]/15 flex items-center justify-center">
                  <Target className="w-5 h-5 text-[#22c55e]" />
                </div>
                <div>
                  <div className="text-sm text-[#9ca3af]">Выполнено</div>
                  <div className="text-2xl font-bold text-white">5</div>
                </div>
              </div>
              <div className="w-full bg-white/[0.08] rounded-full h-1.5">
                <div className="bg-[#22c55e] h-1.5 rounded-full" style={{ width: '50%' }} />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-3 gap-6">
          {/* Life Areas */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div>
                <CardTitle>Сферы жизни</CardTitle>
                <CardDescription>Управляйте балансом</CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-[#9ca3af]">
                <div className="text-4xl mb-2">🎯</div>
                <p className="text-sm">Нет созданных сфер</p>
                <Button size="sm" className="mt-4">
                  <Plus className="w-4 h-4 mr-1" />
                  Добавить
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Быстрые действия</CardTitle>
              <CardDescription>Частые задачи</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-[#9ca3af] hover:text-white hover:bg-white/[0.05] text-sm transition-colors text-left">
                  <Plus className="w-4 h-4" />
                  Новая цель
                </button>
                <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-[#9ca3af] hover:text-white hover:bg-white/[0.05] text-sm transition-colors text-left">
                  <Plus className="w-4 h-4" />
                  Новая привычка
                </button>
                <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-[#9ca3af] hover:text-white hover:bg-white/[0.05] text-sm transition-colors text-left">
                  <Plus className="w-4 h-4" />
                  Новая задача
                </button>
              </div>
            </CardContent>
          </Card>

          {/* Active Goals */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Активные цели</CardTitle>
              <CardDescription>В процессе</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-[#9ca3af]">
                <div className="text-4xl mb-2">🎯</div>
                <p className="text-sm">Нет активных целей</p>
                <Button size="sm" className="mt-4">
                  <Plus className="w-4 h-4 mr-1" />
                  Добавить
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Component Showcase */}
        <div className="mt-8">
          <h2 className="text-lg font-semibold text-white mb-4">Компоненты</h2>
          
          <Card>
            <CardContent className="p-5 space-y-6">
              {/* Buttons */}
              <div>
                <p className="text-sm text-[#9ca3af] mb-3">Кнопки</p>
                <div className="flex flex-wrap gap-3">
                  <Button>Primary</Button>
                  <Button variant="secondary">Secondary</Button>
                  <Button variant="outline">Outline</Button>
                  <Button variant="ghost">Ghost</Button>
                  <Button variant="destructive">Delete</Button>
                </div>
              </div>

              {/* Gamification */}
              <div>
                <p className="text-sm text-[#9ca3af] mb-3">Геймификация</p>
                <div className="flex flex-wrap gap-3">
                  <Button variant="xp">XP Button</Button>
                  <Button variant="coin">Coin Button</Button>
                  <Button variant="streak">Streak Button</Button>
                  <Button variant="success">Success</Button>
                </div>
              </div>

              {/* Badges */}
              <div>
                <p className="text-sm text-[#9ca3af] mb-3">Бейджи</p>
                <div className="flex flex-wrap gap-3">
                  <Badge>Default</Badge>
                  <Badge variant="primary">Primary</Badge>
                  <Badge variant="secondary">Secondary</Badge>
                  <Badge variant="outline">Outline</Badge>
                  <Badge variant="destructive">Error</Badge>
                  <XpBadge value={150} />
                  <CoinBadge value={50} />
                  <StreakBadge value={5} />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
