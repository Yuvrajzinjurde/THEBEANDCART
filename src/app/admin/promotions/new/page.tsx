
"use client";

import { CouponForm } from "@/components/admin/coupon-form";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, TicketPercent } from "lucide-react";
import { useRouter } from "next/navigation";

export default function NewCouponPage() {
    const router = useRouter();
  return (
    <div className="space-y-4">
        <div className="flex items-center gap-4">
             <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => router.back()}>
                <ArrowLeft className="h-4 w-4" />
                <span className="sr-only">Back</span>
            </Button>
        </div>
        <Card>
        <CardHeader>
            <CardTitle className="flex items-center gap-2">
                <TicketPercent />
                Create a New Coupon
            </CardTitle>
            <CardDescription>
            Fill out the form below to add a new promotion to your platform.
            </CardDescription>
        </CardHeader>
        <CardContent>
            <CouponForm mode="create" />
        </CardContent>
        </Card>
    </div>
  );
}
