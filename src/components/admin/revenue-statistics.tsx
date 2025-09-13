
"use client"

import { Area, AreaChart, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts"

import {
  ChartContainer,
  ChartTooltipContent,
} from "@/components/ui/chart"

const chartConfig = {
  revenue: {
    label: "Revenue",
    color: "hsl(var(--primary))",
  },
}

type RevenueStatisticsProps = {
  data: { month: string; revenue: number }[];
};

export function RevenueStatistics({ data }: RevenueStatisticsProps) {
  return (
      <ChartContainer config={chartConfig} className="h-[300px] w-full">
        <AreaChart
          accessibilityLayer
          data={data}
          margin={{
            left: -20,
            right: 12,
            top: 12,
            bottom: 12,
          }}
        >
          <CartesianGrid vertical={false} />
           <YAxis
            tickLine={false}
            axisLine={false}
            tickMargin={8}
            tickCount={5}
            tickFormatter={(value) => `₹${Number(value) / 1000}k`}
          />
          <XAxis
            dataKey="month"
            tickLine={false}
            axisLine={false}
            tickMargin={8}
            tickFormatter={(value) => value.slice(0, 3)}
          />
          <Tooltip 
            cursor={false} 
            content={<ChartTooltipContent 
                formatter={(value) => `₹${Number(value).toLocaleString('en-IN')}`}
                hideLabel 
            />} 
          />
          <Area
            dataKey="revenue"
            type="natural"
            fill="var(--color-revenue)"
            fillOpacity={0.4}
            stroke="var(--color-revenue)"
            stackId="a"
          />
        </AreaChart>
      </ChartContainer>
  )
}
