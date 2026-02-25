// ============================================
// AUTH HEADER — навигационная шапка
// TODO: Добавить реальные ссылки когда будет лендинг
// ============================================

import Image from "next/image"
import Link from "next/link"

export function AuthHeader() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 h-14 flex items-center px-6 backdrop-blur-md bg-[#0A0A0A]/70 border-b border-white/8">
      {/* Логотип */}
      <Link href="/" className="flex items-center gap-2 mr-auto">
        <Image src="/logo-light.svg" alt="LifeOS" width={20} height={20} />
        <span className="font-bold text-base text-white/90 tracking-tight">LifeOS</span>
      </Link>

      {/* Навигация — заглушки скрыты на мобильном */}
      <nav className="hidden md:flex items-center gap-6 mr-6">
        <span
          className="text-sm text-white/30 cursor-not-allowed select-none"
          title="Скоро"
        >
          Возможности
        </span>
        <span
          className="text-sm text-white/30 cursor-not-allowed select-none"
          title="Скоро"
        >
          Как это работает
        </span>
      </nav>

      {/* Войти — всегда видна */}
      <Link
        href="/auth/login"
        className="text-sm text-white/70 hover:text-white transition-colors"
      >
        Войти
      </Link>
    </header>
  )
}
