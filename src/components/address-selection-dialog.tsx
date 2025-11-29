
"use client";

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Loader } from './ui/loader';
import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';
import { PlusCircle, Edit } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ScrollArea } from './ui/scroll-area';

interface AddressSelectionDialogProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  orderId: string;
  onSaveSuccess: () => void;
}

export function AddressSelectionDialog({ isOpen, setIsOpen, orderId, onSaveSuccess }: AddressSelectionDialogProps) {
    const { user, token } = useAuth();
    const router = useRouter();
    const [selectedAddressId, setSelectedAddressId] = useState<string | undefined>(user?.addresses?.[0]?._id);
    const [isSubmitting, setIsSubmitting] = useState(false);

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

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Change Shipping Address</DialogTitle>
                    <DialogDescription>
                        Select a new shipping address for your order.
                    </DialogDescription>
                </DialogHeader>
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
                
                <Button variant="outline" onClick={() => router.push('/dashboard/addresses/new')}>
                    <PlusCircle className="mr-2 h-4 w-4" /> Add New Address
                </Button>

                <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>Cancel</Button>
                    <Button type="button" onClick={handleSave} disabled={isSubmitting}>
                        {isSubmitting && <Loader className="mr-2 h-4 w-4" />}
                        Save Changes
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

