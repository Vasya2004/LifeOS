"use client"

import Image from "next/image"
import { AuthLeftPanel } from "@/components/auth/auth-left-panel"
import SignupForm from "@/components/auth/signup-form"

export default function RegisterPage() {
  return (
    <>
      {/* ── MOBILE ──────────────────────────────────────────────────────── */}
      <div
        className="lg:hidden min-h-screen flex items-center justify-center p-5 py-10"
        style={{
          background: [
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
                <h1 className="text-2xl font-bold text-white">Создать аккаунт</h1>
                <p className="text-sm text-white/45 leading-relaxed">
                  Начни путь к лучшей версии себя
                </p>
              </div>

              {/* Form */}
              <SignupForm />
            </div>
          </div>
        </div>
      </div>

      {/* ── DESKTOP ─────────────────────────────────────────────────────── */}
      <div className="hidden lg:flex min-h-screen bg-[#111111]">
        <AuthLeftPanel activeTab="register" />
        <div className="flex w-1/2 flex-col items-center justify-center px-8 py-12">
          <div className="w-full max-w-sm space-y-6">
            <div className="space-y-1">
              <h2 className="text-2xl font-semibold tracking-tight text-white">Создайте аккаунт</h2>
              <p className="text-sm text-white/65">Начните путь к лучшей версии себя</p>
            </div>
            <SignupForm />
          </div>
        </div>
      </div>
    </>
  )
}
