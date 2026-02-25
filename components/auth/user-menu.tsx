"use client"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { useIdentity, useStats } from "@/hooks/use-data"
import { useAuth } from "@/lib/auth/context"
import { getLevelName } from "@/lib/store"
import { User, LogOut, Settings, Cloud, CloudOff } from "lucide-react"
import { useState, useEffect } from "react"

interface UserMenuProps {
  user: {
    id: string
    email?: string
    user_metadata?: {
      name?: string
    }
  }
}

export function UserMenu({ user }: UserMenuProps) {
  const router = useRouter()
  const { signOut } = useAuth()
  const { data: identity } = useIdentity()
  const { data: stats } = useStats()
  const [isOnline, setIsOnline] = useState(true)

  useEffect(() => {
    setIsOnline(navigator.onLine)
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)
    window.addEventListener("online", handleOnline)
    window.addEventListener("offline", handleOffline)
    return () => {
      window.removeEventListener("online", handleOnline)
      window.removeEventListener("offline", handleOffline)
    }
  }, [])

  const handleSignOut = async () => {
    console.log("[UserMenu] handleSignOut started")
    await signOut()
    console.log("[UserMenu] signOut completed, redirecting...")
    window.location.href = "/auth/login"
  }

  const displayName = identity?.name || user.user_metadata?.name || user.email?.split("@")[0] || "User"
  const initials = displayName.slice(0, 2).toUpperCase()
  const levelName = getLevelName(stats?.level || 1)

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-9 w-9 rounded-full">
          <Avatar className="h-9 w-9">
            <AvatarFallback className="bg-primary text-primary-foreground text-xs">
              {initials}
            </AvatarFallback>
          </Avatar>
          <span className={`absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-background ${isOnline ? "bg-green-500" : "bg-gray-400"}`} />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{displayName}</p>
            <p className="text-xs leading-none text-muted-foreground">
              {user.email}
            </p>
            <p className="text-xs text-primary mt-1">
              {levelName} • Уровень {stats?.level || 1}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => router.push("/settings")}>
          <Settings className="mr-2 h-4 w-4" />
          Настройки
        </DropdownMenuItem>
        <DropdownMenuItem disabled>
          {isOnline ? (
            <>
              <Cloud className="mr-2 h-4 w-4 text-green-500" />
              Синхронизировано
            </>
          ) : (
            <>
              <CloudOff className="mr-2 h-4 w-4 text-gray-400" />
              Оффлайн режим
            </>
          )}
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleSignOut} className="text-destructive focus:text-destructive">
          <LogOut className="mr-2 h-4 w-4" />
          Выйти
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
