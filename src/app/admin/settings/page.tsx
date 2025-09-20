
"use client";

import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'react-toastify';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Save, ShoppingCart, Info } from 'lucide-react';
import { Loader } from '@/components/ui/loader';
import { CartSettingsSchema, type CartSettingsValues } from '@/lib/brand-schema';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export default function SettingsPage() {
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(true);

  const form = useForm<CartSettingsValues>({
    resolver: zodResolver(CartSettingsSchema),
    defaultValues: {
      freeShippingThreshold: 399,
      extraDiscountThreshold: 799,
      freeGiftThreshold: 999,
    },
    mode: 'onChange',
  });
  
  useEffect(() => {
    const fetchSettings = async () => {
        setIsLoading(true);
        try {
            const response = await fetch('/api/settings');
            if (response.ok) {
                const settings = await response.json();
                if (settings) {
                    form.reset(settings);
                }
            }
        } catch (error) {
            console.error("Failed to fetch cart settings", error);
            toast.error("Could not load cart settings. Displaying default values.");
        } finally {
            setIsLoading(false);
        }
    }
    fetchSettings();
  }, [form]);

  async function onSubmit(data: CartSettingsValues) {
    setIsSubmitting(true);
    try {
      const response = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || `Failed to save settings.`);
      }

      toast.success(`Cart settings saved successfully!`);
      form.reset(result); // Re-set form with the saved data to clear dirty state

    } catch (error: any) {
      console.error("Submission Error:", error);
      toast.error(error.message);
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isLoading) {
      return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><ShoppingCart /> Cart Offers</CardTitle>
                <CardDescription>Manage the cart page offers and progress bar milestones.</CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center items-center h-64"><Loader /></CardContent>
        </Card>
      )
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <Card>
            <CardHeader className="flex flex-row justify-between items-start">
                <div>
                    <CardTitle className="flex items-center gap-2"><ShoppingCart /> Cart Offers</CardTitle>
                    <CardDescription>Manage the cart page offers and progress bar milestones.</CardDescription>
                </div>
                <Button type="submit" disabled={isSubmitting || !form.formState.isDirty}>
                    {isSubmitting && <Loader className="mr-2" />}
                    <Save className="mr-2 h-4 w-4" />
                    Save Changes
                </Button>
            </CardHeader>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Cart Progress Bar Milestones</CardTitle>
            <CardDescription>
              Configure the three milestones that appear on the cart page to incentivize users to add more items.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
              <Alert>
                <Info className="h-4 w-4" />
                <AlertTitle>Heads up!</AlertTitle>
                <AlertDescription>
                    These thresholds correspond to the rewards shown on the cart page: Free Delivery, Extra 10% Off, and a Free Gift. The reward text itself is not editable from here.
                </AlertDescription>
              </Alert>
             <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <FormField
                    control={form.control}
                    name="freeShippingThreshold"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Milestone 1: Free Shipping</FormLabel>
                         <div className="relative">
                            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground">₹</span>
                            <FormControl>
                                <Input type="number" placeholder="399" className="pl-7" {...field} />
                            </FormControl>
                        </div>
                        <FormDescription>Cart value to unlock free shipping.</FormDescription>
                        <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="extraDiscountThreshold"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Milestone 2: Extra Discount</FormLabel>
                         <div className="relative">
                            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground">₹</span>
                            <FormControl>
                                <Input type="number" placeholder="799" className="pl-7" {...field} />
                            </FormControl>
                        </div>
                        <FormDescription>Cart value to unlock a 10% discount.</FormDescription>
                        <FormMessage />
                        </FormItem>
                    )}
                />
                 <FormField
                    control={form.control}
                    name="freeGiftThreshold"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Milestone 3: Free Gift</FormLabel>
                         <div className="relative">
                            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground">₹</span>
                            <FormControl>
                                <Input type="number" placeholder="999" className="pl-7" {...field} />
                            </FormControl>
                        </div>
                        <FormDescription>Cart value to unlock a free gift.</FormDescription>
                        <FormMessage />
                        </FormItem>
                    )}
                />
             </div>
          </CardContent>
        </Card>
      </form>
    </Form>
  );
}
