
"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Package, Users, IndianRupee, ArrowUp, ArrowDown, Info, ShoppingCart } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import useBrandStore from "@/stores/brand-store";
import { getDashboardStats, type DashboardStats } from "./actions";
import { Loader } from "@/components/ui/loader";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";


const DashboardSkeleton = () => (
    <div className="flex-1 space-y-6 text-center">
        <div className="space-y-2">
            <Skeleton className="h-8 w-1/2" />
            <Skeleton className="h-5 w-1/3" />
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
                <Card key={i}>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <Skeleton className="h-5 w-1/3" />
                        <Skeleton className="h-4 w-4" />
                    </CardHeader>
                    <CardContent>
                        <Skeleton className="h-8 w-1/2" />
                        <Skeleton className="h-4 w-2/3 mt-1" />
                    </CardContent>
                </Card>
            ))}
        </div>
        <p className="mt-8 text-lg text-muted-foreground">Just a moment, getting everything ready for you…</p>
    </div>
);

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
  
  const PercentageChange = ({ value }: { value: number }) => {
    const isPositive = value >= 0;
    return (
      <p className="text-xs text-muted-foreground flex items-center">
        {isPositive ? (
          <ArrowUp className="h-4 w-4 text-green-500" />
        ) : (
          <ArrowDown className="h-4 w-4 text-red-500" />
        )}
        <span className={cn("font-semibold", isPositive ? "text-green-600" : "text-red-600")}>
          {(value || 0).toFixed(1)}%
        </span>
        &nbsp;from last month
      </p>
    );
  };


  if (loading) {
    return <DashboardSkeleton />;
  }

  if (error) {
    return <div className="text-center text-destructive"><p>{error}</p></div>;
  }
  
  if (!stats) {
    return <div className="text-center text-muted-foreground"><p>No data available.</p></div>;
  }

  return (
    <div className="flex-1 space-y-6">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight">
              Hi, Welcome back {user?.name || 'Admin'}!
          </h2>
          <p className="text-muted-foreground text-sm md:text-base">
              Here's a list of stats for {selectedBrand}.
          </p>
        </div>
      </div>
      
       <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <Card className="bg-gradient-to-br from-blue-900/50 to-blue-800/20 text-blue-100 border-blue-700/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-300">Total Revenue</CardTitle>
            <IndianRupee className="h-4 w-4 text-blue-300" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">₹{(stats.totalRevenue || 0).toLocaleString('en-IN')}</div>
            <PercentageChange value={stats.percentageChanges.revenue || 0} />
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-red-900/50 to-red-800/20 text-red-100 border-red-700/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-red-300">Total Loss</CardTitle>
            <Info className="h-4 w-4 text-red-300" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">₹{(stats.totalLoss || 0).toLocaleString('en-IN')}</div>
            <PercentageChange value={stats.percentageChanges.loss || 0} />
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-green-900/50 to-green-800/20 text-green-100 border-green-700/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-300">Total Inventory Value</CardTitle>
            <ShoppingCart className="h-4 w-4 text-green-300" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">₹{(stats.totalInventoryValue || 0).toLocaleString('en-IN')}</div>
            <PercentageChange value={stats.percentageChanges.inventory || 0} />
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-green-900/50 to-green-800/20 text-green-100 border-green-700/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-300">Total Orders</CardTitle>
            <Package className="h-4 w-4 text-green-300" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{(stats.totalOrders || 0)}</div>
             <PercentageChange value={stats.percentageChanges.orders || 0} />
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-orange-900/50 to-orange-800/20 text-orange-100 border-orange-700/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-orange-300">Total Products</CardTitle>
            <Package className="h-4 w-4 text-orange-300" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{(stats.totalProducts || 0)}</div>
             <p className="text-xs text-orange-200/70">Count of all listed products</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-purple-900/50 to-purple-800/20 text-purple-100 border-purple-700/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-purple-300">Total Users</CardTitle>
            <Users className="h-4 w-4 text-purple-300" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{(stats.totalUsers || 0)}</div>
            <PercentageChange value={stats.percentageChanges.users || 0} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default AdminDashboardPage;
