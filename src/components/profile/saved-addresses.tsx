
"use client";

import React, { useState, useEffect } from 'react';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "react-toastify";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader } from "@/components/ui/loader";
import { Checkbox } from "@/components/ui/checkbox";
import { PlusCircle, Trash2, Edit, Home, Briefcase, Star, X } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import type { IUser, IAddress } from "@/models/user.model";
import { useAuth } from '@/hooks/use-auth';

const addressSchema = z.object({
  _id: z.string().optional(),
  name: z.string().min(1, "Name is required"),
  phone: z.string().min(10, "A valid phone number is required"),
  street: z.string().min(1, "Street address is required"),
  city: z.string().min(1, "City is required"),
  state: z.string().min(1, "State is required"),
  zip: z.string().min(6, "A valid 6-digit ZIP/PIN code is required").max(6),
  country: z.string().min(1, "Country is required"),
  type: z.enum(['Home', 'Office', 'Other']),
  otherType: z.string().optional(),
  isDefault: z.boolean(),
}).refine(data => {
    if (data.type === 'Other') {
        return !!data.otherType && data.otherType.length > 0;
    }
    return true;
}, { message: "Please specify the address type", path: ["otherType"] });

type AddressFormValues = z.infer<typeof addressSchema>;

const AddressForm = ({ address, onSave, onCancel }: { address?: AddressFormValues; onSave: (data: AddressFormValues) => void; onCancel: () => void; }) => {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isFetchingPincode, setIsFetchingPincode] = useState(false);
    
    const form = useForm<AddressFormValues>({
        resolver: zodResolver(addressSchema),
        defaultValues: address || {
            name: '', phone: '', street: '', city: '', state: '', zip: '', country: 'India', type: 'Home', isDefault: false
        }
    });
    
    const addressType = form.watch('type');
    const zipCode = form.watch('zip');

    useEffect(() => {
        const fetchPincodeDetails = async () => {
            if (zipCode && zipCode.length === 6) {
                setIsFetchingPincode(true);
                try {
                    const response = await fetch(`https://api.postalpincode.in/pincode/${zipCode}`);
                    const data = await response.json();
                    if (data && data[0].Status === "Success") {
                        const postOffice = data[0].PostOffice[0];
                        form.setValue('city', postOffice.District, { shouldValidate: true });
                        form.setValue('state', postOffice.State, { shouldValidate: true });
                        form.setValue('country', postOffice.Country, { shouldValidate: true });
                    } else {
                        toast.error("Invalid PIN code. Please check and try again.");
                    }
                } catch (error) {
                    console.error("Failed to fetch PIN code details", error);
                    toast.error("Could not fetch address details for this PIN code.");
                } finally {
                    setIsFetchingPincode(false);
                }
            }
        };
        const handler = setTimeout(() => {
            fetchPincodeDetails();
        }, 500); // Debounce the API call

        return () => clearTimeout(handler);
    }, [zipCode, form]);

    const handleFormSubmit = (data: AddressFormValues) => {
        setIsSubmitting(true);
        onSave(data);
        setIsSubmitting(false);
    };

    return (
        <Card className="mt-4 bg-slate-50">
            <CardHeader>
                <CardTitle>{address ? 'Edit Address' : 'Add New Address'}</CardTitle>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <FormField control={form.control} name="name" render={({ field }) => (<FormItem><FormLabel>Full Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                            <FormField control={form.control} name="phone" render={({ field }) => (<FormItem><FormLabel>Phone Number</FormLabel><FormControl><Input type="tel" {...field} /></FormControl><FormMessage /></FormItem>)} />
                        </div>
                        <FormField control={form.control} name="street" render={({ field }) => (<FormItem><FormLabel>Street Address, Area, Colony</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                        
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <FormField control={form.control} name="zip" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>PIN Code</FormLabel>
                                    <div className="relative">
                                        <FormControl><Input {...field} /></FormControl>
                                        {isFetchingPincode && <Loader className="absolute right-2 top-1/2 -translate-y-1/2 h-5 w-5" />}
                                    </div>
                                    <FormMessage />
                                </FormItem>
                            )} />
                            <FormField control={form.control} name="city" render={({ field }) => (<FormItem><FormLabel>City / District</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                            <FormField control={form.control} name="state" render={({ field }) => (<FormItem><FormLabel>State</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                        </div>
                        <FormField control={form.control} name="country" render={({ field }) => (<FormItem className="hidden"><FormLabel>Country</FormLabel><FormControl><Input {...field} readOnly /></FormControl><FormMessage /></FormItem>)} />

                        <FormField control={form.control} name="type" render={({ field }) => (
                            <FormItem><FormLabel>Address Type</FormLabel>
                                <FormControl>
                                    <RadioGroup onValueChange={field.onChange} value={field.value} className="flex items-center gap-4">
                                        <FormItem className="flex items-center space-x-2"><FormControl><RadioGroupItem value="Home" /></FormControl><FormLabel className="font-normal">Home</FormLabel></FormItem>
                                        <FormItem className="flex items-center space-x-2"><FormControl><RadioGroupItem value="Office" /></FormControl><FormLabel className="font-normal">Office</FormLabel></FormItem>
                                        <FormItem className="flex items-center space-x-2"><FormControl><RadioGroupItem value="Other" /></FormControl><FormLabel className="font-normal">Other</FormLabel></FormItem>
                                    </RadioGroup>
                                </FormControl>
                            </FormItem>
                        )} />
                        {addressType === 'Other' && (
                            <FormField control={form.control} name="otherType" render={({ field }) => (<FormItem><FormLabel>Please Specify</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                        )}
                        <FormField control={form.control} name="isDefault" render={({ field }) => (<FormItem className="flex items-center gap-2 pt-2"><FormControl><Checkbox checked={field.checked} onCheckedChange={field.onChange} /></FormControl><Label>Set as default address</Label></FormItem>)} />
                        
                        <div className="flex justify-end gap-2 pt-4">
                            <Button type="button" variant="ghost" onClick={onCancel}>Cancel</Button>
                            <Button type="submit" disabled={isSubmitting}>{isSubmitting && <Loader className="mr-2" />} Save Address</Button>
                        </div>
                    </form>
                </Form>
            </CardContent>
        </Card>
    )
}

interface SavedAddressesProps {
    user: IUser;
    onUserUpdate: (updatedUser: IUser) => void;
}

export function SavedAddresses({ user, onUserUpdate }: SavedAddressesProps) {
    const { token } = useAuth();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [editingAddressId, setEditingAddressId] = useState<string | null>(null);
    const [isAddingNew, setIsAddingNew] = useState(false);
    
    const [isAlertOpen, setIsAlertOpen] = useState(false);
    const [addressToDelete, setAddressToDelete] = useState<string | null>(null);
    
    const openForm = (addressId?: string) => {
        setEditingAddressId(addressId || null);
        setIsAddingNew(!addressId);
    };

    const closeForm = () => {
        setEditingAddressId(null);
        setIsAddingNew(false);
    };

    const saveAddress = async (formData: AddressFormValues) => {
        let updatedAddresses: IAddress[];
        if (formData._id) { // Editing existing address
            updatedAddresses = (user.addresses || []).map(a => a._id.toString() === formData._id ? formData as IAddress : a);
        } else { // Adding new address
            updatedAddresses = [...(user.addresses || []), formData as IAddress];
        }

        await updateBackend({ addresses: updatedAddresses });
        closeForm();
    };

    const deleteAddress = async () => {
        if (!addressToDelete) return;
        const updatedAddresses = user.addresses.filter(a => a._id.toString() !== addressToDelete);
        await updateBackend({ addresses: updatedAddresses });
        setAddressToDelete(null);
        setIsAlertOpen(false);
    };

    const setDefault = async (addressId: string) => {
        const updatedAddresses = user.addresses.map(a => ({
            ...a,
            isDefault: a._id.toString() === addressId,
        }));
        await updateBackend({ addresses: updatedAddresses });
    };

    const updateBackend = async (payload: { addresses: IAddress[] }) => {
        setIsSubmitting(true);
        try {
            const response = await fetch('/api/user/profile', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(payload),
            });
            const result = await response.json();
            if (!response.ok) throw new Error(result.message);
            onUserUpdate(result.user);
            toast.success("Addresses updated successfully!");
        } catch (error: any) {
            toast.error(error.message || "Failed to update addresses.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const getIcon = (type: string) => {
        if (type === 'Home') return <Home className="h-4 w-4" />;
        if (type === 'Office') return <Briefcase className="h-4 w-4" />;
        return null;
    }

    const currentEditingAddress = editingAddressId ? user.addresses.find(a => a._id.toString() === editingAddressId) : undefined;
    
    return (
        <Card className="shadow-lg">
            <CardHeader className="flex flex-row items-start justify-between">
                <div>
                    <CardTitle>Saved Addresses</CardTitle>
                    <CardDescription>Manage your shipping and billing addresses.</CardDescription>
                </div>
                 {!isAddingNew && !editingAddressId && (
                    <Button onClick={() => openForm()}><PlusCircle className="mr-2 h-4 w-4" /> Add New Address</Button>
                 )}
            </CardHeader>
            <CardContent>
                {isSubmitting && <div className="absolute inset-0 bg-white/50 flex items-center justify-center"><Loader /></div>}
                
                {isAddingNew && (
                    <AddressForm onSave={saveAddress} onCancel={closeForm} />
                )}

                <div className="space-y-4 mt-4">
                    {user.addresses && user.addresses.length > 0 ? (
                        user.addresses.map(addr => (
                             editingAddressId === addr._id.toString() ? (
                                 <AddressForm key={addr._id as string} address={currentEditingAddress} onSave={saveAddress} onCancel={closeForm} />
                             ) : (
                                <div key={addr._id as string} className={cn("p-4 border rounded-lg flex justify-between items-start", addr.isDefault && "border-primary border-2")}>
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <div className="flex items-center gap-1 font-semibold">
                                                {getIcon(addr.type)}
                                                <span>{addr.type === 'Other' ? addr.otherType : addr.type}</span>
                                            </div>
                                            {addr.isDefault && <div className="flex items-center gap-1 text-xs text-amber-600 font-bold"><Star className="h-3 w-3 fill-amber-500" />Default</div>}
                                        </div>
                                        <address className="text-sm text-gray-600 not-italic">
                                            <p className="font-bold text-gray-800">{addr.name}</p>
                                            <p>{addr.street}, {addr.city}</p>
                                            <p>{addr.state} - {addr.zip}, {addr.country}</p>
                                            <p className="mt-1">Phone: {addr.phone}</p>
                                        </address>
                                    </div>
                                    <div className="flex flex-col gap-2">
                                        <Button variant="outline" size="sm" onClick={() => openForm(addr._id as string)}><Edit className="h-4 w-4" /></Button>
                                        <Button variant="destructive" size="sm" onClick={() => { setAddressToDelete(addr._id as string); setIsAlertOpen(true); }}><Trash2 className="h-4 w-4" /></Button>
                                        {!addr.isDefault && <Button variant="secondary" size="sm" onClick={() => setDefault(addr._id as string)}>Set Default</Button>}
                                    </div>
                                </div>
                             )
                        ))
                    ) : !isAddingNew && (
                        <p className="text-sm text-gray-500 text-center py-8">No saved addresses. Add one to get started!</p>
                    )}
                </div>

                <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                            <AlertDialogDescription>This action will permanently delete this address. This cannot be undone.</AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={deleteAddress}>Delete</AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </CardContent>
        </Card>
    );
}
