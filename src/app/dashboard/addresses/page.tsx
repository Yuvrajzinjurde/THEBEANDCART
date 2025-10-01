
"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default function AddressesPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Saved Addresses</CardTitle>
        <CardDescription>Manage your shipping and billing addresses.</CardDescription>
      </CardHeader>
      <CardContent>
        <p>Your saved addresses will be displayed here.</p>
        <p className="text-muted-foreground pt-4">This page is under construction.</p>
      </CardContent>
    </Card>
  );
}
