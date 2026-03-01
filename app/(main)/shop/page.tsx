"use client"

import { useRewards, useStats } from "@/hooks"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { FadeIn, StaggerContainer, StaggerItem } from "@/components/animations"
import {
    ShoppingBag,
    Coins,
    Zap,
    Snowflake,
    Palette,
    Box,
    CheckCircle2,
    Lock
} from "lucide-react"
import type { Reward } from "@/lib/types"

const iconMap: Record<string, any> = {
    zap: Zap,
    snowflake: Snowflake,
    frame: Box,
    palette: Palette,
}

export default function ShopPage() {
    const { rewards, purchase, isLoading } = useRewards()
    const { data: stats } = useStats()

    return (
        <div className="flex flex-col gap-6 p-4 md:p-6 lg:p-8">
            {/* Header */}
            <FadeIn>
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold flex items-center gap-2">
                            <ShoppingBag className="size-6 text-primary" />
                            Магазин предметов
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            Тратьте монеты на усиления и кастомизацию
                        </p>
                    </div>
                    <div className="flex items-center gap-2 bg-chart-4/10 px-4 py-2 rounded-full border border-chart-4/20">
                        <Coins className="size-5 text-chart-4" />
                        <span className="text-lg font-bold text-chart-4">{stats?.coins || 0}</span>
                    </div>
                </div>
            </FadeIn>

            {/* Categories / Filters (Optional) */}

            {/* Items Grid */}
            <StaggerContainer className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {rewards.map((item: Reward) => {
                    const Icon = iconMap[item.icon] || Box
                    const isPurchased = item.lastPurchasedAt && !item.isRepeatable
                    const canAfford = (stats?.coins || 0) >= item.cost

                    return (
                        <StaggerItem key={item.id}>
                            <Card className={`h-full flex flex-col transition-all duration-300 hover:shadow-xl ${isPurchased ? 'opacity-75 bg-muted/30' : ''}`}>
                                <CardHeader>
                                    <div className="flex justify-between items-start mb-2">
                                        <div className={`p-3 rounded-2xl ${isPurchased ? 'bg-muted' : 'bg-primary/10'}`}>
                                            <Icon className={`size-6 ${isPurchased ? 'text-muted-foreground' : 'text-primary'}`} />
                                        </div>
                                        <Badge variant="secondary" className="uppercase text-[10px]">
                                            {item.category === 'experience' ? 'Развитие' :
                                                item.category === 'privilege' ? 'Привилегия' : 'Предмет'}
                                        </Badge>
                                    </div>
                                    <CardTitle className="text-lg">{item.title}</CardTitle>
                                    <CardDescription className="line-clamp-2">
                                        {item.description}
                                    </CardDescription>
                                </CardHeader>

                                <CardContent className="flex-1">
                                    {/* Additional details could go here */}
                                </CardContent>

                                <CardFooter className="pt-0">
                                    <Button
                                        className="w-full gap-2"
                                        variant={isPurchased ? "secondary" : "default"}
                                        disabled={isPurchased || !canAfford}
                                        onClick={() => purchase(item.id)}
                                    >
                                        {isPurchased ? (
                                            <>
                                                <CheckCircle2 className="size-4" />
                                                Куплено
                                            </>
                                        ) : !canAfford ? (
                                            <>
                                                <Lock className="size-4" />
                                                {item.cost} монет
                                            </>
                                        ) : (
                                            <>
                                                <Coins className="size-4" />
                                                Купить за {item.cost}
                                            </>
                                        )}
                                    </Button>
                                </CardFooter>
                            </Card>
                        </StaggerItem>
                    )
                })}
            </StaggerContainer>

            {isLoading && (
                <div className="flex justify-center py-12">
                    <p className="text-muted-foreground">Загрузка товаров...</p>
                </div>
            )}
        </div>
    )
}
