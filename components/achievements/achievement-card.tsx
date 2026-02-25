"use client"

import { useState } from "react"
import { format } from "date-fns"
import { ru } from "date-fns/locale"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Heart,
  MoreVertical,
  Lock,
  Unlock,
  Edit,
  Trash2,
  Zap,
  Trophy,
  Star,
  Sparkles,
  ImageIcon,
  Link2,
} from "lucide-react"
import type { Achievement } from "@/lib/types/achievements"
import {
  getAchievementTypeLabel,
  getAchievementTypeColor,
  getCategoryLabel,
  getEmotionEmoji,
  ACHIEVEMENT_CATEGORY_CONFIG,
  EMOTION_TAG_CONFIG,
} from "@/lib/types/achievements"
import { cn } from "@/lib/utils"

interface AchievementCardProps {
  achievement: Achievement
  onEdit?: (achievement: Achievement) => void
  onDelete?: (id: string) => void
  onToggleFavorite?: (id: string) => void
  compact?: boolean
}

const typeIcons = {
  micro: Zap,
  macro: Trophy,
  breakthrough: Star,
  moment: Sparkles,
}

export function AchievementCard({
  achievement,
  onEdit,
  onDelete,
  onToggleFavorite,
  compact = false,
}: AchievementCardProps) {
  const [isHovered, setIsHovered] = useState(false)
  const [imageError, setImageError] = useState(false)

  const TypeIcon = typeIcons[achievement.type]
  const typeColor = getAchievementTypeColor(achievement.type)
  const isUnlocked = !achievement.isTimeCapsule || 
    (achievement.unlockDate && new Date(achievement.unlockDate) <= new Date())

  if (compact) {
    return (
      <Card 
        className={cn(
          "group relative overflow-hidden transition-all duration-300",
          "hover:shadow-lg hover:shadow-primary/5",
          achievement.isFavorite && "border-primary/50"
        )}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div 
              className="flex size-10 shrink-0 items-center justify-center rounded-lg"
              style={{ backgroundColor: `${typeColor}20`, color: typeColor }}
            >
              <TypeIcon className="size-5" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-start justify-between gap-2">
                <h3 className="font-medium leading-tight line-clamp-2">
                  {achievement.title}
                </h3>
                {achievement.isFavorite && (
                  <Heart className="size-4 shrink-0 fill-primary text-primary" />
                )}
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                {format(new Date(achievement.achievementDate), "d MMM yyyy", { locale: ru })}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card 
      className={cn(
        "group relative overflow-hidden transition-all duration-300",
        "hover:shadow-lg hover:shadow-primary/5",
        achievement.isFavorite && "border-primary/50"
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Cover Image */}
      {achievement.mediaUrls.length > 0 && !imageError && isUnlocked && (
        <div className="relative aspect-video overflow-hidden">
          <img
            src={achievement.mediaUrls[achievement.coverImageIndex]}
            alt={achievement.title}
            className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
            onError={() => setImageError(true)}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
        </div>
      )}

      {/* Time Capsule Overlay */}
      {achievement.isTimeCapsule && !isUnlocked && (
        <div className="relative aspect-video flex flex-col items-center justify-center bg-muted">
          <Lock className="size-12 text-muted-foreground/50" />
          <p className="mt-2 text-sm text-muted-foreground">
            Откроется {achievement.unlockDate && format(new Date(achievement.unlockDate), "PPP", { locale: ru })}
          </p>
        </div>
      )}

      <CardContent className={cn("p-4", achievement.mediaUrls.length > 0 && "pt-0 -mt-8 relative")}>
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <div 
              className="flex size-12 shrink-0 items-center justify-center rounded-xl"
              style={{ backgroundColor: `${typeColor}20`, color: typeColor }}
            >
              <TypeIcon className="size-6" />
            </div>
            <div className="min-w-0">
              <Badge 
                variant="secondary" 
                className="text-xs"
                style={{ 
                  backgroundColor: `${typeColor}15`, 
                  color: typeColor,
                  borderColor: `${typeColor}30` 
                }}
              >
                {getAchievementTypeLabel(achievement.type)}
              </Badge>
              <h3 className="mt-1 font-semibold leading-tight">{achievement.title}</h3>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="size-8"
              onClick={() => onToggleFavorite?.(achievement.id)}
            >
              <Heart 
                className={cn(
                  "size-4",
                  achievement.isFavorite && "fill-primary text-primary"
                )} 
              />
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="size-8">
                  <MoreVertical className="size-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onEdit?.(achievement)}>
                  <Edit className="mr-2 size-4" />
                  Редактировать
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => onDelete?.(achievement.id)}
                  className="text-destructive"
                >
                  <Trash2 className="mr-2 size-4" />
                  Удалить
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Description */}
        {achievement.description && (
          <p className="mt-3 text-sm text-muted-foreground line-clamp-2">
            {achievement.description}
          </p>
        )}

        {/* Meta */}
        <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            {format(new Date(achievement.achievementDate), "d MMM yyyy", { locale: ru })}
          </span>
          
          {achievement.category && (
            <>
              <span>•</span>
              <span className="flex items-center gap-1">
                {getCategoryLabel(achievement.category)}
              </span>
            </>
          )}
          
          {achievement.emotionTag && (
            <>
              <span>•</span>
              <span className="flex items-center gap-1">
                {getEmotionEmoji(achievement.emotionTag)}
              </span>
            </>
          )}
          
          {achievement.mediaUrls.length > 0 && (
            <>
              <span>•</span>
              <span className="flex items-center gap-1">
                <ImageIcon className="size-3" />
                {achievement.mediaUrls.length}
              </span>
            </>
          )}
          
          {achievement.links && achievement.links.length > 0 && (
            <>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Link2 className="size-3" />
                {achievement.links.length}
              </span>
            </>
          )}
        </div>

        {/* Lesson Learned */}
        {achievement.lessonLearned && (
          <div className="mt-3 rounded-lg bg-muted/50 p-3">
            <p className="text-xs text-muted-foreground italic">
              "{achievement.lessonLearned}"
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
