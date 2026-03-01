"use client"

import { useState } from "react"
import { AppShell } from "@/components/app-shell"
import { useAccounts, useTransactions, useFinancialGoals, useFinancialStats } from "@/hooks/use-data"
import { 
  addAccount, 
  addTransaction, 
  addFinancialGoal, 
  contributeToGoal, 
  deleteAccount, 
  deleteTransaction, 
  deleteFinancialGoal 
} from "@/lib/store"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { FadeIn, StaggerContainer, StaggerItem } from "@/components/animations"
import { TextField, SelectField, NumberField, FormError, SubmitButton } from "@/components/form-field"
import { FINANCE_CATEGORIES } from "@/lib/types"
import { 
  Wallet, 
  Plus, 
  TrendingUp, 
  TrendingDown, 
  PiggyBank,
  Target,
  DollarSign,
  ArrowUpRight,
  ArrowDownRight,
  Trash2,
  LandPlot,
  Briefcase,
  Laptop,
  TrendingUp as TrendingUpIcon,
  Gift,
  Utensils,
  Car,
  Home,
  Heart,
  Gamepad2,
  BookOpen,
  ShoppingBag,
  CreditCard,
  Minus,
} from "lucide-react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import type { Account, Transaction, FinancialGoal, AccountType } from "@/lib/types"

const ACCOUNT_TYPES = [
  { value: "cash", label: "Наличные", icon: Wallet, color: "#22c55e" },
  { value: "bank", label: "Банк", icon: LandPlot, color: "#8b5cf6" },
  { value: "investment", label: "Инвестиции", icon: TrendingUpIcon, color: "#8b5cf6" },
  { value: "crypto", label: "Крипта", icon: DollarSign, color: "#f59e0b" },
  { value: "debt", label: "Долги", icon: TrendingDown, color: "#ef4444" },
]

const GOAL_CATEGORIES = [
  { value: "savings", label: "Накопления", icon: PiggyBank },
  { value: "investment", label: "Инвестиции", icon: TrendingUp },
  { value: "debt_payment", label: "Погашение долга", icon: ArrowDownRight },
  { value: "purchase", label: "Покупка", icon: ShoppingBag },
  { value: "emergency_fund", label: "Резерв", icon: Shield },
]

// Category icons mapping
const CATEGORY_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  salary: Briefcase,
  freelance: Laptop,
  investment: TrendingUpIcon,
  gift: Gift,
  other_income: Plus,
  food: Utensils,
  transport: Car,
  housing: Home,
  health: Heart,
  entertainment: Gamepad2,
  education: BookOpen,
  shopping: ShoppingBag,
  subscriptions: CreditCard,
  other_expense: Minus,
}

function Shield({ className }: { className?: string }) {
  return (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
    </svg>
  )
}

