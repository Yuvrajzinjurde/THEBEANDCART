
"use client";

import { useEffect, useMemo } from 'react';
import { Bell, Package, ShoppingCart, Tag, CheckCheck, Circle } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import useUserStore from '@/stores/user-store';
import { useAuth } from '@/hooks/use-auth';
import type { INotification, NotificationType } from '@/models/notification.model';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';

const NOTIFICATION_ICONS: Record<NotificationType, React.ElementType> = {
  order_success: Package,
  order_status: Package,
  order_delivery: Package,
  shipment_update: Package,
  cart_stock_alert: ShoppingCart,
  wishlist_stock_alert: ShoppingCart,
  new_product_suggestion: Tag,
  upcoming_sale: Tag,
  admin_announcement: Bell,
  new_order_admin: Bell,
  return_request_admin: Bell,
};


const NotificationItem = ({ notification }: { notification: INotification }) => {
    const router = useRouter();
    const { token } = useAuth();
    const { markNotificationAsRead } = useUserStore();

    const Icon = NOTIFICATION_ICONS[notification.type] || Circle;

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
                "flex items-start gap-4 p-4 rounded-lg transition-colors cursor-pointer",
                notification.isRead ? 'hover:bg-muted/50' : 'bg-primary/10 hover:bg-primary/20'
            )}
            onClick={handleNotificationClick}
        >
            <div className={cn("h-10 w-10 rounded-full flex items-center justify-center shrink-0", !notification.isRead ? 'bg-primary/20 text-primary' : 'bg-muted text-muted-foreground')}>
                <Icon className="h-5 w-5" />
            </div>
            <div className="flex-grow">
                <p className="font-semibold text-sm">{notification.title}</p>
                <p className="text-xs text-muted-foreground">{notification.message}</p>
                <p className="text-xs text-muted-foreground mt-1">
                    {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                </p>
            </div>
            {!notification.isRead && (
                 <div className="h-2.5 w-2.5 rounded-full bg-primary mt-1 flex-shrink-0" />
            )}
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
    return [...notifications].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [notifications]);

  const unreadNotifications = sortedNotifications.filter(n => !n.isRead);
  const readNotifications = sortedNotifications.filter(n => n.isRead);
  
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
      <SheetContent className="w-[400px] sm:w-[540px] flex flex-col p-0">
        <SheetHeader className="p-6 pb-2 border-b">
          <SheetTitle className="flex items-center justify-between">
            <span>Notifications</span>
            {unreadNotifications.length > 0 && (
                <Button variant="ghost" size="sm" onClick={handleMarkAllAsRead}>
                    <CheckCheck className="mr-2 h-4 w-4" />
                    Mark all as read
                </Button>
            )}
          </SheetTitle>
        </SheetHeader>
        <div className="flex-1 flex flex-col min-h-0">
            <Tabs defaultValue="all" className="flex-1 flex flex-col min-h-0">
                <TabsList className="mx-6 mt-4">
                    <TabsTrigger value="all">All</TabsTrigger>
                    <TabsTrigger value="unread">Unread ({unreadNotifications.length})</TabsTrigger>
                </TabsList>
                <ScrollArea className="flex-1">
                    <TabsContent value="all" className="p-6 pt-4 m-0">
                        {sortedNotifications.length > 0 ? (
                             <div className="space-y-4">
                                {sortedNotifications.map(n => <NotificationItem key={n._id as string} notification={n} />)}
                            </div>
                        ) : (
                            <p className="text-center text-muted-foreground py-16">No notifications yet.</p>
                        )}
                    </TabsContent>
                    <TabsContent value="unread" className="p-6 pt-4 m-0">
                        {unreadNotifications.length > 0 ? (
                            <div className="space-y-4">
                                {unreadNotifications.map(n => <NotificationItem key={n._id as string} notification={n} />)}
                            </div>
                        ) : (
                            <p className="text-center text-muted-foreground py-16">All caught up!</p>
                        )}
                    </TabsContent>
                </ScrollArea>
            </Tabs>
        </div>
      </SheetContent>
    </Sheet>
  );
}
