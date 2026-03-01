"use client"

import { useStats } from "@/hooks"
import {
  useWishes,
  useCreateWish,
  useContributeToWish,
  usePurchaseWish,
  useDeleteWish,
} from "@/hooks/modules/use-wishes"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { FadeIn, StaggerContainer, StaggerItem } from "@/components/animations"
import { Star, Coins, Plus, Trash2, ShoppingCart, PiggyBank, Trophy } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"
import type { Wish } from "@/lib/types"

// ============================================
// WISH CARD
// ============================================

function WishCard({
  wish,
  coins,
  onContribute,
  onPurchase,
  onDelete,
}: {
  wish: Wish
  coins: number
  onContribute: (id: string, amount: number) => void
  onPurchase: (id: string) => void
  onDelete: (id: string) => void
}) {
  const [contributeOpen, setContributeOpen] = useState(false)
  const [amount, setAmount] = useState("")

  const coinsNeeded = Math.round((wish.cost * (100 - wish.progress)) / 100)
  const coinsSaved = Math.round((wish.cost * wish.progress) / 100)

  const handleContribute = () => {
    const n = Number(amount)
    if (!n || n <= 0) return
    onContribute(wish.id, n)
    setAmount("")
    setContributeOpen(false)
  }

  const isPurchased = wish.status === "purchased"
  const isReady = wish.status === "ready"

  return (
    <>
      <Card className={`relative overflow-hidden transition-all ${isReady ? "border-yellow-500/50 shadow-[0_0_20px_rgba(234,179,8,0.1)]" : ""}`}>
        {isReady && (
          <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-yellow-400 via-amber-300 to-yellow-400" />
        )}
        {isPurchased && (
          <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-green-400 to-emerald-400" />
        )}

        <CardContent className="p-5 space-y-4">
          {/* Header */}
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-semibold text-base truncate">{wish.title}</h3>
                {isReady && <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30 text-xs">Готово!</Badge>}
                {isPurchased && <Badge className="bg-green-500/20 text-green-400 border-green-500/30 text-xs">Куплено</Badge>}
              </div>
              {wish.description && (
                <p className="text-sm text-muted-foreground mt-0.5 line-clamp-2">{wish.description}</p>
              )}
            </div>
            {!isPurchased && (
              <Button
                variant="ghost"
                size="icon"
                className="size-7 shrink-0 text-muted-foreground hover:text-destructive"
                onClick={() => onDelete(wish.id)}
              >
                <Trash2 className="size-3.5" />
              </Button>
            )}
          </div>

          {/* Cost & Progress */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground flex items-center gap-1">
                <Coins className="size-3.5 text-chart-4" />
                {coinsSaved} / {wish.cost}
              </span>
              <span className="font-medium text-chart-4">{Math.round(wish.progress)}%</span>
            </div>
            <Progress value={wish.progress} className="h-2" />
            {!isPurchased && (
              <p className="text-xs text-muted-foreground">Осталось: {coinsNeeded} монет</p>
            )}
            {wish.deadline && (
              <p className="text-xs text-muted-foreground">
                Дедлайн: {new Date(wish.deadline).toLocaleDateString("ru-RU")}
              </p>
            )}
          </div>

          {/* Actions */}
          {!isPurchased && (
            <div className="flex gap-2">
              {isReady ? (
                <Button
                  className="flex-1 bg-yellow-500 hover:bg-yellow-400 text-black font-semibold"
                  onClick={() => onPurchase(wish.id)}
                >
                  <Trophy className="mr-2 size-4" />
                  Купить!
                </Button>
              ) : (
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setContributeOpen(true)}
                  disabled={coins === 0}
                >
                  <PiggyBank className="mr-2 size-4" />
                  Внести монеты
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Contribute Dialog */}
      <Dialog open={contributeOpen} onOpenChange={setContributeOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Внести монеты</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/50 rounded-lg px-3 py-2">
              <Coins className="size-4 text-chart-4" />
              Баланс: <span className="font-semibold text-foreground">{coins} монет</span>
            </div>
            <div className="space-y-1.5">
              <Label>Сколько монет внести?</Label>
              <Input
                type="number"
                min={1}
                max={Math.min(coins, coinsNeeded)}
                value={amount}
                onChange={e => setAmount(e.target.value)}
                placeholder={`Макс. ${Math.min(coins, coinsNeeded)}`}
              />
            </div>
            <div className="flex gap-2 flex-wrap">
              {[10, 25, 50, Math.min(coins, coinsNeeded)].filter((v, i, a) => v > 0 && a.indexOf(v) === i).map(v => (
                <Button key={v} variant="outline" size="sm" onClick={() => setAmount(String(v))} className="text-xs">
                  {v}
                </Button>
              ))}
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="ghost">Отмена</Button>
            </DialogClose>
            <Button
              onClick={handleContribute}
              disabled={!amount || Number(amount) <= 0 || Number(amount) > coins}
            >
              Внести
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

// ============================================
// EMPTY STATE
// ============================================

function EmptyState({ label, onAdd }: { label: string; onAdd: () => void }) {
  return (
    <div className="col-span-full flex flex-col items-center justify-center py-16 text-center text-muted-foreground gap-3">
      <Star className="size-10 opacity-20" />
      <p className="text-sm">{label}</p>
      <Button variant="outline" size="sm" onClick={onAdd}>
        <Plus className="mr-2 size-4" />
        Добавить желание
      </Button>
    </div>
  )
}

// ============================================
// MAIN PAGE
// ============================================

export default function WishesPage() {
  const { data: wishes, mutate } = useWishes()
  const { data: stats } = useStats()
  const createWish = useCreateWish()
  const contributeToWish = useContributeToWish()
  const purchaseWish = usePurchaseWish()
  const deleteWish = useDeleteWish()

  const [createOpen, setCreateOpen] = useState(false)
  const [form, setForm] = useState({
    title: "",
    description: "",
    cost: "",
    deadline: "",
    imageUrl: "",
  })

  const coins = stats?.coins ?? 0
  const active = wishes?.filter(w => w.status === "saving" || w.status === "ready") ?? []
  const purchased = wishes?.filter(w => w.status === "purchased") ?? []

  const handleCreate = async () => {
    if (!form.title.trim() || !form.cost) return
    await createWish({
      title: form.title.trim(),
      description: form.description.trim(),
      cost: Number(form.cost),
      deadline: form.deadline || undefined,
      imageUrl: form.imageUrl.trim() || undefined,
    })
    mutate()
    setForm({ title: "", description: "", cost: "", deadline: "", imageUrl: "" })
    setCreateOpen(false)
    toast.success("Желание добавлено!")
  }

  const handleContribute = async (id: string, amount: number) => {
    const result = await contributeToWish(id, amount)
    if (result.success) {
      mutate()
      if (result.newProgress !== undefined && result.newProgress >= 100) {
        toast.success("Накоплено! Можно купить!", { description: "Нажмите «Купить!»" })
      } else {
        toast.success(`Внесено ${amount} монет`)
      }
    } else {
      toast.error(result.error === "Not enough coins" ? "Недостаточно монет" : result.error)
    }
  }

  const handlePurchase = async (id: string) => {
    const result = await purchaseWish(id)
    if (result.success) {
      mutate()
      toast.success("Желание исполнено!", { description: "Поздравляем!" })
    } else {
      toast.error(result.error)
    }
  }

  const handleDelete = (id: string) => {
    deleteWish(id)
    mutate()
    toast.success("Желание удалено")
  }

  return (
    <div className="flex flex-col gap-6 p-4 md:p-6 lg:p-8">
      {/* Header */}
      <FadeIn>
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Star className="size-6 text-primary" />
              Желания
            </h1>
            <p className="text-sm text-muted-foreground">
              Накапливайте монеты и исполняйте мечты
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-chart-4/10 px-4 py-2 rounded-full border border-chart-4/20">
              <Coins className="size-5 text-chart-4" />
              <span className="text-lg font-bold text-chart-4">{coins}</span>
            </div>
            <Button onClick={() => setCreateOpen(true)}>
              <Plus className="mr-2 size-4" />
              Добавить
            </Button>
          </div>
        </div>
      </FadeIn>

      {/* Stats strip */}
      <FadeIn>
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: "Активных", value: active.length, icon: PiggyBank },
            { label: "Готовы к покупке", value: active.filter(w => w.status === "ready").length, icon: ShoppingCart },
            { label: "Куплено", value: purchased.length, icon: Trophy },
          ].map(({ label, value, icon: Icon }) => (
            <Card key={label}>
              <CardContent className="p-4 flex items-center gap-3">
                <Icon className="size-5 text-muted-foreground shrink-0" />
                <div>
                  <p className="text-xl font-bold">{value}</p>
                  <p className="text-xs text-muted-foreground">{label}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </FadeIn>

      {/* Tabs */}
      <Tabs defaultValue="active">
        <TabsList>
          <TabsTrigger value="active">Активные ({active.length})</TabsTrigger>
          <TabsTrigger value="purchased">Куплено ({purchased.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="mt-4">
          <StaggerContainer className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {active.length === 0 ? (
              <EmptyState
                label="Нет активных желаний. Добавьте первое!"
                onAdd={() => setCreateOpen(true)}
              />
            ) : (
              active.map(wish => (
                <StaggerItem key={wish.id}>
                  <WishCard
                    wish={wish}
                    coins={coins}
                    onContribute={handleContribute}
                    onPurchase={handlePurchase}
                    onDelete={handleDelete}
                  />
                </StaggerItem>
              ))
            )}
          </StaggerContainer>
        </TabsContent>

        <TabsContent value="purchased" className="mt-4">
          <StaggerContainer className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {purchased.length === 0 ? (
              <EmptyState
                label="Ещё ничего не куплено"
                onAdd={() => setCreateOpen(true)}
              />
            ) : (
              purchased.map(wish => (
                <StaggerItem key={wish.id}>
                  <WishCard
                    wish={wish}
                    coins={coins}
                    onContribute={handleContribute}
                    onPurchase={handlePurchase}
                    onDelete={handleDelete}
                  />
                </StaggerItem>
              ))
            )}
          </StaggerContainer>
        </TabsContent>
      </Tabs>

      {/* Create Dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Новое желание</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label>Название *</Label>
              <Input
                placeholder="Новый MacBook Pro..."
                value={form.title}
                onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Описание</Label>
              <Textarea
                placeholder="Зачем это нужно?"
                value={form.description}
                onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                rows={2}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Стоимость (монет) *</Label>
                <Input
                  type="number"
                  min={1}
                  placeholder="500"
                  value={form.cost}
                  onChange={e => setForm(f => ({ ...f, cost: e.target.value }))}
                />
              </div>
              <div className="space-y-1.5">
                <Label>Дедлайн</Label>
                <Input
                  type="date"
                  value={form.deadline}
                  onChange={e => setForm(f => ({ ...f, deadline: e.target.value }))}
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>URL картинки (необязательно)</Label>
              <Input
                placeholder="https://..."
                value={form.imageUrl}
                onChange={e => setForm(f => ({ ...f, imageUrl: e.target.value }))}
              />
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="ghost">Отмена</Button>
            </DialogClose>
            <Button
              onClick={handleCreate}
              disabled={!form.title.trim() || !form.cost || Number(form.cost) <= 0}
            >
              Создать
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
