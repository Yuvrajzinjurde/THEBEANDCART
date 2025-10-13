
import { z } from 'zod';

const FileValueSchema = z.object({ value: z.string().url() });

const VariantSchema = z.object({
  size: z.string().optional(),
  color: z.string().optional(),
  sku: z.string().min(1, "SKU is required for variants."),
  stock: z.coerce.number().min(0, "Stock must be 0 or more"),
  images: z.array(z.string().url()).optional(),
  videos: z.array(z.string().url()).optional(),
});

const ServerVariantSchema = VariantSchema;

// Base schema without the refinement, for merging.
const BaseProductFormSchema = z.object({
  name: z.string().min(1, "Product name is required"),
  description: z.string().min(1, "Description is required"),
  mainImage: z.string().url("A main image is required.").min(1, "A main image is required."),
  purchasePrice: z.coerce.number().min(0.01, "Purchase price must be greater than 0"),
  mrp: z.coerce.number().min(0, "MRP must be a positive number").optional().or(z.literal('')),
  sellingPrice: z.coerce.number().min(0.01, "Selling price must be greater than 0"),
  category: z.string().min(1, "Category is required"),
  brand: z.string().min(1, "Product brand is required"),
  storefront: z.string().min(1, "Storefront is required"),
  sku: z.string().optional(),
  images: z.array(z.string().url()).optional(),
  videos: z.array(z.string().url()).optional(),
  keywords: z.array(z.string()).optional(),
  stock: z.coerce.number().min(0).optional(),
  returnPeriod: z.coerce.number().min(0).optional(),
  variants: z.array(ServerVariantSchema),
});


// Schema for client-side form which uses { value: string } for images/videos
export const ProductFormSchemaForClient = BaseProductFormSchema.merge(z.object({
  images: z.array(FileValueSchema).optional(),
  videos: z.array(FileValueSchema).optional(),
  keywords: z.array(z.object({ value: z.string() })).optional(),
  variants: z.array(VariantSchema.extend({
      images: z.array(FileValueSchema).optional(),
      videos: z.array(FileValueSchema).optional(),
  })),
}))
.refine(data => {
    if (data.mrp === undefined || data.mrp === null || data.mrp === '') return true;
    return data.sellingPrice <= data.mrp;
}, {
  message: "Selling price cannot be greater than MRP",
  path: ["sellingPrice"],
})
.refine(data => {
    if (data.sellingPrice && data.purchasePrice) {
        return data.sellingPrice > data.purchasePrice;
    }
    return true;
}, {
    message: "Selling price must be greater than the purchase price.",
    path: ["sellingPrice"],
})
.refine(data => {
    if (!data.variants || data.variants.length === 0) {
        return !!data.sku && data.sku.length > 0;
    }
    return true;
}, {
    message: "SKU is required for products without variants.",
    path: ["sku"],
});


// Server-side schema for POST/PUT requests
export const ProductFormSchema = BaseProductFormSchema;


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
  category: z.string().describe('The most relevant product category from a dynamic list that will be provided.'),
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


export const SuggestPriceInputSchema = z.object({
  productName: z.string().describe('The name of the product.'),
  description: z.string().describe('The description of the product.'),
  category: z.string().describe('The product category.'),
  purchasePrice: z.number().describe('The cost price at which the product was purchased.'),
  mainImage: z
    .string()
    .describe(
      "The primary image of the product, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type SuggestPriceInput = z.infer<typeof SuggestPriceInputSchema>;

export const SuggestPriceOutputSchema = z.object({
  suggestedPrice: z.number().describe('The suggested selling price for the product.'),
});
export type SuggestPriceOutput = z.infer<typeof SuggestPriceOutputSchema>;
