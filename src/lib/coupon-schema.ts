
import { z } from 'zod';

const emptyStringToUndefined = z.literal('').transform(() => undefined);

export const CouponFormSchema = z.object({
  code: z.string().min(3, "Code must be at least 3 characters long.").toUpperCase(),
  type: z.enum(['percentage', 'fixed', 'free-shipping']),
  value: z.preprocess(
    (val) => (val === '' || val === null ? undefined : val),
    z.coerce.number({ invalid_type_error: 'Discount value must be a number.' }).optional()
  ),
  minPurchase: z.preprocess(
    (val) => (val === '' || val === null || val === undefined ? 0 : val),
    z.coerce.number({ invalid_type_error: 'Minimum purchase must be a number.' })
  ),
  brand: z.string().min(1, "A brand must be selected."),
  startDate: z.date().optional(),
  endDate: z.date().optional(),
})
.refine(data => {
    if (data.startDate && data.endDate) {
        return data.endDate > data.startDate;
    }
    return true;
}, {
    message: "End date must be after start date.",
    path: ["endDate"],
})
.refine(data => {
    if (data.type === 'percentage') {
        return data.value !== undefined && data.value >= 0 && data.value <= 100;
    }
    if (data.type === 'fixed') {
        return data.value !== undefined && data.value >= 0;
    }
    return true; 
}, {
    message: "A valid discount value is required for this coupon type.",
    path: ["value"],
})
.refine(data => {
    if (data.type === 'free-shipping') {
        return data.value === undefined;
    }
    return true;
}, {
    message: "Discount value should not be set for 'Free Shipping' type.",
    path: ["value"],
});


export type CouponFormValues = z.infer<typeof CouponFormSchema>;
