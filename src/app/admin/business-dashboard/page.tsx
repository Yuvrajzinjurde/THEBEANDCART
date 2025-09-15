
"use client";

import { useState, useEffect } from "react";
import useBrandStore from "@/stores/brand-store";
import { getDashboardStats, type DashboardStats } from "../dashboard/actions";
import { Loader } from "@/components/ui/loader";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import { format, subDays } from 'date-fns';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, ArrowUp, ArrowDown, Info, Clock } from 'lucide-react';
import { Input } from "@/components/ui/input";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { ChartTooltipContent, ChartContainer } from "@/components/ui/chart";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { IProduct } from "@/models/product.model";


type Period = '7d' | '30d' | 'yesterday' | 'custom';
type ChartView = 'orders' | 'sales';

const EmptyState = () => (
    <div className="flex flex-col items-center justify-center text-center py-16">
        <svg width="100" height="100" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="15" y="20" width="70" height="60" rx="4" fill="#F3F4F6"/>
            <path d="M25 35H75" stroke="#D1D5DB" strokeWidth="3" strokeLinecap="round"/>
            <path d="M25 45H75" stroke="#D1D5DB" strokeWidth="3" strokeLinecap="round"/>
            <path d="M25 55H55" stroke="#D1D5DB" strokeWidth="3" strokeLinecap="round"/>
            <circle cx="68" cy="68" r="14" fill="white"/>
            <path d="M72 64L64 72" stroke="#9CA3AF" strokeWidth="3" strokeLinecap="round"/>
            <path d="M64 64L72 72" stroke="#9CA3AF" strokeWidth="3" strokeLinecap="round"/>
        </svg>
        <p className="mt-4 font-bold text-lg text-foreground">No Data to Show</p>
        <p className="text-sm text-muted-foreground">There is no sufficient data to show the results in the selected timeframe.</p>
    </div>
);

function BusinessDashboardPage() {
  const { selectedBrand } = useBrandStore();
  const [data, setData] = useState<DashboardStats | null>(null);
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

  const chartData = data?.chartData;

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
  
  const hasChartData = chartData && chartData.some(d => d.sales > 0 || d.orders > 0);

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

  const { allProducts, totalRevenue, totalOrders, totalViews, totalClicks, conversionRate, percentageChanges } = data;

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

  const getProductConversion = (product: IProduct) => {
      const clicks = product.clicks || 0;
      if (clicks === 0) return 0;
      // This is a simplified conversion. A real app would track orders per product.
      // For now, we'll simulate it based on a product's rating.
      const simulatedOrders = (product.rating / 5) * clicks * 0.1; // 10% max conversion based on clicks
      return (simulatedOrders / clicks) * 100;
  }
  
  const productRows = allProducts.map((product) => (
      <TableRow key={product._id as string}>
          <TableCell className="font-medium">
              <div className="flex items-center gap-3">
                  <Image src={product.images[0]} alt={product.name} width={40} height={40} className="rounded-md"/>
                  <span>{product.name}</span>
              </div>
          </TableCell>
          <TableCell>{(product.views || 0).toLocaleString()}</TableCell>
          <TableCell>{(product.clicks || 0).toLocaleString()}</TableCell>
          <TableCell>N/A</TableCell>
          <TableCell>{getProductConversion(product).toFixed(1)}%</TableCell>
          <TableCell>N/A</TableCell>
          <TableCell>0</TableCell>
          <TableCell>
              <Button variant="outline" size="sm">View</Button>
          </TableCell>
          <TableCell>
              <Button variant="outline" size="sm">View</Button>
          </TableCell>
      </TableRow>
  ));


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
            {hasChartData ? (
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
            ) : (
                <div className="flex flex-col items-center justify-center h-full text-center bg-background rounded-lg">
                    <div className="p-4 rounded-full bg-muted/80">
                         <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-muted-foreground/50">
                            <path d="M10 34L18 26L24 32L36 20" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M38 10C40.2091 10 42 11.7909 42 14V34C42 36.2091 40.2091 38 38 38H10C7.79086 38 6 36.2091 6 34V14C6 11.7909 7.79086 10 10 10H38Z" stroke="currentColor" strokeWidth="3" strokeLinejoin="round"/>
                            <circle cx="32" cy="32" r="8" fill="hsl(var(--background))" stroke="currentColor" strokeWidth="3" />
                            <path d="M35 29L29 35" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/>
                         </svg>
                    </div>
                    <p className="mt-4 font-bold text-lg text-foreground">No Trend to Show</p>
                    <p className="text-sm text-muted-foreground">There is no sufficient data to show the results in the selected timeframe.</p>
                </div>
            )}
            </div>

            <div className="flex flex-wrap gap-4 items-center justify-start border-t pt-4">
                <StatCard title="Total Views" value={totalViews.toLocaleString()} change={percentageChanges.views} />
                <StatCard title="Total Clicks" value={totalClicks.toLocaleString()} change={percentageChanges.clicks} />
                <StatCard title="Total Orders" value={totalOrders.toLocaleString()} change={percentageChanges.orders}/>
                <StatCard title="Conversion Rate" value={`${conversionRate.toFixed(1)}%`} change={percentageChanges.conversion} info="Conversion rate from clicks to orders"/>
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
                    <TabsTrigger value="all">All ({allProducts.length})</TabsTrigger>
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
                            {productRows.length > 0 ? (
                                <TableBody>
                                    {productRows}
                                </TableBody>
                            ) : (
                                <TableBody>
                                    <TableRow>
                                        <TableCell colSpan={9} className="h-24 text-center">
                                            No products to display.
                                        </TableCell>
                                    </TableRow>
                                </TableBody>
                            )}
                        </Table>
                    </div>
                </TabsContent>
                <TabsContent value="low-orders" className="mt-4">
                    <p className="text-sm text-muted-foreground mb-4">
                        <span className="font-semibold text-foreground">Low Orders:</span> Orders for these products have reduced by 30% or more in the last 7 days as compared to the previous 7 days
                    </p>
                    <EmptyState />
                </TabsContent>
                 <TabsContent value="low-views" className="mt-4">
                    <p className="text-sm text-muted-foreground mb-4">
                        <span className="font-semibold text-foreground">Low Views:</span> Views for these products have reduced by 30% or more in the last 7 days as compared to the previous 7 days
                    </p>
                    <EmptyState />
                </TabsContent>
                 <TabsContent value="low-conversion" className="mt-4">
                    <p className="text-sm text-muted-foreground mb-4">
                        <span className="font-semibold text-foreground">Low Conversion Rate:</span> Conversion rate for these products is below the category average.
                    </p>
                    <EmptyState />
                </TabsContent>
                 <TabsContent value="high-returns" className="mt-4">
                    <p className="text-sm text-muted-foreground mb-4">
                        <span className="font-semibold text-foreground">High Returns:</span> These products have a return rate higher than the category average.
                    </p>
                    <EmptyState />
                </TabsContent>
                 <TabsContent value="low-ratings" className="mt-4">
                    <p className="text-sm text-muted-foreground mb-4">
                        <span className="font-semibold text-foreground">Low Ratings:</span> These products have an average rating of 3 stars or less.
                    </p>
                    <EmptyState />
                </TabsContent>
            </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}

export default BusinessDashboardPage;

    