"use client"

import { useState } from "react"
import Link from "next/link"
import { useAuth } from "@/lib/auth"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ArrowLeft, CheckCircle2, Loader2 } from "lucide-react"

const inputBase =
  "h-12 rounded-2xl bg-white/[0.20] border border-white/[0.12] text-white placeholder:text-white/35 focus-visible:ring-1 focus-visible:ring-white/30 focus-visible:ring-offset-0 transition-colors"

export default function ResetPasswordPage() {
  const { resetPassword } = useAuth()
  const [email, setEmail] = useState("")
  const [isPending, setIsPending] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim()) return

    setIsPending(true)
    setError(null)

    const { error } = await resetPassword(email.trim())

    if (error) {
      setError("Не удалось отправить письмо. Проверьте email и попробуйте снова.")
    } else {
      setSuccess(true)
    }

    setIsPending(false)
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center p-5 bg-black">
        <div className="w-full max-w-[360px] rounded-[28px] bg-[#0e0e0e] px-6 pt-8 pb-7 space-y-6 text-center">
          <CheckCircle2 className="size-12 text-green-400 mx-auto" />
          <div className="space-y-1">
            <h2 className="text-xl font-semibold text-white">Проверьте почту</h2>
            <p className="text-sm text-white/60">
              Мы отправили ссылку для сброса пароля на{" "}
              <span className="text-white/80 font-medium">{email}</span>
            </p>
          </div>
          <Link href="/auth/login">
            <Button className="w-full h-12 rounded-2xl bg-white text-zinc-900 font-semibold hover:bg-white/90">
              Вернуться к входу
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-5 bg-black">
      <div className="w-full max-w-[360px] rounded-[28px] bg-[#0e0e0e] px-6 pt-8 pb-7 space-y-6">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold text-white">Забыли пароль?</h1>
          <p className="text-sm text-white/45">
            Введите email — мы отправим ссылку для сброса
          </p>
        </div>

        {error && (
          <Alert variant="destructive" className="border-red-500/50 bg-red-500/10">
            <AlertDescription className="text-red-400">{error}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="email" className="text-white/80">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              autoComplete="email"
              disabled={isPending}
              className={inputBase}
            />
          </div>

          <Button
            type="submit"
            disabled={isPending || !email.trim()}
            className="h-12 w-full rounded-2xl bg-white text-zinc-900 font-semibold hover:bg-white/90 transition-all disabled:opacity-60"
          >
            {isPending ? (
              <><Loader2 className="mr-2 size-4 animate-spin" />Отправка...</>
            ) : (
              "Отправить ссылку"
            )}
          </Button>
        </form>

        <Link
          href="/auth/login"
          className="flex items-center gap-2 text-sm text-white/50 hover:text-white/80 transition-colors"
        >
          <ArrowLeft className="size-4" />
          Вернуться к входу
        </Link>
      </div>
    </div>
  )
}
