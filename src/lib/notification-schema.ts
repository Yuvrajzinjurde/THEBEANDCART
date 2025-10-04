
import { z } from 'zod';

export const notificationTypes = [
  'order_success',
  'order_status',
  'order_delivery',
  'shipment_update',
  'cart_stock_alert',
  'wishlist_stock_alert',
  'new_product_suggestion',
  'upcoming_sale',
  'admin_announcement',
  'new_order_admin',
  'return_request_admin',
] as const;

export const notificationSchema = z.object({
  title: z.string().min(1, "Title is required."),
  message: z.string().min(1, "Message is required."),
  link: z.string().url("Must be a valid URL.").optional().or(z.literal('')),
  type: z.enum(notificationTypes)
});

export type NotificationFormValues = z.infer<typeof notificationSchema>;

export const broadcastSchema = z.object({
  title: z.string().min(1),
  message: z.string().min(1),
  link: z.string().optional(),
  type: z.enum(notificationTypes).default('admin_announcement'),
});
