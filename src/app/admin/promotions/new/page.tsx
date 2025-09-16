
import { CouponForm } from "@/components/admin/coupon-form";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { TicketPercent } from "lucide-react";

export default function NewCouponPage() {
  return (
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
  );
}
