
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Package } from "lucide-react";

export default function OrdersPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Package className="mr-2" />
          Orders
        </CardTitle>
        <CardDescription>Manage and view customer orders.</CardDescription>
      </CardHeader>
      <CardContent>
        <p>Orders page is under construction.</p>
      </CardContent>
    </Card>
  );
}
