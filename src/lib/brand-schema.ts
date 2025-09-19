
import { z } from 'zod';

export const bannerSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  imageUrl: z.string().url("Must be a valid URL or data URI.").min(1, "Image is required"),
  imageHint: z.string().min(1, "Image hint is required"),
});

const offerSchema = z.object({
  title: z.string().min(1, "Offer title is required"),
  description: z.string().min(1, "Offer description is required"),
  code: z.string().min(1, "Offer code is required"),
});

const reviewSchema = z.object({
  customerName: z.string().min(1, "Customer name is required"),
  rating: z.coerce.number().min(1).max(5, "Rating must be between 1 and 5"),
  reviewText: z.string().min(1, "Review text is required"),
  customerAvatarUrl: z.string().url("Must be a valid URL or data URI.").min(1, "Avatar is required"),
});

const promoBannerSchema = z.object({
  title: z.string(),
  description: z.string(),
  imageUrl: z.string(),
  imageHint: z.string(),
  buttonText: z.string(),
  buttonLink: z.string(),
}).refine(data => {
    // If any field is filled, all fields (except optionals like imageHint) must be filled.
    const fields = [data.title, data.description, data.imageUrl, data.buttonText, data.buttonLink];
    const filledFields = fields.filter(f => f && f.length > 0).length;
    // It's either all empty (0) or all filled (5).
    if (filledFields > 0 && filledFields < 5) return false;
    if (data.buttonLink) return z.string().url().safeParse(data.buttonLink).success;
    return true;
}, {
    message: "To use the promo banner, all fields must be filled out with a valid link.",
    path: ['buttonLink'], // Or a more general path
});


const categoryBannerSchema = z.object({
  categoryName: z.string().min(1, "Category name is required"),
  imageUrl: z.string().url("Must be a valid URL or data URI.").min(1, "Image is required"),
  imageHint: z.string().min(1, "Image hint is required"),
});


export const themeColors = [
    { name: 'Jewelry', primary: '45 90% 55%', background: '0 0% 98%', accent: '45 90% 95%' },
    { name: 'Blue', primary: '39 80% 55%', background: '40 50% 98%', accent: '39 80% 95%' },
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

export const BrandFormSchema = z.object({
  displayName: z.string().min(1, "Display name is required"),
  permanentName: z.string().min(1, "Permanent name is required").regex(/^[a-z0-9-]+$/, "Permanent name can only contain lowercase letters, numbers, and hyphens."),
  logoUrl: z.string().url("Must be a valid URL or data URI.").min(1, "Logo is required"),
  banners: z.array(bannerSchema).min(1, "At least one banner is required"),
  themeName: z.string({ required_error: "Please select a theme." }),
  offers: z.array(offerSchema).optional(),
  reviews: z.array(reviewSchema).optional(),
  promoBanner: promoBannerSchema.optional(),
  categoryBanners: z.array(categoryBannerSchema).optional(),
  categories: z.array(z.string()).optional(),
});

export type BrandFormValues = z.infer<typeof BrandFormSchema>;

// Zod schema for Platform Settings form validation
export const PlatformSettingsValidationSchema = z.object({
  aiEnabled: z.boolean().optional(),
  heroBanners: z.array(bannerSchema).min(1, "At least one hero banner is required"),
  featuredCategories: z.array(z.object({ name: z.string() })).optional(),
  promoBanner: promoBannerSchema.optional(),
  offers: z.array(offerSchema).optional(),
});

export type PlatformSettingsValues = z.infer<typeof PlatformSettingsValidationSchema>;
