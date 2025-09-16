
import { z } from 'zod';

export const CouponFormSchema = z.object({
  code: z.string().min(3, "Code must be at least 3 characters long.").toUpperCase(),
  type: z.enum(['percentage', 'fixed', 'free-shipping']),
  value: z.preprocess(
    (val) => (val === '' || val === null || val === undefined ? undefined : parseFloat(String(val))),
    z.number().optional()
  ),
  minPurchase: z.preprocess(
    (val) => {
        const processed = parseFloat(String(val));
        return isNaN(processed) ? 0 : processed;
    },
    z.number().min(0, "Minimum purchase cannot be negative.")
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
    if (data.type === 'free-shipping') {
        // For free shipping, value is not required.
        return true;
    }
    return false; // Should not happen
}, {
    message: "A valid discount value is required for this coupon type.",
    path: ["value"],
});


export type CouponFormValues = z.infer<typeof CouponFormSchema>;
