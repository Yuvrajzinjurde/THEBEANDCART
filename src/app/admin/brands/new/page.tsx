
import { BrandForm } from "@/components/admin/brand-form";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";

export default function NewBrandPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Create a New Brand</CardTitle>
        <CardDescription>
          Fill out the form below to add a new brand to your platform.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <BrandForm mode="create" />
      </CardContent>
    </Card>
  );
}
