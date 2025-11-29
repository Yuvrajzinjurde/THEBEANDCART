
import { z } from 'zod';

export const bannerSchema = z.object({
  title: z.string().optional(),
  description: z.string().optional(),
  imageUrl: z.string().url("Must be a valid URL or data URI.").min(1, "Image is required"),
  imageHint: z.string().min(1, "Image hint is required"),
  buttonLink: z.string().url().optional().or(z.literal('')),
});

const reviewSchema = z.object({
  customerName: z.string().min(1, "Customer name is required"),
  rating: z.coerce.number().min(1).max(5, "Rating must be between 1 and 5"),
  reviewText: z.string().min(1, "Review text is required"),
  customerAvatarUrl: z.string().url("Must be a valid URL or data URI.").min(1, "Avatar is required"),
});

const promoBannerSchema = z.object({
  title: z.string().optional(),
  description: z.string().optional(),
  imageUrl: z.string().optional(),
  imageHint: z.string().optional(),
  buttonText: z.string().optional(),
  buttonLink: z.string().url().optional().or(z.literal('')),
});

const categoryGridItemSchema = z.object({
    category: z.string().min(1, "Category is required."),
    title: z.string().min(1, "Title is required."),
    description: z.string().min(1, "Description is required."),
    images: z.array(z.object({
        url: z.string().url("Must be a valid URL.").min(1, "Image URL is required."),
        hint: z.string().optional(),
    })).max(8, "You can upload a maximum of 8 images per category."),
    buttonLink: z.string().min(1, "Button link is required."),
});

export const themeSchema = z.object({
    name: z.string(),
    primary: z.string(),
    background: z.string(),
    accent: z.string(),
});

export type Theme = z.infer<typeof themeSchema>;

const SocialLinksSchema = z.object({
    twitter: z.string().url("Invalid Twitter URL").or(z.literal('')).optional(),
    facebook: z.string().url("Invalid Facebook URL").or(z.literal('')).optional(),
    instagram: z.string().url("Invalid Instagram URL").or(z.literal('')).optional(),
    linkedin: z.string().url("Invalid LinkedIn URL").or(z.literal('')).optional(),
});

export const BrandFormSchema = z.object({
  displayName: z.string().min(1, "Display name is required"),
  permanentName: z.string().min(1, "Permanent name is required").regex(/^[a-z0-9-]+$/, "Permanent name can only contain lowercase letters, numbers, and hyphens."),
  logoUrl: z.string().url("Must be a valid URL or data URI.").min(1, "Logo is required"),
  banners: z.array(bannerSchema).min(1, "At least one banner is required"),
  themeName: z.string(),
  theme: themeSchema,
  reviews: z.array(reviewSchema).optional(),
  promoBanner: promoBannerSchema.extend({
    title: z.string().optional(),
    description: z.string().optional(),
    buttonText: z.string().optional(),
  }).optional(),
  categories: z.array(z.string()).optional(),
  socials: SocialLinksSchema.optional(),
  categoryGrid: z.array(categoryGridItemSchema).optional(),
});

export type BrandFormValues = z.infer<typeof BrandFormSchema>;

export const PlatformSettingsValidationSchema = z.object({
  platformName: z.string().min(1, "Platform name is required."),
  platformDescription: z.string().optional(),
  platformLogoUrl: z.string().url("Must be a valid URL.").optional().or(z.literal('')),
  platformFaviconUrl: z.string().url("Must be a valid URL.").optional().or(z.literal('')),
  platformThemeName: z.string().min(1, "A theme must be selected."),
  socials: SocialLinksSchema.optional(),
  aiEnabled: z.boolean().optional(),
  hamperFeatureEnabled: z.boolean().optional(),
  promoBannerEnabled: z.boolean().optional(),
  cancellableOrderStatus: z.enum(['pending', 'ready-to-ship']).optional(),
  heroBanners: z.array(bannerSchema).min(1, "At least one hero banner is required."),
<<<<<<< HEAD
  featuredCategories: z.array(z.string()).optional(),
  promoBanner: promoBannerSchema.optional(),
=======
  featuredCategories: z.array(z.object({ name: z.string() })).optional(),
  featuredBrands: z.array(z.object({ name: z.string() })).optional(),
  promoBanner: promoBannerSchema.extend({
    title: z.string().optional(),
    description: z.string().optional(),
    buttonText: z.string().optional(),
  }).optional(),
  offers: z.array(offerSchema).optional(),
>>>>>>> 81a0047e5ec12db80da74c44e0a5c54d6cfcaa25
});

export type PlatformSettingsValues = z.infer<typeof PlatformSettingsValidationSchema>;

export const CartSettingsSchema = z.object({
    freeShippingThreshold: z.coerce.number().min(0, "Threshold must be a positive number"),
    extraDiscountThreshold: z.coerce.number().min(0, "Threshold must be a positive number"),
    freeGiftThreshold: z.coerce.number().min(0, "Threshold must be a positive number"),
});

export type CartSettingsValues = z.infer<typeof CartSettingsSchema>;

export const themeColors: (Theme)[] = [
    { name: 'Jewelry', primary: '45 92% 63%', background: '35 10% 98%', accent: '39 88% 93%' },
    { name: 'Blue', primary: '217.2 91.2% 59.8%', background: '0 0% 100%', accent: '210 40% 96.1%' },
    { name: 'Green', primary: '142.1 76.2% 36.3%', background: '0 0% 100%', accent: '145 63.4% 92.5%' },
    { name: 'Orange', primary: '24.6 95% 53.1%', background: '0 0% 100%', accent: '20 92.3% 93.5%' },
    { name: 'Purple', primary: '262.1 83.3% 57.8%', background: '0 0% 100%', accent: '260 100% 96.7%' },
    { name: 'Teal', primary: '175 75% 40%', background: '0 0% 100%', accent: '175 50% 95%' },
    { name: 'Rose', primary: '346.8 77.2% 49.8%', background: '0 0% 100%', accent: '350 100% 96.9%' },
    { name: 'Yellow', primary: '47.9 95.8% 53.1%', background: '0 0% 100%', accent: '50 100% 96.1%' },
    { name: 'Slate (Dark)', primary: '215.2 79.8% 52%', background: '222.2 84% 4.9%', accent: '217.2 32.6% 17.5%' },
    { name: 'Red', primary: '0 72.2% 50.6%', background: '0 0% 100%', accent: '0 85.7% 95.9%' },
    { name: 'Magenta', primary: '310 75% 50%', background: '0 0% 100%', accent: '310 50% 95%' },
] as const;
