
"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { format } from "date-fns";
import { DollarSign, Package, Users, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { SalesByCategory } from "@/components/admin/sales-by-category";
import { RevenueStatistics } from "@/components/admin/revenue-statistics";
import useBrandStore from "@/stores/brand-store";

function AdminDashboardPage() {
  const { user } = useAuth();
  const { selectedBrand } = useBrandStore();

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
                <span className="text-sm font-medium text-muted-foreground">Total Revenue</span>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
            </div>
            <div>
                <div className="text-2xl font-bold">₹542,980.00</div>
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <span className="text-green-600 flex items-center font-semibold">
                        <ArrowUpRight className="h-3 w-3 mr-1"/> 26%
                    </span>
                    vs. last month
                </p>
            </div>
        </div>
        <div className="flex flex-col p-4 rounded-lg">
            <div className="flex flex-row items-center justify-between space-y-0 pb-2">
                <span className="text-sm font-medium text-muted-foreground">Total Orders</span>
                <Package className="h-4 w-4 text-muted-foreground" />
            </div>
            <div>
                <div className="text-2xl font-bold">8,589</div>
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <span className="text-red-600 flex items-center font-semibold">
                        <ArrowDownRight className="h-3 w-3 mr-1"/> 5%
                    </span>
                    vs. last month
                </p>
            </div>
        </div>
        <div className="flex flex-col p-4 rounded-lg">
            <div className="flex flex-row items-center justify-between space-y-0 pb-2">
                <span className="text-sm font-medium text-muted-foreground">Active Users</span>
                <Users className="h-4 w-4 text-muted-foreground" />
            </div>
            <div>
                <div className="text-2xl font-bold">16,284</div>
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
                <RevenueStatistics />
            </CardContent>
        </Card>
         <Card className="col-span-12">
            <CardHeader>
                <CardTitle>Sales by Category</CardTitle>
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
