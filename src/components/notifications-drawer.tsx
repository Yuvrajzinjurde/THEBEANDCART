
"use client";

import { useEffect, useMemo, useState } from 'react';
import { Bell, Package, ShoppingCart, Tag, CheckCheck, Circle, RefreshCw, X, Info, AlertCircle, CheckCircle2, ArrowRight } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
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

const NotificationItem = ({ notification, userId, closePopover }: { notification: INotification, userId: string, closePopover: () => void }) => {
    const router = useRouter();
    const { token } = useAuth();
    const { markNotificationAsRead } = useUserStore();
    const isRead = notification.readBy.includes(userId as any);

    const Icon = NOTIFICATION_ICONS[notification.type] || Circle;

    const handleNotificationClick = async () => {
        if (!isRead && token) {
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
        closePopover();
    };

    return (
        <div 
            className={cn(
                "flex items-start gap-4 p-3 rounded-lg transition-colors cursor-pointer",
                !isRead && 'bg-primary/5'
            )}
            onClick={handleNotificationClick}
        >
            <div className="flex-grow">
                <div className='flex items-center gap-2 mb-1'>
                    {!isRead && <div className='w-2 h-2 rounded-full bg-primary'></div>}
                    <p className="font-semibold text-sm">{notification.title}</p>
                </div>
                <p className="text-xs text-muted-foreground ml-4">{notification.message}</p>
                <p className="text-xs text-muted-foreground mt-1 ml-4">
                    {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                </p>
            </div>
             <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground shrink-0">
                <X className="h-4 w-4" />
             </Button>
        </div>
    );
};

export function NotificationsPopover() {
    const { user, token } = useAuth();
    const { notifications, markAllNotificationsAsRead, unreadNotificationsCount } = useUserStore(state => ({
        notifications: state.notifications,
        markAllNotificationsAsRead: state.markAllNotificationsAsRead,
        unreadNotificationsCount: Array.isArray(state.notifications) ? state.notifications.filter(n => !n.readBy.includes(user?.userId as any)).length : 0,
    }));
    const [activeTab, setActiveTab] = useState('all');
    const [isOpen, setIsOpen] = useState(false);

    const sortedNotifications = useMemo(() => {
        return [...(notifications || [])].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }, [notifications]);

    const filteredNotifications = useMemo(() => {
        if (!user) return [];
        if (activeTab === 'unread') return sortedNotifications.filter(n => !n.readBy.includes(user.userId as any));
        return sortedNotifications;
    }, [activeTab, sortedNotifications, user]);
  
    const handleMarkAllAsRead = async () => {
        if (!token) return;
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
        <Popover open={isOpen} onOpenChange={setIsOpen}>
            <PopoverTrigger asChild>
                <Button variant="ghost" size="icon" aria-label="Notifications">
                    <div className="relative">
                        <Bell className="h-5 w-5" />
                        {unreadNotificationsCount > 0 && <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">{unreadNotificationsCount}</span>}
                    </div>
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[400px] p-0" align="end">
                 <div className="p-4 border-b">
                    <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold">Notifications</h3>
                        <div className='flex items-center gap-1'>
                             <Button variant='ghost' size='sm' className='text-xs h-7' onClick={handleMarkAllAsRead}>Mark all as read</Button>
                        </div>
                    </div>
                    <div className='mt-4 flex items-center gap-2'>
                        <Button
                            size='sm'
                            variant={activeTab === 'all' ? 'default' : 'outline'}
                            className='rounded-full h-8 px-4 text-xs'
                            onClick={() => setActiveTab('all')}
                        >
                            All {notifications?.length || 0}
                        </Button>
                        <Button
                            size='sm'
                            variant={activeTab === 'unread' ? 'default' : 'outline'}
                            className='rounded-full h-8 px-4 text-xs'
                            onClick={() => setActiveTab('unread')}
                        >
                            Unread {unreadNotificationsCount}
                        </Button>
                    </div>
                </div>

                <ScrollArea className='h-[400px]'>
                    <div className="p-2 space-y-1">
                        {filteredNotifications.length > 0 ? (
                            filteredNotifications.map(n => <NotificationItem key={n._id as string} notification={n} userId={user!.userId} closePopover={() => setIsOpen(false)} />)
                        ) : (
                            <div className="flex flex-col items-center justify-center text-center py-16 text-muted-foreground">
                                <Bell className="w-12 h-12 mb-2" />
                                <p className='font-medium'>All caught up!</p>
                            </div>
                        )}
                    </div>
                </ScrollArea>
                <Separator />
                 <div className="p-4 flex items-center justify-center">
                    <Button variant="link" className="p-0 h-auto text-primary">
                        Go to notification center <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                </div>
            </PopoverContent>
        </Popover>
    )
}
