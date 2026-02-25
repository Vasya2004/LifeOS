import { useCallback } from "react"

// Simple beep sounds using Web Audio API
export function useSound() {
  const playSound = useCallback((type: "success" | "error" | "click" | "levelUp") => {
    // Check if user has enabled sound (could be stored in settings)
    const soundEnabled = localStorage.getItem("lifeOS_soundEnabled") !== "false"
    if (!soundEnabled) return

    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
    const oscillator = audioContext.createOscillator()
    const gainNode = audioContext.createGain()

    oscillator.connect(gainNode)
    gainNode.connect(audioContext.destination)

    switch (type) {
      case "success":
        oscillator.frequency.setValueAtTime(523.25, audioContext.currentTime) // C5
        oscillator.frequency.setValueAtTime(659.25, audioContext.currentTime + 0.1) // E5
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime)
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3)
        oscillator.start(audioContext.currentTime)
        oscillator.stop(audioContext.currentTime + 0.3)
        break
      case "error":
        oscillator.frequency.setValueAtTime(200, audioContext.currentTime)
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime)
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2)
        oscillator.start(audioContext.currentTime)
        oscillator.stop(audioContext.currentTime + 0.2)
        break
      case "click":
        oscillator.frequency.setValueAtTime(800, audioContext.currentTime)
        gainNode.gain.setValueAtTime(0.1, audioContext.currentTime)
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.05)
        oscillator.start(audioContext.currentTime)
        oscillator.stop(audioContext.currentTime + 0.05)
        break
      case "levelUp":
        // Ascending arpeggio
        oscillator.frequency.setValueAtTime(523.25, audioContext.currentTime) // C5
        oscillator.frequency.setValueAtTime(659.25, audioContext.currentTime + 0.15) // E5
        oscillator.frequency.setValueAtTime(783.99, audioContext.currentTime + 0.3) // G5
        oscillator.frequency.setValueAtTime(1046.5, audioContext.currentTime + 0.45) // C6
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime)
        gainNode.gain.linearRampToValueAtTime(0, audioContext.currentTime + 0.8)
        oscillator.start(audioContext.currentTime)
        oscillator.stop(audioContext.currentTime + 0.8)
        break
    }
  }, [])

  return { playSound }
}

export function toggleSound(enabled: boolean) {
  localStorage.setItem("lifeOS_soundEnabled", String(enabled))
}

export function isSoundEnabled(): boolean {
  return localStorage.getItem("lifeOS_soundEnabled") !== "false"
}
