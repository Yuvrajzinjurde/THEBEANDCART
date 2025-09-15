
import { ProductForm } from "@/components/admin/product-form";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";

export default function NewProductPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Create a New Product / Catalog</CardTitle>
        <CardDescription>
          Fill out the form below to add a new product to your inventory. Add variants to create a catalog.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ProductForm mode="create" />
      </CardContent>
    </Card>
  );
}
