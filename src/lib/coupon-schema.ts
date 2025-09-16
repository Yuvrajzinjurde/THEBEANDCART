
import { z } from 'zod';

const BaseCouponSchema = z.object({
  code: z.string().min(3, "Code must be at least 3 characters long.").toUpperCase(),
  minPurchase: z.coerce.number().min(0, "Minimum purchase cannot be negative."),
  brand: z.string().min(1, "A brand must be selected."),
  startDate: z.date().optional(),
  endDate: z.date().optional(),
});

const PercentageCouponSchema = BaseCouponSchema.extend({
  type: z.literal('percentage'),
  value: z.coerce.number().min(0, "Percentage must be positive.").max(100, "Percentage cannot exceed 100."),
});

const FixedCouponSchema = BaseCouponSchema.extend({
  type: z.literal('fixed'),
  value: z.coerce.number().min(0, "Fixed amount must be a positive number."),
});

const FreeShippingCouponSchema = BaseCouponSchema.extend({
  type: z.literal('free-shipping'),
  value: z.undefined().optional(),
});


export const CouponFormSchema = z.discriminatedUnion('type', [
  PercentageCouponSchema,
  FixedCouponSchema,
  FreeShippingCouponSchema,
]).refine(data => {
    if (data.startDate && data.endDate) {
        return data.endDate > data.startDate;
    }
    return true;
}, {
    message: "End date must be after start date.",
    path: ["endDate"],
});


export type CouponFormValues = z.infer<typeof CouponFormSchema>;

    