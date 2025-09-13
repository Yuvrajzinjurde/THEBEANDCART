
"use client"

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, LabelList } from "recharts"

type SalesByCategoryProps = {
  data: { name: string; value: number }[];
};

export function SalesByCategory({ data }: SalesByCategoryProps) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data} layout="vertical" margin={{ left: 20, right: 40 }}>
        <XAxis type="number" hide />
        <YAxis 
          dataKey="name" 
          type="category" 
          axisLine={false} 
          tickLine={false} 
          width={120} 
          tick={{ fontSize: 12 }}
        />
        <Tooltip 
            cursor={{ fill: 'hsl(var(--muted))' }} 
            formatter={(value) => `${value} products`}
        />
        <Bar dataKey="value" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} barSize={15}>
           <LabelList dataKey="value" position="right" offset={10} className="fill-foreground text-xs" />
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}
