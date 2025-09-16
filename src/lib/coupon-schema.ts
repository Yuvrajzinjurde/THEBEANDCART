
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
  // If type is not free-shipping, value must be a number
  if (data.type !== 'free-shipping') {
    return typeof data.value === 'number';
  }
  return true;
}, {
  message: "Discount value is required for this type.",
  path: ["value"],
}).refine(data => {
  if (data.type === 'percentage') {
    return data.value! >= 0 && data.value! <= 100;
  }
  return true;
}, {
  message: "Percentage value must be between 0 and 100.",
  path: ["value"],
}).refine(data => {
  if (data.type === 'fixed') {
    return data.value! >= 0;
  }
  return true;
}, {
  message: "Fixed amount cannot be negative.",
  path: ["value"],
}).refine(data => {
  // if type is free-shipping, value must be undefined
  if (data.type === 'free-shipping') {
    return data.value === undefined;
  }
  return true;
}, {
    message: "Value should not be set for free shipping.",
    path: ["value"],
}).refine(data => {
    if (data.startDate && data.endDate) {
        return data.endDate > data.startDate;
    }
    return true;
}, {
    message: "End date must be after start date.",
    path: ["endDate"],
});


export type CouponFormValues = z.infer<typeof CouponFormSchema>;
