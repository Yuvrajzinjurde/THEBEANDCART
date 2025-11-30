

"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default function SettingsPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Settings</CardTitle>
        <CardDescription>Manage your account settings.</CardDescription>
      </CardHeader>
      <CardContent>
        <p>Account settings options will be available here.</p>
        <p className="text-muted-foreground pt-4">This page is under construction.</p>
      </CardContent>
    </Card>
  );
}
