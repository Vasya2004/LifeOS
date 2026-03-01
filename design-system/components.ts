// ============================================
// LifeOS Design System - Components
// ============================================
//
// Готовые стили для компонентов.
// Используйте эти константы для className.
//
// ============================================

import { colors, darkTheme, spacing, typography, shadows, radius, transitions } from './tokens'

// ============================================
// BUTTON - Кнопки
// ============================================

export const button = {
  // Base styles (все кнопки)
  base: `
    inline-flex items-center justify-center
    font-medium transition-colors
    focus:outline-none focus:ring-2 focus:ring-offset-2
    disabled:opacity-50 disabled:pointer-events-none
    rounded-lg
  `,

  // Variants
  variants: {
    // Primary - основное действие
    primary: `
      bg-[#2563eb] text-white
      hover:bg-[#3b82f6]
      active:bg-[#1d4ed8]
      focus:ring-[#3b82f6]
      shadow-md hover:shadow-lg
    `,
    
    // Secondary - вторичное действие
    secondary: `
      bg-slate-800 text-slate-200
      border border-slate-700
      hover:bg-slate-700 hover:border-slate-600
      active:bg-slate-900
      focus:ring-slate-500
    `,
    
    // Ghost - тонкое действие
    ghost: `
      bg-transparent text-slate-400
      hover:bg-slate-800 hover:text-slate-200
      active:bg-slate-900
      focus:ring-slate-500
    `,
    
    // Outline - контурная
    outline: `
      bg-transparent text-blue-400
      border border-[#3b82f6]/50
      hover:bg-[#3b82f6]/10 hover:border-[#3b82f6]
      active:bg-[#3b82f6]/20
      focus:ring-[#3b82f6]
    `,
    
    // Destructive - опасное действие
    destructive: `
      bg-red-600 text-white
      hover:bg-red-500
      active:bg-red-700
      focus:ring-red-500
      shadow-md hover:shadow-lg
    `,
    
    // Success - успешное действие
    success: `
      bg-emerald-600 text-white
      hover:bg-emerald-500
      active:bg-emerald-700
      focus:ring-emerald-500
      shadow-md hover:shadow-lg
    `,
    
    // XP - для геймификации
    xp: `
      bg-gradient-to-r from-[#2563eb] to-blue-600 text-white
      hover:from-[#3b82f6] hover:to-blue-500
      active:from-[#1d4ed8] active:to-blue-700
      focus:ring-blue-500
      shadow-lg shadow-[#3b82f6]/25
      hover:shadow-xl hover:shadow-[#3b82f6]/30
    `,
  },

  // Sizes
  sizes: {
    xs: 'h-7 px-2.5 text-xs gap-1.5',
    sm: 'h-8 px-3 text-sm gap-2',
    md: 'h-10 px-4 text-sm gap-2',
    lg: 'h-12 px-6 text-base gap-2',
    xl: 'h-14 px-8 text-lg gap-3',
    icon: 'h-10 w-10 p-2',
  },
} as const

// ============================================
// INPUT - Поля ввода
// ============================================

export const input = {
  base: `
    flex w-full
    bg-slate-900/50
    border border-slate-700
    rounded-lg
    px-3 py-2
    text-sm text-slate-200
    placeholder:text-slate-500
    transition-colors
    file:border-0 file:bg-transparent file:text-sm file:font-medium
    focus:outline-none focus:ring-2 focus:ring-[#3b82f6]/50 focus:border-[#3b82f6]
    disabled:cursor-not-allowed disabled:opacity-50
  `,

  states: {
    error: 'border-red-500 focus:border-red-500 focus:ring-red-500/50',
    success: 'border-emerald-500 focus:border-emerald-500 focus:ring-emerald-500/50',
  },

  sizes: {
    sm: 'h-8 text-xs',
    md: 'h-10 text-sm',
    lg: 'h-12 text-base',
  },
} as const

// ============================================
// CARD - Карточки
// ============================================

