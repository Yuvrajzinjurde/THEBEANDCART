
"use client";

import { ProductForm } from "@/components/admin/product-form";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

export default function NewProductPage() {
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
        <CardContent className="pt-6">
            <ProductForm mode="create" />
        </CardContent>
        </Card>
    </div>
  );
}
