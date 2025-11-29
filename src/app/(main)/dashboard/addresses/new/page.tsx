
"use client";

import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { AddressForm } from "@/components/address-form";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { Loader } from "@/components/ui/loader";

export default function NewAddressPage() {
    const router = useRouter();
    const { user, checkUser, loading } = useAuth();
    
    const handleSaveSuccess = () => {
        toast.success("Address added successfully!");
        checkUser();
        router.push('/dashboard/addresses');
    }
    
    if(loading || !user) {
        return <div className="flex h-full w-full items-center justify-center"><Loader className="h-8 w-8"/></div>
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-4">
                <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => router.back()}>
                    <ArrowLeft className="h-4 w-4" />
                    <span className="sr-only">Back</span>
                </Button>
                <h1 className="text-xl font-bold">Add New Address</h1>
            </div>
            <Card>
                <CardHeader>
                    <CardTitle>New Shipping Address</CardTitle>
                    <CardDescription>
                        Enter the details for your new shipping address.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <AddressForm 
                        userId={user._id}
                        onSaveSuccess={handleSaveSuccess}
                        onCancel={() => router.push('/dashboard/addresses')}
                    />
                </CardContent>
            </Card>
        </div>
    )
}
