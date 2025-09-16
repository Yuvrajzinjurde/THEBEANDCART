
import { z } from 'zod';

const emptyStringToUndefined = z.literal('').transform(() => undefined);

// Preprocessor for numeric fields that might be empty strings
const numericPreprocessor = z.preprocess((val) => {
    if (typeof val === 'string' && val.trim() === '') return undefined;
    if (val === null) return undefined;
    return val;
}, z.coerce.number().optional());


export const CouponFormSchema = z.object({
  code: z.string().min(3, "Code must be at least 3 characters long.").toUpperCase(),
  type: z.enum(['percentage', 'fixed', 'free-shipping']),
  value: numericPreprocessor,
  minPurchase: numericPreprocessor.default(0),
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
        // For free shipping, a value is not needed.
        return true;
    }
    return false;
}, {
    message: "A valid discount value is required for the selected discount type.",
    path: ["value"],
})
.refine(data => {
    if (data.type === 'free-shipping') {
        return data.value === undefined || data.value === null;
    }
    return true;
}, {
    message: "Discount value should not be set for 'Free Shipping' type.",
    path: ["value"],
});


export type CouponFormValues = z.infer<typeof CouponFormSchema>;
