
"use client";

import { BrandForm } from "@/components/admin/brand-form";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

export default function NewBrandPage() {
    const router = useRouter();
  return (
    <div className="space-y-4">
        <div className="flex items-center gap-4">
            <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => router.back()}>
                <ArrowLeft className="h-4 w-4" />
                <span className="sr-only">Back</span>
            </Button>
            <h1 className="text-xl font-bold">Create New Brand</h1>
        </div>
        <Card>
        <CardHeader>
            <CardTitle>Brand Details</CardTitle>
            <CardDescription>
            Fill out the form below to add a new brand to your platform.
            </CardDescription>
        </CardHeader>
        <CardContent>
            <BrandForm mode="create" />
        </CardContent>
        </Card>
    </div>
  );
}
