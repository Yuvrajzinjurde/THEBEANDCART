

import { z } from 'zod';

const CATEGORIES = [
    "Men Fashion", "Women Fashion", "Home & Living", "Kids & Toys",
    "Personal Care & Wellness", "Mobiles & Tablets", "Consumer Electronics",
    "Appliances", "Automotive", "Beauty & Personal Care", "Home Utility",
    "Kids", "Grocery", "Women", "Home & Kitchen", "Health & Wellness",
    "Beauty & Makeup", "Personal Care", "Men'S Grooming",
    "Craft & Office Supplies", "Sports & Fitness", "Automotive Accessories",
    "Pet Supplies", "Office Supplies & Stationery",
    "Industrial & Scientific Products", "Musical Instruments", "Books",
    "Eye Utility", "Bags, Luggage & Travel Accessories", "Mens Personal Care & Grooming"
];


const VariantSchema = z.object({
  size: z.string().optional(),
  color: z.string().optional(),
  stock: z.coerce.number().min(0, "Stock must be 0 or more"),
});

export const ProductFormSchema = z.object({
  name: z.string().min(1, "Product name is required"),
  description: z.string().min(1, "Description is required"),
  mrp: z.coerce.number().min(0, "MRP must be a positive number").optional().or(z.literal('')),
  sellingPrice: z.coerce.number().min(0.01, "Selling price must be greater than 0"),
  category: z.string().min(1, "Category is required"),
  brand: z.string().min(1, "Product brand is required"), // The actual brand of the product, e.g., Nike
  storefront: z.string().min(1, "Storefront is required"), // The store this product belongs to, e.g., reeva
  images: z.array(z.string().url()).min(1, "At least one image is required"),
  
  // Represents a single product's stock if no variants are provided
  stock: z.coerce.number().min(0).optional(), 

  // Used for products with multiple variations (e.g., size, color)
  variants: z.array(VariantSchema),
}).refine(data => {
    if (data.mrp === undefined || data.mrp === null || data.mrp === '') return true;
    return data.sellingPrice <= data.mrp;
}, {
  message: "Selling price cannot be greater than MRP",
  path: ["sellingPrice"],
});


const ImageValueSchema = z.object({ value: z.string().url() });

export const ProductFormSchemaForClient = ProductFormSchema.extend({
  images: z.array(ImageValueSchema).min(1, "At least one image is required"),
});

export type ProductFormValues = z.infer<typeof ProductFormSchemaForClient>;


// AI Flow Schemas
export const AutofillProductInputSchema = z.object({
  productName: z
    .string()
    .describe('The name of the product to generate details for.'),
});
export type AutofillProductInput = z.infer<typeof AutofillProductInputSchema>;

export const AutofillProductOutputSchema = z.object({
  description: z.string().describe('The generated SEO-optimized product description. Should be around 100-150 words.'),
  mrp: z.number().describe('The suggested Maximum Retail Price (MRP). Should be higher than the selling price.'),
  sellingPrice: z.number().describe('The suggested selling price.'),
  category: z.enum(CATEGORIES as [string, ...string[]]).describe('The most relevant product category from the provided list.'),
  brand: z.string().describe("The product's actual brand name (e.g., Nike, Sony, Apple)."),
  stock: z.number().describe('A suggested initial stock quantity, between 50 and 200.'),
});
export type AutofillProductOutput = z.infer<typeof AutofillProductOutputSchema>;
