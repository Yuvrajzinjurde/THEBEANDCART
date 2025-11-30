import { z } from 'zod';

// Base schema for fields common to all coupon types
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
    required_error: "A value is required for this discount type.",
    invalid_type_error: "Discount value must be a number.",
  }).min(0, "Value cannot be negative."),
});

// Schema for free shipping coupons, which have no value
const freeShippingCouponSchema = baseCouponSchema.extend({
  type: z.literal('free-shipping'),
});

// This is the final schema. The problematic .refine() check has been removed.
export const CouponFormSchema = z.discriminatedUnion("type", [
  valuedCouponSchema,
  freeShippingCouponSchema,
]);

export type CouponFormValues = z.infer<typeof CouponFormSchema>;
