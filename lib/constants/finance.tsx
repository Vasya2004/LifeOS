// ============================================
// Finance Constants
// ============================================

import {
  Wallet,
  LandPlot,
  TrendingUp,
  TrendingDown,
  DollarSign,
  PiggyBank,
  ArrowDownRight,
  ShoppingBag,
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
  CreditCard,
  Minus,
  Plus,
} from "lucide-react"
import type { AccountType } from "@/lib/types"

export const ACCOUNT_TYPES: { value: AccountType; label: string; icon: React.ComponentType<{ className?: string }>; color: string }[] = [
  { value: "cash", label: "Наличные", icon: Wallet, color: "#22c55e" },
  { value: "bank", label: "Банк", icon: LandPlot, color: "#3b82f6" },
  { value: "investment", label: "Инвестиции", icon: TrendingUpIcon, color: "#3b82f6" },
  { value: "crypto", label: "Крипта", icon: DollarSign, color: "#f59e0b" },
  { value: "debt", label: "Долги", icon: TrendingDown, color: "#ef4444" },
]

export const GOAL_CATEGORIES: { value: string; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { value: "savings", label: "Накопления", icon: PiggyBank },
  { value: "investment", label: "Инвестиции", icon: TrendingUp },
  { value: "debt_payment", label: "Погашение долга", icon: ArrowDownRight },
  { value: "purchase", label: "Покупка", icon: ShoppingBag },
  { value: "emergency_fund", label: "Резерв", icon: Shield },
]

export const CATEGORY_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
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
    <svg 
      className={className} 
      xmlns="http://www.w3.org/2000/svg" 
      width="24" 
      height="24" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    >
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
    </svg>
  )
}

export { Shield }
