

"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default function BillingPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Billing</CardTitle>
        <CardDescription>Manage your billing information and view invoices.</CardDescription>
      </CardHeader>
      <CardContent>
        <p>Your billing details and past invoices will appear here.</p>
        <p className="text-muted-foreground pt-4">This page is under construction.</p>
      </CardContent>
    </Card>
  );
}
