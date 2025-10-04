
"use client";

import { useEffect, useMemo } from 'react';
import { Bell, Package, ShoppingCart, Tag, CheckCheck, Circle, RefreshCw, X, Info, AlertCircle, CheckCircle2, ArrowRight } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import useUserStore from '@/stores/user-store';
import { useAuth } from '@/hooks/use-auth';
import type { INotification, NotificationType } from '@/models/notification.model';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';

const NOTIFICATION_ICONS: Record<NotificationType, React.ElementType> = {
  order_success: CheckCircle2,
  order_status: Package,
  order_delivery: Package,
  shipment_update: Package,
  cart_stock_alert: AlertCircle,
  wishlist_stock_alert: AlertCircle,
  new_product_suggestion: Info,
  upcoming_sale: Tag,
  admin_announcement: Bell,
  new_order_admin: ShoppingCart,
  return_request_admin: AlertCircle,
};

const NOTIFICATION_COLORS: Record<NotificationType, string> = {
  order_success: 'text-green-500 bg-green-100',
  order_status: 'text-blue-500 bg-blue-100',
  order_delivery: 'text-green-500 bg-green-100',
  shipment_update: 'text-blue-500 bg-blue-100',
  cart_stock_alert: 'text-yellow-500 bg-yellow-100',
  wishlist_stock_alert: 'text-yellow-500 bg-yellow-100',
  new_product_suggestion: 'text-blue-500 bg-blue-100',
  upcoming_sale: 'text-purple-500 bg-purple-100',
  admin_announcement: 'text-gray-800 bg-gray-100',
  new_order_admin: 'text-green-500 bg-green-100',
  return_request_admin: 'text-red-500 bg-red-100',
};


const NotificationItem = ({ notification }: { notification: INotification }) => {
    const router = useRouter();
    const { token } = useAuth();
    const { markNotificationAsRead } = useUserStore();

    const Icon = NOTIFICATION_ICONS[notification.type] || Circle;
    const colors = NOTIFICATION_COLORS[notification.type] || 'text-gray-800 bg-gray-100';

    const handleNotificationClick = async () => {
        if (!notification.isRead) {
             try {
                const response = await fetch(`/api/notifications/${notification._id}`, {
                    method: 'PATCH',
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (response.ok) {
                    markNotificationAsRead(notification._id as string);
                }
            } catch (error) {
                console.error("Failed to mark notification as read", error);
            }
        }
        if (notification.link) {
            router.push(notification.link);
        }
    };

    return (
        <div 
            className={cn(
                "flex items-start gap-4 p-4 rounded-lg transition-colors cursor-pointer border",
                notification.isRead ? 'bg-background hover:bg-muted/50' : 'bg-primary/5 border-primary/20 hover:bg-primary/10'
            )}
            onClick={handleNotificationClick}
        >
            <div className={cn("h-8 w-8 rounded-full flex items-center justify-center shrink-0", colors)}>
                <Icon className="h-5 w-5" />
            </div>
            <div className="flex-grow">
                <p className="font-semibold text-sm">{notification.title}</p>
                <p className="text-xs text-muted-foreground">{notification.message}</p>
                <p className="text-xs text-muted-foreground mt-1">
                    {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                </p>
            </div>
             <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground shrink-0">
                <X className="h-4 w-4" />
             </Button>
        </div>
    );
};


interface NotificationsDrawerProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
}

export function NotificationsDrawer({ isOpen, onOpenChange }: NotificationsDrawerProps) {
  const { notifications, markAllNotificationsAsRead } = useUserStore();
  const { token } = useAuth();

  const sortedNotifications = useMemo(() => {
    return [...(notifications || [])].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [notifications]);

  const unreadNotifications = sortedNotifications.filter(n => !n.isRead);
  
  const handleMarkAllAsRead = async () => {
    try {
        const response = await fetch('/api/notifications/mark-all-read', {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (response.ok) {
            markAllNotificationsAsRead();
        }
    } catch (error) {
        console.error("Failed to mark all as read", error);
    }
  };


  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent className="w-[440px] sm:max-w-md flex flex-col p-0">
        <SheetHeader className="p-4 pb-2 border-b">
          <SheetTitle className="flex items-center justify-between">
            <span className="text-lg font-semibold">Notifications</span>
            <Button variant="ghost" size="icon" className="h-8 w-8">
                <RefreshCw className="h-4 w-4" />
            </Button>
          </SheetTitle>
        </SheetHeader>
        <div className="flex-1 flex flex-col min-h-0">
            <Tabs defaultValue="all" className="flex-1 flex flex-col min-h-0">
                <div className="px-4 pt-4">
                    <TabsList className="grid w-full grid-cols-3 bg-muted/60">
                        <TabsTrigger value="all">All <Badge variant="secondary" className="ml-2">{sortedNotifications.length}</Badge></TabsTrigger>
                        <TabsTrigger value="unread">Unread <Badge variant="secondary" className="ml-2">{unreadNotifications.length}</Badge></TabsTrigger>
                        <TabsTrigger value="read">Read</TabsTrigger>
                    </TabsList>
                </div>
                <ScrollArea className="flex-1">
                    <TabsContent value="all" className="p-4 pt-4 m-0">
                        {sortedNotifications.length > 0 ? (
                             <div className="space-y-3">
                                {sortedNotifications.map(n => <NotificationItem key={n._id as string} notification={n} />)}
                            </div>
                        ) : (
                            <p className="text-center text-muted-foreground py-16">No notifications yet.</p>
                        )}
                    </TabsContent>
                    <TabsContent value="unread" className="p-4 pt-4 m-0">
                        {unreadNotifications.length > 0 ? (
                            <div className="space-y-3">
                                {unreadNotifications.map(n => <NotificationItem key={n._id as string} notification={n} />)}
                            </div>
                        ) : (
                            <p className="text-center text-muted-foreground py-16">All caught up!</p>
                        )}
                    </TabsContent>
                    <TabsContent value="read" className="p-4 pt-4 m-0">
                         {(sortedNotifications.length - unreadNotifications.length) > 0 ? (
                            <div className="space-y-3">
                                {sortedNotifications.filter(n => n.isRead).map(n => <NotificationItem key={n._id as string} notification={n} />)}
                            </div>
                        ) : (
                            <p className="text-center text-muted-foreground py-16">No read notifications yet.</p>
                        )}
                    </TabsContent>
                </ScrollArea>
            </Tabs>
        </div>
         <SheetFooter className="p-4 border-t bg-background flex-row justify-between items-center">
            <Button variant="link" className="p-0 h-auto" onClick={handleMarkAllAsRead}>Mark all as read</Button>
            <Button variant="ghost">
                Go to notification center <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
