import { z } from 'zod';

const valuedCouponSchema = z.object({
  type: z.enum(['percentage', 'fixed']),
  value: z.coerce.number({ required_error: "A value is required for this type." }).min(0, "Discount value must be non-negative."),
});

const freeShippingCouponSchema = z.object({
  type: z.literal('free-shipping'),
  value: z.union([z.string(), z.number()]).optional().transform(() => undefined), // Ensure value is removed
});

// Common fields for all coupon types
const baseCouponSchema = z.object({
  code: z.string().min(3, "Code must be at least 3 characters long.").toUpperCase(),
  minPurchase: z.coerce.number().min(0, "Minimum purchase must be a positive number.").default(0),
  brand: z.string().min(1, "A brand must be selected."),
  startDate: z.date().optional(),
  endDate: z.date().optional(),
});

// Combine the base schema with the discriminated union of specific types
export const CouponFormSchema = baseCouponSchema
  .and(z.discriminatedUnion("type", [
    valuedCouponSchema,
    freeShippingCouponSchema,
  ]))
  .refine((data) => {
    // End date must be after start date if both are provided
    if (data.startDate && data.endDate && data.endDate <= data.startDate) {
        return false;
    }
    return true;
  }, {
      message: "End date must be after the start date.",
      path: ["endDate"],
  })
  .refine((data) => {
    // Percentage value cannot exceed 100
    if (data.type === 'percentage' && data.value > 100) {
        return false;
    }
    return true;
  }, {
      message: "Percentage value cannot exceed 100.",
      path: ["value"],
  });

export type CouponFormValues = z.infer<typeof CouponFormSchema>;
