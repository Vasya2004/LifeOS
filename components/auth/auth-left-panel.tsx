import Image from "next/image"

const AUTH_BADGE_TEXT = "Переход на новый уровень"

interface AuthLeftPanelProps {
  activeTab: "login" | "register"
}

export function AuthLeftPanel({ activeTab: _ }: AuthLeftPanelProps) {
  return (
    <div className="hidden lg:flex lg:w-1/2 p-5">
      <div className="relative w-full overflow-hidden flex flex-col justify-between p-10 rounded-2xl">

        {/* Фоновое изображение */}
        <Image
          src="/auth-bg.webp"
          alt=""
          fill
          className="object-cover"
          priority
        />

        {/* Декоративные световые пятна */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-white/10 rounded-full blur-[80px] translate-x-1/3 -translate-y-1/3 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-400/20 rounded-full blur-[60px] -translate-x-1/4 translate-y-1/4 pointer-events-none" />

        {/* Шапка: логотип + навигация */}
        <div className="relative z-10 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Image src="/logo-light.svg" alt="LifeOS" width={20} height={20} />
            <span className="text-white/90 font-normal text-lg tracking-tight font-heading">LifeOS</span>
          </div>
          <nav className="flex items-center gap-6">
            <span className="text-[15px] text-white/60 cursor-not-allowed select-none transition-colors duration-200 hover:text-white/90" title="Скоро">Возможности</span>
            <span className="text-[15px] text-white/60 cursor-not-allowed select-none transition-colors duration-200 hover:text-white/90" title="Скоро">Как это работает</span>
            <span className="text-[15px] text-white/60 cursor-not-allowed select-none transition-colors duration-200 hover:text-white/90" title="Скоро">Миссия</span>
          </nav>
        </div>

        {/* Нижний блок */}
        <div className="relative z-10 space-y-6">

          {/* Плашка */}
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/15 rounded-full px-4 py-1.5">
            <div className="size-2 rounded-full bg-green-400 shadow-[0_0_6px_rgba(74,222,128,0.8)]" />
            <span className="text-sm text-white/90 font-medium">{AUTH_BADGE_TEXT}</span>
          </div>

          <h1 className="text-5xl font-normal text-white leading-[1.1] tracking-tight font-heading">
            Преврати свою жизнь в игру,<br />
            где ты главный герой
          </h1>

          <p className="text-lg text-white/70 leading-relaxed">
            Забудьте о скучных списках дел. LifeOS превращает каждый день в квест:
            выполняйте задачи, получайте опыт, открывайте достижения и соревнуйтесь
            с самим собой. Прокачка персонажа ещё никогда не была такой полезной.
          </p>
        </div>
      </div>
    </div>
  )
}
