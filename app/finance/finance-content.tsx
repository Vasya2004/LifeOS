"use client"

import { useState } from "react"
import { useAccounts, useTransactions, useFinancialGoals, useFinancialStats } from "@/hooks/use-data"
import { 
  deleteAccount, 
  deleteTransaction, 
  deleteFinancialGoal,
  contributeToGoal,
} from "@/lib/store"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { FadeIn, StaggerContainer, StaggerItem } from "@/components/animations"
import { formatCurrency } from "@/lib/utils/finance"
import { 
  Wallet, 
  Plus, 
  TrendingUp, 
  TrendingDown, 
  PiggyBank,
  Target,
  DollarSign,
} from "lucide-react"
import { toast } from "sonner"
import {
  StatCard,
  AccountCard,
  TransactionRow,
  GoalRow,
  GoalCard,
  EmptyState,
  CreateAccountDialog,
  CreateTransactionDialog,
  CreateGoalDialog,
} from "./components"

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
            <Button onClick={() => setIsTransactionOpen(true)}>
              <Plus className="mr-2 size-4" />
              Транзакция
            </Button>
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
              <OverviewTab 
                stats={stats} 
                transactions={transactions} 
                accounts={accounts}
                goals={goals}
                onViewTransactions={() => setActiveTab("transactions")}
                onViewGoals={() => setActiveTab("goals")}
                onCreateGoal={() => setIsGoalOpen(true)}
              />
            </TabsContent>

            <TabsContent value="accounts" className="mt-6">
              <AccountsTab 
                accounts={accounts}
                onCreate={() => setIsAccountOpen(true)}
                onDelete={(id) => {
                  deleteAccount(id)
                  mutateAccounts()
                  toast.success("Счёт удалён")
                }}
              />
            </TabsContent>

            <TabsContent value="transactions" className="mt-6">
              <TransactionsTab 
                transactions={transactions}
                accounts={accounts}
                onCreate={() => setIsTransactionOpen(true)}
                onDelete={(id) => {
                  deleteTransaction(id)
                  mutateTransactions()
                  toast.success("Транзакция удалена")
                }}
              />
            </TabsContent>

            <TabsContent value="goals" className="mt-6">
              <GoalsTab 
                goals={goals}
                onCreate={() => setIsGoalOpen(true)}
                onContribute={(id, amount) => {
                  contributeToGoal(id, amount)
                  mutateGoals()
                  toast.success(`Внесено ${formatCurrency(amount)}`)
                }}
                onDelete={(id) => {
                  deleteFinancialGoal(id)
                  mutateGoals()
                  toast.success("Цель удалена")
                }}
              />
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
  )
}

// Tab Components

function OverviewTab({ 
  stats, 
  transactions, 
  accounts, 
  goals,
  onViewTransactions,
  onViewGoals,
  onCreateGoal,
}: {
  stats: any
  transactions?: any[]
  accounts?: any[]
  goals?: any[]
  onViewTransactions: () => void
  onViewGoals: () => void
  onCreateGoal: () => void
}) {
  return (
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
          <Button variant="ghost" size="sm" onClick={onViewTransactions}>
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

      {/* Active Goals Preview */}
      <Card className="lg:col-span-2">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg">Финансовые цели</CardTitle>
          <Button variant="ghost" size="sm" onClick={onViewGoals}>
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
              <Button onClick={onCreateGoal}>
                <Plus className="mr-2 size-4" />
                Создать цель
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

function AccountsTab({ 
  accounts, 
  onCreate, 
  onDelete 
}: {
  accounts?: any[]
  onCreate: () => void
  onDelete: (id: string) => void
}) {
  return (
    <>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">Ваши счета</h2>
        <Button onClick={onCreate}>
          <Plus className="mr-2 size-4" />
          Новый счёт
        </Button>
      </div>
      <StaggerContainer className="grid md:grid-cols-2 lg:grid-cols-3 gap-4" staggerDelay={0.1}>
        {accounts?.map(account => (
          <StaggerItem key={account.id}>
            <AccountCard 
              account={account}
              onDelete={() => onDelete(account.id)}
            />
          </StaggerItem>
        ))}
      </StaggerContainer>
      {(!accounts || accounts.length === 0) && (
        <EmptyState 
          icon={Wallet}
          title="Нет счетов"
          description="Добавьте свои счета, чтобы начать отслеживать финансы"
          action={<Button onClick={onCreate}>Добавить счёт</Button>}
        />
      )}
    </>
  )
}

function TransactionsTab({ 
  transactions, 
  accounts, 
  onCreate, 
  onDelete 
}: {
  transactions?: any[]
  accounts?: any[]
  onCreate: () => void
  onDelete: (id: string) => void
}) {
  return (
    <div className="space-y-4">
      {transactions
        ?.sort((a, b) => new Date(b.transactionDate).getTime() - new Date(a.transactionDate).getTime())
        .map(transaction => (
          <TransactionRow 
            key={transaction.id} 
            transaction={transaction}
            account={accounts?.find(a => a.id === transaction.accountId)}
            showDelete
            onDelete={() => onDelete(transaction.id)}
          />
        ))}
      {(!transactions || transactions.length === 0) && (
        <EmptyState 
          icon={DollarSign}
          title="Нет транзакций"
          description="Добавьте свою первую транзакцию"
          action={<Button onClick={onCreate}>Добавить транзакцию</Button>}
        />
      )}
    </div>
  )
}

function GoalsTab({ 
  goals, 
  onCreate, 
  onContribute, 
  onDelete 
}: {
  goals?: any[]
  onCreate: () => void
  onContribute: (id: string, amount: number) => void
  onDelete: (id: string) => void
}) {
  return (
    <>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">Финансовые цели</h2>
        <Button onClick={onCreate}>
          <Plus className="mr-2 size-4" />
          Новая цель
        </Button>
      </div>
      <StaggerContainer className="grid md:grid-cols-2 gap-4" staggerDelay={0.1}>
        {goals?.map(goal => (
          <StaggerItem key={goal.id}>
            <GoalCard 
              goal={goal}
              onContribute={(amount) => onContribute(goal.id, amount)}
              onDelete={() => onDelete(goal.id)}
            />
          </StaggerItem>
        ))}
      </StaggerContainer>
      {(!goals || goals.length === 0) && (
        <EmptyState 
          icon={Target}
          title="Нет целей"
          description="Создайте финансовую цель для мотивации"
          action={<Button onClick={onCreate}>Создать цель</Button>}
        />
      )}
    </>
  )
}
