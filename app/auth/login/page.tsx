"use client"

import Image from "next/image"
import { AuthLeftPanel } from "@/components/auth/auth-left-panel"
import LoginForm from "@/components/auth/login-form"

export default function LoginPage() {
  return (
    <>
      {/* ── MOBILE ──────────────────────────────────────────────────────── */}
      <div
        className="lg:hidden min-h-screen flex items-center justify-center p-5"
        style={{
          background: [
            /* Большое белое свечение справа сверху — как в референсе */
            "radial-gradient(ellipse at 92% 0%, rgba(230,230,240,0.22) 0%, rgba(180,180,200,0.10) 22%, transparent 52%)",
            "#000",
          ].join(", "),
        }}
      >
        <div className="w-full max-w-[360px]">
          {/* Card */}
          <div
            className="rounded-[28px] overflow-hidden"
            style={{ backgroundColor: "#0e0e0e" }}
          >
            {/* Inner edge glow overlay */}
            <div
              className="absolute inset-0 rounded-[28px] pointer-events-none"
              style={{
                background: [
                  "radial-gradient(ellipse at 50% 0%,   rgba(255,255,255,0.18) 0%, transparent 48%)",
                  "radial-gradient(ellipse at 0%   50%,  rgba(255,255,255,0.10) 0%, transparent 38%)",
                  "radial-gradient(ellipse at 100% 50%,  rgba(255,255,255,0.10) 0%, transparent 38%)",
                  "radial-gradient(ellipse at 50% 100%, rgba(255,255,255,0.08) 0%, transparent 38%)",
                ].join(", "),
              }}
            />

            {/* Content */}
            <div className="relative px-6 pt-8 pb-7 space-y-6">
              {/* Logo */}
              <div className="flex justify-center">
                <Image
                  src="/logo-light.svg"
                  alt="LifeOS"
                  width={36}
                  height={52}
                  className="opacity-90"
                />
              </div>

              {/* Heading */}
              <div className="text-center space-y-1.5">
                <h1 className="text-2xl font-bold text-white">Войти</h1>
                <p className="text-sm text-white/45 leading-relaxed">
                  Введите данные для входа в аккаунт
                </p>
              </div>

              {/* Form */}
              <LoginForm />
            </div>
          </div>
        </div>
      </div>

      {/* ── DESKTOP ─────────────────────────────────────────────────────── */}
      <div className="hidden lg:flex min-h-screen bg-[#111111]">
        <AuthLeftPanel activeTab="login" />
        <div className="flex w-1/2 flex-col items-center justify-center px-8 py-12">
          <div className="w-full max-w-sm space-y-6">
            <div className="space-y-1">
              <h2 className="text-2xl font-semibold tracking-tight text-white">С возвращением</h2>
              <p className="text-sm text-white/65">Войдите, чтобы продолжить прокачку</p>
            </div>
            <LoginForm />
          </div>
        </div>
      </div>
    </>
  )
}
