
"use client";

import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Loader } from './ui/loader';
import { useAuth } from '@/hooks/use-auth';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import type { IAddress } from '@/models/user.model';

const addressFormSchema = z.object({
  _id: z.string().optional(),
  fullName: z.string().min(1, 'Full name is required'),
  phone: z.string().min(10, 'A valid phone number is required'),
  street: z.string().min(1, 'Street address is required'),
  city: z.string().min(1, 'City is required'),
  state: z.string().min(1, 'State is required'),
  zip: z.string().min(1, 'ZIP code is required'),
  country: z.string().min(1, 'Country is required'),
  addressType: z.string().min(1, 'Address type is required'),
  customAddressType: z.string().optional(),
}).refine(data => {
    if (data.addressType === 'Other') {
        return !!data.customAddressType && data.customAddressType.length > 0;
    }
    return true;
}, {
    message: "Please specify your address type",
    path: ['customAddressType'],
});

type AddressFormValues = z.infer<typeof addressFormSchema>;

interface AddressFormProps {
  userId: string;
  existingAddress?: IAddress | null;
  onSaveSuccess: () => void;
  onCancel: () => void;
}

export function AddressForm({ userId, existingAddress, onSaveSuccess, onCancel }: AddressFormProps) {
    const { token, user } = useAuth();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const mode = existingAddress ? 'edit' : 'create';

    const form = useForm<AddressFormValues>({
        resolver: zodResolver(addressFormSchema),
        defaultValues: {
            country: 'India',
            addressType: 'Home',
        }
    });

    const addressType = form.watch('addressType');

    useEffect(() => {
        if (existingAddress) {
            const isCustom = !['Home', 'Office'].includes(existingAddress.addressType);
            form.reset({
                ...existingAddress,
                addressType: isCustom ? 'Other' : existingAddress.addressType,
                customAddressType: isCustom ? existingAddress.addressType : '',
            });
        } else {
            form.reset({
                fullName: '',
                phone: '',
                street: '',
                city: '',
                state: '',
                zip: '',
                country: 'India',
                addressType: 'Home',
                customAddressType: '',
            });
        }
    }, [existingAddress, form]);

    const onSubmit = async (data: AddressFormValues) => {
        setIsSubmitting(true);
        const finalAddressType = data.addressType === 'Other' ? data.customAddressType : data.addressType;
        
        try {
            const currentAddresses = user?.addresses || [];

            if (currentAddresses.some(addr => addr.addressType === finalAddressType && addr._id !== data._id)) {
                toast.error(`You already have an address saved as "${finalAddressType}".`);
                setIsSubmitting(false);
                return;
            }

            let updatedAddresses;
            const finalData = { ...data, addressType: finalAddressType };
            delete (finalData as any).customAddressType;

            if (data._id) { // Editing existing address
                updatedAddresses = currentAddresses.map(addr => addr._id === data._id ? finalData : addr);
            } else { // Adding new address
                updatedAddresses = [...currentAddresses, { ...finalData, _id: new Date().toISOString() }];
            }
            
            const response = await fetch(`/api/users/${userId}/profile`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ addresses: updatedAddresses }),
            });

            if (!response.ok) {
                const result = await response.json();
                throw new Error(result.message || "Failed to save address.");
            }
            
            onSaveSuccess();

        } catch (error: any) {
            toast.error(error.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField control={form.control} name="fullName" render={({ field }) => (<FormItem><FormLabel>Full Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)}/>
                <FormField control={form.control} name="phone" render={({ field }) => (<FormItem><FormLabel>Phone Number</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)}/>
                <FormField control={form.control} name="street" render={({ field }) => (<FormItem><FormLabel>Street Address</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)}/>
                <div className="grid grid-cols-2 gap-4">
                    <FormField control={form.control} name="city" render={({ field }) => (<FormItem><FormLabel>City</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)}/>
                    <FormField control={form.control} name="state" render={({ field }) => (<FormItem><FormLabel>State</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)}/>
                </div>
                    <div className="grid grid-cols-2 gap-4">
                    <FormField control={form.control} name="zip" render={({ field }) => (<FormItem><FormLabel>ZIP Code</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)}/>
                    <FormField control={form.control} name="country" render={({ field }) => (<FormItem><FormLabel>Country</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)}/>
                </div>

                    <FormField control={form.control} name="addressType" render={({ field }) => (
                    <FormItem className="space-y-3">
                        <FormLabel>Address Type</FormLabel>
                        <FormControl>
                            <RadioGroup
                                onValueChange={field.onChange}
                                value={field.value}
                                className="flex gap-4 items-center"
                            >
                                <FormItem className="flex items-center space-x-2 space-y-0">
                                    <FormControl><RadioGroupItem value="Home" /></FormControl>
                                    <FormLabel className="font-normal">Home</FormLabel>
                                </FormItem>
                                <FormItem className="flex items-center space-x-2 space-y-0">
                                    <FormControl><RadioGroupItem value="Office" /></FormControl>
                                    <FormLabel className="font-normal">Office</FormLabel>
                                </FormItem>
                                <FormItem className="flex items-center space-x-2 space-y-0">
                                    <FormControl><RadioGroupItem value="Other" /></FormControl>
                                    <FormLabel className="font-normal">Other</FormLabel>
                                </FormItem>
                            </RadioGroup>
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )} />

                {addressType === 'Other' && (
                        <FormField control={form.control} name="customAddressType" render={({ field }) => (
                        <FormItem>
                            <FormLabel>Custom Address Type</FormLabel>
                            <FormControl><Input placeholder="e.g., Weekend Home" {...field} /></FormControl>
                            <FormMessage />
                        </FormItem>
                    )}/>
                )}

                <div className="flex justify-end gap-2 pt-4">
                    <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>Cancel</Button>
                    <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting && <Loader className="mr-2 h-4 w-4" />}
                        {mode === 'create' ? 'Save Address' : 'Update Address'}
                    </Button>
                </div>
            </form>
        </Form>
    );
}