export const card = {
  base: `
    bg-slate-900/50
    border border-slate-800
    rounded-xl
    shadow-sm
  `,

  variants: {
    default: 'bg-slate-900/50 border-slate-800',
    elevated: 'bg-slate-800/50 border-slate-700 shadow-lg',
    interactive: 'bg-slate-900/50 border-slate-800 hover:border-slate-700 hover:bg-slate-800/30 transition-colors cursor-pointer',
    primary: 'bg-blue-950/30 border-[#3b82f6]/20',
    success: 'bg-emerald-950/30 border-emerald-500/20',
    warning: 'bg-amber-950/30 border-amber-500/20',
    error: 'bg-red-950/30 border-red-500/20',
  },

  padding: {
    none: '',
    sm: 'p-3',
    md: 'p-4',
    lg: 'p-6',
    xl: 'p-8',
  },
} as const

// ============================================
// BADGE - Бейджи
// ============================================

export const badge = {
  base: `
    inline-flex items-center
    px-2.5 py-0.5
    rounded-full
    text-xs font-medium
    transition-colors
  `,

  variants: {
    default: 'bg-slate-800 text-slate-200 border border-slate-700',
    primary: 'bg-[#3b82f6]/10 text-blue-400 border border-[#3b82f6]/20',
    secondary: 'bg-blue-500/10 text-blue-400 border border-blue-500/20',
    success: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20',
    warning: 'bg-amber-500/10 text-amber-400 border border-amber-500/20',
    error: 'bg-red-500/10 text-red-400 border border-red-500/20',
    info: 'bg-[#3b82f6]/10 text-blue-400 border border-[#3b82f6]/20',
    
    // Gamification
    xp: 'bg-gradient-to-r from-[#3b82f6]/20 to-blue-500/20 text-blue-300 border border-[#3b82f6]/30',
    coin: 'bg-amber-500/10 text-amber-400 border border-amber-500/20',
    streak: 'bg-orange-500/10 text-orange-400 border border-orange-500/20',
  },

  sizes: {
    sm: 'px-2 py-0.5 text-[10px]',
    md: 'px-2.5 py-0.5 text-xs',
    lg: 'px-3 py-1 text-sm',
  },
} as const

// ============================================
// AVATAR - Аватары
// ============================================

export const avatar = {
  base: 'relative flex shrink-0 overflow-hidden rounded-full',

  sizes: {
    xs: 'h-6 w-6 text-[10px]',
    sm: 'h-8 w-8 text-xs',
    md: 'h-10 w-10 text-sm',
    lg: 'h-12 w-12 text-base',
    xl: 'h-16 w-16 text-lg',
    '2xl': 'h-20 w-20 text-xl',
  },

  fallback: 'flex h-full w-full items-center justify-center rounded-full bg-slate-800 text-slate-400 font-medium',
} as const

// ============================================
// PROGRESS - Прогресс-бары
// ============================================

export const progress = {
  base: 'relative h-2 w-full overflow-hidden rounded-full bg-slate-800',
  
  bar: 'h-full w-full flex-1 bg-[#3b82f6] transition-all',
  
  variants: {
    default: 'bg-[#3b82f6]',
    success: 'bg-emerald-500',
    warning: 'bg-amber-500',
    error: 'bg-red-500',
    xp: 'bg-gradient-to-r from-[#3b82f6] to-blue-500',
    health: 'bg-gradient-to-r from-emerald-500 to-teal-500',
  },

  sizes: {
    sm: 'h-1',
    md: 'h-2',
    lg: 'h-3',
    xl: 'h-4',
  },
} as const

// ============================================
// SKELETON - Скелетоны загрузки
// ============================================

export const skeleton = {
  base: `
    animate-pulse
    bg-slate-800/50
    rounded-md
  `,

  shimmer: `
    relative
    overflow-hidden
    bg-slate-800/50
    before:absolute before:inset-0
    before:-translate-x-full
    before:animate-[shimmer_2s_infinite]
    before:bg-gradient-to-r
    before:from-transparent before:via-slate-700/50 before:to-transparent
  `,
} as const

// ============================================
// TOOLTIP - Подсказки
// ============================================

