import { z } from 'zod';

// Base schema with common fields
const baseCouponSchema = z.object({
  code: z.string().min(3, "Code must be at least 3 characters long.").toUpperCase(),
  minPurchase: z.coerce.number().min(0, "Minimum purchase must be a positive number.").default(0),
  brand: z.string().min(1, "A brand must be selected."),
  startDate: z.date().optional(),
  endDate: z.date().optional(),
});

// Schema for coupons that have a numeric value
const valuedCouponSchema = baseCouponSchema.extend({
  type: z.enum(['percentage', 'fixed']),
  value: z.coerce.number({
    required_error: "A discount value is required.",
    invalid_type_error: "Discount value must be a number.",
  }).min(0, "Discount value cannot be negative."),
});

// Schema for free shipping coupons (no value)
const freeShippingCouponSchema = baseCouponSchema.extend({
  type: z.literal('free-shipping'),
  value: z.undefined().optional(), // Ensure value is not present
});

// Union of the different coupon types
export const CouponFormSchema = z.union([
  valuedCouponSchema,
  freeShippingCouponSchema,
]).superRefine((data, ctx) => {
    // End date must be after start date
    if (data.startDate && data.endDate && data.endDate <= data.startDate) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "End date must be after the start date.",
            path: ["endDate"],
        });
    }
    // Percentage value cannot exceed 100
    if (data.type === 'percentage' && data.value && data.value > 100) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Percentage value cannot exceed 100.",
            path: ["value"],
        });
    }
});

export type CouponFormValues = z.infer<typeof CouponFormSchema>;