export default function FinanceContent() {
  const { data: accounts, mutate: mutateAccounts } = useAccounts()
  const { data: transactions, mutate: mutateTransactions } = useTransactions()
  const { data: goals, mutate: mutateGoals } = useFinancialGoals()
  const { data: stats } = useFinancialStats()
  
  const [activeTab, setActiveTab] = useState("overview")
  const [isAccountOpen, setIsAccountOpen] = useState(false)
  const [isTransactionOpen, setIsTransactionOpen] = useState(false)
  const [isGoalOpen, setIsGoalOpen] = useState(false)

  // Calculate totals
  const totalAssets = accounts?.filter(a => a.type !== "debt").reduce((sum, a) => sum + a.balance, 0) || 0
  const totalDebts = accounts?.filter(a => a.type === "debt").reduce((sum, a) => sum + a.balance, 0) || 0
  const netWorth = totalAssets - totalDebts

  return (
    <AppShell>
      <div className="flex flex-col gap-6 p-4 md:p-6 lg:p-8">
        {/* Header */}
        <FadeIn>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Финансы</h1>
              <p className="text-sm text-muted-foreground">
                Отслеживайте деньги и развивайте финансовую дисциплину
              </p>
            </div>
            <div className="flex gap-2">
              <Button onClick={() => setIsTransactionOpen(true)}>
                <Plus className="mr-2 size-4" />
                Транзакция
              </Button>
            </div>
          </div>
        </FadeIn>

        {/* Stats Overview */}
        <FadeIn delay={0.1}>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              title="Чистый капитал"
              value={formatCurrency(netWorth)}
              icon={Wallet}
              trend={stats?.netWorth && stats.netWorth > 0 ? "positive" : "neutral"}
            />
            <StatCard
              title="Активы"
              value={formatCurrency(totalAssets)}
              icon={TrendingUp}
              trend="positive"
            />
            <StatCard
              title="Долги"
              value={formatCurrency(totalDebts)}
              icon={TrendingDown}
              trend={totalDebts > 0 ? "negative" : "neutral"}
            />
            <StatCard
              title="Накопления"
              value={`${stats?.savingsRate || 0}%`}
              icon={PiggyBank}
              description="от дохода"
            />
          </div>
        </FadeIn>

        {/* Main Content */}
        <FadeIn delay={0.2}>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full max-w-lg grid-cols-4">
              <TabsTrigger value="overview">Обзор</TabsTrigger>
              <TabsTrigger value="accounts">Счета</TabsTrigger>
              <TabsTrigger value="transactions">Транзакции</TabsTrigger>
              <TabsTrigger value="goals">Цели</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="mt-6 space-y-6">
              <div className="grid lg:grid-cols-2 gap-6">
                {/* Monthly Stats */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Этот месяц</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Доходы</span>
                      <span className="font-medium text-success">+{formatCurrency(stats?.monthlyIncome || 0)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Расходы</span>
                      <span className="font-medium text-destructive">-{formatCurrency(stats?.monthlyExpenses || 0)}</span>
                    </div>
                    <div className="flex items-center justify-between pt-2 border-t">
                      <span className="font-medium">Сэкономлено</span>
                      <span className="font-bold">{formatCurrency(stats?.monthlySavings || 0)}</span>
                    </div>
                  </CardContent>
                </Card>

                {/* Recent Transactions */}
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="text-lg">Последние операции</CardTitle>
                    <Button variant="ghost" size="sm" onClick={() => setActiveTab("transactions")}>
                      Все
                    </Button>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {transactions?.slice(0, 5).map(transaction => (
                      <TransactionRow 
                        key={transaction.id} 
                        transaction={transaction}
                        account={accounts?.find(a => a.id === transaction.accountId)}
                      />
                    ))}
                    {(!transactions || transactions.length === 0) && (
                      <p className="text-center text-muted-foreground py-4">Нет операций</p>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Active Goals Preview */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="text-lg">Финансовые цели</CardTitle>
                  <Button variant="ghost" size="sm" onClick={() => setActiveTab("goals")}>
                    Все
                  </Button>
                </CardHeader>
                <CardContent>
                  {goals?.filter(g => !g.isCompleted).slice(0, 3).map(goal => (
                    <GoalRow key={goal.id} goal={goal} />
                  ))}
                  {(!goals || goals.filter(g => !g.isCompleted).length === 0) && (
                    <div className="text-center py-8">
                      <Target className="size-12 mx-auto mb-4 text-muted-foreground/50" />
                      <p className="text-muted-foreground mb-4">Нет активных целей</p>
                      <Button onClick={() => setIsGoalOpen(true)}>
                        <Plus className="mr-2 size-4" />
                        Создать цель
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="accounts" className="mt-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold">Ваши счета</h2>
                <Button onClick={() => setIsAccountOpen(true)}>
                  <Plus className="mr-2 size-4" />
                  Новый счёт
                </Button>
              </div>
              <StaggerContainer className="grid md:grid-cols-2 lg:grid-cols-3 gap-4" staggerDelay={0.1}>
                {accounts?.map(account => (
                  <StaggerItem key={account.id}>
                    <AccountCard 
                      account={account}
                      onDelete={() => {
                        deleteAccount(account.id)
                        mutateAccounts()
                        toast.success("Счёт удалён")
                      }}
                    />
                  </StaggerItem>
                ))}
              </StaggerContainer>
              {(!accounts || accounts.length === 0) && (
                <EmptyState 
                  icon={Wallet}
                  title="Нет счетов"
                  description="Добавьте свои счета, чтобы начать отслеживать финансы"
                  action={<Button onClick={() => setIsAccountOpen(true)}>Добавить счёт</Button>}
                />
              )}
            </TabsContent>

            <TabsContent value="transactions" className="mt-6">
              <div className="space-y-4">
                {transactions?.sort((a, b) => new Date(b.transactionDate).getTime() - new Date(a.transactionDate).getTime()).map(transaction => (
                  <TransactionRow 
                    key={transaction.id} 
                    transaction={transaction}
                    account={accounts?.find(a => a.id === transaction.accountId)}
                    showDelete
                    onDelete={() => {
                      deleteTransaction(transaction.id)
                      mutateTransactions()
                      toast.success("Транзакция удалена")
                    }}
                  />
                ))}
                {(!transactions || transactions.length === 0) && (
                  <EmptyState 
                    icon={DollarSign}
                    title="Нет транзакций"
                    description="Добавьте свою первую транзакцию"
                    action={<Button onClick={() => setIsTransactionOpen(true)}>Добавить транзакцию</Button>}
                  />
                )}
              </div>
            </TabsContent>

            <TabsContent value="goals" className="mt-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold">Финансовые цели</h2>
                <Button onClick={() => setIsGoalOpen(true)}>
                  <Plus className="mr-2 size-4" />
                  Новая цель
                </Button>
              </div>
              <StaggerContainer className="grid md:grid-cols-2 gap-4" staggerDelay={0.1}>
                {goals?.map(goal => (
                  <StaggerItem key={goal.id}>
                    <GoalCard 
                      goal={goal}
                      onContribute={(amount) => {
                        contributeToGoal(goal.id, amount)
                        mutateGoals()
                        toast.success(`Внесено ${formatCurrency(amount)}`)
                      }}
                      onDelete={() => {
                        deleteFinancialGoal(goal.id)
                        mutateGoals()
                        toast.success("Цель удалена")
                      }}
                    />
                  </StaggerItem>
                ))}
              </StaggerContainer>
              {(!goals || goals.length === 0) && (
                <EmptyState 
                  icon={Target}
                  title="Нет целей"
                  description="Создайте финансовую цель для мотивации"
                  action={<Button onClick={() => setIsGoalOpen(true)}>Создать цель</Button>}
                />
              )}
            </TabsContent>
          </Tabs>
        </FadeIn>

        {/* Dialogs */}
        {isAccountOpen && (
          <CreateAccountDialog 
            onClose={() => setIsAccountOpen(false)}
            onSuccess={() => {
              mutateAccounts()
              setIsAccountOpen(false)
            }}
          />
        )}

        {isTransactionOpen && (
          <CreateTransactionDialog 
            accounts={accounts || []}
            onClose={() => setIsTransactionOpen(false)}
            onSuccess={() => {
              mutateTransactions()
              mutateAccounts()
              setIsTransactionOpen(false)
            }}
          />
        )}

        {isGoalOpen && (
          <CreateGoalDialog 
            onClose={() => setIsGoalOpen(false)}
            onSuccess={() => {
              mutateGoals()
              setIsGoalOpen(false)
            }}
          />
        )}
      </div>
    </AppShell>
  )
}

// Components

function StatCard({ title, value, icon: Icon, trend, description }: { 
  title: string
  value: string
  icon: React.ComponentType<{ className?: string }>
  trend?: "positive" | "negative" | "neutral"
  description?: string
}) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <div className={cn(
            "p-2 rounded-lg",
            trend === "positive" && "bg-success/10 text-success",
            trend === "negative" && "bg-destructive/10 text-destructive",
            trend === "neutral" && "bg-muted text-muted-foreground"
          )}>
            <Icon className="size-5" />
          </div>
          <div>
            <p className="text-2xl font-bold">{value}</p>
            <p className="text-xs text-muted-foreground">{title}</p>
            {description && <p className="text-[10px] text-muted-foreground">{description}</p>}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function AccountCard({ account, onDelete }: { account: Account; onDelete: () => void }) {
  const typeInfo = ACCOUNT_TYPES.find(t => t.value === account.type)
  const isDebt = account.type === "debt"
  
  return (
    <Card className="overflow-hidden group">
      <div className="h-1.5" style={{ backgroundColor: typeInfo?.color || "#6366f1" }} />
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center gap-2">
            {typeInfo && <typeInfo.icon className="size-4 text-muted-foreground" />}
            <span className="font-medium">{account.name}</span>
          </div>
          <Button variant="ghost" size="icon" className="size-8 opacity-0 group-hover:opacity-100" onClick={onDelete}>
            <Trash2 className="size-4 text-destructive" />
          </Button>
        </div>
        <p className={cn("text-2xl font-bold", isDebt ? "text-destructive" : "text-foreground")}>
          {isDebt ? "-" : ""}{formatCurrency(account.balance)}
        </p>
        <p className="text-xs text-muted-foreground">{typeInfo?.label}</p>
      </CardContent>
    </Card>
  )
}

function TransactionRow({ transaction, account, showDelete, onDelete }: { 
  transaction: Transaction
  account?: Account
  showDelete?: boolean
  onDelete?: () => void
}) {
  const isIncome = transaction.type === "income"
  const categoryInfo = [...FINANCE_CATEGORIES.income, ...FINANCE_CATEGORIES.expense].find(c => c.id === transaction.category)
  const CategoryIcon = categoryInfo ? CATEGORY_ICONS[categoryInfo.id] || Minus : Minus
  
  return (
    <div className="flex items-center gap-3 p-3 rounded-lg border hover:border-primary/50 transition-colors">
      <div className={cn(
        "p-2 rounded-lg",
        isIncome ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive"
      )}>
        {isIncome ? <ArrowUpRight className="size-4" /> : <ArrowDownRight className="size-4" />}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-medium truncate">{transaction.description || categoryInfo?.name || transaction.category}</span>
          <Badge variant="outline" className="text-xs">
            <CategoryIcon className="size-3 mr-1" />
            {categoryInfo?.name || transaction.category}
          </Badge>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span>{account?.name || "Неизвестный счёт"}</span>
          <span>•</span>
          <span>{new Date(transaction.transactionDate).toLocaleDateString('ru-RU')}</span>
        </div>
      </div>
      <div className={cn("font-bold", isIncome ? "text-success" : "text-destructive")}>
        {isIncome ? "+" : "-"}{formatCurrency(transaction.amount)}
      </div>
      {showDelete && onDelete && (
        <Button variant="ghost" size="icon" className="size-8" onClick={onDelete}>
          <Trash2 className="size-4 text-destructive" />
        </Button>
      )}
    </div>
  )
}

function GoalRow({ goal }: { goal: FinancialGoal }) {
  const progress = Math.min(100, (goal.currentAmount / goal.targetAmount) * 100)
  const categoryInfo = GOAL_CATEGORIES.find(c => c.value === goal.category)
  
  return (
    <div className="flex items-center gap-4 p-3 rounded-lg border">
      <div className="p-2 rounded-lg bg-primary/10">
        {categoryInfo && <categoryInfo.icon className="size-5 text-primary" />}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium truncate">{goal.title}</p>
        <Progress value={progress} className="h-2 mt-1" />
      </div>
      <div className="text-right">
        <p className="font-bold">{formatCurrency(goal.currentAmount)}</p>
        <p className="text-xs text-muted-foreground">из {formatCurrency(goal.targetAmount)}</p>
      </div>
    </div>
  )
}

function GoalCard({ goal, onContribute, onDelete }: { 
  goal: FinancialGoal
  onContribute: (amount: number) => void
  onDelete: () => void
}) {
  const progress = Math.min(100, (goal.currentAmount / goal.targetAmount) * 100)
  const categoryInfo = GOAL_CATEGORIES.find(c => c.value === goal.category)
  const [contributeAmount, setContributeAmount] = useState(1000)
  
  return (
    <Card className="overflow-hidden">
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            {categoryInfo && <categoryInfo.icon className="size-5 text-primary" />}
            <div>
              <h3 className="font-semibold">{goal.title}</h3>
              {goal.deadline && (
                <p className="text-xs text-muted-foreground">
                  Дедлайн: {new Date(goal.deadline).toLocaleDateString('ru-RU')}
                </p>
              )}
            </div>
          </div>
          <Button variant="ghost" size="icon" className="size-8" onClick={onDelete}>
            <Trash2 className="size-4 text-destructive" />
          </Button>
        </div>
        
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Прогресс</span>
            <span className="font-medium">{progress.toFixed(0)}%</span>
          </div>
          <Progress value={progress} className="h-2" />
          <div className="flex justify-between text-sm">
            <span>{formatCurrency(goal.currentAmount)}</span>
            <span className="text-muted-foreground">{formatCurrency(goal.targetAmount)}</span>
          </div>
        </div>
        
        {!goal.isCompleted && (
          <div className="flex gap-2 mt-4 pt-3 border-t">
            <Input
              type="number"
              value={contributeAmount}
              onChange={(e) => setContributeAmount(Number(e.target.value))}
              className="w-24"
              min={1}
            />
            <Button onClick={() => onContribute(contributeAmount)} className="flex-1">
              Внести
            </Button>
          </div>
        )}
        
        {goal.isCompleted && (
          <div className="mt-4 pt-3 border-t">
            <Badge className="bg-success text-success-foreground">Цель достигнута! 🎉</Badge>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function EmptyState({ icon: Icon, title, description, action }: { 
  icon: React.ComponentType<{ className?: string }>
  title: string
  description: string
  action: React.ReactNode
}) {
  return (
    <Card className="p-12 text-center">
      <Icon className="size-12 mx-auto mb-4 text-muted-foreground/50" />
      <h3 className="text-lg font-medium mb-2">{title}</h3>
      <p className="text-muted-foreground mb-4 max-w-sm mx-auto">{description}</p>
      {action}
    </Card>
  )
}

// Dialogs

function CreateAccountDialog({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  
  const [name, setName] = useState("")
  const [type, setType] = useState<AccountType>("cash")
  const [balance, setBalance] = useState(0)
  const [currency, setCurrency] = useState("RUB")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitError(null)
    
    if (!name.trim()) {
      setSubmitError("Название обязательно")
      return
    }
    
    setIsSubmitting(true)
    try {
      addAccount({
        name,
        type,
        balance,
        currency,
        isActive: true,
      })
      toast.success("Счёт создан! +20 XP")
      onSuccess()
    } catch (error) {
      setSubmitError("Ошибка при создании счёта")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog onClose={onClose} title="Новый счёт">
      <form onSubmit={handleSubmit} className="space-y-4">
        <FormError error={submitError} />
        <div className="space-y-2">
          <Label>Название *</Label>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="например, Основной счёт"
          />
        </div>
        <SelectField
          label="Тип"
          name="type"
          value={type}
          onValueChange={(v) => setType(v as AccountType)}
          options={ACCOUNT_TYPES.map(t => ({ value: t.value, label: t.label }))}
        />
        <NumberField
          label="Начальный баланс"
          name="balance"
          value={balance}
          onChange={setBalance}
          min={0}
        />
        <div className="flex gap-2 pt-2">
          <Button type="button" variant="outline" className="flex-1" onClick={onClose}>
            Отмена
          </Button>
          <SubmitButton isSubmitting={isSubmitting} className="flex-1">
            Создать
          </SubmitButton>
        </div>
      </form>
    </Dialog>
  )
}

function CreateTransactionDialog({ accounts, onClose, onSuccess }: { 
  accounts: Account[]
  onClose: () => void
  onSuccess: () => void
}) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  
  const [type, setType] = useState<"income" | "expense">("expense")
  const [accountId, setAccountId] = useState("")
  const [amount, setAmount] = useState(0)
  const [category, setCategory] = useState("")
  const [description, setDescription] = useState("")
  const [date, setDate] = useState(new Date().toISOString().split("T")[0])

  const categories = type === "income" ? FINANCE_CATEGORIES.income : FINANCE_CATEGORIES.expense

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitError(null)
    
    if (!accountId) {
      setSubmitError("Выберите счёт")
      return
    }
    if (!category) {
      setSubmitError("Выберите категорию")
      return
    }
    if (amount <= 0) {
      setSubmitError("Введите сумму")
      return
    }
    
    setIsSubmitting(true)
    try {
      addTransaction({
        accountId,
        type,
        amount,
        category,
        description,
        transactionDate: date,
      })
      const xpReward = type === "expense" ? 5 : 10
      toast.success(`Транзакция добавлена! +${xpReward} XP`)
      onSuccess()
    } catch (error) {
      setSubmitError("Ошибка при создании транзакции")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog onClose={onClose} title="Новая транзакция">
      <form onSubmit={handleSubmit} className="space-y-4">
        <FormError error={submitError} />
        
        <div className="flex gap-2">
          <Button
            type="button"
            variant={type === "expense" ? "default" : "outline"}
            className="flex-1"
            onClick={() => setType("expense")}
          >
            Расход
          </Button>
          <Button
            type="button"
            variant={type === "income" ? "default" : "outline"}
            className="flex-1"
            onClick={() => setType("income")}
          >
            Доход
          </Button>
        </div>

        <SelectField
          label="Счёт"
          name="accountId"
          value={accountId}
          onValueChange={setAccountId}
          options={accounts.map(a => ({ value: a.id, label: a.name }))}
          placeholder="Выберите счёт"
          required
        />

        <NumberField
          label="Сумма"
          name="amount"
          value={amount}
          onChange={setAmount}
          min={1}
          required
        />

        <SelectField
          label="Категория"
          name="category"
          value={category}
          onValueChange={setCategory}
          options={categories.map(c => ({ value: c.id, label: c.name }))}
          placeholder="Выберите категорию"
          required
        />

        <div className="space-y-2">
          <Label>Описание (опционально)</Label>
          <Input
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="например, Продукты на неделю"
          />
        </div>

        <div className="space-y-2">
          <Label>Дата *</Label>
          <Input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </div>

        <div className="flex gap-2 pt-2">
          <Button type="button" variant="outline" className="flex-1" onClick={onClose}>
            Отмена
          </Button>
          <SubmitButton isSubmitting={isSubmitting} className="flex-1">
            Добавить
          </SubmitButton>
        </div>
      </form>
    </Dialog>
  )
}

function CreateGoalDialog({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  
  const [title, setTitle] = useState("")
  const [category, setCategory] = useState<"savings" | "investment" | "debt_payment" | "purchase" | "emergency_fund">("savings")
  const [targetAmount, setTargetAmount] = useState(100000)
  const [deadline, setDeadline] = useState("")
  const [description, setDescription] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitError(null)
    
    if (!title.trim()) {
      setSubmitError("Название обязательно")
      return
    }
    if (targetAmount <= 0) {
      setSubmitError("Введите целевую сумму")
      return
    }
    
    setIsSubmitting(true)
    try {
      addFinancialGoal({
        title,
        description,
        targetAmount,
        deadline: deadline || undefined,
        category,
      })
      toast.success("Финансовая цель создана! +50 XP")
      onSuccess()
    } catch (error) {
      setSubmitError("Ошибка при создании цели")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog onClose={onClose} title="Новая финансовая цель">
      <form onSubmit={handleSubmit} className="space-y-4">
        <FormError error={submitError} />
        
        <div className="space-y-2">
          <Label>Название цели *</Label>
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="например, Купить машину"
          />
        </div>

        <SelectField
          label="Тип цели"
          name="category"
          value={category}
          onValueChange={(v) => setCategory(v as any)}
          options={GOAL_CATEGORIES.map(c => ({ value: c.value, label: c.label }))}
        />

        <NumberField
          label="Целевая сумма"
          name="targetAmount"
          value={targetAmount}
          onChange={setTargetAmount}
          min={1}
          required
        />

        <div className="space-y-2">
          <Label>Дедлайн (опционально)</Label>
          <Input
            type="date"
            value={deadline}
            onChange={(e) => setDeadline(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label>Описание (опционально)</Label>
          <Input
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Подробнее о цели..."
          />
        </div>

        <div className="flex gap-2 pt-2">
          <Button type="button" variant="outline" className="flex-1" onClick={onClose}>
            Отмена
          </Button>
          <SubmitButton isSubmitting={isSubmitting} className="flex-1">
            Создать
          </SubmitButton>
        </div>
      </form>
    </Dialog>
  )
}

function Dialog({ onClose, title, children }: { onClose: () => void; title: string; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-background rounded-lg shadow-lg max-w-md w-full">
        <div className="p-6">
          <h2 className="text-lg font-semibold mb-4">{title}</h2>
          {children}
        </div>
      </div>
    </div>
  )
}

// Utilities

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    maximumFractionDigits: 0,
  }).format(amount)
}