export const tooltip = {
  trigger: 'inline-flex',
  
  content: `
    z-50
    overflow-hidden
    rounded-lg
    bg-slate-900
    border border-slate-800
    px-3 py-1.5
    text-sm text-slate-200
    shadow-lg
    animate-in fade-in-0 zoom-in-95
    data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95
    data-[side=bottom]:slide-in-from-top-2
    data-[side=left]:slide-in-from-right-2
    data-[side=right]:slide-in-from-left-2
    data-[side=top]:slide-in-from-bottom-2
  `,
} as const

// ============================================
// DIALOG - Модальные окна
// ============================================

export const dialog = {
  overlay: `
    fixed inset-0 z-50
    bg-black/80
    data-[state=open]:animate-in data-[state=open]:fade-in-0
    data-[state=closed]:animate-out data-[state=closed]:fade-out-0
  `,

  content: `
    fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4
    bg-slate-900
    border border-slate-800
    p-6
    shadow-2xl
    duration-200
    data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95 data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%]
    data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%]
    sm:rounded-xl
  `,

  header: 'flex flex-col space-y-1.5 text-center sm:text-left',
  footer: 'flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2',
  title: 'text-lg font-semibold leading-none tracking-tight text-slate-100',
  description: 'text-sm text-slate-400',
} as const

// ============================================
// DROPDOWN - Выпадающие меню
// ============================================

export const dropdown = {
  content: `
    z-50
    min-w-[8rem]
    overflow-hidden
    rounded-lg
    bg-slate-900
    border border-slate-800
    p-1
    text-slate-200
    shadow-xl
    data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95
    data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95
  `,

  item: `
    relative flex cursor-pointer select-none items-center
    rounded-md
    px-2 py-1.5
    text-sm
    outline-none
    transition-colors
    focus:bg-slate-800 focus:text-slate-100
    data-[disabled]:pointer-events-none data-[disabled]:opacity-50
  `,

  separator: '-mx-1 my-1 h-px bg-slate-800',
  label: 'px-2 py-1.5 text-xs font-semibold text-slate-500',
} as const

// ============================================
// TABS - Вкладки
// ============================================

export const tabs = {
  list: 'inline-flex h-10 items-center justify-center rounded-lg bg-slate-800/50 p-1 text-slate-400',
  
  trigger: `
    inline-flex items-center justify-center whitespace-nowrap
    rounded-md
    px-3 py-1.5
    text-sm font-medium
    ring-offset-slate-900
    transition-all
    focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3b82f6] focus-visible:ring-offset-2
    disabled:pointer-events-none disabled:opacity-50
    data-[state=active]:bg-slate-800 data-[state=active]:text-slate-100 data-[state=active]:shadow-sm
  `,

  content: `
    mt-2
    ring-offset-slate-900
    focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3b82f6] focus-visible:ring-offset-2
  `,
} as const

// ============================================
// FORM - Формы
// ============================================

export const form = {
  label: 'text-sm font-medium leading-none text-slate-200 peer-disabled:cursor-not-allowed peer-disabled:opacity-70',
  
  description: 'text-xs text-slate-500',
  
  message: 'text-xs font-medium text-red-400',
  
  required: 'text-red-400',
} as const

// ============================================
// LAYOUT - Разметка
// ============================================

export const layout = {
  // Container
  container: 'mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8',
  
  // Page
  page: 'min-h-screen bg-slate-950',
  
  // Section
  section: 'py-6 md:py-8 lg:py-12',
  
  // Grid
  grid: {
    1: 'grid grid-cols-1 gap-4',
    2: 'grid grid-cols-1 sm:grid-cols-2 gap-4',
    3: 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4',
    4: 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4',
  },
  
  // Stack
  stack: {
    1: 'flex flex-col gap-1',
    2: 'flex flex-col gap-2',
    3: 'flex flex-col gap-3',
    4: 'flex flex-col gap-4',
    6: 'flex flex-col gap-6',
    8: 'flex flex-col gap-8',
  },
} as const

// ============================================
// TYPOGRAPHY - Типографика (готовые классы)
// ============================================

