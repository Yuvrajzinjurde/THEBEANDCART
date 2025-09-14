
"use client";

import { useState } from "react";
import {
  Download,
  Search,
  PackageOpen,
  Info,
  Calendar as CalendarIcon,
} from "lucide-react";
import { format } from "date-fns";
import type { DateRange } from "react-day-picker";
import * as XLSX from "xlsx";

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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { toast } from "react-toastify";


export default function OrdersPage() {
  const [activeTab, setActiveTab] = useState("pending");
  const [date, setDate] = useState<DateRange | undefined>();

  const renderEmptyState = () => (
    <div className="flex flex-col items-center justify-center text-center py-16">
      <PackageOpen className="w-24 h-24 text-gray-300" strokeWidth={1} />
      <p className="mt-4 text-lg font-semibold">No orders yet</p>
      <p className="text-sm text-muted-foreground">
        When you get an order, it will appear here.
      </p>
    </div>
  );

  const handleDownload = async () => {
    if (!date?.from || !date?.to) {
        toast.error("Please select a date range first.");
        return;
    }
    
    toast.info("Generating your report...");

    try {
        const fromDate = format(date.from, 'yyyy-MM-dd');
        const toDate = format(date.to, 'yyyy-MM-dd');
        
        const response = await fetch(`/api/orders?startDate=${fromDate}&endDate=${toDate}`);
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to fetch orders');
        }

        const { orders } = await response.json();

        if (orders.length === 0) {
            toast.warn("No orders found in the selected date range.");
            return;
        }
        
        // Flatten the data for Excel export
        const flattenedData = orders.map((order: any) => ({
            'Order ID': order._id,
            'User ID': order.userId,
            'Total Amount': order.totalAmount,
            'Status': order.status,
            'Brand': order.brand,
            'Order Date': format(new Date(order.createdAt), 'PPpp'),
            'Product Count': order.products.length,
        }));

        const worksheet = XLSX.utils.json_to_sheet(flattenedData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Orders");
        
        const fileName = `orders_${format(date.from, "yyyy-MM-dd")}_to_${format(date.to, "yyyy-MM-dd")}.xlsx`;
        XLSX.writeFile(workbook, fileName);
        toast.success("Report downloaded successfully!");

    } catch (error: any) {
        console.error("Download Error:", error);
        toast.error(error.message || "An error occurred while generating the report.");
    }
  };


  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Orders</h1>
        <div className="flex items-center gap-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                  <Button variant="default">
                      <Download className="mr-2 h-4 w-4" />
                      Download Orders Data
                  </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-80 p-4" align="end">
                  <div className="space-y-4">
                      <Alert variant="default" className="bg-blue-50 border-blue-200 text-blue-800 [&>svg]:text-blue-800">
                          <Info className="h-4 w-4" />
                          <AlertDescription className="text-xs">
                                Download Orders data here. For tax invoice, please use the Downloads option in Payments tab
                          </AlertDescription>
                      </Alert>
                      
                      <div>
                        <div className="flex items-center justify-between">
                             <div>
                                <p className="font-semibold">Download Orders Data</p>
                                <p className="text-xs text-muted-foreground">It might take some time to generate the file</p>
                            </div>
                           <Popover>
                              <PopoverTrigger asChild>
                                <Button
                                  id="date"
                                  variant={"outline"}
                                  size="sm"
                                  className={cn(
                                    "w-auto justify-start text-left font-normal",
                                    !date && "text-muted-foreground"
                                  )}
                                >
                                  <CalendarIcon className="mr-2 h-4 w-4" />
                                  {date?.from ? (
                                    date.to ? (
                                      <>
                                        {format(date.from, "LLL dd, y")} -{" "}
                                        {format(date.to, "LLL dd, y")}
                                      </>
                                    ) : (
                                      format(date.from, "LLL dd, y")
                                    )
                                  ) : (
                                    <span>Select Date Range</span>
                                  )}
                                </Button>
                              </PopoverTrigger>
                              <PopoverContent className="w-auto p-0" align="end">
                                <Calendar
                                  initialFocus
                                  mode="range"
                                  defaultMonth={date?.from}
                                  selected={date}
                                  onSelect={setDate}
                                  numberOfMonths={1}
                                />
                                <div className="p-4 border-t">
                                    <Button onClick={handleDownload} className="w-full" disabled={!date?.from || !date?.to}>Download</Button>
                                </div>
                              </PopoverContent>
                            </Popover>
                        </div>
                      </div>

                      <DropdownMenuSeparator />

                      <div>
                          <p className="text-xs font-semibold uppercase text-muted-foreground mb-2">Exported Files</p>
                          <p className="text-sm text-center text-muted-foreground py-4">No file yet.</p>
                      </div>
                  </div>
              </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-5 bg-muted/50">
          <TabsTrigger value="on-hold">On Hold</TabsTrigger>
          <TabsTrigger value="pending">Pending</TabsTrigger>
          <TabsTrigger value="ready-to-ship">Ready to Ship</TabsTrigger>
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
                            </Trigger>
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
