

"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default function OrdersPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>My Orders</CardTitle>
        <CardDescription>View your past and current orders.</CardDescription>
      </CardHeader>
      <CardContent>
        <p>Your order history will appear here.</p>
        <p className="text-muted-foreground pt-4">This page is under construction.</p>
      </CardContent>
    </Card>
  );
}
