// ============================================
// LOGIN PAGE — split layout (dark both sides)
// ============================================

import { AuthLeftPanel } from "@/components/auth/auth-left-panel"
import LoginForm from "@/components/auth/login-form"
import Image from "next/image"
import { Zap } from "lucide-react"

export default function LoginPage() {
  return (
    <div className="flex min-h-screen bg-[#111111]">
      <AuthLeftPanel activeTab="login" />

      <div className="flex w-full lg:w-1/2 flex-col items-center justify-center px-8 py-12">

        {/* Mobile header */}
        <div className="lg:hidden w-full max-w-sm mb-8 space-y-4">
          <div className="flex items-center gap-2">
            <div className="flex size-8 items-center justify-center rounded-lg bg-violet-600">
              <Zap className="size-4 text-white" />
            </div>
            <span className="font-semibold text-lg text-white">LifeOS</span>
          </div>
          <div className="space-y-1">
            <h1 className="text-2xl font-bold text-white leading-tight">Преврати свою жизнь в игру</h1>
            <p className="text-sm text-white/65">Управляйте жизнью системно — цели, привычки, навыки и личный прогресс</p>
          </div>
        </div>

        <div className="w-full max-w-sm space-y-6">
          {/* Логотип (десктоп) */}
          <div className="hidden lg:block w-fit">
            <Image src="/logo-light.svg" alt="LifeOS" width={32} height={32} className="block" />
          </div>

          <div className="space-y-1">
            <h2 className="text-2xl font-semibold tracking-tight text-white">С возвращением</h2>
            <p className="text-sm text-white/65">Войдите, чтобы продолжить прокачку</p>
          </div>

          <LoginForm />
        </div>
      </div>
    </div>
  )
}
