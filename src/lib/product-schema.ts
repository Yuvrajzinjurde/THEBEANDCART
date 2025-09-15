
import { z } from 'zod';

const VariantSchema = z.object({
  size: z.string().optional(),
  color: z.string().optional(),
  stock: z.coerce.number().min(0, "Stock must be 0 or more"),
});

export const ProductFormSchema = z.object({
  name: z.string().min(1, "Product name is required"),
  description: z.string().min(1, "Description is required"),
  mrp: z.coerce.number().min(0, "MRP must be a positive number").optional(),
  sellingPrice: z.coerce.number().min(0.01, "Selling price must be greater than 0"),
  category: z.string().min(1, "Category is required"),
  brand: z.string().min(1, "Product brand is required"), // The actual brand of the product, e.g., Nike
  storefront: z.string().min(1, "Storefront is required"), // The store this product belongs to, e.g., reeva
  images: z.array(z.string().url()).min(1, "At least one image is required"),
  
  // Represents a single product's stock if no variants are provided
  stock: z.coerce.number().min(0).optional(), 

  // Used for products with multiple variations (e.g., size, color)
  variants: z.array(VariantSchema),
}).refine(data => !data.mrp || data.sellingPrice <= data.mrp, {
  message: "Selling price cannot be greater than MRP",
  path: ["sellingPrice"],
});


export type ProductFormValues = z.infer<typeof ProductFormSchema>;
