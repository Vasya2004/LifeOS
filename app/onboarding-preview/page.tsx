"use client"

import { OnboardingWizard } from "@/components/onboarding/onboarding-wizard"
import { useState } from "react"

export default function OnboardingPreviewPage() {
  const [done, setDone] = useState(false)

  if (done) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-white text-lg font-medium">Онбординг завершён ✓</p>
          <button
            onClick={() => setDone(false)}
            className="px-4 py-2 rounded-xl bg-emerald-600 text-white text-sm hover:bg-emerald-500 transition-colors"
          >
            Посмотреть снова
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black">
      <OnboardingWizard onComplete={() => setDone(true)} />
    </div>
  )
}
