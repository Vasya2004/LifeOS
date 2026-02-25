// ============================================
// AUTH ERROR MAPPER — Supabase → дружелюбные сообщения
// ============================================

export interface MappedError {
  message: string
  action?: { label: string; href: string }
}

export function mapAuthError(error: unknown): MappedError {
  const msg =
    error instanceof Error
      ? error.message
      : typeof error === "string"
        ? error
        : "Произошла неизвестная ошибка. Попробуйте еще раз."

  const lower = msg.toLowerCase()

  // Email уже существует
  if (
    lower.includes("email_already_exists") ||
    lower.includes("user already registered") ||
    lower.includes("already been registered")
  ) {
    return {
      message: "Этот email уже зарегистрирован.",
      action: { label: "Войти", href: "/auth/login" },
    }
  }

  // Слабый пароль
  if (lower.includes("weak_password") || lower.includes("password should be")) {
    return { message: "Пароль слишком простой. Добавьте цифры и спецсимволы." }
  }

  // Неверные данные для входа
  if (
    lower.includes("invalid_credentials") ||
    lower.includes("invalid login credentials") ||
    lower.includes("invalid email or password")
  ) {
    return { message: "Неверный email или пароль." }
  }

  // Слишком много запросов
  if (
    lower.includes("too_many_requests") ||
    lower.includes("rate limit") ||
    lower.includes("email rate limit exceeded")
  ) {
    return { message: "Слишком много попыток. Попробуйте через 5 минут." }
  }

  // Email не подтверждён
  if (
    lower.includes("email_not_confirmed") ||
    lower.includes("email not confirmed")
  ) {
    return { message: "Подтвердите email перед входом. Проверьте почту." }
  }

  // Некорректный email
  if (lower.includes("invalid email") || lower.includes("invalid_email")) {
    return { message: "Некорректный формат email." }
  }

  // Сетевая ошибка
  if (
    lower.includes("fetch failed") ||
    lower.includes("network") ||
    lower.includes("failed to fetch") ||
    lower.includes("econnrefused")
  ) {
    return { message: "Проверьте подключение к интернету." }
  }

  // Тайм-аут
  if (lower.includes("timeout") || lower.includes("auth_timeout") || lower.includes("profile_timeout")) {
    return { message: "Превышено время ожидания сервера. Проверьте интернет или попробуйте позже." }
  }

  // Fallback — если есть сообщение, показываем его (но на русском, если это системный fallback)
  if (msg === "Произошла неизвестная ошибка. Попробуйте еще раз.") {
    return { message: msg }
  }

  return { message: msg }
}
