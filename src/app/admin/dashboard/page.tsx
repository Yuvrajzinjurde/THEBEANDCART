
"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { DollarSign, Package, Users, ArrowUpRight, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SalesByCategory } from "@/components/admin/sales-by-category";
import { RevenueStatistics } from "@/components/admin/revenue-statistics";
import useBrandStore from "@/stores/brand-store";
import { getDashboardStats, type DashboardStats } from "./actions";

function AdminDashboardPage() {
  const { user } = useAuth();
  const { selectedBrand } = useBrandStore();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      setError(null);
      try {
        const dashboardStats = await getDashboardStats(selectedBrand);
        setStats(dashboardStats);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch dashboard stats');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [selectedBrand]);

  if (loading) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return <div className="text-center text-destructive"><p>{error}</p></div>;
  }
  
  if (!stats) {
    return <div className="text-center text-muted-foreground"><p>No data available.</p></div>;
  }

  return (
    <div className="flex-1 space-y-8 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">
              Hi, Welcome back {user?.name || 'Admin'}!
          </h2>
          <p className="text-muted-foreground">
              Here's a list of stats for {selectedBrand}.
          </p>
        </div>
      </div>
      
      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        <div className="flex flex-col p-4 rounded-lg">
            <div className="flex flex-row items-center justify-between space-y-0 pb-2">
                <span className="text-sm font-medium text-muted-foreground">Total Inventory Value</span>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
            </div>
            <div>
                <div className="text-2xl font-bold">₹{stats.totalInventoryValue.toLocaleString('en-IN')}</div>
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <span className="text-green-600 flex items-center font-semibold">
                        <ArrowUpRight className="h-3 w-3 mr-1"/> 2.5%
                    </span>
                    vs. last month
                </p>
            </div>
        </div>
        <div className="flex flex-col p-4 rounded-lg">
            <div className="flex flex-row items-center justify-between space-y-0 pb-2">
                <span className="text-sm font-medium text-muted-foreground">Total Products</span>
                <Package className="h-4 w-4 text-muted-foreground" />
            </div>
            <div>
                <div className="text-2xl font-bold">{stats.totalProducts}</div>
                 <p className="text-xs text-muted-foreground flex items-center gap-1">
                    in stock
                </p>
            </div>
        </div>
        <div className="flex flex-col p-4 rounded-lg">
            <div className="flex flex-row items-center justify-between space-y-0 pb-2">
                <span className="text-sm font-medium text-muted-foreground">Total Users</span>
                <Users className="h-4 w-4 text-muted-foreground" />
            </div>
            <div>
                <div className="text-2xl font-bold">{stats.totalUsers}</div>
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <span className="text-green-600 flex items-center font-semibold">
                        <ArrowUpRight className="h-3 w-3 mr-1"/> 18%
                    </span>
                    this month
                </p>
            </div>
        </div>
      </div>

      <div className="space-y-8">
        <Card className="col-span-12">
             <CardHeader>
                <CardTitle>Revenue Statistics</CardTitle>
            </CardHeader>
            <CardContent className="pl-2">
                <RevenueStatistics data={stats.revenueChartData} />
            </CardContent>
        </Card>
         <Card className="col-span-12">
            <CardHeader>
                <CardTitle>Sales by Category</CardTitle>
            </CardHeader>
            <CardContent>
               <SalesByCategory data={stats.salesByCategoryData} />
            </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default AdminDashboardPage;
