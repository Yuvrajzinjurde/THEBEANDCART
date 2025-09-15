
"use client";

import { useState, useEffect } from "react";
import useBrandStore from "@/stores/brand-store";
import { getBusinessDashboardData, type BusinessDashboardData } from "./actions";
import { Loader } from "@/components/ui/loader";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { AlertTriangle, TrendingUp, Package, IndianRupee } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import Image from "next/image";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LabelList } from 'recharts';

function BusinessDashboardPage() {
  const { selectedBrand } = useBrandStore();
  const [data, setData] = useState<BusinessDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const dashboardData = await getBusinessDashboardData(selectedBrand);
        setData(dashboardData);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [selectedBrand]);

  if (loading) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <Loader className="h-8 w-8" />
      </div>
    );
  }

  if (error) {
    return <div className="text-center text-destructive"><p>{error}</p></div>;
  }

  if (!data) {
    return <div className="text-center text-muted-foreground"><p>No data available.</p></div>;
  }

  const { topByRevenue, topByUnitsSold, lowStockProducts } = data;

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="p-2 text-xs bg-background/80 backdrop-blur-sm rounded-md border">
          <p className="font-bold">{label}</p>
          <p className="text-muted-foreground">{payload[0].name === 'totalRevenue' ? `Revenue: ₹${payload[0].value.toLocaleString()}` : `Units Sold: ${payload[0].value}`}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="flex-1 space-y-6">
      <div>
        <h2 className="text-2xl md:text-3xl font-bold tracking-tight">Business Dashboard</h2>
        <p className="text-muted-foreground text-sm md:text-base">
          Performance overview for {selectedBrand}.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><TrendingUp className="text-green-500" />Top 5 by Revenue</CardTitle>
            <CardDescription>Top selling products by total revenue generated.</CardDescription>
          </CardHeader>
          <CardContent>
             <ResponsiveContainer width="100%" height={300}>
              <BarChart data={topByRevenue} layout="vertical" margin={{ left: 100, right: 50 }}>
                <YAxis dataKey="name" type="category" width={100} tickLine={false} axisLine={false} tick={{ fontSize: 12 }} />
                <XAxis type="number" hide />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'hsl(var(--muted))' }} />
                <Bar dataKey="totalRevenue" name="totalRevenue" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]}>
                    <LabelList 
                        dataKey="totalRevenue" 
                        position="right" 
                        offset={10} 
                        className="fill-foreground text-xs" 
                        formatter={(value: number) => `₹${value.toLocaleString()}`}
                    />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Package className="text-blue-500" />Top 5 by Units Sold</CardTitle>
            <CardDescription>Top selling products by number of units sold.</CardDescription>
          </CardHeader>
          <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={topByUnitsSold} layout="vertical" margin={{ left: 100, right: 50 }}>
                    <YAxis dataKey="name" type="category" width={100} tickLine={false} axisLine={false} tick={{ fontSize: 12 }} />
                    <XAxis type="number" hide />
                    <Tooltip content={<CustomTooltip />} cursor={{ fill: 'hsl(var(--muted))' }} />
                    <Bar dataKey="unitsSold" name="unitsSold" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]}>
                        <LabelList dataKey="unitsSold" position="right" offset={10} className="fill-foreground text-xs" />
                    </Bar>
                </BarChart>
             </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><AlertTriangle className="text-orange-500" />Low Stock Products</CardTitle>
          <CardDescription>Products with stock level below 10 units.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[80px]">Image</TableHead>
                <TableHead>Product Name</TableHead>
                <TableHead className="text-right">Stock Left</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {lowStockProducts.length > 0 ? (
                lowStockProducts.map(product => (
                  <TableRow key={product._id}>
                    <TableCell>
                      <Image
                        src={product.imageUrl}
                        alt={product.name}
                        width={40}
                        height={40}
                        className="rounded-md object-cover"
                      />
                    </TableCell>
                    <TableCell className="font-medium">{product.name}</TableCell>
                    <TableCell className="text-right font-bold text-destructive">{product.stock}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={3} className="h-24 text-center">
                    All products have sufficient stock.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

export default BusinessDashboardPage;
