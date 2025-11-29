
"use client";

import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Loader } from './ui/loader';
import { useAuth } from '@/hooks/use-auth';
import { PlusCircle, ArrowLeft } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ScrollArea } from './ui/scroll-area';
import { AddressForm } from './address-form';

interface AddressSelectionDialogProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  orderId: string;
  onSaveSuccess: () => void;
}

export function AddressSelectionDialog({ isOpen, setIsOpen, orderId, onSaveSuccess }: AddressSelectionDialogProps) {
    const { user, token, checkUser } = useAuth();
    const [selectedAddressId, setSelectedAddressId] = useState<string | undefined>(user?.addresses?.find(a => a.isDefault)?._id || user?.addresses?.[0]?._id);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [view, setView] = useState<'list' | 'form'>('list');

    useEffect(() => {
        // Reset to list view when dialog is reopened
        if (isOpen) {
            setView('list');
        }
    }, [isOpen]);

    const handleSave = async () => {
        if (!selectedAddressId) {
            toast.warning("Please select an address.");
            return;
        }
        setIsSubmitting(true);
        try {
            const response = await fetch(`/api/orders/${orderId}/update-address`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ addressId: selectedAddressId }),
            });

            if (!response.ok) {
                const result = await response.json();
                throw new Error(result.message || "Failed to update address.");
            }
            onSaveSuccess();

        } catch (error: any) {
            toast.error(error.message);
        } finally {
            setIsSubmitting(false);
        }
    };
    
    const handleNewAddressSaveSuccess = async () => {
        await checkUser(); // Re-fetch user data to get the new address
        toast.success("New address saved! You can now select it.");
        setView('list');
    }

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                     <div className="flex items-center gap-2">
                        {view === 'form' && (
                            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setView('list')}>
                                <ArrowLeft className="h-4 w-4" />
                            </Button>
                        )}
                        <DialogTitle>{view === 'list' ? 'Change Shipping Address' : 'Add New Address'}</DialogTitle>
                    </div>
                    <DialogDescription>
                        {view === 'list' ? 'Select a new shipping address for your order.' : 'Enter the details for your new address.'}
                    </DialogDescription>
                </DialogHeader>
                
                {view === 'list' ? (
                    <>
                        <ScrollArea className="max-h-[60vh] my-4">
                            <RadioGroup value={selectedAddressId} onValueChange={setSelectedAddressId} className="space-y-4 pr-6">
                                {user?.addresses?.map((address, index) => (
                                    <Label
                                        key={address._id || index}
                                        htmlFor={address._id || `address-${index}`}
                                        className={cn(
                                            "flex items-start gap-4 rounded-lg border p-4 cursor-pointer transition-all",
                                            selectedAddressId === address._id && "border-primary ring-2 ring-primary"
                                        )}
                                    >
                                        <RadioGroupItem value={address._id} id={address._id || `address-${index}`} className="mt-1" />
                                        <div className="flex-grow">
                                            <p className="font-semibold">{address.fullName}</p>
                                            <p className="text-muted-foreground text-sm">{address.street}, {address.city}, {address.state} - {address.zip}</p>
                                            <p className="text-muted-foreground text-sm">Mobile: {address.phone}</p>
                                        </div>
                                    </Label>
                                ))}
                            </RadioGroup>
                        </ScrollArea>
                        
                        <Button variant="outline" onClick={() => setView('form')}>
                            <PlusCircle className="mr-2 h-4 w-4" /> Add New Address
                        </Button>

                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>Cancel</Button>
                            <Button type="button" onClick={handleSave} disabled={isSubmitting || !selectedAddressId}>
                                {isSubmitting && <Loader className="mr-2 h-4 w-4" />}
                                Save Changes
                            </Button>
                        </DialogFooter>
                    </>
                ) : (
                    <ScrollArea className="max-h-[60vh] -mx-6 px-6">
                         <div className="py-4">
                             {user && (
                                <AddressForm 
                                    userId={user._id}
                                    onSaveSuccess={handleNewAddressSaveSuccess}
                                    onCancel={() => setView('list')}
                                />
                             )}
                         </div>
                    </ScrollArea>
                )}
            </DialogContent>
        </Dialog>
    );
}
