
"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { format } from "date-fns";
import { DollarSign, Package, Users, ArrowUp, BarChart, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SalesByCategory } from "@/components/admin/sales-by-category";
import { RevenueStatistics } from "@/components/admin/revenue-statistics";
import useBrandStore from "@/stores/brand-store";

function AdminDashboardPage() {
  const { user } = useAuth();
  const { selectedBrand } = useBrandStore();
  const [currentDate, setCurrentDate] = useState("");

  useEffect(() => {
    setCurrentDate(format(new Date(), "EEEE, MMMM dd, yyyy"));
  }, []);

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
       <div className="flex items-center justify-between space-y-2">
         <div>
            <h2 className="text-3xl font-bold tracking-tight">
                Hey, {user?.name || 'Admin'}!
            </h2>
            <p className="text-muted-foreground">
                Here's the latest for {selectedBrand}.
            </p>
        </div>
        <div className="hidden md:flex items-center space-x-2">
            <p className="text-sm text-muted-foreground">{currentDate}</p>
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card className="bg-primary text-primary-foreground">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Revenue
            </CardTitle>
            <DollarSign className="h-4 w-4 text-primary-foreground/70" />
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold">₹542,980.00</div>
            <p className="text-xs text-primary-foreground/80 flex items-center">
              <ArrowUp className="h-3 w-3 mr-1"/>
              26% Than last month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Orders</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold">8,589</div>
            <p className="text-xs text-muted-foreground flex items-center">
               <ArrowUp className="h-3 w-3 mr-1 text-green-500"/>
              11% Than last month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold">16,284</div>
            <p className="text-xs text-muted-foreground flex items-center">
               <ArrowUp className="h-3 w-3 mr-1 text-green-500"/>
              18% Increase this month
            </p>
          </CardContent>
        </Card>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-1 lg:col-span-3">
            <CardHeader>
                <CardTitle className="flex items-center">
                   <BarChart className="h-4 w-4 mr-2 text-muted-foreground" />
                    Sales by category
                </CardTitle>
            </CardHeader>
            <CardContent>
               <SalesByCategory />
            </CardContent>
        </Card>
        <Card className="col-span-1 lg:col-span-4">
             <CardHeader>
                <CardTitle className="flex items-center">
                    <TrendingUp className="h-4 w-4 mr-2 text-muted-foreground" />
                    Revenue statistics
                </CardTitle>
            </CardHeader>
            <CardContent>
                <RevenueStatistics />
            </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default AdminDashboardPage;
