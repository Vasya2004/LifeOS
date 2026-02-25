// ============================================
// SEARCH TRIGGER - Button to open global search
// ============================================

"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { GlobalSearch } from "./global-search"
import { Search } from "lucide-react"

export function SearchTrigger() {
  const [open, setOpen] = useState(false)

  // Keyboard shortcut: Cmd/Ctrl + K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setOpen(true)
      }
    }
    
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  return (
    <>
      <Button
        variant="outline"
        className="w-full justify-start text-muted-foreground"
        onClick={() => setOpen(true)}
      >
        <Search className="mr-2 size-4" />
        Поиск...
        <kbd className="ml-auto px-1.5 py-0.5 text-xs bg-muted rounded border">
          ⌘K
        </kbd>
      </Button>
      
      <GlobalSearch open={open} onOpenChange={setOpen} />
    </>
  )
}
