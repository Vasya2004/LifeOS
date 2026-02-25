"use client"

import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Legend,
    Cell
} from 'recharts'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"

interface ActivityData {
    date: string
    tasks: number
    habits: number
}

interface ActivityChartProps {
    data: ActivityData[]
}

export function ActivityChart({ data }: ActivityChartProps) {
    return (
        <Card className="col-span-full lg:col-span-2">
            <CardHeader>
                <CardTitle className="text-lg">Активность за неделю</CardTitle>
                <CardDescription>Завершенные задачи и привычки</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="h-[300px] w-full pt-4">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                            data={data}
                            margin={{ top: 5, right: 30, left: 0, bottom: 5 }}
                        >
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.1)" />
                            <XAxis
                                dataKey="date"
                                axisLine={false}
                                tickLine={false}
                                tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                            />
                            <YAxis
                                axisLine={false}
                                tickLine={false}
                                tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                            />
                            <Tooltip
                                cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                                contentStyle={{
                                    backgroundColor: 'hsl(var(--background))',
                                    borderColor: 'hsl(var(--border))',
                                    borderRadius: '8px',
                                    fontSize: '12px'
                                }}
                            />
                            <Legend
                                verticalAlign="top"
                                align="right"
                                iconType="circle"
                                wrapperStyle={{ paddingBottom: '20px', fontSize: '12px' }}
                            />
                            <Bar
                                name="Задачи"
                                dataKey="tasks"
                                fill="hsl(var(--primary))"
                                radius={[4, 4, 0, 0]}
                                barSize={32}
                            />
                            <Bar
                                name="Привычки"
                                dataKey="habits"
                                fill="hsl(var(--chart-2))"
                                radius={[4, 4, 0, 0]}
                                barSize={32}
                            />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    )
}
