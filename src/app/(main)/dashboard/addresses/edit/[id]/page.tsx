
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { AddressForm } from "@/components/address-form";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { Loader } from "@/components/ui/loader";
import type { IAddress } from "@/models/user.model";

export default function EditAddressPage() {
    const router = useRouter();
    const params = useParams();
    const { user, checkUser, loading } = useAuth();
    const addressId = params.id as string;

    const [addressToEdit, setAddressToEdit] = useState<IAddress | null>(null);

    useEffect(() => {
        if(user?.addresses) {
            const foundAddress = user.addresses.find(a => a._id === addressId);
            if (foundAddress) {
                setAddressToEdit(foundAddress);
            } else {
                toast.error("Address not found.");
                router.push('/dashboard/addresses');
            }
        }
    }, [user, addressId, router]);
    
    const handleSaveSuccess = () => {
        toast.success("Address updated successfully!");
        checkUser();
        router.push('/dashboard/addresses');
    }
    
    if(loading || !user || !addressToEdit) {
        return <div className="flex h-full w-full items-center justify-center"><Loader className="h-8 w-8"/></div>
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-4">
                <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => router.back()}>
                    <ArrowLeft className="h-4 w-4" />
                    <span className="sr-only">Back</span>
                </Button>
                <h1 className="text-xl font-bold">Edit Address</h1>
            </div>
            <Card>
                <CardHeader>
                    <CardTitle>Edit Shipping Address</CardTitle>
                    <CardDescription>
                        Update the details for your shipping address.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <AddressForm 
                        userId={user._id}
                        existingAddress={addressToEdit}
                        onSaveSuccess={handleSaveSuccess}
                        onCancel={() => router.push('/dashboard/addresses')}
                    />
                </CardContent>
            </Card>
        </div>
    )
}
