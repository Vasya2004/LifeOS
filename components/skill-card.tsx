"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import type { Skill } from "@/lib/types"
import { getSkillTier, SKILL_TIERS } from "@/lib/types"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Trophy, Crown, Sparkles, TrendingDown } from "lucide-react"
import { cn } from "@/lib/utils"

interface SkillCardProps {
  skill: Skill
  compact?: boolean
}

// Fire animation component for Legend tier
function FireAnimation() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-xl">
      {[...Array(5)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute bottom-0 w-2 bg-gradient-to-t from-red-600 via-orange-500 to-yellow-400 rounded-full"
          style={{
            left: `${20 + i * 15}%`,
            height: "40%",
            opacity: 0.6,
          }}
          animate={{
            height: ["30%", "60%", "40%", "70%", "30%"],
            opacity: [0.4, 0.8, 0.5, 0.9, 0.4],
          }}
          transition={{
            duration: 1.5 + i * 0.2,
            repeat: Infinity,
            ease: "easeInOut",
            delay: i * 0.1,
          }}
        />
      ))}
      <motion.div
        className="absolute inset-0 bg-gradient-to-t from-red-500/10 via-transparent to-transparent"
        animate={{ opacity: [0.3, 0.6, 0.3] }}
        transition={{ duration: 2, repeat: Infinity }}
      />
    </div>
  )
}

// Glow effect components
function SoftGlow({ color }: { color: string }) {
  return (
    <div 
      className="absolute inset-0 rounded-xl opacity-30 blur-xl"
      style={{ backgroundColor: color.replace('text-', '').replace('500', '') }}
    />
  )
}

function GlowEffect({ color }: { color: string }) {
  return (
    <motion.div 
      className="absolute -inset-1 rounded-xl opacity-40 blur-md"
      style={{ backgroundColor: color }}
      animate={{ opacity: [0.3, 0.5, 0.3] }}
      transition={{ duration: 2, repeat: Infinity }}
    />
  )
}

function PulseEffect({ color }: { color: string }) {
  return (
    <motion.div 
      className="absolute -inset-2 rounded-xl opacity-30 blur-lg"
      style={{ backgroundColor: color }}
      animate={{ 
        scale: [1, 1.05, 1],
        opacity: [0.3, 0.5, 0.3]
      }}
      transition={{ duration: 1.5, repeat: Infinity }}
    />
  )
}

function GoldGradient() {
  return (
    <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-yellow-400/20 via-orange-500/20 to-yellow-600/20" />
  )
}

