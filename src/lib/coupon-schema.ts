
import { z } from 'zod';

export const CouponFormSchema = z.object({
  code: z.string().min(3, "Code must be at least 3 characters long.").toUpperCase(),
  type: z.enum(['percentage', 'fixed', 'free-shipping']),
  value: z.preprocess(
    // Preprocess to convert empty strings or null to undefined
    (val) => (val === "" || val === null ? undefined : val),
    z.coerce.number().optional()
  ),
  minPurchase: z.coerce.number().min(0, "Minimum purchase cannot be negative."),
  brand: z.string().min(1, "A brand must be selected."),
  startDate: z.date().optional(),
  endDate: z.date().optional(),
}).refine(data => {
    if (data.startDate && data.endDate) {
        return data.endDate > data.startDate;
    }
    return true;
}, {
    message: "End date must be after start date.",
    path: ["endDate"],
}).refine(data => {
  if (data.type === 'percentage') {
    return typeof data.value === 'number' && data.value >= 0 && data.value <= 100;
  }
  if (data.type === 'fixed') {
    return typeof data.value === 'number' && data.value >= 0;
  }
  if (data.type === 'free-shipping') {
    return data.value === undefined;
  }
  return false; // Should not happen
}, {
  message: "Invalid value for the selected discount type. Percentage must be 0-100, Fixed must be >= 0, and Free Shipping must have no value.",
  path: ["value"],
});


export type CouponFormValues = z.infer<typeof CouponFormSchema>;
