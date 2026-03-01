"use client"

import * as React from "react"
import { Check, Sparkles, Moon } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export function ThemeSwitcher() {
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <Button variant="ghost" size="icon" className="h-9 w-9">
        <Moon className="h-4 w-4 text-muted-foreground" />
      </Button>
    )
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-9 w-9 relative"
        >
          <Sparkles className="h-4 w-4 text-primary" />
          <span className="absolute -bottom-0.5 -right-0.5 h-2 w-2 rounded-full bg-primary animate-pulse" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        <DropdownMenuLabel>Тема оформления</DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        <div className="p-3 space-y-3">
          {/* Current Theme */}
          <div className="flex items-center gap-3 p-2 rounded-lg bg-primary/10 border border-primary/20">
            <div 
              className="w-10 h-10 rounded-lg flex items-center justify-center"
              style={{ 
                background: 'linear-gradient(135deg, #7B61FF20, #8B5CF640)',
              }}
            >
              <Moon className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1">
              <p className="font-medium text-foreground">Cosmic Blue</p>
              <p className="text-xs text-muted-foreground">Космическая фиолетовая</p>
            </div>
            <Check className="h-4 w-4 text-primary" />
          </div>
          
          {/* Colors */}
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground uppercase tracking-wider">Цвета</p>
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <div 
                  className="h-8 rounded-md"
                  style={{ 
                    backgroundColor: '#7B61FF',
                    boxShadow: '0 0 10px rgba(123,97,255,0.4)',
                  }}
                />
                <p className="text-[10px] text-muted-foreground text-center">Primary</p>
              </div>
              <div className="space-y-1">
                <div 
                  className="h-8 rounded-md"
                  style={{ 
                    backgroundColor: '#27272a',
                    border: '1px solid rgba(255,255,255,0.1)',
                  }}
                />
                <p className="text-[10px] text-muted-foreground text-center">Card</p>
              </div>
            </div>
          </div>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
