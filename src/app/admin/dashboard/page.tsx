
"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { format } from "date-fns";
import { DollarSign, Package, Users, BarChart, TrendingUp, ArrowUpRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { SalesByCategory } from "@/components/admin/sales-by-category";
import { RevenueStatistics } from "@/components/admin/revenue-statistics";
import useBrandStore from "@/stores/brand-store";

function AdminDashboardPage() {
  const { user } = useAuth();
  const { selectedBrand } = useBrandStore();
  const [currentDate, setCurrentDate] = useState("");

  useEffect(() => {
    setCurrentDate(format(new Date(), "MMMM dd, yyyy"));
  }, []);

  return (
    <div className="flex-1 space-y-6 p-4 md:p-8 pt-6">
       <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
         <div>
            <h2 className="text-3xl font-bold tracking-tight">
                Welcome back, {user?.name || 'Admin'}!
            </h2>
            <p className="text-muted-foreground mt-2">
                Here's a look at the performance for {selectedBrand}.
            </p>
        </div>
        <div className="hidden md:flex items-center space-x-2 p-2 rounded-lg bg-card border">
            <p className="text-sm font-medium text-muted-foreground">{currentDate}</p>
        </div>
      </div>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹542,980.00</div>
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <span className="text-green-600 flex items-center font-semibold">
                <ArrowUpRight className="h-3 w-3 mr-1"/> 26%
              </span>
              vs. last month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">8,589</div>
             <p className="text-xs text-muted-foreground flex items-center gap-1">
              <span className="text-green-600 flex items-center font-semibold">
                <ArrowUpRight className="h-3 w-3 mr-1"/> 11%
              </span>
               vs. last month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">16,284</div>
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <span className="text-green-600 flex items-center font-semibold">
                <ArrowUpRight className="h-3 w-3 mr-1"/> 18%
              </span>
               this month
            </p>
          </CardContent>
        </Card>
      </div>
      <div className="grid grid-cols-12 gap-6">
        <Card className="col-span-12 lg:col-span-8">
             <CardHeader>
                <CardTitle>Revenue Statistics</CardTitle>
                <CardDescription>Showing revenue over the last 12 months</CardDescription>
            </CardHeader>
            <CardContent className="pl-2">
                <RevenueStatistics />
            </CardContent>
        </Card>
         <Card className="col-span-12 lg:col-span-4">
            <CardHeader>
                <CardTitle>Sales by Category</CardTitle>
                <CardDescription>Top performing product categories</CardDescription>
            </CardHeader>
            <CardContent>
               <SalesByCategory />
            </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default AdminDashboardPage;
