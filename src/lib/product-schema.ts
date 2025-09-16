

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

const FileValueSchema = z.object({ value: z.string().url() });

const VariantSchema = z.object({
  size: z.string().optional(),
  color: z.string().optional(),
  stock: z.coerce.number().min(0, "Stock must be 0 or more"),
  images: z.array(FileValueSchema).min(1, "Each variant must have at least one image."),
  videos: z.array(FileValueSchema).optional(),
});

const ServerVariantSchema = VariantSchema.extend({
    images: z.array(z.string().url()).min(1, "Each variant must have at least one image."),
    videos: z.array(z.string().url()).optional(),
})

// Base schema without the refinement, for merging.
const BaseProductFormSchema = z.object({
  name: z.string().min(1, "Product name is required"),
  description: z.string().min(1, "Description is required"),
  mrp: z.coerce.number().min(0, "MRP must be a positive number").optional().or(z.literal('')),
  sellingPrice: z.coerce.number().min(0.01, "Selling price must be greater than 0"),
  category: z.string().min(1, "Category is required"),
  brand: z.string().min(1, "Product brand is required"),
  storefront: z.string().min(1, "Storefront is required"),
  images: z.array(z.string().url()).optional(),
  videos: z.array(z.string().url()).optional(),
  keywords: z.array(z.string()).optional(),
  stock: z.coerce.number().min(0).optional(),
  variants: z.array(ServerVariantSchema),
});


// Schema for client-side form which uses { value: string } for images/videos
export const ProductFormSchemaForClient = BaseProductFormSchema.merge(z.object({
  images: z.array(FileValueSchema).optional(),
  videos: z.array(FileValueSchema).optional(),
  keywords: z.array(z.object({ value: z.string() })).optional(),
  variants: z.array(VariantSchema),
}))
.refine(data => {
    if (data.mrp === undefined || data.mrp === null || data.mrp === '') return true;
    return data.sellingPrice <= data.mrp;
}, {
  message: "Selling price cannot be greater than MRP",
  path: ["sellingPrice"],
})
.refine(data => {
    // If there are no variants, there must be top-level images.
    if (data.variants.length === 0) {
        return Array.isArray(data.images) && data.images.length > 0;
    }
    return true;
}, {
    message: "A product must have at least one image.",
    path: ["images"],
});


// Server-side schema for POST/PUT requests
export const ProductFormSchema = BaseProductFormSchema.refine(data => {
    if (data.variants.length === 0) {
        return Array.isArray(data.images) && data.images.length > 0;
    }
    return true;
}, {
    message: "A product must have at least one image.",
    path: ["images"],
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


export const GenerateTagsInputSchema = z.object({
  productName: z.string().describe('The name of the product.'),
  description: z.string().describe('The description of the product.'),
});
export type GenerateTagsInput = z.infer<typeof GenerateTagsInputSchema>;

export const GenerateTagsOutputSchema = z.object({
  tags: z.array(z.string()).describe('An array of 5-7 relevant, single-word tags for the product.'),
});
export type GenerateTagsOutput = z.infer<typeof GenerateTagsOutputSchema>;