export const text = {
  // Headings
  h1: 'text-3xl font-bold tracking-tight text-slate-100 sm:text-4xl',
  h2: 'text-2xl font-semibold tracking-tight text-slate-100',
  h3: 'text-xl font-semibold tracking-tight text-slate-100',
  h4: 'text-lg font-semibold text-slate-100',
  
  // Body
  body: 'text-base text-slate-300',
  bodySm: 'text-sm text-slate-300',
  bodyXs: 'text-xs text-slate-400',
  
  // Specialized
  caption: 'text-xs text-slate-500',
  overline: 'text-xs font-semibold uppercase tracking-wider text-slate-500',
  label: 'text-sm font-medium text-slate-200',
  helper: 'text-xs text-slate-500',
  
  // Colors
  muted: 'text-slate-400',
  accent: 'text-blue-400',
  success: 'text-emerald-400',
  warning: 'text-amber-400',
  error: 'text-red-400',
} as const

// ============================================
// GAMIFICATION - Специфичные для игры
// ============================================

export const gamification = {
  // XP Bar
  xpBar: {
    container: 'h-3 w-full overflow-hidden rounded-full bg-slate-800',
    fill: 'h-full bg-gradient-to-r from-[#3b82f6] via-blue-500 to-cyan-500 transition-all duration-500',
    glow: 'shadow-[0_0_10px_rgba(59,130,246,0.5)]',
  },

  // Level Badge
  levelBadge: `
    inline-flex items-center justify-center
    rounded-full
    bg-gradient-to-br from-[#3b82f6] to-blue-600
    text-white font-bold
    shadow-lg shadow-[#3b82f6]/25
  `,

  // Coin Display
  coin: {
    container: 'inline-flex items-center gap-1.5 text-amber-400',
    icon: 'text-lg',
    value: 'font-semibold tabular-nums',
  },

  // Streak
  streak: {
    container: 'inline-flex items-center gap-1.5 text-orange-400',
    icon: 'text-lg',
    value: 'font-semibold tabular-nums',
    fire: 'animate-pulse',
  },

  // Achievement Card
  achievement: {
    locked: 'opacity-50 grayscale',
    unlocked: 'opacity-100',
    rare: 'border-amber-500/50 bg-amber-500/10',
    epic: 'border-blue-500/50 bg-blue-500/10',
    legendary: 'border-red-500/50 bg-gradient-to-br from-red-500/20 to-orange-500/20',
  },
} as const

// ============================================
// EMPTY STATES - Пустые состояния
// ============================================

export const emptyState = {
  base: 'flex flex-col items-center justify-center text-center py-12 px-4',
  
  icon: 'w-16 h-16 text-slate-600 mb-4',
  
  title: 'text-lg font-semibold text-slate-300 mb-2',
  
  description: 'text-sm text-slate-500 max-w-sm mb-6',
  
  action: '', // Кнопка действия
} as const

// ============================================
// NAVIGATION - Навигация
// ============================================

export const navigation = {
  // Sidebar
  sidebar: {
    container: 'fixed left-0 top-0 z-40 h-screen w-64 bg-slate-900 border-r border-slate-800',
    item: `
      flex items-center gap-3 px-4 py-3
      text-slate-400
      hover:bg-slate-800/50 hover:text-slate-200
      transition-colors
      rounded-lg mx-2
    `,
    itemActive: 'bg-[#3b82f6]/10 text-blue-400 border-r-2 border-[#3b82f6]',
  },

  // Breadcrumbs
  breadcrumb: {
    container: 'flex items-center gap-2 text-sm',
    item: 'text-slate-400 hover:text-slate-200 transition-colors',
    active: 'text-slate-200 font-medium',
    separator: 'text-slate-600',
  },

  // Pagination
  pagination: {
    container: 'flex items-center gap-2',
    item: `
      inline-flex items-center justify-center
      min-w-[2rem] h-8 px-2
      rounded-md
      text-sm
      transition-colors
      hover:bg-slate-800
    `,
    active: 'bg-[#2563eb] text-white hover:bg-[#3b82f6]',
    disabled: 'opacity-50 cursor-not-allowed',
  },
} as const
