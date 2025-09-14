
"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Package, Users, ArrowUpRight, ArrowDownRight, Minus, IndianRupee } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SalesByCategory } from "@/components/admin/sales-by-category";
import { RevenueStatistics } from "@/components/admin/revenue-statistics";
import useBrandStore from "@/stores/brand-store";
import { getDashboardStats, type DashboardStats } from "./actions";
import { Loader } from "@/components/ui/loader";
import { cn } from "@/lib/utils";


const StatChange = ({ value }: { value: number }) => {
    const isPositive = value > 0;
    const isNegative = value < 0;

    if (value === 0 || !isFinite(value)) {
        return (
             <span className="text-muted-foreground flex items-center font-semibold">
                <Minus className="h-3 w-3 mr-1"/> --
              </span>
        );
    }
    
    return (
        <span className={cn(
            "flex items-center font-semibold",
            isPositive ? "text-green-600" : "text-red-600"
        )}>
            {isPositive && <ArrowUpRight className="h-3 w-3 mr-1"/>}
            {isNegative && <ArrowDownRight className="h-3 w-3 mr-1"/>}
            {Math.abs(value).toFixed(1)}%
        </span>
    );
};


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
        <Loader className="h-8 w-8" />
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
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <IndianRupee className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{stats.totalRevenue.toLocaleString('en-IN')}</div>
            <p className="text-xs text-muted-foreground flex items-center">
                <StatChange value={stats.percentageChanges.revenue} />
                &nbsp;vs. last month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Loss</CardTitle>
            <IndianRupee className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{stats.totalLoss.toLocaleString('en-IN')}</div>
            <p className="text-xs text-muted-foreground flex items-center">
                <StatChange value={stats.percentageChanges.loss} />
                &nbsp;vs. last month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Inventory Value</CardTitle>
            <IndianRupee className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{stats.totalInventoryValue.toLocaleString('en-IN')}</div>
            <p className="text-xs text-muted-foreground flex items-center flex-wrap">
                <StatChange value={stats.percentageChanges.inventory} />
                <span className="ml-1">vs. last month</span>
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Products</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalProducts}</div>
            <p className="text-xs text-muted-foreground">in stock for this brand</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUsers}</div>
            <p className="text-xs text-muted-foreground flex items-center">
                <StatChange value={stats.percentageChanges.users} />
                &nbsp;this month
            </p>
          </CardContent>
        </Card>
      </div>

    </div>
  );
}

export default AdminDashboardPage;
