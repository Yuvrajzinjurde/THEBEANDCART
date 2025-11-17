import { z } from 'zod';

export const CouponFormSchema = z.object({
  code: z.string().min(3, "Code must be at least 3 characters long.").toUpperCase(),
  type: z.enum(['percentage', 'fixed', 'free-shipping']),
  value: z.coerce.number({ invalid_type_error: 'Discount value must be a number.' }).optional(),
  minPurchase: z.coerce.number({ invalid_type_error: 'Minimum purchase must be a number.' }).min(0).default(0),
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
      if (typeof data.value !== 'number') return false; // Must have a value
      return data.value >= 0 && data.value <= 100;
    }
    if (data.type === 'fixed') {
      return typeof data.value === 'number' && data.value >= 0; // Must have a value
    }
    return true;
}, {
    message: "A valid discount value is required and must be within the correct range for the selected type.",
    path: ["value"],
});


export type CouponFormValues = z.infer<typeof CouponFormSchema>;
