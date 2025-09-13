
"use client"

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts"

const data = [
  { name: "Cookware & bakeware", value: 80 },
  { name: "Plates", value: 60 },
  { name: "Frying pans", value: 65 },
  { name: "Rice cookers", value: 50 },
  { name: "Dinnerware", value: 40 },
]

export function SalesByCategory() {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data} layout="vertical" margin={{ left: 20, right: 30 }}>
        <XAxis type="number" hide />
        <YAxis 
          dataKey="name" 
          type="category" 
          axisLine={false} 
          tickLine={false} 
          width={120} 
          tick={{ fontSize: 12 }}
        />
        <Tooltip cursor={{ fill: 'transparent' }} />
        <Bar dataKey="value" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} barSize={15}>
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}
