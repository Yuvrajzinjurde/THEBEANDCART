
"use client";

import { useState, useEffect, useTransition } from "react";
import {
  FileSpreadsheet,
  Search,
  PackageOpen,
  Info,
  Calendar as CalendarIcon,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { format } from "date-fns";
import type { DateRange } from "react-day-picker";
import * as XLSX from "xlsx";
import { toast } from "sonner";
import useBrandStore from "@/stores/brand-store";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { Loader } from "@/components/ui/loader";
import { useAuth } from "@/hooks/use-auth";

// Simplified Order type for client-side
interface PopulatedOrder {
    _id: string;
    userId: {
        _id: string;
        firstName: string;
        lastName: string;
        email: string;
    };
    orderId: string;
    totalAmount: number;
    status: 'pending' | 'shipped' | 'delivered' | 'cancelled' | 'on-hold' | 'ready-to-ship';
    brand: string;
    createdAt: string;
    products: any[];
}


export default function OrdersPage() {
  const { selectedBrand } = useBrandStore();
  const { token } = useAuth();
  const [allOrders, setAllOrders] = useState<PopulatedOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [isPending, startTransition] = useTransition();

  const [activeTab, setActiveTab] = useState("pending");
  const [date, setDate] = useState<DateRange | undefined>();
  
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [orderToReject, setOrderToReject] = useState<PopulatedOrder | null>(null);
  
  const fetchOrders = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/admin/orders?brand=${selectedBrand}`);
      if (!response.ok) throw new Error("Failed to fetch orders");
      const data = await response.json();
      setAllOrders(data.orders);
    } catch (error) {
      console.error(error);
      toast.error("Could not load orders.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [selectedBrand]);

  const handleAcceptOrder = (orderId: string) => {
    startTransition(async () => {
      try {
        const response = await fetch(`/api/admin/orders/${orderId}/accept`, { method: 'PATCH' });
        if (!response.ok) throw new Error("Failed to accept order");
        toast.success("Order moved to 'Ready to Ship'");
        fetchOrders();
      } catch (error) {
        toast.error("Could not accept order.");
      }
    });
  };
  
  const handleRejectOrder = () => {
      if (!orderToReject || !rejectionReason) return;
      startTransition(async () => {
          try {
              const response = await fetch(`/api/admin/orders/${orderToReject._id}/reject`, {
                  method: 'PATCH',
                  headers: {
                      'Content-Type': 'application/json',
                      'Authorization': `Bearer ${token}`
                  },
                  body: JSON.stringify({ reason: rejectionReason }),
              });
              if (!response.ok) throw new Error("Failed to reject order");
              toast.success("Order rejected and moved to 'Cancelled'");
              fetchOrders();
              setRejectDialogOpen(false);
              setOrderToReject(null);
              setRejectionReason("");
          } catch (error) {
              toast.error("Could not reject order.");
          }
      });
  };

  const openRejectDialog = (order: PopulatedOrder) => {
    setOrderToReject(order);
    setRejectDialogOpen(true);
  };


  const renderOrderTable = (status: PopulatedOrder['status']) => {
    const filteredOrders = allOrders.filter(order => order.status === status);

    if (loading) {
      return <div className="flex justify-center p-8"><Loader /></div>;
    }
    
    if (filteredOrders.length === 0) {
       return (
        <div className="flex flex-col items-center justify-center text-center py-16">
            <PackageOpen className="w-24 h-24 text-gray-300" strokeWidth={1} />
            <p className="mt-4 text-lg font-semibold">No {status} orders</p>
            <p className="text-sm text-muted-foreground">
                When new orders match this status, they will appear here.
            </p>
        </div>
      );
    }

    return (
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>Order ID</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Items</TableHead>
                    {status === 'pending' && <TableHead className="text-right">Actions</TableHead>}
                </TableRow>
            </TableHeader>
            <TableBody>
                {filteredOrders.map(order => (
                    <TableRow key={order._id}>
                        <TableCell className="font-mono text-xs">{order.orderId}</TableCell>
                        <TableCell>
                          <div className="font-medium">{order.userId?.firstName || 'N/A'} {order.userId?.lastName}</div>
                          <div className="text-xs text-muted-foreground">{order.userId?.email}</div>
                        </TableCell>
                        <TableCell>{format(new Date(order.createdAt), 'dd MMM, yyyy')}</TableCell>
                        <TableCell>₹{order.totalAmount.toLocaleString('en-IN')}</TableCell>
                        <TableCell>{order.products.length}</TableCell>
                        {status === 'pending' && (
                            <TableCell className="text-right">
                                <Button variant="ghost" size="sm" className="text-green-600 hover:text-green-700" onClick={() => handleAcceptOrder(order._id)} disabled={isPending}>
                                    <CheckCircle className="mr-2 h-4 w-4"/> Accept
                                </Button>
                                <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700" onClick={() => openRejectDialog(order)} disabled={isPending}>
                                    <XCircle className="mr-2 h-4 w-4" /> Reject
                                </Button>
                            </TableCell>
                        )}
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    );
  };

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
            toast.warning("No orders found in the selected date range.");
            return;
        }
        
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
       <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold">Orders</h1>
        <div className="flex items-center gap-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="bg-green-50 text-green-700 border-green-200 hover:bg-green-100 hover:text-green-700">
                      <FileSpreadsheet className="mr-2 h-4 w-4" />
                      Download Report
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
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                             <div>
                                <p className="font-semibold">Download Orders Data</p>
                                <p className="text-xs text-muted-foreground">Select a date range to export.</p>
                            </div>
                           <Popover>
                              <PopoverTrigger asChild>
                                <Button
                                  id="date"
                                  variant={"outline"}
                                  size="sm"
                                  className={cn(
                                    "w-full sm:w-auto justify-start text-left font-normal mt-2 sm:mt-0",
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
        <div className="overflow-x-auto">
            <TabsList className="grid w-full grid-cols-5 min-w-[600px] bg-muted/50">
            <TabsTrigger value="pending">Pending</TabsTrigger>
            <TabsTrigger value="ready-to-ship">Ready to Ship</TabsTrigger>
            <TabsTrigger value="shipped">Shipped</TabsTrigger>
            <TabsTrigger value="on-hold">On Hold</TabsTrigger>
            <TabsTrigger value="cancelled">Cancelled</TabsTrigger>
            </TabsList>
        </div>
        
        <Card className="mt-4">
            <CardContent className="p-4 space-y-4">
                <div className="flex flex-col md:flex-row items-center gap-4">
                    <span className="text-sm font-medium shrink-0">Filter by:</span>
                     <div className="grid grid-cols-1 sm:grid-cols-3 md:flex md:flex-1 gap-4 w-full">
                         <Select>
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="SLA Status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All</SelectItem>
                                <SelectItem value="due-today">Due Today</SelectItem>
                                <SelectItem value="due-tomorrow">Due Tomorrow</SelectItem>
                            </SelectContent>
                        </Select>
                        <Select>
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="Dispatch Date" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="today">Today</SelectItem>
                                <SelectItem value="yesterday">Yesterday</SelectItem>
                            </SelectContent>
                        </Select>
                        <Select>
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="Order Date" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="last-7-days">Last 7 days</SelectItem>
                                <SelectItem value="last-30-days">Last 30 days</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="relative w-full md:w-[300px] mt-4 md:mt-0">
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
                    <TabsContent value="pending">{renderOrderTable("pending")}</TabsContent>
                    <TabsContent value="ready-to-ship">{renderOrderTable("ready-to-ship")}</TabsContent>
                    <TabsContent value="shipped">{renderOrderTable("shipped")}</TabsContent>
                    <TabsContent value="on-hold">{renderOrderTable("on-hold")}</TabsContent>
                    <TabsContent value="cancelled">{renderOrderTable("cancelled")}</TabsContent>
                </div>
            </CardContent>
        </Card>
      </Tabs>
      
      <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
          <DialogContent>
              <DialogHeader>
                  <DialogTitle>Reject Order</DialogTitle>
                  <DialogDescription>
                    Please provide a reason for rejecting this order. This will be logged.
                  </DialogDescription>
              </DialogHeader>
              <div className="py-4">
                  <Textarea 
                    placeholder="e.g., Item out of stock, address invalid..."
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                  />
              </div>
              <DialogFooter>
                  <Button variant="outline" onClick={() => setRejectDialogOpen(false)}>Cancel</Button>
                  <Button variant="destructive" onClick={handleRejectOrder} disabled={isPending || !rejectionReason.trim()}>
                      {isPending && <Loader className="mr-2" />}
                      Confirm Rejection
                  </Button>
              </DialogFooter>
          </DialogContent>
      </Dialog>
    </div>
  );
}
