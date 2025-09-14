
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

  const handleDownload = () => {
    if (!date?.from || !date?.to) {
        alert("Please select a date range first.");
        return;
    }

    // Since we don't have real order data, we'll create some dummy data.
    const dummyOrders = [
        { id: 'ORD001', date: '2023-10-26', customer: 'John Doe', total: 150.00, status: 'Shipped' },
        { id: 'ORD002', date: '2023-10-27', customer: 'Jane Smith', total: 200.50, status: 'Pending' },
        { id: 'ORD003', date: '2023-10-28', customer: 'Peter Jones', total: 75.25, status: 'Delivered' },
    ];

    const worksheet = XLSX.utils.json_to_sheet(dummyOrders);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Orders");
    
    // Generate a file name with the date range
    const fileName = `orders_${format(date.from, "yyyy-MM-dd")}_to_${format(date.to, "yyyy-MM-dd")}.xlsx`;
    XLSX.writeFile(workbook, fileName);
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
                                  numberOfMonths={2}
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
