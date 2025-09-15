
"use client";

import { useState, useEffect } from "react";
import useBrandStore from "@/stores/brand-store";
import { getDashboardStats, type DashboardStats as BusinessDashboardData } from "../dashboard/actions";
import { Loader } from "@/components/ui/loader";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { format, subDays } from 'date-fns';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, ArrowUp, ArrowDown, Info, Clock } from 'lucide-react';
import { Input } from "@/components/ui/input";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { ChartTooltipContent, ChartContainer } from "@/components/ui/chart";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";


type Period = '7d' | '30d' | 'yesterday' | 'custom';
type ChartView = 'orders' | 'sales';

function BusinessDashboardPage() {
  const { selectedBrand } = useBrandStore();
  const [data, setData] = useState<BusinessDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [period, setPeriod] = useState<Period>('7d');
  const [chartView, setChartView] = useState<ChartView>('orders');
  
  const now = new Date();
  const dateRanges = {
      '7d': { from: subDays(now, 6), to: now },
      '30d': { from: subDays(now, 29), to: now },
      'yesterday': { from: subDays(now, 1), to: subDays(now, 1) },
      'custom': { from: now, to: now }
  };
  const currentRange = dateRanges[period];
  
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const dashboardData = await getDashboardStats(selectedBrand);
        setData(dashboardData);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [selectedBrand]);

  const chartData = data?.revenueChartData.map(d => ({
      date: d.month,
      orders: Math.floor(d.revenue / 5000) + Math.floor(Math.random() * 5),
      sales: d.revenue,
  })).slice(-7); // Mocking orders from revenue for now

  const chartConfig = {
    sales: {
      label: 'Sales',
      color: 'hsl(var(--primary))',
    },
    orders: {
      label: 'Orders',
      color: 'hsl(var(--primary))',
    },
  };

  if (loading) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <Loader className="h-8 w-8" />
      </div>
    );
  }

  if (error || !data) {
    return (
        <div className="text-center text-destructive">
            <p>{error || 'No data available.'}</p>
        </div>
    );
  }

  const { totalProducts, totalUsers, totalRevenue, percentageChanges } = data;
  // NOTE: Clicks and Conversion Rate are currently placeholders as we don't track this data yet.
  const totalClicks = Math.floor(totalProducts * 1.5); 
  const conversionRate = totalUsers > 0 ? (totalUsers / totalClicks) * 100 : 0;

  const StatCard = ({ title, value, change, info }: { title: string, value: string, change?: number, info?: string }) => (
    <div className="p-4 bg-background rounded-lg flex-1 min-w-[150px]">
        <div className="flex items-center gap-1 text-sm text-muted-foreground">
            {title}
            {info && <Info className="h-3 w-3" />}
        </div>
        <div className="flex items-baseline gap-2 mt-1">
            <p className="text-2xl font-semibold text-foreground">{value}</p>
             {change !== undefined && (
                <div className={cn("flex items-center text-sm font-semibold", change >= 0 ? "text-green-500" : "text-red-500")}>
                    {change >= 0 ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />}
                    {Math.abs(change).toFixed(1)}%
                </div>
            )}
        </div>
    </div>
  );


  return (
    <div className="flex-1 space-y-6">
      <h1 className="text-2xl font-bold">Business Dashboard</h1>
      
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2">
            <div>
              <CardTitle>Business Overview</CardTitle>
              <CardDescription>
                {format(currentRange.from, 'do MMM yy')} - {format(currentRange.to, 'do MMM yy')}
              </CardDescription>
            </div>
            <div className="flex items-center gap-1 p-1 bg-muted rounded-md">
                <Button variant={period === 'yesterday' ? 'default' : 'ghost'} size="sm" onClick={() => setPeriod('yesterday')}>Yesterday</Button>
                <Button variant={period === '7d' ? 'default' : 'ghost'} size="sm" onClick={() => setPeriod('7d')}>Last 7 Days</Button>
                <Button variant={period === '30d' ? 'default' : 'ghost'} size="sm" onClick={() => setPeriod('30d')}>Last 30 Days</Button>
                <Button variant={period === 'custom' ? 'default' : 'ghost'} size="sm" onClick={() => setPeriod('custom')}>Custom Date</Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
            <div className="flex items-center gap-1 p-1 bg-muted rounded-md w-max">
                <Button variant={chartView === 'orders' ? 'default' : 'ghost'} size="sm" onClick={() => setChartView('orders')}>Orders</Button>
                <Button variant={chartView === 'sales' ? 'default' : 'ghost'} size="sm" onClick={() => setChartView('sales')}>Sales</Button>
            </div>

            <div className="h-[300px] w-full">
               <ChartContainer config={chartConfig} className="h-full w-full">
                    <AreaChart data={chartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="date" tick={{ fontSize: 12 }} tickLine={false} axisLine={false}/>
                        <YAxis tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
                        <Tooltip
                            cursor={false}
                            content={<ChartTooltipContent indicator="line" />}
                        />
                        <Area 
                            type="monotone" 
                            dataKey={chartView} 
                            stroke={`var(--color-${chartView})`}
                            fill={`var(--color-${chartView})`}
                            fillOpacity={0.1}
                            strokeWidth={2}
                        />
                    </AreaChart>
                </ChartContainer>
            </div>

            <div className="flex flex-wrap gap-4 items-center justify-start border-t pt-4">
                <StatCard title="Total Views" value={totalProducts.toLocaleString()} change={percentageChanges.inventory} />
                <StatCard title="Total Clicks" value={totalClicks.toLocaleString()} change={-43.3} />
                <StatCard title="Total Orders" value={totalUsers.toLocaleString()} change={percentageChanges.users}/>
                <StatCard title="Conversion Rate" value={`${conversionRate.toFixed(1)}%`} change={5.1} info="Conversion rate from clicks to orders"/>
                <StatCard title="Total Sales" value={`₹${totalRevenue.toLocaleString()}`} change={percentageChanges.revenue} />
                <StatCard title="Return Percentage" value="0%" />
            </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
            <div className="flex flex-col sm:flex-row justify-between sm:items-start gap-4">
                <div>
                    <CardTitle>Product Performance</CardTitle>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                        <span>{format(currentRange.from, 'do MMM yy')} - {format(currentRange.to, 'do MMM yy')}</span>
                        <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            <span>Last updated {format(now, 'do MMM | HH:mm')}</span>
                        </div>
                    </div>
                </div>
                 <div className="relative w-full sm:max-w-xs">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input placeholder="Search by Product ID or Style ID" className="pl-10" />
                </div>
            </div>
        </CardHeader>
        <CardContent>
            <Tabs defaultValue="all">
                <TabsList>
                    <TabsTrigger value="all">All ({totalProducts})</TabsTrigger>
                    <TabsTrigger value="low-orders">Low Orders (0)</TabsTrigger>
                    <TabsTrigger value="low-views">Low Views (0)</TabsTrigger>
                    <TabsTrigger value="low-conversion">Low Conversion Rate (0)</TabsTrigger>
                    <TabsTrigger value="high-returns">High Returns (0)</TabsTrigger>
                    <TabsTrigger value="low-ratings">Low Ratings (0)</TabsTrigger>
                </TabsList>
                 <TabsContent value="all" className="mt-4">
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-[300px]">Product Details</TableHead>
                                    <TableHead>Views</TableHead>
                                    <TableHead>Clicks</TableHead>
                                    <TableHead>Orders</TableHead>
                                    <TableHead>Conversions</TableHead>
                                    <TableHead>Sales</TableHead>
                                    <TableHead>Returns</TableHead>
                                    <TableHead>Insights</TableHead>
                                    <TableHead>Recommendations</TableHead>
                                </TableRow>
                            </TableHeader>
                             <TableBody>
                                 {Array.from({ length: 5 }).map((_, index) => (
                                     <TableRow key={index}>
                                         <TableCell className="font-medium">
                                             <div className="flex items-center gap-3">
                                                 <Image src={`https://picsum.photos/seed/product${index}/40/40`} alt="Product" width={40} height={40} className="rounded-md"/>
                                                 <span>Product Name {index + 1}</span>
                                             </div>
                                         </TableCell>
                                         <TableCell>1,234</TableCell>
                                         <TableCell>567</TableCell>
                                         <TableCell>89</TableCell>
                                         <TableCell>7.2%</TableCell>
                                         <TableCell>₹12,345</TableCell>
                                         <TableCell>2</TableCell>
                                         <TableCell>
                                             <Button variant="outline" size="sm">View</Button>
                                         </TableCell>
                                          <TableCell>
                                             <Button variant="outline" size="sm">View</Button>
                                         </TableCell>
                                     </TableRow>
                                 ))}
                            </TableBody>
                        </Table>
                    </div>
                </TabsContent>
            </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}

export default BusinessDashboardPage;

    