export function SkillCard({ skill, compact = false }: SkillCardProps) {
  const tier = getSkillTier(skill.currentLevel)
  const tierConfig = SKILL_TIERS[skill.currentLevel >= 10 ? 10 : skill.currentLevel >= 5 ? 5 : skill.currentLevel as keyof typeof SKILL_TIERS] || SKILL_TIERS[1]
  
  // Calculate progress percentage
  const progressPercent = Math.min(100, (skill.currentXp / skill.xpNeeded) * 100)
  
  // Check for certificates
  const hasExpertCertificate = skill.certificates.some(c => c.levelAchieved === 5)
  const hasLegendCertificate = skill.certificates.some(c => c.levelAchieved >= 10)
  
  // Get color value from tailwind class
  const getColorFromClass = (twClass: string) => {
    const colorMap: Record<string, string> = {
      'text-gray-400': '#9ca3af',
      'text-green-500': '#22c55e',
      'text-[#8b5cf6]': '#8b5cf6',
      'text-purple-500': '#a855f7',
      'text-orange-500': '#f97316',
      'text-red-500': '#ef4444',
    }
    return colorMap[twClass] || '#6b7280'
  }
  
  const tierColor = getColorFromClass(tier.color)

  if (compact) {
    return (
      <Link href={`/skills/${skill.id}`}>
        <Card className={cn(
          "relative overflow-hidden transition-all duration-300 hover:scale-[1.02] cursor-pointer",
          tier.borderColor,
          "border-2"
        )}>
          {/* Tier Effects */}
          {tier.glowEffect === 'soft' && <SoftGlow color={tierColor} />}
          {tier.glowEffect === 'glow' && <GlowEffect color={tierColor} />}
          {tier.glowEffect === 'pulse' && <PulseEffect color={tierColor} />}
          {tier.glowEffect === 'gold' && <GoldGradient />}
          {tier.glowEffect === 'fire' && <FireAnimation />}
          
          <CardContent className="relative p-3">
            <div className="flex items-center gap-3">
              <div 
                className={cn("w-10 h-10 rounded-lg flex items-center justify-center text-lg", tier.bgColor)}
                style={{ color: tierColor }}
              >
                {skill.icon}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate text-sm">{skill.name}</p>
                <p className={cn("text-xs", tier.color)}>{tier.title}</p>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold" style={{ color: tierColor }}>
                  {skill.currentLevel}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </Link>
    )
  }

  return (
    <Link href={`/skills/${skill.id}`}>
      <Card className={cn(
        "relative overflow-hidden transition-all duration-300 hover:scale-[1.02] cursor-pointer group",
        tier.borderColor,
        "border-2"
      )}>
        {/* Tier Effects */}
        {tier.glowEffect === 'soft' && <SoftGlow color={tierColor} />}
        {tier.glowEffect === 'glow' && <GlowEffect color={tierColor} />}
        {tier.glowEffect === 'pulse' && <PulseEffect color={tierColor} />}
        {tier.glowEffect === 'gold' && <GoldGradient />}
        {tier.glowEffect === 'fire' && <FireAnimation />}
        
        <CardContent className="relative p-5">
          {/* Decay Warning */}
          {skill.isDecaying && (
            <div className="absolute top-2 right-2">
              <Badge variant="destructive" className="gap-1">
                <TrendingDown className="w-3 h-3" />
                Декей
              </Badge>
            </div>
          )}
          
          {/* Header */}
          <div className="flex items-start gap-4 mb-4">
            <motion.div 
              className={cn(
                "w-14 h-14 rounded-xl flex items-center justify-center text-2xl shadow-lg",
                tier.bgColor
              )}
              style={{ color: tierColor }}
              whileHover={{ rotate: [0, -10, 10, 0] }}
              transition={{ duration: 0.5 }}
            >
              {skill.icon}
            </motion.div>
            
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-lg truncate">{skill.name}</h3>
              <div className="flex items-center gap-2 flex-wrap">
                <Badge variant="outline" className={cn("text-xs", tier.color, tier.borderColor)}>
                  {tier.title}
                </Badge>
                {hasExpertCertificate && (
                  <Badge className="bg-orange-500/20 text-orange-500 border-orange-500/50 gap-1">
                    <Trophy className="w-3 h-3" />
                    Эксперт
                  </Badge>
                )}
                {hasLegendCertificate && (
                  <Badge className="bg-red-500/20 text-red-500 border-red-500/50 gap-1">
                    <Crown className="w-3 h-3" />
                    Легенда
                  </Badge>
                )}
              </div>
            </div>
            
            {/* Level Badge */}
            <div className={cn(
              "w-12 h-12 rounded-full flex flex-col items-center justify-center border-2",
              tier.borderColor,
              tier.bgColor
            )}>
              <span className="text-xs text-muted-foreground">Lvl</span>
              <span className={cn("text-lg font-bold leading-none", tier.color)}>
                {skill.currentLevel}
              </span>
            </div>
          </div>
          
          {/* Description */}
          {skill.description && (
            <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
              {skill.description}
            </p>
          )}
          
          {/* XP Progress */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">XP прогресс</span>
              <span className={tier.color}>
                {skill.currentXp} / {skill.xpNeeded} XP
              </span>
            </div>
            <div className="relative">
              <Progress 
                value={progressPercent} 
                className="h-2"
              />
              {tier.glowEffect === 'gold' && (
                <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/0 via-yellow-400/50 to-yellow-400/0 animate-shimmer" />
              )}
            </div>
          </div>
          
          {/* Footer Stats */}
          <div className="flex items-center justify-between mt-4 pt-3 border-t border-border/50">
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                {skill.totalXpEarned} всего XP
              </span>
              <span>
                {skill.activities.length} активностей
              </span>
            </div>
            
            {/* Last Activity */}
            <span className="text-xs text-muted-foreground">
              {new Date(skill.lastActivityDate).toLocaleDateString('ru-RU')}
            </span>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}

// Mini skill badge for use in other components
export function SkillBadge({ skill }: { skill: Skill }) {
  const tier = getSkillTier(skill.currentLevel)
  
  return (
    <Badge 
      variant="outline" 
      className={cn("gap-1", tier.color, tier.borderColor)}
    >
      <span>{skill.icon}</span>
      <span>{skill.name}</span>
      <span className="opacity-60">Lvl {skill.currentLevel}</span>
    </Badge>
  )
}
