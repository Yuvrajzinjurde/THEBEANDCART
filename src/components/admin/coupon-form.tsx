

"use client";

import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Loader } from '../ui/loader';
import useBrandStore from '@/stores/brand-store';
import { CouponFormSchema, type CouponFormValues } from '@/lib/coupon-schema';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { CalendarIcon } from 'lucide-react';
import { Calendar } from '../ui/calendar';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import type { ICoupon } from '@/models/coupon.model';


interface CouponFormProps {
  mode: 'create' | 'edit';
  existingCoupon?: ICoupon;
}

export function CouponForm({ mode, existingCoupon }: CouponFormProps) {
  const router = useRouter();
  const { selectedBrand, availableBrands } = useBrandStore();
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const defaultValues: CouponFormValues = React.useMemo(() => {
    if (existingCoupon) {
      // For editing, transform the data to match the form's expected types.
      return {
        ...existingCoupon,
        code: existingCoupon.code || '',
        type: existingCoupon.type || 'percentage',
        value: existingCoupon.value !== undefined ? existingCoupon.value : undefined,
        minPurchase: existingCoupon.minPurchase || 0,
        brand: existingCoupon.brand || 'All Brands',
        startDate: existingCoupon.startDate ? new Date(existingCoupon.startDate) : undefined,
        endDate: existingCoupon.endDate ? new Date(existingCoupon.endDate) : undefined,
      };
    }
    // For creating, set sensible defaults.
    return {
      code: '',
      type: 'percentage',
      value: undefined,
      minPurchase: 0,
      brand: selectedBrand === 'All Brands' ? 'All Brands' : selectedBrand,
      startDate: undefined,
      endDate: undefined
    };
  }, [existingCoupon, selectedBrand]);

  const form = useForm<CouponFormValues>({
    resolver: zodResolver(CouponFormSchema),
    defaultValues,
    mode: 'onChange',
  });

  const discountType = form.watch('type');

  useEffect(() => {
    if (discountType === 'free-shipping') {
      form.setValue('value', undefined, { shouldValidate: true });
    }
  }, [discountType, form]);

  const generateRandomCode = () => {
    const randomPart = Math.random().toString(36).substring(2, 10).toUpperCase();
    form.setValue('code', `SALE${randomPart}`, { shouldValidate: true });
  };

  async function onSubmit(data: CouponFormValues) {
    setIsSubmitting(true);
    
    const url = mode === 'create' ? '/api/coupons' : `/api/coupons/${existingCoupon?._id}`;
    const method = mode === 'create' ? 'POST' : 'PUT';

    try {
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || `Failed to ${mode} coupon.`);
      }

      toast.success(`Coupon ${mode === 'create' ? 'created' : 'updated'} successfully!`);
      router.push('/admin/promotions');
      router.refresh();

    } catch (error: any) {
      console.error("Submission Error:", error);
      toast.error(error.message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 max-w-2xl">
        <FormField
            control={form.control}
            name="brand"
            render={({ field }) => (
                <FormItem>
                    <FormLabel>Brand</FormLabel>
                     <Select onValueChange={field.onChange} value={field.value} disabled={mode === 'edit'}>
                        <FormControl>
                            <SelectTrigger>
                                <SelectValue placeholder="Select brand this coupon applies to" />
                            </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                           {availableBrands.map(brand => (
                               <SelectItem key={brand} value={brand} className="capitalize">{brand}</SelectItem>
                           ))}
                        </SelectContent>
                    </Select>
                    <FormDescription>The brand this promotion will be active for. Select "All Brands" for a global coupon.</FormDescription>
                    <FormMessage />
                </FormItem>
            )}
        />
        
        <FormField
            control={form.control}
            name="code"
            render={({ field }) => (
                <FormItem>
                    <FormLabel>Discount Code</FormLabel>
                     <div className="flex gap-2">
                        <FormControl>
                            <Input placeholder="e.g., SUMMER20" {...field} className="uppercase" />
                        </FormControl>
                         <Button type="button" variant="outline" onClick={generateRandomCode}>Generate</Button>
                    </div>
                    <FormDescription>This is the code customers will enter at checkout.</FormDescription>
                    <FormMessage />
                </FormItem>
            )}
        />

        <FormField
            control={form.control}
            name="type"
            render={({ field }) => (
                <FormItem className="space-y-3">
                    <FormLabel>Discount Type</FormLabel>
                    <FormControl>
                        <RadioGroup
                        onValueChange={field.onChange}
                        value={field.value}
                        className="flex flex-col sm:flex-row sm:items-center gap-4"
                        >
                        <FormItem className="flex items-center space-x-2 space-y-0">
                            <FormControl>
                                <RadioGroupItem value="percentage" />
                            </FormControl>
                            <FormLabel className="font-normal">Percentage</FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center space-x-2 space-y-0">
                            <FormControl>
                                <RadioGroupItem value="fixed" />
                            </FormControl>
                            <FormLabel className="font-normal">Fixed Amount</FormLabel>
                        </FormItem>
                         <FormItem className="flex items-center space-x-2 space-y-0">
                            <FormControl>
                                <RadioGroupItem value="free-shipping" />
                            </FormControl>
                            <FormLabel className="font-normal">Free Shipping</FormLabel>
                        </FormItem>
                        </RadioGroup>
                    </FormControl>
                    <FormMessage />
                </FormItem>
            )}
        />
        
         {discountType !== 'free-shipping' && (
            <FormField
                control={form.control}
                name="value"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Discount Value</FormLabel>
                         <div className="relative">
                            {discountType === 'fixed' && <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground">₹</span>}
                            <FormControl>
                                <Input 
                                  type="number"
                                  placeholder={discountType === 'percentage' ? 'e.g., 10 for 10%' : 'e.g., 100'}
                                  {...field}
                                />
                            </FormControl>
                             {discountType === 'percentage' && <span className="absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground">%</span>}
                        </div>
                        <FormMessage />
                    </FormItem>
                )}
            />
        )}


        <FormField
            control={form.control}
            name="minPurchase"
            render={({ field }) => (
                <FormItem>
                    <FormLabel>Minimum Purchase Amount</FormLabel>
                     <div className="relative">
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground">₹</span>
                        <FormControl>
                            <Input 
                              type="number"
                              placeholder="0"
                              {...field}
                              className="pl-7"
                            />
                        </FormControl>
                    </div>
                    <FormDescription>The minimum amount a customer must spend to use this coupon.</FormDescription>
                    <FormMessage />
                </FormItem>
            )}
        />
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField
                control={form.control}
                name="startDate"
                render={({ field }) => (
                    <FormItem className="flex flex-col">
                    <FormLabel>Start Date</FormLabel>
                    <Popover>
                        <PopoverTrigger asChild>
                        <FormControl>
                            <Button
                            variant={"outline"}
                            className={cn(
                                "w-full pl-3 text-left font-normal",
                                !field.value && "text-muted-foreground"
                            )}
                            >
                            {field.value ? (
                                format(field.value, "PPP")
                            ) : (
                                <span>Pick a date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                        </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            initialFocus
                        />
                        </PopoverContent>
                    </Popover>
                    <FormDescription>
                        When the coupon becomes active.
                    </FormDescription>
                    <FormMessage />
                    </FormItem>
                )}
            />
            <FormField
                control={form.control}
                name="endDate"
                render={({ field }) => (
                    <FormItem className="flex flex-col">
                    <FormLabel>End Date</FormLabel>
                    <Popover>
                        <PopoverTrigger asChild>
                        <FormControl>
                            <Button
                            variant={"outline"}
                            className={cn(
                                "w-full pl-3 text-left font-normal",
                                !field.value && "text-muted-foreground"
                            )}
                            >
                            {field.value ? (
                                format(field.value, "PPP")
                            ) : (
                                <span>Pick a date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                        </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            disabled={(date) =>
                                form.getValues('startDate') ? date < form.getValues('startDate')! : false
                            }
                            initialFocus
                        />
                        </PopoverContent>
                    </Popover>
                    <FormDescription>
                        When the coupon expires. Leave blank for no expiry.
                    </FormDescription>
                    <FormMessage />
                    </FormItem>
                )}
            />
        </div>


        <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? <Loader className="mr-2 h-4 w-4" /> : null}
              {mode === 'create' ? 'Create Coupon' : 'Save Changes'}
            </Button>
        </div>
      </form>
    </Form>
  );
}