
"use client";

import { useState } from "react";
import Image from "next/image";
import {
  AlertCircle,
  CheckCircle2,
  ChevronDown,
  Download,
  PlaySquare,
  Search,
  X,
  PackageOpen,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function OrdersPage() {
  const [activeTab, setActiveTab] = useState("pending");

  const renderEmptyState = () => (
    <div className="flex flex-col items-center justify-center text-center py-16">
      <PackageOpen className="w-24 h-24 text-gray-300" strokeWidth={1} />
      <p className="mt-4 text-lg font-semibold">No orders yet</p>
      <p className="text-sm text-muted-foreground">
        But keep checking this section from time to time.
      </p>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Orders</h1>
        <div className="flex items-center gap-4">
          <Button variant="ghost" className="text-sm font-medium">
            <PlaySquare className="mr-2 h-4 w-4 text-red-600" />
            Learn how to process your orders?
          </Button>
          <Button variant="default">
            <Download className="mr-2 h-4 w-4" />
            Download Orders Data
            <ChevronDown className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>

      <Card className="bg-yellow-50 border-yellow-200">
        <CardContent className="p-4 flex items-start gap-4">
          <Image
            src="https://picsum.photos/seed/labelbox/80/80"
            alt="Shipping Label Box"
            width={60}
            height={60}
            className="rounded-md"
            data-ai-hint="shipping box"
          />
          <div className="flex-grow">
            <div className="flex items-center gap-2 font-semibold">
              <X className="h-5 w-5 text-red-500" />
              <span>Label download failed?</span>
              <CheckCircle2 className="h-5 w-5 text-green-600" />
              <span>Meesho will retry automatically</span>
            </div>
            <p className="text-sm text-yellow-800 mt-1">
              We will notify you once it's ready for download
            </p>
            <p className="text-sm text-yellow-800">
              Don't worry! Your orders will{" "}
              <span className="font-bold">not be blocked or lose visibility</span>
            </p>
          </div>
            <span className="text-xs text-muted-foreground self-center -rotate-90 whitespace-nowrap">*T&C's apply</span>
        </CardContent>
      </Card>
      
      <Card>
         <CardContent className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
                <div className="bg-purple-100 p-3 rounded-lg">
                    <AlertCircle className="h-6 w-6 text-purple-600" />
                </div>
                <p className="text-sm">
                    As per Meesho packaging policy, all sellers must use Transparent Barcoded Packaging for their products on the platform.
                </p>
            </div>
            <div className="flex items-center gap-2">
                <Button variant="outline">Buy Barcoded Packets</Button>
                <Button variant="outline">Scan Barcoded Packets</Button>
            </div>
         </CardContent>
      </Card>


      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-5 bg-muted/50">
          <TabsTrigger value="on-hold">On Hold</TabsTrigger>
          <TabsTrigger value="pending">Pending (0)</TabsTrigger>
          <TabsTrigger value="ready-to-ship">Ready to Ship (1)</TabsTrigger>
          <TabsTrigger value="shipped">Shipped</TabsTrigger>
          <TabsTrigger value="cancelled">Cancelled</TabsTrigger>
        </TabsList>
        
        <Card className="mt-4">
            <CardContent className="p-4 space-y-4">
                <div className="flex items-center gap-4">
                    <span className="text-sm font-medium">Filter by:</span>
                     <Select>
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="SLA Status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All</SelectItem>
                            <SelectItem value="due-today">Due Today</SelectItem>
                            <SelectItem value="due-tomorrow">Due Tomorrow</SelectItem>
                        </SelectContent>
                    </Select>
                     <Select>
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Dispatch Date" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="today">Today</SelectItem>
                            <SelectItem value="yesterday">Yesterday</SelectItem>
                        </SelectContent>
                    </Select>
                     <Select>
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Order Date" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="last-7-days">Last 7 days</SelectItem>
                             <SelectItem value="last-30-days">Last 30 days</SelectItem>
                        </SelectContent>
                    </Select>
                    <div className="relative ml-auto w-[300px]">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input placeholder="Search..." className="pl-9" />
                        <Select defaultValue="sku-id">
                            <SelectTrigger className="absolute right-1 top-1/2 -translate-y-1/2 w-auto h-8 bg-muted border-l rounded-l-none">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="sku-id">SKU ID</SelectItem>
                                <SelectItem value="order-id">Order ID</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <div className="border-t pt-4">
                    <TabsContent value="on-hold">{renderEmptyState()}</TabsContent>
                    <TabsContent value="pending">{renderEmptyState()}</TabsContent>
                    <TabsContent value="ready-to-ship">{renderEmptyState()}</TabsContent>
                    <TabsContent value="shipped">{renderEmptyState()}</TabsContent>
                    <TabsContent value="cancelled">{renderEmptyState()}</TabsContent>
                </div>
            </CardContent>
        </Card>
      </Tabs>

    </div>
  );
}
