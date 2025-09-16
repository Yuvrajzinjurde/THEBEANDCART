
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
  title: z.string().min(1, "Promo banner title is required"),
  description: z.string().min(1, "Promo banner description is required"),
  imageUrl: z.string().url("Must be a valid URL or data URI.").min(1, "Image is required"),
  imageHint: z.string().min(1, "Image hint is required"),
  buttonText: z.string().min(1, "Button text is required"),
  buttonLink: z.string().url("Must be a valid URL").min(1, "Button link is required"),
});

const categoryBannerSchema = z.object({
  categoryName: z.string().min(1, "Category name is required"),
  imageUrl: z.string().url("Must be a valid URL or data URI.").min(1, "Image is required"),
  imageHint: z.string().min(1, "Image hint is required"),
});


export const themeColors = [
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
});

export type BrandFormValues = z.infer<typeof BrandFormSchema>;
