
"use client";

import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Loader } from './ui/loader';
import { useAuth } from '@/hooks/use-auth';

const addressFormSchema = z.object({
  _id: z.string().optional(),
  fullName: z.string().min(1, 'Full name is required'),
  phone: z.string().min(10, 'A valid phone number is required'),
  street: z.string().min(1, 'Street address is required'),
  city: z.string().min(1, 'City is required'),
  state: z.string().min(1, 'State is required'),
  zip: z.string().min(1, 'ZIP code is required'),
  country: z.string().min(1, 'Country is required'),
});

type AddressFormValues = z.infer<typeof addressFormSchema>;

interface AddressFormDialogProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  userId: string;
  existingAddress?: any; // The address to edit
  onSaveSuccess: () => void;
}

export function AddressFormDialog({ isOpen, setIsOpen, userId, existingAddress, onSaveSuccess }: AddressFormDialogProps) {
    const { token, user } = useAuth();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const form = useForm<AddressFormValues>({
        resolver: zodResolver(addressFormSchema),
        defaultValues: {
            country: 'India',
        }
    });

    useEffect(() => {
        if (isOpen) {
            if (existingAddress) {
                form.reset(existingAddress);
            } else {
                form.reset({
                    fullName: '',
                    phone: '',
                    street: '',
                    city: '',
                    state: '',
                    zip: '',
                    country: 'India',
                });
            }
        }
    }, [isOpen, existingAddress, form]);

    const onSubmit = async (data: AddressFormValues) => {
        setIsSubmitting(true);
        try {
            // Get current addresses and prepare the new list
            const currentAddresses = user?.addresses || [];
            let updatedAddresses;

            if (data._id) { // Editing existing address
                updatedAddresses = currentAddresses.map(addr => addr._id === data._id ? data : addr);
            } else { // Adding new address
                updatedAddresses = [...currentAddresses, data];
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
            
            toast.success("Address saved successfully!");
            onSaveSuccess();
            setIsOpen(false);

        } catch (error: any) {
            toast.error(error.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{existingAddress ? 'Edit Address' : 'Add New Address'}</DialogTitle>
                    <DialogDescription>
                        Enter the details for the shipping address.
                    </DialogDescription>
                </DialogHeader>
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
                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setIsOpen(false)} disabled={isSubmitting}>Cancel</Button>
                            <Button type="submit" disabled={isSubmitting}>
                                {isSubmitting && <Loader className="mr-2 h-4 w-4" />}
                                Save Address
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}

