import { z } from 'zod';

const valuedCouponSchema = z.object({
  type: z.enum(['percentage', 'fixed']),
  value: z.coerce.number().min(0, "Discount value must be non-negative."),
});

const freeShippingCouponSchema = z.object({
  type: z.literal('free-shipping'),
});

const baseCouponSchema = z.object({
  code: z.string().min(3, "Code must be at least 3 characters long.").toUpperCase(),
  minPurchase: z.coerce.number().min(0, "Minimum purchase must be a positive number.").default(0),
  brand: z.string().min(1, "A brand must be selected."),
  startDate: z.date().optional(),
  endDate: z.date().optional(),
});

export const CouponFormSchema = z.discriminatedUnion("type", [
  baseCouponSchema.merge(valuedCouponSchema),
  baseCouponSchema.merge(freeShippingCouponSchema),
])
.refine((data) => {
    if (data.startDate && data.endDate && data.endDate <= data.startDate) {
        return false;
    }
    return true;
}, {
    message: "End date must be after the start date.",
    path: ["endDate"],
})
.refine((data) => {
    if (data.type === 'percentage' && data.value > 100) {
        return false;
    }
    return true;
}, {
    message: "Percentage value cannot exceed 100.",
    path: ["value"],
});


export type CouponFormValues = z.infer<typeof CouponFormSchema>;