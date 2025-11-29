
"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { MapPin, Edit, Trash2, PlusCircle } from "lucide-react";
import { toast } from "sonner";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import type { IAddress } from "@/models/user.model";
import { AddressFormDialog } from "@/components/address-form-dialog";

export default function AddressesPage() {
  const { user, token, checkUser } = useAuth();
  const [isAddressFormOpen, setIsAddressFormOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<IAddress | null>(null);

  const handleEditAddress = (address: IAddress) => {
    setEditingAddress(address);
    setIsAddressFormOpen(true);
  };

  const handleAddNewAddress = () => {
    setEditingAddress(null);
    setIsAddressFormOpen(true);
  };
  
  const handleDeleteAddress = async (addressId: string) => {
    if (!user) return;
    
    const updatedAddresses = user.addresses?.filter(addr => addr._id !== addressId);

    try {
      const response = await fetch(`/api/users/${user._id}/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ addresses: updatedAddresses }),
      });

      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.message || "Failed to delete address.");
      }
      
      toast.success("Address removed successfully!");
      await checkUser();

    } catch (error: any) {
      toast.error(error.message);
    }
  };

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2"><MapPin/> Saved Addresses</CardTitle>
            <CardDescription>Manage your shipping addresses for a faster checkout.</CardDescription>
          </div>
           <Button variant="outline" onClick={handleAddNewAddress}>
              <PlusCircle className="mr-2 h-4 w-4" /> Add New Address
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {user?.addresses && user.addresses.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {user.addresses.map((address, index) => (
                <div key={address._id || index} className="border p-4 rounded-lg flex items-start justify-between bg-background">
                  <div>
                    <p className="font-semibold capitalize">{address.addressType}</p>
                    <p className="text-muted-foreground text-sm">{address.street}, {address.city}, {address.state} - {address.zip}</p>
                    <p className="text-muted-foreground text-sm">Contact: {address.fullName}, {address.phone}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="icon" onClick={() => handleEditAddress(address)}><Edit className="h-4 w-4" /></Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon" className="text-destructive"><Trash2 className="h-4 w-4" /></Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                          <AlertDialogDescription>This action will permanently delete this address.</AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDeleteAddress(address._id)}>Delete</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 border-2 border-dashed rounded-lg">
                <p className="text-muted-foreground">No saved addresses.</p>
                 <Button variant="link" onClick={handleAddNewAddress}>Add your first address</Button>
            </div>
          )}
        </CardContent>
      </Card>
      <AddressFormDialog
        isOpen={isAddressFormOpen}
        setIsOpen={setIsAddressFormOpen}
        userId={user?._id || ''}
        existingAddress={editingAddress}
        onSaveSuccess={checkUser}
      />
    </>
  );
}
