
"use client";

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Radio, Send, Loader } from 'lucide-react';
import { broadcastSchema, type NotificationFormValues } from '@/lib/notification-schema';

export default function AdminNotificationsPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<NotificationFormValues>({
    resolver: zodResolver(broadcastSchema),
    defaultValues: {
      title: '',
      message: '',
      link: '',
      type: 'admin_announcement',
    },
  });

  const onSubmit = async (data: NotificationFormValues) => {
    setIsSubmitting(true);
    toast.info("Sending notifications to all users...");

    try {
      const response = await fetch('/api/notifications/broadcast', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Failed to send notifications.');
      }

      toast.success(`Successfully sent notification to ${result.notificationCount} users!`);
      form.reset();

    } catch (error: any) {
      toast.error(error.message);
      console.error("Broadcast Error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2"><Radio /> Broadcast Notifications</CardTitle>
        <CardDescription>Send a notification to all registered users on the platform.</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 max-w-2xl">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Weekend Flash Sale!" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="message"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Message</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Get 50% off on all items. This weekend only!" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="link"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Link (Optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., /search?category=sale" {...field} />
                  </FormControl>
                  <FormDescription>A link to open when the notification is clicked.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? <Loader className="mr-2 h-4 w-4" /> : <Send className="mr-2 h-4 w-4" />}
              Send to All Users
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}

    
