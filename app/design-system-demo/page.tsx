'use client'

import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Badge, XpBadge, CoinBadge, StreakBadge } from '@/components/ui/badge'

export default function DesignSystemDemo() {
  return (
    <div className="min-h-screen bg-black p-8">
      <div className="mx-auto max-w-6xl space-y-12">
        
        <div className="space-y-2">
          <h1 className="text-4xl font-bold text-white">Design System</h1>
          <p className="text-[#9ca3af]">Оригинальный дизайн из preview</p>
        </div>

        {/* Buttons */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-white">Кнопки</h2>
          <div className="flex flex-wrap gap-4">
            <Button>Primary</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="outline">Outline</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="destructive">Delete</Button>
            <Button variant="xp">XP</Button>
            <Button variant="coin">Coin</Button>
            <Button variant="streak">Streak</Button>
            <Button loading>Loading</Button>
          </div>
        </section>

        {/* Cards */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-white">Карточки</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Default</CardTitle>
                <CardDescription>Стандартная карточка с границей</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-[#9ca3af]">Контент карточки</p>
              </CardContent>
            </Card>

            <Card variant="hover">
              <CardHeader>
                <CardTitle>Hover</CardTitle>
                <CardDescription>Меняет границу при наведении</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-[#9ca3af]">Наведите курсор</p>
              </CardContent>
            </Card>

            <Card variant="interactive">
              <CardHeader>
                <CardTitle>Interactive</CardTitle>
                <CardDescription>Кликабельная карточка</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-[#9ca3af]">Кликните по мне</p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Badges */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-white">Бейджи</h2>
          <div className="flex flex-wrap gap-4">
            <Badge>Default</Badge>
            <Badge variant="primary">Primary</Badge>
            <Badge variant="secondary">Secondary</Badge>
            <Badge variant="outline">Outline</Badge>
            <Badge variant="destructive">Error</Badge>
            <XpBadge value={150} />
            <CoinBadge value={50} />
            <StreakBadge value={5} />
          </div>
        </section>

        {/* Colors */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-white">Цвета</h2>
          <div className="grid grid-cols-4 gap-4">
            <div className="p-4 rounded-lg bg-black border border-white/[0.08]">
              <div className="w-full h-16 rounded bg-[#3b82f6] mb-2" />
              <p className="text-sm text-[#9ca3af]">Primary</p>
              <p className="text-xs text-[#6b7280]">#3b82f6</p>
            </div>
            <div className="p-4 rounded-lg bg-black border border-white/[0.08]">
              <div className="w-full h-16 rounded bg-[#0a0a0f] mb-2 border border-white/[0.08]" />
              <p className="text-sm text-[#9ca3af]">Card</p>
              <p className="text-xs text-[#6b7280]">#0a0a0f</p>
            </div>
            <div className="p-4 rounded-lg bg-black border border-white/[0.08]">
              <div className="w-full h-16 rounded bg-[#a855f7] mb-2" />
              <p className="text-sm text-[#9ca3af]">Coins</p>
              <p className="text-xs text-[#6b7280]">#a855f7</p>
            </div>
            <div className="p-4 rounded-lg bg-black border border-white/[0.08]">
              <div className="w-full h-16 rounded bg-[#f97316] mb-2" />
              <p className="text-sm text-[#9ca3af]">Streak</p>
              <p className="text-xs text-[#6b7280]">#f97316</p>
            </div>
          </div>
        </section>

      </div>
    </div>
  )
}
